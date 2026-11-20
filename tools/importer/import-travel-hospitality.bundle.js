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

  // tools/importer/import-travel-hospitality.js
  var import_travel_hospitality_exports = {};
  __export(import_travel_hospitality_exports, {
    default: () => import_travel_hospitality_default
  });

  // tools/importer/parsers/carousel-image-only.js
  function parse(element, { document }) {
    const cells = [];
    let slides = [...element.querySelectorAll("li.carousel-slide")];
    if (!slides.length) slides = [...element.querySelectorAll(":scope > div")];
    slides.forEach((slide) => {
      const imageHolder = slide.querySelector(".carousel-slide-image") || slide;
      const picture = imageHolder.querySelector("picture");
      const img = imageHolder.querySelector("img");
      const cell = [];
      if (img) {
        cell.push(document.createComment(" field:media_image "));
        cell.push(picture || img);
      } else {
        const a = imageHolder.querySelector("a[href]");
        if (a) {
          cell.push(document.createComment(" field:media_image "));
          cell.push(a);
        }
      }
      if (cell.length) cells.push([cell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-image-only", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gradient.js
  function parse2(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > ul > li")];
    const decorated = items.length > 0;
    if (!decorated) items = [...element.querySelectorAll(":scope > div")];
    items.forEach((item) => {
      let imageHolder;
      let body;
      if (decorated) {
        imageHolder = item.querySelector(".cards-card-image, .cards-card-dynamic-image");
        body = item.querySelector(".cards-card-body");
      } else {
        const cols = [...item.querySelectorAll(":scope > div")];
        imageHolder = cols[0] || null;
        body = cols[1] || null;
      }
      const imageCell = [];
      if (imageHolder) {
        const picture = imageHolder.querySelector("picture");
        const img = imageHolder.querySelector("img");
        const imgLink = !img ? imageHolder.querySelector("a[href]") : null;
        if (img || imgLink) {
          imageCell.push(document.createComment(" field:image "));
          imageCell.push(picture || img || imgLink);
        }
      }
      const textCell = [];
      if (body && body.textContent.trim()) {
        textCell.push(document.createComment(" field:text "));
        const children = [...body.children];
        if (children.length) {
          children.forEach((child) => textCell.push(child));
        } else {
          const p = document.createElement("p");
          p.textContent = body.textContent.trim();
          textCell.push(p);
        }
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-gradient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hotspot.js
  function readStyleValue(styleAttr, prop) {
    if (!styleAttr) return "";
    const m = styleAttr.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"));
    return m ? m[1].trim() : "";
  }
  function makeLink(document, href) {
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = href;
    return a;
  }
  function parse3(element, { document }) {
    const cells = [];
    const rows = [...element.querySelectorAll(":scope > div")];
    const bgRow = rows.find((r) => !r.classList.contains("hotspot") && (r.querySelector("img") || r.querySelector("a[href]")));
    const bgCell = [];
    if (bgRow) {
      const picture = bgRow.querySelector("picture");
      const img = bgRow.querySelector("img");
      const bgLink = !img ? bgRow.querySelector("a[href]") : null;
      if (img || bgLink) {
        bgCell.push(document.createComment(" field:image "));
        bgCell.push(picture || img || bgLink);
      }
    }
    cells.push([bgCell]);
    const items = rows.filter((r) => r !== bgRow);
    items.forEach((item, idx) => {
      let href = "";
      let left = "";
      let top = "";
      if (item.classList.contains("hotspot")) {
        href = item.getAttribute("data") || item.getAttribute("data-url") || "";
        if (!href) {
          const iframe = item.querySelector("iframe[src]");
          const a = item.querySelector("a[href]");
          href = iframe && iframe.getAttribute("src") || a && a.getAttribute("href") || "";
        }
        const style = item.getAttribute("style") || "";
        left = readStyleValue(style, "left");
        top = readStyleValue(style, "top");
      } else {
        const cols = [...item.querySelectorAll(":scope > div")];
        const a = cols[0] && cols[0].querySelector("a[href]");
        href = a ? a.getAttribute("href") : cols[0] && cols[0].textContent.trim() || "";
        left = cols[1] && cols[1].textContent.trim() || "";
        top = cols[2] && cols[2].textContent.trim() || "";
      }
      if (!href) {
        console.warn(`[hotspot] item ${idx + 1}: no media URL found`);
        return;
      }
      if (!left || !top) console.warn(`[hotspot] item ${idx + 1}: missing left/top position`);
      const linkCell = [document.createComment(" field:link "), makeLink(document, href)];
      const leftCell = left ? [document.createComment(" field:left "), document.createTextNode(left)] : "";
      const topCell = top ? [document.createComment(" field:top "), document.createTextNode(top)] : "";
      cells.push([linkCell, leftCell, topCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-dm-viewer.js
  function findViewerUrl(element) {
    const iframe = element.querySelector("iframe[src]");
    if (iframe && iframe.getAttribute("src")) return iframe.getAttribute("src");
    const a = element.querySelector("a[href]");
    if (a && a.getAttribute("href")) return a.getAttribute("href");
    const nodes = [element, ...element.querySelectorAll("*")];
    for (const node of nodes) {
      for (const attr of [...node.attributes]) {
        if ((attr.name === "data" || attr.name.startsWith("data-")) && /^https?:\/\//i.test(attr.value.trim())) {
          return attr.value.trim();
        }
      }
    }
    const text = element.textContent.trim();
    const m = text.match(/https?:\/\/\S+/);
    return m ? m[0] : "";
  }
  function findAuthoredViewerUrl(element, document, params) {
    try {
      const pageUrl = new URL(params && params.originalURL || document.location.href);
      const embeds = [...document.querySelectorAll(".embed-wrapper > .embed, div.embed")];
      const index = Math.max(0, embeds.indexOf(element));
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${pageUrl.origin}${pageUrl.pathname.replace(/\.html$/, "")}.plain.html`, false);
      xhr.send();
      if (xhr.status !== 200) return "";
      const authored = new DOMParser().parseFromString(xhr.responseText, "text/html");
      const block = authored.querySelectorAll("div.embed")[index];
      if (!block) return "";
      const a = block.querySelector("a[href]");
      if (a) return a.getAttribute("href");
      const m = block.textContent.match(/https?:\/\/\S+/);
      return m ? m[0] : "";
    } catch (e) {
      return "";
    }
  }
  function parse4(element, { document, params }) {
    const cells = [];
    const cell = [];
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    if (img) {
      cell.push(document.createComment(" field:embed_placeholder "));
      cell.push(picture || img);
    }
    const url = findViewerUrl(element) || findAuthoredViewerUrl(element, document, params);
    if (url) {
      cell.push(document.createComment(" field:embed_uri "));
      const a = document.createElement("a");
      a.setAttribute("href", url);
      a.textContent = url;
      cell.push(a);
    } else {
      console.warn("[embed-dm-viewer] no Dynamic Media viewer URL found in block; leaving embed_uri empty");
    }
    cells.push([cell.length ? cell : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-dm-viewer", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var CHROME_SELECTORS = [
    "header",
    "footer",
    ".header-wrapper",
    ".footer-wrapper",
    ".nav-wrapper",
    "#nav",
    // carousel decoration chrome
    ".carousel-navigation-buttons",
    ".carousel-slide-indicators",
    ".carousel nav",
    // non-content tags
    "script",
    "style",
    "noscript",
    "link"
  ];
  var TRACKING_ATTRS = [
    "data-analytics",
    "data-track",
    "data-tracking",
    "data-gtm",
    "onclick"
  ];
  function removeEmptySources(root) {
    root.querySelectorAll("source").forEach((s) => {
      if (!s.getAttribute("srcset") && !s.getAttribute("src")) {
        while (s.firstChild) s.parentNode.insertBefore(s.firstChild, s);
        s.remove();
      }
    });
  }
  function unwrapDynamicLogo(root) {
    const document = root.ownerDocument;
    root.querySelectorAll(".dynamic-wrapper").forEach((wrapper) => {
      const imgs = [...wrapper.querySelectorAll("img")];
      if (!imgs.length) {
        wrapper.remove();
        return;
      }
      const frag = document.createDocumentFragment();
      imgs.forEach((img) => {
        img.removeAttribute("class");
        const p = document.createElement("p");
        p.append(img);
        frag.append(p);
      });
      wrapper.replaceWith(frag);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
      removeEmptySources(element);
      unwrapDynamicLogo(element);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        ".carousel-navigation-buttons",
        ".carousel-slide-indicators",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      removeEmptySources(element);
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

  // tools/importer/transformers/wknd-dm-images.js
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
  function isDmVideoUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    const p = u.pathname.toLowerCase();
    if (/\/play\/?$/.test(p) || /\/manifest\./.test(p)) return true;
    return /\.(mp4|m4v|mov|webm|m3u8|mpd)(\/|$)/.test(p);
  }
  function getDmImageSrc(img) {
    const candidates = [img.getAttribute("src"), img.getAttribute("data-src")];
    for (const c of candidates) {
      if (c && detectDynamicMediaUrl(c) && !isDmVideoUrl(c)) return c;
    }
    return null;
  }
  function altToLinkText(alt) {
    return (alt || "").trim() || EMPTY_ALT_SENTINEL;
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
      const dmUrl = getDmImageSrc(img);
      if (!dmUrl) return;
      const linkText = altToLinkText(img.getAttribute("alt"));
      const anchor = img.closest("a");
      if (anchor) {
        if (!isImgSoleContent(anchor, img)) {
          console.warn(`[wknd-dm-images] skipping DM image inside mixed-content link: ${dmUrl}`);
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

  // tools/importer/transformers/wknd-sections.js
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

  // tools/importer/import-travel-hospitality.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-image-only": parse,
    "cards-gradient": parse2,
    "hotspot": parse3,
    "embed-dm-viewer": parse4
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
  var import_travel_hospitality_default = {
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
  return __toCommonJS(import_travel_hospitality_exports);
})();
