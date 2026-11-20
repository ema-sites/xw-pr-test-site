/* eslint-disable */
/* global WebImporter */

/**
 * WKND Travel Dynamic Media transformer (XWalk project, template: travel-hospitality).
 * afterTransform only: rewrites DM Open API (/adobe/assets/urn:) and Scene7
 * (/is/image/) <img> elements into anchors that survive markdown conversion.
 * The scripts.js DM auto-block turns them back into <picture> at render time.
 *  - Unlinked image: <a href="DM-URL">alt-or-sentinel</a>
 *  - Linked image (img is the sole meaningful content of a link): keep href,
 *    set title to DM URL, replace content with alt-or-sentinel.
 *  - Mixed-content anchors are skipped with a warning.
 * Only <img> elements are touched. Video URLs (DM Open API .mp4 /play links,
 * s7viewers iframes used by the hotspot block) are never converted.
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

// DM Open API video delivery: .../urn:avid:aem:<name>.mp4/play (or other
// video extensions / manifest endpoints). These are video links, not images.
function isDmVideoUrl(urlStr) {
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  const p = u.pathname.toLowerCase();
  if (/\/play\/?$/.test(p) || /\/manifest\./.test(p)) return true;
  return /\.(mp4|m4v|mov|webm|m3u8|mpd)(\/|$)/.test(p);
}

function getDmImageSrc(img) {
  const candidates = [img.getAttribute('src'), img.getAttribute('data-src')];
  for (const c of candidates) {
    if (c && detectDynamicMediaUrl(c) && !isDmVideoUrl(c)) return c;
  }
  return null;
}

function altToLinkText(alt) {
  return (alt || '').trim() || EMPTY_ALT_SENTINEL;
}

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
    const dmUrl = getDmImageSrc(img);
    if (!dmUrl) return;
    const linkText = altToLinkText(img.getAttribute('alt'));
    const anchor = img.closest('a');

    if (anchor) {
      if (!isImgSoleContent(anchor, img)) {
        console.warn(`[wknd-dm-images] skipping DM image inside mixed-content link: ${dmUrl}`);
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
