/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-privacy-center.js
  var import_privacy_center_exports = {};
  __export(import_privacy_center_exports, {
    default: () => import_privacy_center_default
  });

  // tools/importer/parsers/hero-inset-card.js
  function parse(element, { document }) {
    const cells = [];
    const img = element.querySelector(".hero-container-bg img");
    const imageCell = [];
    if (img) {
      imageCell.push(document.createComment(" field:image "));
      imageCell.push(img);
    }
    cells.push([imageCell]);
    const textCell = [];
    const title = element.querySelector(".custom-title-heading, .hero-container-section-inner h1, .hero-container-section-inner h2");
    const subtitles = [...element.querySelectorAll(".text-container .text-container-text")];
    if (title || subtitles.length) {
      textCell.push(document.createComment(" field:text "));
      if (title) {
        const h1 = document.createElement("h1");
        h1.innerHTML = title.innerHTML;
        textCell.push(h1);
      }
      subtitles.forEach((p) => textCell.push(p));
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-inset-card", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-sidebar.js
  function parse2(element, { document }) {
    const leftCell = [];
    element.querySelectorAll(".text-container-container .text-container-text").forEach((p) => leftCell.push(p));
    const rightCell = [];
    const label = element.querySelector(".eyebrow-text-text");
    if (label) {
      const p = document.createElement("p");
      p.textContent = label.textContent.trim();
      rightCell.push(p);
    }
    element.querySelectorAll(".cta a[href]").forEach((a) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document.createElement("p");
      p.append(link);
      rightCell.push(p);
    });
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-sidebar", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-teaser.js
  function parse3(element, { document }) {
    const leftCell = [];
    const title = element.querySelector(".teaser-left .teaser-title, .teaser-left h1, .teaser-left h2, .teaser-left h3");
    if (title) {
      const h2 = document.createElement("h2");
      [...title.childNodes].forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "SPAN") {
          const em = document.createElement("em");
          em.textContent = node.textContent;
          h2.append(em);
        } else {
          h2.append(node.cloneNode(true));
        }
      });
      leftCell.push(h2);
    }
    const rightCell = [];
    element.querySelectorAll(".teaser-right .teaser-description p").forEach((p) => rightCell.push(p));
    element.querySelectorAll(".teaser-right .button-container a[href]").forEach((a) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document.createElement("p");
      p.append(link);
      rightCell.push(p);
    });
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-image-top.js
  function parse4(element, { document }) {
    const cells = [];
    const cards = element.querySelectorAll(":scope > .grid-section.custom-image-container");
    cards.forEach((card) => {
      const imageCell = [];
      const img = card.querySelector(".custom-image img");
      if (img) {
        imageCell.push(document.createComment(" field:image "));
        imageCell.push(img);
      }
      const textCell = [];
      const title = card.querySelector(".eyebrow-text-text");
      const descs = [...card.querySelectorAll(".text-container .text-container-text")];
      const ctas = [...card.querySelectorAll(".cta a[href]")];
      if (title || descs.length || ctas.length) {
        textCell.push(document.createComment(" field:text "));
        if (title) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = title.textContent.trim();
          p.append(strong);
          textCell.push(p);
        }
        descs.forEach((d) => textCell.push(d));
        ctas.forEach((a) => {
          const link = document.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = a.textContent.trim();
          const p = document.createElement("p");
          p.append(link);
          textCell.push(p);
        });
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-image-top", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse5(element, { document }) {
    const cells = [];
    const sections = [...element.querySelectorAll(":scope > .grid-section")];
    const imageSections = sections.filter((s) => s.classList.contains("custom-image-container"));
    const textSections = sections.filter((s) => s.classList.contains("custom-title-container") || s.classList.contains("text-container-container"));
    imageSections.forEach((imgSection, i) => {
      const imageCell = [];
      const img = imgSection.querySelector("img");
      if (img) imageCell.push(img);
      const textCell = [];
      const textSection = textSections[i];
      if (textSection) {
        textSection.querySelectorAll(".custom-title-heading").forEach((h) => {
          const h2 = document.createElement("h2");
          h2.innerHTML = h.innerHTML;
          textCell.push(h2);
        });
        textSection.querySelectorAll(".text-container .text-container-text").forEach((el) => {
          el.removeAttribute("class");
          textCell.push(el);
        });
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/abbvie-cleanup.js
  var CHROME_SELECTORS = [
    "header",
    "footer",
    "nav",
    ".header-wrapper",
    ".footer-wrapper",
    ".nav-wrapper",
    ".breadcrumb",
    ".breadcrumbs",
    ".skip-link",
    // cookie / consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    ".onetrust-pc-dark-filter",
    ".cookie-banner",
    ".cookie-consent",
    '[id*="cookie" i]',
    // back to top
    ".back-to-top",
    ".back-to-top-wrapper",
    ".backtotop",
    '[class*="back-to-top"]',
    // modals / widgets
    ".modal",
    "dialog",
    'iframe[src*="googletagmanager"]',
    // non-content tags
    "script",
    "style",
    "noscript",
    "link",
    // hidden authoring-data divs (EDS source authoring rows, not rendered)
    ".hero-container-item-authoring-data",
    '[class$="-authoring-data"]',
    // schema.org meta inside figures
    "figure meta[itemprop]"
  ];
  var TRACKING_ATTRS = [
    "data-analytics",
    "data-track",
    "data-tracking",
    "data-cmp-data-layer",
    "data-gtm",
    "onclick"
  ];
  var TRACKING_PIXEL_HOSTS = /(^|\.)(t\.co|analytics\.twitter\.com|ads-twitter\.com|facebook\.com|doubleclick\.net|google-analytics\.com|googletagmanager\.com|linkedin\.com|bing\.com|adsrvr\.org)$/i;
  function removeTrackingPixels(root) {
    root.querySelectorAll("img").forEach((img) => {
      let host = "";
      try {
        host = new URL(img.getAttribute("src") || "", "https://www.abbvie.com/").hostname;
      } catch (e) {
        return;
      }
      if (!TRACKING_PIXEL_HOSTS.test(host)) return;
      const picture = img.closest("picture");
      (picture || img).remove();
    });
    root.querySelectorAll("p").forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector("img, picture, a, video, iframe")) p.remove();
    });
  }
  function demoteSectionTitles(root) {
    root.querySelectorAll("h1.custom-title-heading").forEach((h1) => {
      if (h1.closest(".hero-container")) return;
      const h2 = h1.ownerDocument.createElement("h2");
      [...h1.attributes].forEach((a) => h2.setAttribute(a.name, a.value));
      while (h1.firstChild) h2.appendChild(h1.firstChild);
      h1.replaceWith(h2);
    });
  }
  function isEmptyNode(el) {
    if (!el) return true;
    if (el.querySelector("img, picture, video, iframe, svg, a, h1, h2, h3, h4, h5, h6, p, ul, ol, table")) return false;
    return el.textContent.trim() === "";
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
      removeTrackingPixels(element);
      demoteSectionTitles(element);
      element.querySelectorAll(".separator-wrapper").forEach((el) => el.remove());
      element.querySelectorAll(".grid-section").forEach((el) => {
        if (isEmptyNode(el)) el.remove();
      });
      const main = element.querySelector("#main-content") || element;
      [...main.children].forEach((child) => {
        if (child.classList && child.classList.contains("section") && isEmptyNode(child)) {
          child.remove();
        }
      });
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "script",
        "style",
        "noscript",
        "link",
        '[class$="-authoring-data"]',
        "[hidden]"
      ]);
      removeTrackingPixels(element);
      element.querySelectorAll("*").forEach((el) => {
        TRACKING_ATTRS.forEach((attr) => el.removeAttribute(attr));
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-analytics") || attr.name.startsWith("data-track")) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/abbvie-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  function altToLinkText(alt) {
    return (alt || "").trim() || EMPTY_ALT_SENTINEL;
  }
  function getImgSrc(img) {
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.src
    ];
    for (const c of candidates) {
      if (c && detectDynamicMediaUrl(c)) return c;
    }
    return null;
  }
  function isImgSoleContent(anchor, img) {
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll("img, picture, source").forEach((n) => n.remove());
    if (clone.textContent.trim() !== "") return false;
    return anchor.querySelectorAll("img").length === 1 && anchor.contains(img);
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const document = element.ownerDocument;
    [...element.querySelectorAll("img")].forEach((img) => {
      const dmUrl = getImgSrc(img);
      if (!dmUrl) return;
      const linkText = altToLinkText(img.getAttribute("alt"));
      const anchor = img.closest("a");
      if (anchor) {
        if (!isImgSoleContent(anchor, img)) {
          console.warn(`[dm-images] skipping DM image inside mixed-content link: ${dmUrl}`);
          return;
        }
        anchor.setAttribute("title", dmUrl);
        anchor.textContent = linkText;
        return;
      }
      const a = document.createElement("a");
      a.setAttribute("href", dmUrl);
      a.textContent = linkText;
      const picture = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
      (picture || img).replaceWith(a);
    });
  }

  // tools/importer/transformers/abbvie-sections.js
  var MARKER_ATTR = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
          el.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const meta = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        const el = findSectionElement(element, section);
        if (el) {
          el.after(meta);
        } else if (marker) {
          let cursor = marker.nextElementSibling;
          let last = marker;
          while (cursor && cursor.tagName !== "HR") {
            last = cursor;
            cursor = cursor.nextElementSibling;
          }
          last.after(meta);
        }
        if (marker) {
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER_ATTR);
        }
      }
    }
  }

  // tools/importer/import-privacy-center.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-inset-card": parse,
    "columns-sidebar": parse2,
    "columns-teaser": parse3,
    "cards-image-top": parse4,
    "columns-media": parse5
  };
  var sectionTransformers = [transform3];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, transform2, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_privacy_center_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_privacy_center_exports);
})();
