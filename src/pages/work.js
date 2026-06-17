// Page Work / Portfolio complet
function renderWork(content, projects) {
  const visible = projects.filter(p => p.visible);

  const projectRows = visible.map((p, i) => {
    const isLight = i % 2 === 1;
    const rowClass = isLight ? 'project-row--light' : 'project-row--dark';
    const tagClass = isLight ? 'tag--dark' : 'tag--light';
    const tags = p.category.split(',').map(t => `<span class="tag ${tagClass}">${t.trim()}</span>`).join('');

    return `
    <a href="/projects/${p.slug}" class="project-row ${rowClass}">
      <span class="project-row__number">${String(i + 1).padStart(1, '0')}.</span>
      <span class="project-row__title">${p.title}</span>
      <div class="project-row__right">
        <div class="project-row__tags">${tags}</div>
        <svg class="project-row__arrow" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </a>`;
  }).join('');

  // Hero images — utilise les 4 premières images des projets
  const heroImages = visible.slice(0, 4).map(p => {
    return `
    <div class="hero__img-box">
      ${p.coverImage
        ? `<img src="${p.coverImage}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
        : `<div class="img-placeholder"></div>`}
    </div>`;
  }).join('');

  const skillItems = [...content.skills, ...content.skills]
    .map(s => `<span class="skills-bar__item">${s}</span>`).join('');

  return `
  <!-- HERO (identique à la home) -->
  <section class="hero">
    <div class="hero__left">
      <div class="hero__label">${content.hero.label}</div>
      <div class="hero__name">
        <span class="hero__first-name">${content.firstName}</span>
        <span class="hero__last-name">${content.lastName}</span>
      </div>
      <p class="hero__description">${content.hero.description}</p>
      <div class="hero__buttons">
        <a href="/#contact" class="btn btn-primary">${content.hero.ctaPrimary}</a>
        <a href="#projects" class="btn btn-secondary">Tous mes projets</a>
      </div>
    </div>
    <div class="hero__images">${heroImages}</div>
    <div class="hero__scroll">${content.hero.scrollLabel}</div>
  </section>

  <!-- BARRE COMPÉTENCES -->
  <div class="skills-bar" aria-hidden="true">
    <div class="skills-bar__track">${skillItems}</div>
  </div>

  <!-- LISTE DE TOUS LES PROJETS -->
  <section class="section section--dark work-page" id="projects">
    <div class="section__label">${content.selectedWork.label}</div>
    <div class="projects-header">
      <h2 class="projects-header__title">${content.selectedWork.title}</h2>
    </div>
    <div class="projects-list">${projectRows}</div>
  </section>
  `;
}
