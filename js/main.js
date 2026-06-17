/* ============================================================
   MAIN.JS — Navigation, menu mobile, scroll
   Tu n'as pas besoin de modifier ce fichier.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── MENU MOBILE ──────────────────────────────────────────── //

  const burger  = document.querySelector('.header__burger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen);
      // Animate burger → X
      const spans = burger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Fermer le menu au clic sur un lien
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      });
    });
  }

  // ── SMOOTH SCROLL vers les ancres (#about, #contact) ─────── //

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height') || '78'
        );
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── BACK TO TOP ──────────────────────────────────────────── //

  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── NAV ACTIVE (met en surbrillance le lien courant) ─────── //

  const currentPath = window.location.pathname;
  document.querySelectorAll('.header__nav a, .mobile-nav a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('index.html'))) {
      // pas d'active sur "home" dans la nav
    }
  });

});
