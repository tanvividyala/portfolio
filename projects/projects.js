import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `My Projects (${projects.length})`;

let query = '';
let selectedIndex = -1;

const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const colors = d3.scaleOrdinal([
  '#2d5535',
  '#b84040',
  '#c07830',
  '#5a8a6a',
  '#d8745e',
  '#7fa870',
  '#7d7269',
]);

function renderPieChart(projectsGiven) {
  selectedIndex = -1;

  const rolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        svg.selectAll('path')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'selected' : ''))
          .attr('fill', (_, idx) => {
            const base = colors(idx);
            return selectedIndex === idx ? d3.color(base).darker(0.5).formatHex() : base;
          });
        legend.selectAll('li')
          .attr('class', (_, idx) => (selectedIndex === idx ? 'legend-item selected' : 'legend-item'))
          .attr('style', (_, idx) => {
            const base = colors(idx);
            const c = selectedIndex === idx ? d3.color(base).darker(0.5).formatHex() : base;
            return `--color:${c}`;
          });

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, 'h2');
        } else {
          const selectedYear = data[selectedIndex].label;
          renderProjects(
            projectsGiven.filter((p) => p.year === selectedYear),
            projectsContainer,
            'h2',
          );
        }
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);
renderProjects(projects, projectsContainer, 'h2');

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
