/* eslint-disable */
/* global WebImporter */
/**
 * Parser: embed-dm-viewer (xwalk model embed-dm-viewer: embed_placeholder, embed_placeholderAlt, embed_uri)
 * Source: .embed-wrapper > .embed (DM viewer embed; iframe may not be rendered yet)
 * Single row, single cell: [optional placeholder image + viewer URL link].
 * URL lookup order: iframe[src] -> a[href] -> data-* attribute -> plain-text URL.
 * If nothing is found the cell is left empty and a warning is logged (no hardcoding).
 */
function findViewerUrl(element) {
  const iframe = element.querySelector('iframe[src]');
  if (iframe && iframe.getAttribute('src')) return iframe.getAttribute('src');

  const a = element.querySelector('a[href]');
  if (a && a.getAttribute('href')) return a.getAttribute('href');

  const nodes = [element, ...element.querySelectorAll('*')];
  for (const node of nodes) {
    for (const attr of [...node.attributes]) {
      if ((attr.name === 'data' || attr.name.startsWith('data-')) && /^https?:\/\//i.test(attr.value.trim())) {
        return attr.value.trim();
      }
    }
  }

  const text = element.textContent.trim();
  const m = text.match(/https?:\/\/\S+/);
  return m ? m[0] : '';
}

/**
 * Fallback for EDS sources whose embed block renders empty: read the authored
 * `.plain.html` of the same page (same origin, synchronous) and take the URL of
 * the embed block at the same position as this one.
 */
function findAuthoredViewerUrl(element, document, params) {
  try {
    const pageUrl = new URL((params && params.originalURL) || document.location.href);
    const embeds = [...document.querySelectorAll('.embed-wrapper > .embed, div.embed')];
    const index = Math.max(0, embeds.indexOf(element));
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${pageUrl.origin}${pageUrl.pathname.replace(/\.html$/, '')}.plain.html`, false);
    xhr.send();
    if (xhr.status !== 200) return '';
    const authored = new DOMParser().parseFromString(xhr.responseText, 'text/html');
    const block = authored.querySelectorAll('div.embed')[index];
    if (!block) return '';
    const a = block.querySelector('a[href]');
    if (a) return a.getAttribute('href');
    const m = block.textContent.match(/https?:\/\/\S+/);
    return m ? m[0] : '';
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document, params }) {
  const cells = [];
  const cell = [];

  const picture = element.querySelector('picture');
  const img = element.querySelector('img');
  if (img) {
    cell.push(document.createComment(' field:embed_placeholder '));
    cell.push(picture || img);
  }

  const url = findViewerUrl(element) || findAuthoredViewerUrl(element, document, params);
  if (url) {
    cell.push(document.createComment(' field:embed_uri '));
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.textContent = url;
    cell.push(a);
  } else {
    console.warn('[embed-dm-viewer] no Dynamic Media viewer URL found in block; leaving embed_uri empty');
  }

  cells.push([cell.length ? cell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-dm-viewer', cells });
  element.replaceWith(block);
}
