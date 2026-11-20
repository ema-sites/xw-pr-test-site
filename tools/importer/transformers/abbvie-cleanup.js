/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie cleanup transformer.
 * Removes non-authorable chrome (header, footer, cookie banner, back-to-top),
 * hidden authoring-data divs, empty separator/spacer sections and tracking
 * attributes. Selectors come from migration-work/cleaned.html of
 * https://www.abbvie.com/privacy-center.html.
 */

const CHROME_SELECTORS = [
  'header',
  'footer',
  'nav',
  '.header-wrapper',
  '.footer-wrapper',
  '.nav-wrapper',
  '.breadcrumb',
  '.breadcrumbs',
  '.skip-link',
  // cookie / consent
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '.onetrust-pc-dark-filter',
  '.cookie-banner',
  '.cookie-consent',
  '[id*="cookie" i]',
  // back to top
  '.back-to-top',
  '.back-to-top-wrapper',
  '.backtotop',
  '[class*="back-to-top"]',
  // modals / widgets
  '.modal',
  'dialog',
  'iframe[src*="googletagmanager"]',
  // non-content tags
  'script',
  'style',
  'noscript',
  'link',
  // hidden authoring-data divs (EDS source authoring rows, not rendered)
  '.hero-container-item-authoring-data',
  '[class$="-authoring-data"]',
  // schema.org meta inside figures
  'figure meta[itemprop]',
];

const TRACKING_ATTRS = [
  'data-analytics',
  'data-track',
  'data-tracking',
  'data-cmp-data-layer',
  'data-gtm',
  'onclick',
];

// Third-party tracking pixels injected at runtime (e.g. Twitter/X ads beacons).
const TRACKING_PIXEL_HOSTS = /(^|\.)(t\.co|analytics\.twitter\.com|ads-twitter\.com|facebook\.com|doubleclick\.net|google-analytics\.com|googletagmanager\.com|linkedin\.com|bing\.com|adsrvr\.org)$/i;

function removeTrackingPixels(root) {
  root.querySelectorAll('img').forEach((img) => {
    let host = '';
    try { host = new URL(img.getAttribute('src') || '', 'https://www.abbvie.com/').hostname; } catch (e) { return; }
    if (!TRACKING_PIXEL_HOSTS.test(host)) return;
    const picture = img.closest('picture');
    (picture || img).remove();
  });
  // Drop paragraphs left empty by the removal.
  root.querySelectorAll('p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('img, picture, a, video, iframe')) p.remove();
  });
}

// The source page uses <h1 class="custom-title-heading"> for every section title. Only the hero
// title is the page heading; the others are section headings (h2).
function demoteSectionTitles(root) {
  root.querySelectorAll('h1.custom-title-heading').forEach((h1) => {
    if (h1.closest('.hero-container')) return;
    const h2 = h1.ownerDocument.createElement('h2');
    [...h1.attributes].forEach((a) => h2.setAttribute(a.name, a.value));
    while (h1.firstChild) h2.appendChild(h1.firstChild);
    h1.replaceWith(h2);
  });
}

function isEmptyNode(el) {
  if (!el) return true;
  if (el.querySelector('img, picture, video, iframe, svg, a, h1, h2, h3, h4, h5, h6, p, ul, ol, table')) return false;
  return el.textContent.trim() === '';
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
    removeTrackingPixels(element);
    demoteSectionTitles(element);

    // Separator blocks are purely visual spacing.
    element.querySelectorAll('.separator-wrapper').forEach((el) => el.remove());

    // Empty spacer grid columns (e.g. .grid-section.grid-cols-1 with no content).
    element.querySelectorAll('.grid-section').forEach((el) => {
      if (isEmptyNode(el)) el.remove();
    });

    // Empty top-level sections (e.g. trailing .separator-container section).
    const main = element.querySelector('#main-content') || element;
    [...main.children].forEach((child) => {
      if (child.classList && child.classList.contains('section') && isEmptyNode(child)) {
        child.remove();
      }
    });
  }

  if (hookName === 'afterTransform') {
    // Final pass for anything that survived parsing. Do not touch comments
    // (XWalk field hints are written as HTML comments by parsers).
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      'script',
      'style',
      'noscript',
      'link',
      '[class$="-authoring-data"]',
      '[hidden]',
    ]);
    removeTrackingPixels(element);

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
