/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-image-top (xwalk card model cards-image-top-card: image, imageAlt, text)
 * Source: .grid-container-inner:has(> .grid-cols-4.custom-image-container)
 * One row per .grid-section card: [image | bold title + description + CTA].
 */
export default function parse(element, { document }) {
  const cells = [];
  const cards = element.querySelectorAll(':scope > .grid-section.custom-image-container');

  cards.forEach((card) => {
    const imageCell = [];
    const img = card.querySelector('.custom-image img');
    if (img) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(img);
    }

    const textCell = [];
    const title = card.querySelector('.eyebrow-text-text');
    const descs = [...card.querySelectorAll('.text-container .text-container-text')];
    const ctas = [...card.querySelectorAll('.cta a[href]')];
    if (title || descs.length || ctas.length) {
      textCell.push(document.createComment(' field:text '));
      if (title) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        p.append(strong);
        textCell.push(p);
      }
      descs.forEach((d) => textCell.push(d));
      ctas.forEach((a) => {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        const p = document.createElement('p');
        p.append(link);
        textCell.push(p);
      });
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-image-top', cells });
  element.replaceWith(block);
}
