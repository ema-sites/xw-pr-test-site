import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Stacked media rows: image in one cell, rich text in the other (about 50/50).
 * Each row: [image] [text].
 * @param {Element} block
 */
export default function decorate(block) {
  const first = block.firstElementChild;
  const cols = first ? [...first.children] : [];
  block.classList.add(`columns-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      const textless = !cell.textContent.trim();
      if (pic && textless) {
        cell.classList.add('columns-media-img-col');
      } else {
        cell.classList.add('columns-media-text-col');
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
