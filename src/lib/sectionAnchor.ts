/**
 * The title of a section, as a link to its own place in the page. It looks
 * like plain text until the pointer or the keyboard focus is on it.
 */
export const sectionLink = (id: string, title: string) =>
  `<a href="#${id}">${title}</a>`;

let hasReaderMoved = false;

if (typeof window !== 'undefined') {
  for (const event of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
    window.addEventListener(event, () => (hasReaderMoved = true), {
      once: true,
      passive: true,
    });
  }
}

/**
 * Scrolls again to the section that the address names. The live sections get
 * their content after the page loads, and that moves the sections below them.
 * Call it after each such render. It does nothing after the reader moved.
 */
export const restoreTarget = () => {
  if (hasReaderMoved || location.hash.length < 2) return;

  document
    .getElementById(decodeURIComponent(location.hash.slice(1)))
    ?.scrollIntoView();
};
