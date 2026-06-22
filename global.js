console.log('IT\'S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2 (superseded by Step 3)
// let navLinks = $$("nav a");
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// currentLink?.classList.add('current');

// Step 3: Automatic navigation menu

let BASE_PATH;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  // Local dev server
  BASE_PATH = "/";
} else if (location.origin === "null") {
  // file:// protocol — build absolute path to portfolio root
  let dir = location.href.replace(/\/[^/]+$/, '/');
  if (location.pathname.match(/\/(projects|contact|resume)\//)) {
    dir = dir.replace(/[^/]+\/$/, '');
  }
  BASE_PATH = dir;
} else {
  // GitHub Pages
  BASE_PATH = "/portfolio/";
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/tanvividyala', title: 'GitHub' },
];

const themeToggle = document.createElement('button');
themeToggle.className = 'color-scheme-toggle';
themeToggle.setAttribute('aria-label', 'Toggle light/dark mode');
themeToggle.innerHTML = `<span class="toggle-icon">☀</span><span class="toggle-track"><span class="toggle-thumb"></span></span><span class="toggle-icon">☾</span>`;

function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  document.documentElement.setAttribute('data-color-scheme', scheme);
}

const stored = localStorage.colorScheme;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setColorScheme(stored || (prefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-color-scheme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.colorScheme = next;
  setColorScheme(next);
});

let nav = document.createElement('nav');
document.body.prepend(nav);

const logo = document.createElement('a');
logo.className = 'nav-logo';
logo.href = BASE_PATH;
logo.innerHTML = `<span class="nav-logo__mark">tv</span><span class="nav-logo__name">tanvi.</span>`;
nav.appendChild(logo);

const navLinks = document.createElement('div');
navLinks.className = 'nav-links';
nav.appendChild(navLinks);

nav.appendChild(themeToggle);

const hamburger = document.createElement('button');
hamburger.className = 'nav-hamburger';
hamburger.setAttribute('aria-label', 'Toggle navigation');
hamburger.innerHTML = '<span></span><span></span><span></span>';
nav.appendChild(hamburger);

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Step 5: Better contact form
const form = document.querySelector('form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const params = [];
  for (let [name, value] of data) {
    params.push(`${name}=${encodeURIComponent(value)}`);
  }
  location.href = `${form.action}?${params.join('&')}`;
});

// Normalize URL for comparison: strip index.html and ensure trailing slash
function normalizeURL(href) {
  return href.replace(/index\.html$/, '').replace(/\/?$/, '/');
}

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = !url.startsWith('http') ? BASE_PATH + url : url;

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle('current', normalizeURL(a.href) === normalizeURL(location.href));

  if (a.protocol !== location.protocol || a.host !== location.host) {
    a.target = '_blank';
  }

  navLinks.append(a);
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const p of project) {
    const imgSrc = p.image?.startsWith('http') ? p.image : BASE_PATH + (p.image ?? '');
    const tagsHTML = p.tags?.length
      ? `<div class="card-tags">${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>`
      : '';
    const footerHTML = p.url
      ? `<div class="card-footer">
          <span class="card-link">${p.linkLabel ?? 'view'} <span class="arrow">→</span></span>
        </div>`
      : '';
    const article = document.createElement('article');
    article.innerHTML = `
      <div class="card-top">
        <div class="card-icon"><img src="${imgSrc}" alt=""></div>
        <span class="card-year">${p.year ?? ''}</span>
      </div>
      ${p.eyebrow ? `<p class="card-eyebrow">— ${p.eyebrow}</p>` : ''}
      <${headingLevel} class="card-title">${p.title}</${headingLevel}>
      <p class="card-desc">${p.description}</p>
      ${tagsHTML}
      ${footerHTML}
    `;
    if (p.url) {
      const a = document.createElement('a');
      const isExternal = p.url.startsWith('http');
      a.href = isExternal ? p.url : BASE_PATH + p.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.appendChild(article);
      containerElement.appendChild(a);
    } else {
      containerElement.appendChild(article);
    }
  }
}

document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="footer-contact">
      <p class="footer-eyebrow">— I'D LOVE TO CONNECT WITH YOU</p>
      <h2 class="footer-heading">Come say hello!</h2>
      <div class="footer-rows">
        <div class="footer-row">
          <span class="footer-label">EMAIL</span>
          <a href="mailto:tvidyala@ucsd.edu" class="footer-value">tvidyala@ucsd.edu</a>
        </div>
        <div class="footer-row">
          <span class="footer-label">LINKEDIN</span>
          <a href="https://linkedin.com/in/tanvividyala" class="footer-value" target="_blank" rel="noopener noreferrer">/in/tanvividyala</a>
        </div>
        <div class="footer-row">
          <span class="footer-label">GITHUB</span>
          <a href="https://github.com/tanvividyala" class="footer-value" target="_blank" rel="noopener noreferrer">/tanvividyala</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© TANVI VIDYALA · UCSD COGSCI '26</span>
    </div>
  </footer>
`);

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}
