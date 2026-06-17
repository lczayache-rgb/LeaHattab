/* ============================================================
   ANIMATIONS.JS — Apparition des éléments au scroll
   Tu n'as pas besoin de modifier ce fichier.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // Tous les éléments avec la classe "animate-on-scroll" apparaissent
  // en douceur quand ils entrent dans le champ de vision.

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // On désenregistre après la première apparition
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,       // Déclenche quand 10% de l'élément est visible
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
    observer.observe(el);
  });

  // ── TICKER (bande défilante) ──────────────────────────────── //
  // Duplique le contenu du ticker pour un défilement infini.

  const track = document.querySelector('.ticker__track');
  if (track) {
    const content = track.innerHTML;
    track.innerHTML = content + content; // double pour boucle infinie
  }

});
