// Composant Footer — partagé sur toutes les pages
function renderFooter(content) {
  return `
  <footer class="footer">
    <span class="footer__copy">${content.footer.copyright}</span>
    <nav class="footer__nav">
      <a href="/#work">${content.nav.work}</a>
      <a href="/#about">${content.nav.about}</a>
      <a href="/#contact">${content.nav.contact}</a>
    </nav>
  </footer>
  `;
}
