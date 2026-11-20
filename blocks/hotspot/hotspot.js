import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * Hotspot
 * Background image with positioned, clickable circles that open media.
 * Row 1: [background image]
 * Rows 2..n (one per hotspot): [media link] [left %] [top %]
 */

const POSITION_RE = /^-?\d+(\.\d+)?\s*%?$/;

function toPercent(text) {
  const value = (text || '').trim();
  if (!POSITION_RE.test(value)) return null;
  return value.endsWith('%') ? value.replace(/\s+/g, '') : `${value}%`;
}

function isHotspotRow(row) {
  return [...row.children].some((cell) => toPercent(cell.textContent) !== null);
}

/**
 * Read the media URL from a hotspot cell. The DM auto-block in scripts.js
 * turns DM Open API links (including video /play URLs) into <picture>s
 * before decoration, so fall back to the rendered image src and drop the
 * rendition params it added.
 */
function readMediaUrl(cell) {
  const link = cell.querySelector('a[href]');
  let href = link?.href;
  if (!href) {
    const img = cell.querySelector('img');
    if (img?.src) {
      const url = new URL(img.src, window.location.href);
      ['width', 'format', 'quality'].forEach((p) => url.searchParams.delete(p));
      href = url.toString();
    }
  }
  if (!href) {
    const text = cell.textContent.trim();
    if (/^https?:\/\//i.test(text)) href = text;
  }
  if (!href) return null;
  try {
    const url = new URL(href, window.location.href);
    return /^https?:$/.test(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function getDialog(block) {
  let dialog = block.querySelector('.hotspot-dialog');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'hotspot-dialog';
  dialog.innerHTML = `
    <button type="button" class="hotspot-dialog-close" aria-label="Close"></button>
    <div class="hotspot-dialog-media"></div>
  `;
  const close = () => dialog.close();
  dialog.querySelector('.hotspot-dialog-close').addEventListener('click', close);
  // click on the backdrop closes
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  // stop playback when closed
  dialog.addEventListener('close', () => {
    dialog.querySelector('.hotspot-dialog-media').textContent = '';
  });
  block.append(dialog);
  return dialog;
}

function openMedia(block, url, label) {
  const dialog = getDialog(block);
  const media = dialog.querySelector('.hotspot-dialog-media');
  media.textContent = '';
  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    const video = document.createElement('video');
    video.src = url.href;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    media.append(video);
  } else {
    const iframe = document.createElement('iframe');
    iframe.src = url.href;
    iframe.title = label;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.setAttribute('allowfullscreen', '');
    media.append(iframe);
  }
  dialog.showModal();
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const stage = document.createElement('div');
  stage.className = 'hotspot-stage';

  const bgRow = rows.find((row) => !isHotspotRow(row) && row.querySelector('picture'));
  if (bgRow) {
    const bg = document.createElement('div');
    bg.className = 'hotspot-image';
    moveInstrumentation(bgRow, bg);
    const picture = bgRow.querySelector('picture');
    bg.append(picture);
    stage.append(bg);
  }

  const list = document.createElement('ul');
  list.className = 'hotspot-points';
  let count = 0;
  rows.filter(isHotspotRow).forEach((row) => {
    const cells = [...row.children];
    const positions = cells.map((c) => toPercent(c.textContent)).filter((v) => v !== null);
    const mediaCell = cells.find((c) => toPercent(c.textContent) === null);
    const url = mediaCell ? readMediaUrl(mediaCell) : null;
    if (!url || positions.length < 2) return;

    count += 1;
    const [left, top] = positions;
    const li = document.createElement('li');
    li.className = 'hotspot-point';
    li.style.left = left;
    li.style.top = top;
    moveInstrumentation(row, li);

    const label = mediaCell.querySelector('a')?.title?.trim()
      || mediaCell.querySelector('img')?.alt?.trim()
      || `Hotspot ${count}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot-button';
    button.setAttribute('aria-label', /^https?:/i.test(label) ? `Hotspot ${count}` : label);
    button.dataset.mediaUrl = url.href;
    button.addEventListener('click', () => openMedia(block, url, button.getAttribute('aria-label')));
    li.append(button);
    list.append(li);
  });
  stage.append(list);

  stage.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 600px)', width: '2000' },
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(stage);
}
