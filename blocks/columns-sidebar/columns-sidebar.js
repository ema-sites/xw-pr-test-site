/**
 * Two unequal columns: wide main copy and a narrow aside (label + links).
 * Each row: [main] [aside]. Extra cells are kept and treated as main content.
 * @param {Element} block
 */
export default function decorate(block) {
  const first = block.firstElementChild;
  const cols = first ? [...first.children] : [];
  block.classList.add(`columns-sidebar-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-sidebar-row');
    const cells = [...row.children];
    cells.forEach((cell, i) => {
      if (cells.length > 1 && i === cells.length - 1) {
        cell.classList.add('columns-sidebar-aside');
        // first short paragraph without a link acts as the aside label
        const label = cell.querySelector(':scope > p:first-child');
        if (label && !label.querySelector('a') && cell.children.length > 1) {
          label.classList.add('columns-sidebar-label');
        }
      } else {
        cell.classList.add('columns-sidebar-main');
      }
    });
  });
}
