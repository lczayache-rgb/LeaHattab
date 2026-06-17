// Composant Header — partagé sur toutes les pages
function renderHeader(content) {
  return `
  <header class="header" id="header">
    <a href="/" class="header__logo" aria-label="Accueil">
      <svg viewBox="0 0 284 14" fill="none" xmlns="http://www.w3.org/2000/svg" height="14">
        <text y="12" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" fill="#1d1d1d" letter-spacing="3">
          LÉA
        </text>
        <text x="54" y="12" font-family="'Homemade Apple', cursive" font-size="11" fill="#1d1d1d">
          &amp;
        </text>
        <text x="74" y="12" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" fill="#1d1d1d" letter-spacing="3">
          H
        </text>
      </svg>
    </a>

    <nav class="header__nav">
      <a href="/#work">${content.nav.work}</a>
      <a href="/#about">${content.nav.about}</a>
      <a href="/#contact">${content.nav.contact}</a>
    </nav>

    <button class="header__burger" id="burger" aria-label="Menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  <nav class="mobile-nav" id="mobile-nav">
    <a href="/#work" onclick="closeMobileNav()">${content.nav.work}</a>
    <a href="/#about" onclick="closeMobileNav()">${content.nav.about}</a>
    <a href="/#contact" onclick="closeMobileNav()">${content.nav.contact}</a>
  </nav>
  `;
}
