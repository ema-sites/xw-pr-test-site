/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-media (xwalk columns container; column children, no field hints)
 * Source: .bg-f1f3ff .grid-container-inner
 * One row per image section: [image | h2 heading + text]. Image and text
 * sections are paired by document order. Source headings are h1 -> h2.
 */
export default function parse(element, { document }) {
  const cells = [];
  const sections = [...element.querySelectorAll(':scope > .grid-section')];
  const imageSections = sections.filter((s) => s.classList.contains('custom-image-container'));
  const textSections = sections.filter((s) => s.classList.contains('custom-title-container')
    || s.classList.contains('text-container-container'));

  imageSections.forEach((imgSection, i) => {
    const imageCell = [];
    const img = imgSection.querySelector('img');
    if (img) imageCell.push(img);

    const textCell = [];
    const textSection = textSections[i];
    if (textSection) {
      textSection.querySelectorAll('.custom-title-heading').forEach((h) => {
        const h2 = document.createElement('h2');
        h2.innerHTML = h.innerHTML;
        textCell.push(h2);
      });
      textSection.querySelectorAll('.text-container .text-container-text').forEach((el) => {
        el.removeAttribute('class');
        textCell.push(el);
      });
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
