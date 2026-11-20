import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards Gradient: image on top, centered text on a gradient card shell.
 * Each row is one card: [image] [rich text: title, CTA link, description | caption].
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      const isImage = div.querySelector('picture') && !div.textContent.trim();
      div.className = isImage ? 'cards-gradient-card-image' : 'cards-gradient-card-body';
    });
    // drop fully empty body cells
    li.querySelectorAll('.cards-gradient-card-body').forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('img')) div.remove();
    });
    // keep the image above the body regardless of authored cell order
    const image = li.querySelector('.cards-gradient-card-image');
    if (image && image !== li.firstElementChild) li.prepend(image);

    const body = li.querySelector('.cards-gradient-card-body');
    if (body) {
      const paragraphs = [...body.querySelectorAll(':scope > p')];
      const ctaIndex = paragraphs.findIndex((p) => p.querySelector('a')
        && p.textContent.trim() === p.querySelector('a').textContent.trim());
      if (ctaIndex >= 0) {
        paragraphs[ctaIndex].classList.add('cards-gradient-card-cta');
        if (ctaIndex > 0) paragraphs[0].classList.add('cards-gradient-card-title');
      } else if (paragraphs.length <= 1) {
        // single line of text: caption-only card
        body.classList.add('cards-gradient-card-caption');
      }
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
