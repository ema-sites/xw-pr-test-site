/* eslint-disable */
/* global WebImporter */

import carouselImageOnlyParser from './parsers/carousel-image-only.js';
import cardsGradientParser from './parsers/cards-gradient.js';
import hotspotParser from './parsers/hotspot.js';
import embedDmViewerParser from './parsers/embed-dm-viewer.js';
// Site-specific transformers for aem-dynamicmedia-demo (WKND Travel). The abbvie-* transformers
// in the same folder belong to the privacy-center template and are intentionally not imported.
import cleanupTransformer from './transformers/wknd-cleanup.js';
import dmImagesTransformer from './transformers/wknd-dm-images.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  "name": "travel-hospitality",
  "urls": [
    "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home"
  ],
  "representativeUrl": "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home",
  "description": "WKND Travel home page (Dynamic Media demo): image-only carousel with logo and intro, then tour cards, interactive hotspot map, Dynamic Media video viewer and rows of Dynamic Media image-transformation demo cards.",
  "blocks": [
    {
      "name": "carousel-image-only",
      "instances": [
        ".carousel-wrapper > .carousel"
      ]
    },
    {
      "name": "cards-gradient",
      "instances": [
        ".cards-wrapper > .cards"
      ]
    },
    {
      "name": "hotspot",
      "instances": [
        ".hotspot-wrapper > .hotspot"
      ]
    },
    {
      "name": "embed-dm-viewer",
      "instances": [
        ".embed-wrapper > .embed"
      ]
    }
  ],
  "urlPattern": "/travel-hospitality/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Intro: image carousel, logo and WKND Travel intro",
      "selector": [
        "main > .section.carousel-container",
        "main > .section:has(.carousel-wrapper)"
      ],
      "style": "centered",
      "blocks": [
        "carousel-image-only"
      ],
      "defaultContent": [
        ".dynamic-wrapper",
        ".default-content-wrapper"
      ]
    },
    {
      "id": "section-2",
      "name": "Highlight: tours, interactive map, video and Dynamic Media demos",
      "selector": [
        "main > .section.highlight",
        "main > .section:has(.hotspot-wrapper)"
      ],
      "style": "centered",
      "blocks": [
        "cards-gradient",
        "hotspot",
        "embed-dm-viewer"
      ],
      "defaultContent": [
        ".default-content-wrapper"
      ]
    }
  ]
};

const parsers = {
  'carousel-image-only': carouselImageOnlyParser,
  'cards-gradient': cardsGradientParser,
  'hotspot': hotspotParser,
  'embed-dm-viewer': embedDmViewerParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections ({sitename}-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, dmImagesTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
