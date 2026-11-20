/* eslint-disable */
/* global WebImporter */
/**
 * Parser: hotspot (xwalk models: hotspot {image, imageAlt}; hotspot-item {link, left, top})
 * Source: .hotspot-wrapper > .hotspot (decorated EDS hotspot block)
 * Row 1: background map image. Each further row: [media link | left % | top %].
 * Decorated DOM: each child div.hotspot carries data="<media URL>" and inline
 * style="left: x%; top: y%;"; the nested iframe also carries the URL (fallback).
 * Undecorated authored rows ([link | left | top]) are also supported.
 */
function readStyleValue(styleAttr, prop) {
  if (!styleAttr) return '';
  const m = styleAttr.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m ? m[1].trim() : '';
}

function makeLink(document, href) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = href;
  return a;
}

export default function parse(element, { document }) {
  const cells = [];
  const rows = [...element.querySelectorAll(':scope > div')];

  // Background image row: first direct child that is not a hotspot item
  const bgRow = rows.find((r) => !r.classList.contains('hotspot') && (r.querySelector('img') || r.querySelector('a[href]')));
  const bgCell = [];
  if (bgRow) {
    const picture = bgRow.querySelector('picture');
    const img = bgRow.querySelector('img');
    const bgLink = !img ? bgRow.querySelector('a[href]') : null;
    if (img || bgLink) {
      bgCell.push(document.createComment(' field:image '));
      bgCell.push(picture || img || bgLink);
    }
  }
  cells.push([bgCell]);

  const items = rows.filter((r) => r !== bgRow);
  items.forEach((item, idx) => {
    let href = '';
    let left = '';
    let top = '';

    if (item.classList.contains('hotspot')) {
      href = item.getAttribute('data') || item.getAttribute('data-url') || '';
      if (!href) {
        const iframe = item.querySelector('iframe[src]');
        const a = item.querySelector('a[href]');
        href = (iframe && iframe.getAttribute('src')) || (a && a.getAttribute('href')) || '';
      }
      const style = item.getAttribute('style') || '';
      left = readStyleValue(style, 'left');
      top = readStyleValue(style, 'top');
    } else {
      // Undecorated authored row: [link | left | top]
      const cols = [...item.querySelectorAll(':scope > div')];
      const a = cols[0] && cols[0].querySelector('a[href]');
      href = a ? a.getAttribute('href') : ((cols[0] && cols[0].textContent.trim()) || '');
      left = (cols[1] && cols[1].textContent.trim()) || '';
      top = (cols[2] && cols[2].textContent.trim()) || '';
    }

    if (!href) {
      console.warn(`[hotspot] item ${idx + 1}: no media URL found`);
      return;
    }
    if (!left || !top) console.warn(`[hotspot] item ${idx + 1}: missing left/top position`);

    const linkCell = [document.createComment(' field:link '), makeLink(document, href)];
    const leftCell = left ? [document.createComment(' field:left '), document.createTextNode(left)] : '';
    const topCell = top ? [document.createComment(' field:top '), document.createTextNode(top)] : '';
    cells.push([linkCell, leftCell, topCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'hotspot', cells });
  element.replaceWith(block);
}
