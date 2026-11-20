/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-image-only (xwalk item model carousel-image-only-item: media_image, media_imageAlt)
 * Source: .carousel-wrapper > .carousel (decorated EDS carousel)
 * One row per slide: [image]. Navigation buttons and slide indicators are dropped.
 * Falls back to undecorated authored rows (:scope > div) when slides are not decorated.
 */
export default function parse(element, { document }) {
  const cells = [];

  let slides = [...element.querySelectorAll('li.carousel-slide')];
  if (!slides.length) slides = [...element.querySelectorAll(':scope > div')];

  slides.forEach((slide) => {
    const imageHolder = slide.querySelector('.carousel-slide-image') || slide;
    const picture = imageHolder.querySelector('picture');
    const img = imageHolder.querySelector('img');
    const cell = [];
    if (img) {
      cell.push(document.createComment(' field:media_image '));
      cell.push(picture || img);
    } else {
      // Undecorated authored row: image carried as a link
      const a = imageHolder.querySelector('a[href]');
      if (a) {
        cell.push(document.createComment(' field:media_image '));
        cell.push(a);
      }
    }
    if (cell.length) cells.push([cell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-image-only', cells });
  element.replaceWith(block);
}
