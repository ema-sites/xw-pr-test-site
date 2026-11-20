/**
 * Text-only teaser: large heading on the left, body copy + CTA on the right.
 * Each row: [heading] [body + link].
 * @param {Element} block
 */
export default function decorate(block) {
  const first = block.firstElementChild;
  const cols = first ? [...first.children] : [];
  block.classList.add(`columns-teaser-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-teaser-row');
    [...row.children].forEach((cell, i) => {
      const headingOnly = cell.children.length > 0
        && [...cell.children].every((el) => /^H[1-6]$/.test(el.tagName));
      cell.classList.add(i === 0 || headingOnly ? 'columns-teaser-heading' : 'columns-teaser-body');
    });
    // the last paragraph containing only a link is the CTA
    row.querySelectorAll('.columns-teaser-body > p').forEach((p) => {
      const a = p.querySelector(':scope > a, :scope > strong > a, :scope > em > a');
      if (a && p.textContent.trim() === a.textContent.trim()) p.classList.add('columns-teaser-cta');
    });
  });
}
