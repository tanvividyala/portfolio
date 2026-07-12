import { fetchJSON, renderProjectList, fetchGitHubData } from './global.js';

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
