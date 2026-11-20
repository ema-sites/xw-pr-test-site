/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-sidebar (xwalk columns container; column children, no field hints)
 * Source: .grid-container-inner:has(.eyebrow-text.divider)
 * Left cell: intro text. Right cell: "HELPFUL LINKS" label + CTA link(s).
 */
export default function parse(element, { document }) {
  // Left: intro text from the text-container section
  const leftCell = [];
  element.querySelectorAll('.text-container-container .text-container-text').forEach((p) => leftCell.push(p));

  // Right: eyebrow label + CTA links
  const rightCell = [];
  const label = element.querySelector('.eyebrow-text-text');
  if (label) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    rightCell.push(p);
  }
  element.querySelectorAll('.cta a[href]').forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    rightCell.push(p);
  });

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-sidebar', cells });
  element.replaceWith(block);
}
