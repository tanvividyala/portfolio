// Clicking the TV changes the channel: a blink of static, then the next
// picture. The screen is inline SVG in index.html so the channels are just
// groups we toggle.
//
// Photos join automatically: drop images/prettylj<n>.png into the repo and
// each becomes a channel. A static host has no directory listing, so we probe
// the numbers instead. Numbering doesn't have to start at 1 or be gapless —
// we only give up after a few empty numbers in a row.

const SVG_NS = 'http://www.w3.org/2000/svg';
const PHOTO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
const PHOTO_LIMIT = 24;
const MISSES_BEFORE_STOPPING = 4;

const tv = document.querySelector('.site-icon');
const screen = document.querySelector('.tv-screen');
const staticBurst = document.querySelector('.tv-static');
const stillPlease = window.matchMedia('(prefers-reduced-motion: reduce)');

let channels = [...document.querySelectorAll('.tv-channel')];
let current = 0;
let swapTimer;
let clearTimer;

function showChannel(index) {
  channels[current]?.classList.remove('is-on');
  current = index;
  const next = channels[current];
  next.classList.add('is-on');

  // Photos are hung on their channel only the first time it's shown, so an
  // unwatched channel never costs a download.
  const pending = next.dataset.photo;
  if (pending) {
    const image = document.createElementNS(SVG_NS, 'image');
    image.setAttribute('href', pending);
    image.setAttribute('x', '32');
    image.setAttribute('y', '96');
    image.setAttribute('width', '138');
    image.setAttribute('height', '116');
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    next.append(image);
    delete next.dataset.photo;
  }
}

tv?.addEventListener('click', () => {
  if (!channels.length) return;

  const next = (current + 1) % channels.length;

  if (stillPlease.matches) {
    showChannel(next);
    return;
  }

  // Restart cleanly if you keep clicking through the channels.
  clearTimeout(swapTimer);
  clearTimeout(clearTimer);

  staticBurst?.classList.add('is-on');
  swapTimer = setTimeout(() => showChannel(next), 90);
  clearTimer = setTimeout(() => staticBurst?.classList.remove('is-on'), 220);
});

async function exists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    // Opened straight off disk, where fetch is blocked: let the browser try
    // to load the image instead and see whether it comes back.
    return new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = url;
    });
  }
}

async function findPhoto(number) {
  for (const extension of PHOTO_EXTENSIONS) {
    const url = `images/prettylj${number}.${extension}`;
    if (await exists(url)) return url;
  }
  return null;
}

async function addPhotoChannels() {
  if (!screen || !staticBurst) return;

  let misses = 0;

  for (let number = 1; number <= PHOTO_LIMIT && misses < MISSES_BEFORE_STOPPING; number++) {
    const url = await findPhoto(number);

    if (!url) {
      misses++;
      continue;
    }

    misses = 0;
    const channel = document.createElementNS(SVG_NS, 'g');
    channel.setAttribute('class', 'tv-channel');
    channel.dataset.photo = url;
    staticBurst.before(channel);
  }

  channels = [...document.querySelectorAll('.tv-channel')];
}

addPhotoChannels();
