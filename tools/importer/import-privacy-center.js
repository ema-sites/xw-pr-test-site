/* eslint-disable */
/* global WebImporter */

import heroInsetCardParser from './parsers/hero-inset-card.js';
import columnsSidebarParser from './parsers/columns-sidebar.js';
import columnsTeaserParser from './parsers/columns-teaser.js';
import cardsImageTopParser from './parsers/cards-image-top.js';
import columnsMediaParser from './parsers/columns-media.js';
import cleanupTransformer from './transformers/abbvie-cleanup.js';
import dmImagesTransformer from './transformers/abbvie-dm-images.js';
import sectionsTransformer from './transformers/abbvie-sections.js';

const PAGE_TEMPLATE = {
  "name": "privacy-center",
  "urls": [
    "https://www.abbvie.com/privacy-center.html"
  ],
  "representativeUrl": "https://www.abbvie.com/privacy-center.html",
  "description": "AbbVie Privacy Center landing page: hero with inset title card, intro with helpful links, teaser, audience cards, image/text rows on light-blue panel, closing text.",
  "blocks": [
    {
      "name": "hero-inset-card",
      "instances": [
        ".hero-container"
      ]
    },
    {
      "name": "columns-sidebar",
      "instances": [
        ".grid-container-inner:has(.eyebrow-text.divider)"
      ]
    },
    {
      "name": "columns-teaser",
      "instances": [
        ".teaser .teaser-content"
      ]
    },
    {
      "name": "cards-image-top",
      "instances": [
        ".grid-container-inner:has(> .grid-cols-4.custom-image-container)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".bg-f1f3ff .grid-container-inner"
      ]
    }
  ],
  "urlPattern": "/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero",
      "selector": [
        "#main-content > .section.hero-container-container"
      ],
      "style": null,
      "blocks": [
        "hero-inset-card"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Intro with helpful links",
      "selector": [
        "#main-content > .section.grid-container:has(.eyebrow-text.divider)"
      ],
      "style": null,
      "blocks": [
        "columns-sidebar"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "We are transparent",
      "selector": [
        "#main-content > .section.teaser-container"
      ],
      "style": null,
      "blocks": [
        "columns-teaser"
      ],
      "defaultContent": [
        ".teaser-eyebrow"
      ]
    },
    {
      "id": "section-4",
      "name": "Privacy audiences cards",
      "selector": [
        "#main-content > .section.grid-container:has(> .grid-container-inner > .grid-cols-4.custom-image-container)"
      ],
      "style": null,
      "blocks": [
        "cards-image-top"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "We honor your choices / Committed to your privacy",
      "selector": [
        "#main-content > .section.bg-f1f3ff"
      ],
      "style": "light-blue",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "We prioritize your security",
      "selector": [
        "#main-content > .section.container-medium.custom-title-container"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".custom-title-heading",
        ".text-container-text"
      ]
    }
  ]
};

const parsers = {
  'hero-inset-card': heroInsetCardParser,
  'columns-sidebar': columnsSidebarParser,
  'columns-teaser': columnsTeaserParser,
  'cards-image-top': cardsImageTopParser,
  'columns-media': columnsMediaParser,
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
