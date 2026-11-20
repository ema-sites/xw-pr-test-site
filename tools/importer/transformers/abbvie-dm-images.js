/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie Dynamic Media transformer (XWalk project).
 * afterTransform only: rewrites DM Open API / Scene7 <img> elements into
 * anchors that survive markdown conversion. The scripts.js DM auto-block turns
 * them back into <picture> elements at render time.
 *  - Unlinked image: <a href="DM-URL">alt-or-sentinel</a>
 *  - Linked image (img is the sole meaningful content of a link): keep href,
 *    set title to DM URL, replace content with alt-or-sentinel.
 *  - Mixed-content anchors are skipped with a warning.
 */

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function altToLinkText(alt) {
  return (alt || '').trim() || EMPTY_ALT_SENTINEL;
}

function getImgSrc(img) {
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    img.src,
  ];
  for (const c of candidates) {
    if (c && detectDynamicMediaUrl(c)) return c;
  }
  return null;
}

// True when the img (and its optional <picture>) is the only meaningful
// content of the anchor.
function isImgSoleContent(anchor, img) {
  const clone = anchor.cloneNode(true);
  clone.querySelectorAll('img, picture, source').forEach((n) => n.remove());
  if (clone.textContent.trim() !== '') return false;
  return anchor.querySelectorAll('img').length === 1 && anchor.contains(img);
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const document = element.ownerDocument;

  [...element.querySelectorAll('img')].forEach((img) => {
    const dmUrl = getImgSrc(img);
    if (!dmUrl) return;
    const linkText = altToLinkText(img.getAttribute('alt'));
    const anchor = img.closest('a');

    if (anchor) {
      if (!isImgSoleContent(anchor, img)) {
        console.warn(`[dm-images] skipping DM image inside mixed-content link: ${dmUrl}`);
        return;
      }
      anchor.setAttribute('title', dmUrl);
      anchor.textContent = linkText;
      return;
    }

    const a = document.createElement('a');
    a.setAttribute('href', dmUrl);
    a.textContent = linkText;
    const picture = img.parentElement && img.parentElement.tagName === 'PICTURE'
      ? img.parentElement
      : null;
    (picture || img).replaceWith(a);
  });
}
