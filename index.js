import { fetchJSON, renderProjectList, fetchGitHubData } from './global.js';
import './tv.js';

// The interest pills scroll as a marquee; a second copy of the track is what
// makes the loop seamless. Cloned rather than written twice so the pills stay
// edited in one place.
const pillTrack = document.querySelector('.pills-track');
if (pillTrack) {
  const clone = pillTrack.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  pillTrack.after(clone);
}

const projects = await fetchJSON('./lib/projects.json');

renderProjectList(projects.filter(p => p.category === 'project'), document.querySelector('.projects-list'));

const githubData = await fetchGitHubData('tanvividyala');

const profileStats = document.querySelector('#profile-stats');
if (profileStats && githubData) {
  profileStats.innerHTML = `
    <dl>
      <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers:</dt><dd>${githubData.followers}</dd>
      <dt>Following:</dt><dd>${githubData.following}</dd>
    </dl>
  `;
}
