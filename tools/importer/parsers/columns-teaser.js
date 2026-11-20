/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-teaser (xwalk columns container; column children, no field hints)
 * Source: .teaser .teaser-content
 * Left cell: p.teaser-title rendered as h2 (accent span -> <em>).
 * Right cell: description paragraphs + CTA link.
 */
export default function parse(element, { document }) {
  const leftCell = [];
  const title = element.querySelector('.teaser-left .teaser-title, .teaser-left h1, .teaser-left h2, .teaser-left h3');
  if (title) {
    const h2 = document.createElement('h2');
    [...title.childNodes].forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'SPAN') {
        const em = document.createElement('em');
        em.textContent = node.textContent;
        h2.append(em);
      } else {
        h2.append(node.cloneNode(true));
      }
    });
    leftCell.push(h2);
  }

  const rightCell = [];
  element.querySelectorAll('.teaser-right .teaser-description p').forEach((p) => rightCell.push(p));
  element.querySelectorAll('.teaser-right .button-container a[href]').forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    rightCell.push(p);
  });

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells });
  element.replaceWith(block);
}
