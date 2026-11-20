/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-gradient (xwalk item model cards-gradient-card: image, imageAlt, text)
 * Source: .cards-wrapper > .cards (decorated EDS cards, 4 instances on travel-hospitality)
 * One row per card: [image | rich text (title, CTA link, description) or caption].
 * Tours cards use .cards-card-dynamic-image (Scene7 templated <img>); others use .cards-card-image.
 * Falls back to undecorated authored rows (:scope > div > div) when cards are not decorated.
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = [...element.querySelectorAll(':scope > ul > li')];
  const decorated = items.length > 0;
  if (!decorated) items = [...element.querySelectorAll(':scope > div')];

  items.forEach((item) => {
    let imageHolder;
    let body;
    if (decorated) {
      imageHolder = item.querySelector('.cards-card-image, .cards-card-dynamic-image');
      body = item.querySelector('.cards-card-body');
    } else {
      const cols = [...item.querySelectorAll(':scope > div')];
      imageHolder = cols[0] || null;
      body = cols[1] || null;
    }

    const imageCell = [];
    if (imageHolder) {
      const picture = imageHolder.querySelector('picture');
      const img = imageHolder.querySelector('img');
      const imgLink = !img ? imageHolder.querySelector('a[href]') : null;
      if (img || imgLink) {
        imageCell.push(document.createComment(' field:image '));
        imageCell.push(picture || img || imgLink);
      }
    }

    const textCell = [];
    if (body && body.textContent.trim()) {
      textCell.push(document.createComment(' field:text '));
      const children = [...body.children];
      if (children.length) {
        children.forEach((child) => textCell.push(child));
      } else {
        const p = document.createElement('p');
        p.textContent = body.textContent.trim();
        textCell.push(p);
      }
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gradient', cells });
  element.replaceWith(block);
}
