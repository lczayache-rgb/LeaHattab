/**
 * ============================================================
 *  ROUTEUR PRINCIPAL — Ne pas modifier ce fichier
 *  Il gère la navigation entre les pages automatiquement.
 * ============================================================
 */

const App = {
  // Rendu d'une page dans l'élément #app
  render(html) {
    const app = document.getElementById('app');
    app.classList.add('loading');
    setTimeout(() => {
      app.innerHTML = html;
      app.classList.remove('loading');
      // Scroll en haut à chaque navigation
      window.scrollTo(0, 0);
      // Ré-initialiser les liens internes
      App.bindLinks();
    }, 150);
  },

  // Router selon l'URL actuelle
  async route() {
    const path = window.location.pathname;

    // Header et footer toujours présents
    const header = renderHeader(SITE_CONTENT);
    const footer = renderFooter(SITE_CONTENT);

    let pageContent = '';
    let pageTitle = `${SITE_CONTENT.firstName} ${SITE_CONTENT.lastName} — ${SITE_CONTENT.tagline}`;

    if (path === '/' || path === '/index.html') {
      pageContent = renderHome(SITE_CONTENT, PROJECTS);

    } else if (path === '/work' || path === '/work.html') {
      pageContent = renderWork(SITE_CONTENT, PROJECTS);
      pageTitle = `Work — ${SITE_CONTENT.firstName} ${SITE_CONTENT.lastName}`;

    } else if (path.startsWith('/projects/')) {
      const slug = path.replace('/projects/', '').replace(/\/$/, '');
      const project = PROJECTS.find(p => p.slug === slug && p.visible);
      pageContent = renderProject(project, PROJECTS, SITE_CONTENT);
      if (project) pageTitle = `${project.title} — ${SITE_CONTENT.firstName} ${SITE_CONTENT.lastName}`;

    } else {
      // 404
      pageContent = `
        <div class="not-found" style="padding-top:120px;">
          <div class="not-found__code">404</div>
          <div class="not-found__title">Page introuvable</div>
          <a href="/" class="btn btn-primary" style="margin-top:24px;">Retour à l'accueil</a>
        </div>`;
    }

    // Mise à jour du titre de la page
    document.title = pageTitle;

    // Injection du contenu
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = header + `<main>${pageContent}</main>` + footer;
      App.bindLinks();
      App.initMobileNav();
      // Gestion des ancres (#work, #about, #contact)
      if (window.location.hash) {
        setTimeout(() => {
          const el = document.querySelector(window.location.hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  },

  // Intercepter les liens internes pour navigation SPA
  bindLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      // Ignorer les liens externes, les mailto, les ancres seules
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

      // Liens avec ancre sur la même page
      if (href.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
        return;
      }

      // Liens internes — navigation SPA
      link.addEventListener('click', (e) => {
        const fullHref = link.getAttribute('href');
        // Si contient une ancre, extraire le path
        const [path, hash] = fullHref.split('#');

        e.preventDefault();
        history.pushState({}, '', fullHref);
        App.route();
        if (hash) {
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      });
    });
  },

  initMobileNav() {
    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobile-nav');
    if (burger && mobileNav) {
      burger.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', mobileNav.classList.contains('is-open'));
      });
    }
  }
};

// Fonction globale pour fermer le menu mobile (utilisée dans les liens)
function closeMobileNav() {
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.classList.remove('is-open');
}

// Gestion du bouton retour du navigateur
window.addEventListener('popstate', () => App.route());

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', () => App.route());
