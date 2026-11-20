/*
 * Embed DM Viewer
 * Embeds an Adobe Dynamic Media (Scene7 s7viewers) HTML5 viewer URL as an iframe.
 * Row 1: [optional poster image] [viewer URL link]
 */

function readViewerUrl(block) {
  const link = block.querySelector('a[href]');
  const raw = link ? link.getAttribute('href') : [...block.querySelectorAll('div')]
    .map((d) => d.textContent.trim())
    .find((t) => /^https?:\/\//i.test(t));
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.href);
    return /^https?:$/.test(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function buildIframe(url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'embed-dm-viewer-frame';
  const iframe = document.createElement('iframe');
  // keep the authored viewer URL verbatim: Scene7 viewer params are order/encoding sensitive
  iframe.src = url.href;
  iframe.title = `Dynamic Media viewer from ${url.hostname}`;
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.setAttribute('allowfullscreen', '');
  wrapper.append(iframe);
  return wrapper;
}

function loadViewer(block, url) {
  if (block.classList.contains('embed-dm-viewer-is-loaded')) return;
  block.replaceChildren(buildIframe(url));
  block.classList.add('embed-dm-viewer-is-loaded');
}

export default function decorate(block) {
  const url = readViewerUrl(block);
  if (!url) return;
  const placeholder = block.querySelector('picture');
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-dm-viewer-placeholder';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'embed-dm-viewer-play';
    play.setAttribute('aria-label', 'Play');
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => loadViewer(block, url));
    block.append(wrapper);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadViewer(block, url);
    }
  });
  observer.observe(block);
}
