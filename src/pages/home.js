// Page d'accueil
function renderHome(content, projects) {
  const featuredProjects = projects.filter(p => p.visible && p.featured);
  const allVisible = projects.filter(p => p.visible);

  // ── Hero images (4 premières images cover des projets visibles)
  const heroImages = allVisible.slice(0, 4).map((p, i) => {
    const hasImage = p.coverImage && !p.coverImage.includes('placeholder');
    return `
    <div class="hero__img-box" style="position:relative;">
      ${hasImage
        ? `<img src="${p.coverImage}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`
        : `<div class="img-placeholder" style="display:flex;align-items:center;justify-content:center;"></div>`
      }
    </div>`;
  }).join('');

  // Compléter avec des placeholders si moins de 4 projets
  const paddedImages = heroImages + Array(Math.max(0, 4 - allVisible.length))
    .fill('<div class="hero__img-box"><div class="img-placeholder"></div></div>')
    .join('');

  // ── Skills marquee (double pour effet infini)
  const skillItems = [...content.skills, ...content.skills]
    .map(s => `<span class="skills-bar__item">${s}</span>`).join('');

  // ── Project rows (featured sur la home)
  const projectRows = featuredProjects.map((p, i) => {
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
        <svg class="project-row__arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </a>`;
  }).join('');

  // ── About image
  const hasProfileImg = false; // Mettre à true quand l'image est disponible
  const profileImg = hasProfileImg
    ? `<img src="/images/profile.jpg" alt="${content.firstName} ${content.lastName}">`
    : `<div class="img-placeholder"></div>`;

  return `
  <!-- HERO -->
  <section class="hero">
    <div class="hero__left">
      <div class="hero__label">${content.hero.label}</div>
      <div class="hero__name">
        <span class="hero__first-name">${content.firstName}</span>
        <span class="hero__last-name">${content.lastName}</span>
      </div>
      <p class="hero__description">${content.hero.description}</p>
      <div class="hero__buttons">
        <a href="#contact" class="btn btn-primary">${content.hero.ctaPrimary}</a>
        <a href="#work" class="btn btn-secondary">${content.hero.ctaSecondary}</a>
      </div>
    </div>

    <div class="hero__images">${paddedImages}</div>

    <div class="hero__scroll">${content.hero.scrollLabel}</div>
  </section>

  <!-- BARRE DE COMPÉTENCES -->
  <div class="skills-bar" aria-hidden="true">
    <div class="skills-bar__track">${skillItems}</div>
  </div>

  <!-- PROJETS SÉLECTIONNÉS -->
  <section class="section section--dark" id="work">
    <div class="section__label">${content.selectedWork.label}</div>
    <div class="projects-header">
      <h2 class="projects-header__title">${content.selectedWork.title}</h2>
      <a href="/work" class="projects-header__view-all">
        ${content.selectedWork.viewAll}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>
    ${projectRows}
  </section>

  <!-- À PROPOS -->
  <section class="section section--cream" id="about">
    <div class="section__label">${content.about.label}</div>
    <div class="about">
      <div class="about__left">
        <div class="about__greeting">${content.about.greeting}</div>
        <p class="about__bio">${content.about.bio}</p>
        <span class="about__signature">${content.signature}</span>
      </div>
      <div class="about__image">${profileImg}</div>
    </div>
  </section>

  <!-- AVIS CLIENTS -->
  <section class="section section--dark">
    <div class="section__label" style="color:var(--color-cream-green)">Clients Reviews</div>
    <div class="section-big-title" style="color:var(--color-gray-muted); font-family:var(--font-script); font-weight:400; font-size:40px; letter-spacing:10px;">retour - avis clients</div>
    <div class="reviews-grid">
      <div class="review-card">
        <p class="review-card__quote">"Léa a parfaitement su retranscrire notre vision. Le résultat dépasse nos attentes en termes d'impact visuel et de cohérence de marque."</p>
        <div>
          <div class="review-card__author">Client 1</div>
          <div class="review-card__role">CEO, Startup</div>
        </div>
      </div>
      <div class="review-card">
        <p class="review-card__quote">"Un travail de grande qualité, livré dans les délais. La communication est fluide et le sens du détail est impressionnant."</p>
        <div>
          <div class="review-card__author">Client 2</div>
          <div class="review-card__role">Fondatrice</div>
        </div>
      </div>
      <div class="review-card">
        <p class="review-card__quote">"Léa comprend vraiment les enjeux business derrière le design. Elle ne crée pas juste de belles choses — elle crée des choses qui fonctionnent."</p>
        <div>
          <div class="review-card__author">Client 3</div>
          <div class="review-card__role">Directeur Marketing</div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTACT CTA -->
  <section class="contact-cta section--cream" id="contact">
    <div class="contact-cta__label">${content.contact.label}</div>
    <div class="contact-cta__title">${content.contact.title}</div>
    <a href="mailto:${content.contact.email}" class="contact-cta__email">
      ${content.contact.email}
      <svg width="10" height="22" viewBox="0 0 10 22" fill="none" style="transform:rotate(90deg)">
        <path d="M5 2L5 20M5 20L1 15M5 20L9 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  </section>
  `;
}
