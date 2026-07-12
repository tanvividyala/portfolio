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
} else if (location.hostname.endsWith("github.io")) {
  // GitHub Pages project site (served under /portfolio/)
  BASE_PATH = "/portfolio/";
} else {
  // Custom domain (served at root)
  BASE_PATH = "/";
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'https://drive.google.com/file/d/1-wUAzcKt9h2RGwp54iBRYk6b36fjFVtN/view?usp=sharing', title: 'Resume' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const logo = document.createElement('a');
logo.className = 'nav-logo';
logo.href = BASE_PATH;
logo.innerHTML = `<span class="nav-logo__name">tanvi vidyala</span>`;
nav.appendChild(logo);

const navLinks = document.createElement('div');
navLinks.className = 'nav-links';
nav.appendChild(navLinks);

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
  project.forEach((p, i) => {
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
    article.className = 'reveal';
    article.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
    article.innerHTML = `
      <div class="card-top">
        <div class="card-icon"><span class="card-icon-glyph" style="mask-image:url('${imgSrc}');-webkit-mask-image:url('${imgSrc}')"></span></div>
        <span class="card-year">${p.year ?? ''}</span>
      </div>
      ${p.eyebrow ? `<p class="card-eyebrow">${p.eyebrow}</p>` : ''}
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
  });
  observeReveals(containerElement);
}

export function renderProjectList(items, containerElement) {
  if (!containerElement) return;
  containerElement.innerHTML = '';
  items.forEach((p, i) => {
    const isExternal = p.url?.startsWith('http');
    const href = isExternal ? p.url : BASE_PATH + (p.url ?? '');
    const li = document.createElement('li');
    li.className = 'reveal';
    li.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
    li.innerHTML = `
      <a href="${href}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${p.eyebrow ?? p.description}</a>
      ${p.year ? `<span class="list-date">${p.year}</span>` : ''}
    `;
    containerElement.appendChild(li);
  });
  observeReveals(containerElement);
}

// Scroll reveal: fades/slides .reveal elements in as they enter the
// viewport. Applied to project cards (above) and to any static
// .reveal markup already in the page at load time.
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal--in');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

function observeReveals(root = document) {
  root.querySelectorAll('.reveal:not(.reveal--in)').forEach((el) => revealObserver.observe(el));
}

observeReveals();

document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="footer-contact">
      <div class="footer-text">
        <p class="footer-eyebrow">I'D LOVE TO CONNECT WITH YOU</p>
        <h2 class="footer-heading">Come say hello!</h2>
        <div class="footer-rows">
          <div class="footer-row">
            <span class="footer-label"><svg class="footer-row__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>EMAIL</span>
            <a href="mailto:tvidyala@ucsd.edu" class="footer-value">tvidyala@ucsd.edu</a>
          </div>
          <div class="footer-row">
            <span class="footer-label"><svg class="footer-row__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LINKEDIN</span>
            <a href="https://linkedin.com/in/tanvividyala" class="footer-value" target="_blank" rel="noopener noreferrer">/in/tanvividyala</a>
          </div>
          <div class="footer-row">
            <span class="footer-label"><svg class="footer-row__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.42-1.305.763-1.605-2.665-.303-5.466-1.334-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>GITHUB</span>
            <a href="https://github.com/tanvividyala" class="footer-value" target="_blank" rel="noopener noreferrer">/tanvividyala</a>
          </div>
          <div class="footer-row">
            <span class="footer-label"><svg class="footer-row__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6M9 9h1"/></svg>RESUME</span>
            <a href="https://drive.google.com/file/d/1-wUAzcKt9h2RGwp54iBRYk6b36fjFVtN/view?usp=sharing" class="footer-value" target="_blank" rel="noopener noreferrer">view resume</a>
          </div>
        </div>
      </div>
      <div class="footer-carousel">
        <div class="footer-carousel__track">
          <figure class="footer-carousel__slide is-active">
            <div class="footer-carousel__photo"><img src="${BASE_PATH}images/tanvihero.png" alt="Illustration of Tanvi"></div>
            <figcaption>hi, i'm tanvi!</figcaption>
          </figure>
          <figure class="footer-carousel__slide">
            <div class="footer-carousel__photo"><img src="${BASE_PATH}images/tanvi1.jpeg" alt="Tanvi and her dog Eevee"></div>
            <figcaption>me &amp; my dog eevee</figcaption>
          </figure>
          <figure class="footer-carousel__slide">
            <div class="footer-carousel__photo"><img src="${BASE_PATH}images/tanvi2.jpg" alt="Tanvi at Omegamart"></div>
            <figcaption>at omegamart, the coolest place ever</figcaption>
          </figure>
          <figure class="footer-carousel__slide">
            <div class="footer-carousel__photo"><img src="${BASE_PATH}images/tanvi3.jpg" alt="Tanvi"></div>
            <figcaption>fun fact, i used to want to be a psychologist!</figcaption>
          </figure>
          <button class="footer-carousel__arrow footer-carousel__arrow--prev" aria-label="Previous photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="footer-carousel__arrow footer-carousel__arrow--next" aria-label="Next photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="footer-carousel__dots">
          <button class="footer-carousel__dot is-active" aria-label="Show photo 1"></button>
          <button class="footer-carousel__dot" aria-label="Show photo 2"></button>
          <button class="footer-carousel__dot" aria-label="Show photo 3"></button>
          <button class="footer-carousel__dot" aria-label="Show photo 4"></button>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© TANVI VIDYALA</span>
    </div>
  </footer>
`);

// Footer photo carousel: navigate with arrows or dots.
{
  const carousel = document.querySelector('.footer-carousel');
  if (carousel) {
    const slides = $$('.footer-carousel__slide', carousel);
    const dots = $$('.footer-carousel__dot', carousel);
    const prevBtn = carousel.querySelector('.footer-carousel__arrow--prev');
    const nextBtn = carousel.querySelector('.footer-carousel__arrow--next');
    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
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
