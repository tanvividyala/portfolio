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
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'meta/', title: 'Meta' },
  { url: 'https://github.com/tanvividyala', title: 'GitHub' },
];

document.body.insertAdjacentHTML(
  'afterbegin',
  `<label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`,
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', (event) => {
  localStorage.colorScheme = event.target.value;
  setColorScheme(event.target.value);
});

let nav = document.createElement('nav');
document.body.prepend(nav);

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

  nav.append(a);
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  for (const p of project) {
    const article = document.createElement('article');
    article.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="card-body">
        <${headingLevel}>${p.title}</${headingLevel}>
        <div>
          <p>${p.description}</p>
          <span class="project-year">${p.year ?? ''}</span>
        </div>
      </div>
    `;
    containerElement.appendChild(article);
  }
}

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
