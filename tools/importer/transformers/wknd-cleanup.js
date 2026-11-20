/* eslint-disable */
/* global WebImporter */

/**
 * WKND Travel cleanup transformer (template: travel-hospitality).
 * Source is an existing EDS site rendered with decorated blocks, so besides
 * header/footer/nav this removes block decoration chrome that is not content:
 * carousel prev/next buttons and slide indicators, empty <source> elements
 * left by picture decoration. The "dynamic logo" block (.dynamic-wrapper) is
 * default content: it is unwrapped to a plain image paragraph.
 * Selectors come from migration-work/cleaned.html of
 * https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home
 *
 * NOTE: hotspot iframes (DM Open API .mp4/play and s7viewers URLs) and the
 * empty .embed.dm-videoplayer block are authorable inputs for the hotspot and
 * embed-dm-viewer parsers and must not be removed here.
 */

const CHROME_SELECTORS = [
  'header',
  'footer',
  '.header-wrapper',
  '.footer-wrapper',
  '.nav-wrapper',
  '#nav',
  // carousel decoration chrome
  '.carousel-navigation-buttons',
  '.carousel-slide-indicators',
  '.carousel nav',
  // non-content tags
  'script',
  'style',
  'noscript',
  'link',
];

const TRACKING_ATTRS = [
  'data-analytics',
  'data-track',
  'data-tracking',
  'data-gtm',
  'onclick',
];

// Picture decoration leaves nested, attribute-less <source> elements.
function removeEmptySources(root) {
  root.querySelectorAll('source').forEach((s) => {
    if (!s.getAttribute('srcset') && !s.getAttribute('src')) {
      // Hoist children (malformed nesting can contain the <img>) before removal.
      while (s.firstChild) s.parentNode.insertBefore(s.firstChild, s);
      s.remove();
    }
  });
}

// .dynamic-wrapper > .dynamic.logo.block > img  ->  <p><img></p>
function unwrapDynamicLogo(root) {
  const document = root.ownerDocument;
  root.querySelectorAll('.dynamic-wrapper').forEach((wrapper) => {
    const imgs = [...wrapper.querySelectorAll('img')];
    if (!imgs.length) {
      wrapper.remove();
      return;
    }
    const frag = document.createDocumentFragment();
    imgs.forEach((img) => {
      img.removeAttribute('class');
      const p = document.createElement('p');
      p.append(img);
      frag.append(p);
    });
    wrapper.replaceWith(frag);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
    removeEmptySources(element);
    unwrapDynamicLogo(element);
  }

  if (hookName === 'afterTransform') {
    // Final pass. Do not touch HTML comments: XWalk field hints are comments.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '.carousel-navigation-buttons',
      '.carousel-slide-indicators',
      'script',
      'style',
      'noscript',
      'link',
    ]);
    removeEmptySources(element);

    element.querySelectorAll('*').forEach((el) => {
      TRACKING_ATTRS.forEach((attr) => el.removeAttribute(attr));
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-analytics') || attr.name.startsWith('data-track')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
