import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Fixes common ARIA issues in the document
 */
function fixAriaIssues(document) {
  const main = document.querySelector('main');

  // Fix missing roles on interactive elements
  main.querySelectorAll('[tabindex="0"]').forEach((el) => {
    if (!el.getAttribute('role')) {
      el.setAttribute('role', 'button');
    }
  });

  // Fix invalid ARIA expanded values
  main.querySelectorAll('[aria-expanded]').forEach((el) => {
    if (el.getAttribute('aria-expanded') !== 'true' && el.getAttribute('aria-expanded') !== 'false') {
      el.setAttribute('aria-expanded', 'false');
    }
  });

  // Fix tablist and tabs
  main.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    tablist.setAttribute('aria-orientation', 'horizontal');
    const tabs = tablist.querySelectorAll('[role="tab"]');
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      tab.setAttribute('aria-controls', `tabpanel-${index}`);
    });
  });

  // Fix duplicate ARIA IDs
  main.querySelectorAll('[aria-labelledby]').forEach((el) => {
    const ids = el.getAttribute('aria-labelledby').split(' ');
    const uniqueIds = [...new Set(ids)];
    el.setAttribute('aria-labelledby', uniqueIds.join(' '));
  });

  // Fix missing accessible names
  main.querySelectorAll('img[alt=""]').forEach((img) => {
    img.setAttribute('alt', 'Decorative image');
  });

  // Fix ARIA hidden with focusable content
  main.querySelectorAll('[aria-hidden="true"] button, [aria-hidden="true"] [tabindex="0"]').forEach((el) => {
    el.setAttribute('tabindex', '-1');
  });

  // Fix listbox and options
  main.querySelectorAll('[role="listbox"]').forEach((listbox) => {
    listbox.setAttribute('aria-multiselectable', 'false');
    const options = listbox.querySelectorAll('[role="option"]');
    options.forEach((option, index) => {
      option.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    });
  });

  // Fix invalid ARIA attributes
  main.querySelectorAll('[aria-required]').forEach((el) => {
    if (el.getAttribute('aria-required') !== 'true' && el.getAttribute('aria-required') !== 'false') {
      el.removeAttribute('aria-required');
    }
  });

  // Fix missing ARIA labels on form controls
  main.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach((input) => {
    const label = input.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      input.setAttribute('aria-labelledby', label.id || `label-${Math.random().toString(36).substr(2, 9)}`);
    } else {
      input.setAttribute('aria-label', 'Input field');
    }
  });

  // Fix incorrect ARIA roles
  main.querySelectorAll('a[role="button"]').forEach((link) => {
    link.removeAttribute('role');
  });

  // Fix ARIA live regions
  main.querySelectorAll('[role="alert"]').forEach((alert) => {
    alert.setAttribute('aria-live', 'assertive');
  });

  // Fix invalid ARIA states
  main.querySelectorAll('[role="checkbox"][aria-checked]').forEach((checkbox) => {
    if (checkbox.getAttribute('aria-checked') !== 'true' && checkbox.getAttribute('aria-checked') !== 'false') {
      checkbox.setAttribute('aria-checked', 'false');
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  fixAriaIssues(document);
  loadDelayed();
}

loadPage();
