import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

/*
 * Carousel Image Only
 * Full-width image slides (no text overlay) with dot indicators,
 * prev/next arrows and auto-advance. Each row is one slide: [image] [optional text].
 */

const AUTOPLAY_DELAY = 5000;
let carouselId = 0;

function updateActiveSlide(block, slide) {
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-image-only-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-image-only-slide-indicator button').forEach((button, idx) => {
    if (idx !== slideIndex) button.removeAttribute('disabled');
    else button.setAttribute('disabled', 'true');
  });
}

function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-image-only-slide');
  let realIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realIndex = 0;
  const activeSlide = slides[realIndex];
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-image-only-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior,
  });
}

function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let timer;
  const stop = () => { clearInterval(timer); timer = undefined; };
  const start = () => {
    stop();
    timer = setInterval(() => {
      showSlide(block, (parseInt(block.dataset.activeSlide, 10) || 0) + 1);
    }, AUTOPLAY_DELAY);
  };
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  // only run while the carousel is on screen
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
  }).observe(block);
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-image-only-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-image-only-slide').forEach((slide) => slideObserver.observe(slide));
}

function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-image-only-${id}-slide-${slideIndex}`;
  slide.classList.add('carousel-image-only-slide');

  [...row.children].forEach((cell) => {
    if (cell.querySelector('picture')) {
      cell.classList.add('carousel-image-only-slide-image');
      slide.append(cell);
    } else if (cell.textContent.trim()) {
      cell.classList.add('carousel-image-only-slide-content');
      slide.append(cell);
    }
    // empty text cells are dropped: this is an image-only carousel
  });

  const img = slide.querySelector('img');
  if (img && img.alt) slide.setAttribute('aria-label', img.alt);
  return slide;
}

export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-image-only-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;
  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  const { carousel: roleDescription } = placeholders;
  block.setAttribute('aria-roledescription', roleDescription || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-image-only-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-image-only-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-image-only-slide-indicators');
    nav.append(slideIndicators);
    block.append(nav);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-image-only-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-image-only-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  slidesWrapper.querySelectorAll('picture > img').forEach((img, idx) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, idx === 0, [
      { media: '(min-width: 600px)', width: '2000' },
      { width: '750' },
    ]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    startAutoplay(block);
  }
}
