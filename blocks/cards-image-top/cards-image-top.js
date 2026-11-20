import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Borderless cards: image on top, then title, body and link.
 * Each row is one card: [image] [text].
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-image-top-card-image';
      } else {
        div.className = 'cards-image-top-card-body';
      }
    });
    // keep image above the body regardless of authored cell order
    const image = li.querySelector('.cards-image-top-card-image');
    if (image && image !== li.firstElementChild) li.prepend(image);
    // the leading strong-only paragraph is the card title
    const firstP = li.querySelector('.cards-image-top-card-body > p:first-child');
    const strong = firstP?.querySelector(':scope > strong');
    if (strong && firstP.textContent.trim() === strong.textContent.trim()) {
      firstP.classList.add('cards-image-top-card-title');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
