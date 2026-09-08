// Retro flower motifs — the same four-petal bloom that plays on the TV logo's
// screen, scattered down the page gutters. They drift and spin on their own,
// speed up when you point at one, and burst into petals when you click.
// Purely decorative: hidden from assistive tech and out of the tab order.

const SCHEME_COUNT = 4;

// One petal is a teardrop pointed at the flower's centre, repeated inside
// itself at smaller scales — scaling about (0,0) keeps every layer sharing
// that point, which is what makes the seventies pinwheel middle.
const PETAL = 'M0 0 L13.13 -18.86 A16 16 0 1 0 -13.13 -18.86 Z';

const PETAL_STACK = `
  <path class="flower__l1" d="${PETAL}"/>
  <path class="flower__l2" transform="scale(0.70)" d="${PETAL}"/>
  <path class="flower__l3" transform="scale(0.46)" d="${PETAL}"/>
  <path class="flower__l4" transform="scale(0.28)" d="${PETAL}"/>`;

const FLOWER_SVG = `
  <svg class="flower__svg" viewBox="-46 -46 92 92" aria-hidden="true" focusable="false">
    <g>${PETAL_STACK}</g>
    <g transform="rotate(90)">${PETAL_STACK}</g>
    <g transform="rotate(180)">${PETAL_STACK}</g>
    <g transform="rotate(270)">${PETAL_STACK}</g>
    <circle class="flower__ring" r="7"/>
    <circle class="flower__eye" r="4.4"/>
  </svg>`;

// A flatter, single-layer version of the same petal for the experience-list
// markers — a bullet point, not a centrepiece, so it skips the nested rings.
const MARKER_SVG = `
  <svg class="marker__svg" viewBox="-46 -46 92 92" aria-hidden="true" focusable="false">
    <path class="marker__petal" d="${PETAL}"/>
    <path class="marker__petal" transform="rotate(90)" d="${PETAL}"/>
    <path class="marker__petal" transform="rotate(180)" d="${PETAL}"/>
    <path class="marker__petal" transform="rotate(270)" d="${PETAL}"/>
    <circle class="marker__eye" r="6"/>
  </svg>`;

// side / depth down the page / size in rem / spin + bob seconds.
// Negative delays start each one mid-cycle so they never move in lockstep.
const PLACEMENTS = [
  { side: 'left',  top: '6%',  size: 4.2, spin: 34, bob: 7.4, delay: -1.2 },
  { side: 'right', top: '12%', size: 3.1, spin: 26, bob: 6.1, delay: -3.5 },
  { side: 'left',  top: '22%', size: 3.0, spin: 30, bob: 8.2, delay: -0.4 },
  { side: 'right', top: '30%', size: 3.9, spin: 38, bob: 7.0, delay: -2.6 },
  { side: 'left',  top: '40%', size: 3.4, spin: 28, bob: 6.6, delay: -4.1 },
  { side: 'right', top: '48%', size: 3.0, spin: 33, bob: 7.8, delay: -1.8 },
  { side: 'left',  top: '58%', size: 4.0, spin: 24, bob: 6.9, delay: -3.0 },
  { side: 'right', top: '65%', size: 3.3, spin: 30, bob: 7.1, delay: -2.1 },
  { side: 'left',  top: '74%', size: 3.2, spin: 32, bob: 6.4, delay: -0.7 },
  // `nudge` shifts a bloom in rem: positive moves it inward off its gutter
  // edge, negative pushes it further out. These last two keep clear of the
  // footer's contact rows.
  { side: 'left',  top: '90%', size: 2.9, spin: 36, bob: 6.8, delay: -1.6, nudge: -2.5 },
  { side: 'right', top: '96%', size: 3.4, spin: 25, bob: 7.3, delay: -0.9, nudge: 6 },
];

const field = document.createElement('div');
field.className = 'flower-field';
field.setAttribute('aria-hidden', 'true');

for (const [i, spot] of PLACEMENTS.entries()) {
  const flower = document.createElement('span');
  flower.className = 'flower';
  flower.dataset.side = spot.side;
  flower.dataset.scheme = String(i % SCHEME_COUNT);
  flower.style.cssText = `top:${spot.top};--size:${spot.size}rem;--spin:${spot.spin}s;--bob:${spot.bob}s;--delay:${spot.delay}s;--nudge:${spot.nudge ?? 0}rem`;
  flower.innerHTML = `<span class="flower__bob"><span class="flower__pop">${FLOWER_SVG}</span></span>`;
  flower.addEventListener('click', () => bloom(flower));
  field.append(flower);
}

document.body.append(field);

// Click a bloom: pop it, throw a ring of petals, and roll to the next palette.
function bloom(flower) {
  flower.classList.remove('is-bloom');
  void flower.offsetWidth; // restart the pop even on a rapid second click
  flower.classList.add('is-bloom');

  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const petal = document.createElement('span');
    petal.className = 'flower-petal';
    petal.style.setProperty('--a', `${(360 / petals) * i + (Math.random() * 24 - 12)}deg`);
    petal.style.setProperty('--d', `${30 + Math.random() * 26}px`);
    petal.addEventListener('animationend', () => petal.remove());
    flower.append(petal);
  }

  const next = (Number(flower.dataset.scheme) + 1) % SCHEME_COUNT;
  flower.dataset.scheme = String(next);
}

// The experience entries are <details> toggles; give each one a bloom for a
// marker so the motif does the work the usual disclosure triangle would.
document.querySelectorAll('.role > .role__line').forEach((summary, i) => {
  const marker = document.createElement('span');
  marker.className = 'role__marker';
  marker.dataset.scheme = String(i % SCHEME_COUNT);
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = MARKER_SVG;
  summary.prepend(marker);
});

// The TV logo is the source of the motif, so clicking it sends a handful of
// blooms drifting up off the screen.
const siteIcon = document.querySelector('.site-icon');

function throwBlooms() {
  for (let i = 0; i < 5; i++) {
    const sprite = document.createElement('span');
    sprite.className = 'flower-sprite';
    sprite.dataset.scheme = String(i % SCHEME_COUNT);
    sprite.innerHTML = FLOWER_SVG;
    sprite.style.left = `${siteIcon.offsetLeft + siteIcon.offsetWidth * (0.2 + Math.random() * 0.55)}px`;
    sprite.style.top = `${siteIcon.offsetTop + siteIcon.offsetHeight * (0.3 + Math.random() * 0.35)}px`;
    sprite.style.setProperty('--size', `${0.9 + Math.random() * 0.9}rem`);
    sprite.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
    sprite.style.setProperty('--rise', `${100 + Math.random() * 80}px`);
    sprite.style.animationDelay = `${i * 70}ms`;
    sprite.addEventListener('animationend', () => sprite.remove());
    field.append(sprite);
  }
}

siteIcon?.addEventListener('click', throwBlooms);
