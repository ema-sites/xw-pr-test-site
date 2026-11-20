/* eslint-disable */
/* global WebImporter */

/**
 * AbbVie sections transformer.
 * beforeTransform: inserts <hr> section breaks (while section elements still
 * exist) and marks styled sections with a temporary data-excat-section-id.
 * afterTransform: appends a Section Metadata block to each styled section.
 */

const MARKER_ATTR = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector for this DOM implementation, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      // Non-first sections always get a break; a styled first section gets a
      // temporary marker <hr> that is removed in afterTransform.
      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
        el.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const meta = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      const el = findSectionElement(element, section);
      if (el) {
        el.after(meta);
      } else if (marker) {
        // Section element was replaced; append metadata before the next break.
        let cursor = marker.nextElementSibling;
        let last = marker;
        while (cursor && cursor.tagName !== 'HR') {
          last = cursor;
          cursor = cursor.nextElementSibling;
        }
        last.after(meta);
      }

      if (marker) {
        if (i === 0) marker.remove();
        else marker.removeAttribute(MARKER_ATTR);
      }
    }
  }
}
