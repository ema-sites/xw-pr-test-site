/* eslint-disable */
/* global WebImporter */
/**
 * Parser: hero-inset-card (xwalk model hero-inset-card: image, imageAlt, text)
 * Source: .hero-container on https://www.abbvie.com/privacy-center.html
 * The cleanup transformer removes .hero-container-item-authoring-data, so the
 * image comes from the rendered .hero-container-bg img.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: image (imageAlt collapses into the img alt)
  const img = element.querySelector('.hero-container-bg img');
  const imageCell = [];
  if (img) {
    imageCell.push(document.createComment(' field:image '));
    imageCell.push(img);
  }
  cells.push([imageCell]);

  // Row 2: text (title + subtitle)
  const textCell = [];
  const title = element.querySelector('.custom-title-heading, .hero-container-section-inner h1, .hero-container-section-inner h2');
  const subtitles = [...element.querySelectorAll('.text-container .text-container-text')];
  if (title || subtitles.length) {
    textCell.push(document.createComment(' field:text '));
    if (title) {
      const h1 = document.createElement('h1');
      h1.innerHTML = title.innerHTML;
      textCell.push(h1);
    }
    subtitles.forEach((p) => textCell.push(p));
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-inset-card', cells });
  element.replaceWith(block);
}
