import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Hero with a photo and a content card overlapping the photo's lower edge.
 * Authored rows: [image] then [text (heading + subtitle)].
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  let media = null;
  let content = null;

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const hasPicture = !!cell.querySelector('picture');
    const hasText = !!cell.textContent.trim();
    if (hasPicture && !hasText && !media) {
      media = row;
      row.className = 'hero-inset-card-media';
    } else if (hasText && !content) {
      content = row;
      row.className = 'hero-inset-card-content';
    }
  });

  if (!media && !content) return;

  if (content) {
    const card = content.firstElementChild || content;
    card.classList.add('hero-inset-card-card');
  }

  if (!media) block.classList.add('hero-inset-card-no-image');

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, true, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
