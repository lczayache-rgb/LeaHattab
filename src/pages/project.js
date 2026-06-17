// Page projet individuel (case study)
function renderProject(project, allProjects, content) {
  if (!project) {
    return `
    <div class="not-found" style="padding-top:120px;">
      <div class="not-found__code">404</div>
      <div class="not-found__title">Projet introuvable</div>
      <a href="/work" class="btn btn-primary" style="margin-top:24px;">Retour aux projets</a>
    </div>`;
  }

  // Trouver le projet suivant (cycle)
  const visible = allProjects.filter(p => p.visible);
  const currentIdx = visible.findIndex(p => p.slug === project.slug);
  const nextProject = visible[(currentIdx + 1) % visible.length];

  // ── Section challenges
  const challengesHtml = project.challenges && project.challenges.length
    ? project.challenges.map(c => `
      <div class="challenge-item">
        <div class="challenge-item__number">${c.number}</div>
        <div class="challenge-item__content">
          <div class="challenge-item__title">${c.title}</div>
          <p class="challenge-item__text">${c.text}</p>
        </div>
      </div>`).join('')
    : '<p style="color:var(--color-gray-muted);font-family:var(--font-body);font-size:18px;">À venir...</p>';

  // ── Section process
  const processHtml = project.process && project.process.length
    ? `<div class="process-grid">${project.process.map(step => `
      <div class="process-card">
        <div class="process-card__number">${step.number}</div>
        <div class="process-card__title">${step.title}</div>
        <p class="process-card__text">${step.text}</p>
      </div>`).join('')}</div>`
    : '<p style="color:var(--color-gray);font-family:var(--font-body);font-size:18px;">À venir...</p>';

  // ── Section design decisions
  const decisionsHtml = project.designDecisions && project.designDecisions.length
    ? `<div class="decisions-grid">${project.designDecisions.map(d => `
      <div class="decision-card">
        <div class="decision-card__title">${d.title}</div>
        <p class="decision-card__text">${d.text}</p>
        <span class="decision-card__tag">${d.tag}</span>
      </div>`).join('')}</div>`
    : '';

  // ── Section takeaways
  const takeawaysHtml = project.takeaways && project.takeaways.length
    ? project.takeaways.map(t => `
      <div class="challenge-item">
        <div class="challenge-item__number">${t.number}</div>
        <div class="challenge-item__content">
          <div class="challenge-item__title">${t.title}</div>
          <p class="challenge-item__text">${t.text}</p>
        </div>
      </div>`).join('')
    : '';

  // ── Testimonial
  const testimonialHtml = project.testimonial && project.testimonial.quote
    ? `<div style="padding: 80px 116px;">
        <div class="project-testimonial">
          <div class="project-testimonial__avatar">
            ${project.testimonial.avatar
              ? `<img src="${project.testimonial.avatar}" alt="${project.testimonial.author}">`
              : `<div class="img-placeholder"></div>`}
          </div>
          <div>
            <p class="project-testimonial__quote">"${project.testimonial.quote}"</p>
            <div class="project-testimonial__author">${project.testimonial.author}</div>
            <div class="project-testimonial__role">${project.testimonial.role}</div>
          </div>
        </div>
      </div>`
    : '';

  // ── Images galerie
  const galleryHtml = project.images && project.images.length
    ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px;">
        ${project.images.map(img => `
          <div style="aspect-ratio:4/3;overflow:hidden;border-radius:4px;background:var(--color-gray-muted);">
            <img src="${img}" alt="${project.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
          </div>`).join('')}
      </div>`
    : '';

  // ── Tags catégorie
  const tags = project.category.split(',').map(t =>
    `<span class="tag tag--dark" style="margin-right:8px;">${t.trim()}</span>`
  ).join('');

  return `
  <!-- HERO PROJET -->
  <div class="project-hero">
    <div class="project-hero__category">
      <span>${project.industry || project.category}</span>
    </div>
    <h1 class="project-hero__title">${project.title}</h1>
    <div class="project-hero__meta">
      ${tags}
      <span class="tag tag--dark">${project.year}</span>
      ${project.externalLink
        ? `<a href="${project.externalLink}" target="_blank" rel="noopener" class="project-hero__case-study">Voir le site →</a>`
        : `<span class="project-hero__case-study">case study</span>`}
    </div>
  </div>

  <!-- BARRE INFOS -->
  <div class="project-info-bar">
    <div class="project-info-bar__item">
      Service&nbsp;: <strong>${project.service || '—'}</strong>
    </div>
    <div class="project-info-bar__item">
      Industry&nbsp;: <strong>${project.industry || '—'}</strong>
    </div>
    <div class="project-info-bar__item">
      Year&nbsp;: <strong>${project.year}</strong>
    </div>
    <div class="project-info-bar__item">
      ${project.externalLink
        ? `View live&nbsp;: <strong><a href="${project.externalLink}" target="_blank" rel="noopener" style="color:var(--color-white);text-decoration:underline;">${project.title}</a></strong>`
        : `Credits&nbsp;: <strong>${project.credits}</strong>`}
    </div>
  </div>

  <!-- OVERVIEW -->
  ${project.overview ? `
  <div class="project-overview">
    <div class="section__label">Project overview</div>
    <div class="project-overview__about">About</div>
    ${project.quote ? `<div class="project-overview__quote">${project.quote}</div>` : ''}
    <p class="project-overview__text">${project.overview}</p>
  </div>` : ''}

  <!-- THE CHALLENGE -->
  <div class="challenges">
    <div class="section__label" style="color:var(--color-gray-muted)">The Challenge</div>
    <div class="section-big-title">HOW I APPROACHED <span style="color:var(--color-gold)">IT</span></div>
    ${challengesHtml}
  </div>

  <!-- MY PROCESS -->
  <div class="process">
    <div class="section__label">My Process</div>
    <div class="section-big-title" style="color:var(--color-dark)">HOW I WORKED ON IT</div>
    ${processHtml}
  </div>

  <!-- GALERIE D'IMAGES -->
  ${galleryHtml ? `
  <div style="padding:80px 116px;background:var(--color-cream-green);">
    <div class="section__label">Mock-ups</div>
    ${galleryHtml}
  </div>` : ''}

  <!-- DESIGN DECISIONS -->
  ${decisionsHtml ? `
  <div class="design-decisions">
    <div class="section__label">Key design decisions</div>
    <div class="section-big-title">WHY I MADE THESE CHOICES</div>
    ${decisionsHtml}
  </div>` : ''}

  <!-- KEY TAKEAWAYS -->
  ${takeawaysHtml ? `
  <div class="takeaways">
    <div class="section__label" style="color:var(--color-gray-muted)">What I learned</div>
    <div class="section-big-title">KEY TAKEAWAYS</div>
    ${takeawaysHtml}
  </div>` : ''}

  <!-- TESTIMONIAL -->
  ${testimonialHtml}

  <!-- NEXT PROJECT -->
  ${nextProject && nextProject.slug !== project.slug ? `
  <div class="next-project">
    <div class="next-project__label">Next</div>
    <div class="next-project__title">${nextProject.title}</div>
    <br>
    <a href="/projects/${nextProject.slug}" class="next-project__link">${nextProject.title} →</a>
  </div>` : ''}

  <!-- CONTACT CTA -->
  <section class="contact-cta section--cream" id="contact">
    <div class="contact-cta__label">${content.contact.label}</div>
    <div class="contact-cta__title">${content.contact.title}</div>
    <a href="mailto:${content.contact.email}" class="contact-cta__email">
      ${content.contact.email}
    </a>
  </section>
  `;
}
