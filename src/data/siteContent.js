/**
 * ============================================================
 *  FICHIER DE CONTENU — À MODIFIER LIBREMENT
 *  Ce fichier contient tous les textes du site.
 *  Tu peux modifier tout ce qui est entre guillemets " "
 *  sans risquer de casser le site.
 * ============================================================
 */

const SITE_CONTENT = {

  // ──────────────────────────────────────────
  // TON IDENTITÉ
  // ──────────────────────────────────────────

  /** Ton prénom (affiché en grand dans le hero) */
  firstName: "Léa",

  /** Ton nom de famille (affiché en script italique sous le prénom) */
  lastName: "Hattab",

  /** Ta signature (affichée dans la section About) */
  signature: "Léa.H",

  /** Ton titre professionnel */
  tagline: "Graphic & UX/UI Designer",

  // ──────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────

  nav: {
    /** Lien vers la liste de tes projets */
    work: "WORK",
    /** Lien vers ta section À propos */
    about: "ABOUT",
    /** Lien vers le formulaire de contact */
    contact: "CONTACT",
  },

  // ──────────────────────────────────────────
  // SECTION HERO (la première chose visible)
  // ──────────────────────────────────────────

  hero: {
    /** Texte sous le tiret, au-dessus de ton nom */
    label: "Graphic & UX/UI Designer",

    /** Texte de présentation courte à côté de ton nom */
    description:
      "Je crée des identités visuelles fortes et des expériences digitales soignées, à mi-chemin entre créativité et stratégie.",

    /** Bouton principal (fond noir) */
    ctaPrimary: "Let's work together?",

    /** Bouton secondaire (contour) */
    ctaSecondary: "Check out my work",

    /** Texte vertical d'indication de scroll */
    scrollLabel: "SCROLL",
  },

  // ──────────────────────────────────────────
  // BARRE DE COMPÉTENCES DÉFILANTE
  // ──────────────────────────────────────────

  /** Liste de tes compétences — elles défilent en boucle */
  skills: [
    "Campaign Ads",
    "UX/UI",
    "Branding",
    "Digital Marketing",
    "Team Leadership",
    "Direction Artistique",
  ],

  // ──────────────────────────────────────────
  // SECTION PROJETS (liste sur la page d'accueil)
  // ──────────────────────────────────────────

  selectedWork: {
    /** Titre affiché au-dessus de la liste */
    label: "Selected Work",
    /** Grand titre en script */
    title: "Projects",
    /** Lien "Voir tout" */
    viewAll: "View All",
  },

  // ──────────────────────────────────────────
  // SECTION À PROPOS
  // ──────────────────────────────────────────

  about: {
    label: "About me",

    /** Titre "Hey" en script */
    greeting: "Hey",

    /** Ton texte de présentation — tu peux le modifier librement */
    bio: "Je suis Graphic & UX/UI Designer passionnée par la création d'identités de marque fortes et d'expériences digitales soignées. Avec un parcours en agences de marketing digital, j'ai travaillé sur du branding, du web design, de l'UX/UI, des campagnes publicitaires et du contenu — toujours avec un équilibre entre créativité et stratégie.",

    /** Texte du bouton */
    cta: "Travaillons ensemble",
  },

  // ──────────────────────────────────────────
  // SECTION AVIS CLIENTS
  // ──────────────────────────────────────────

  reviews: {
    label: "Clients Reviews",
  },

  // ──────────────────────────────────────────
  // SECTION CONTACT / CTA
  // ──────────────────────────────────────────

  contact: {
    /** Petit texte au-dessus */
    label: "let's work together?",

    /** Grand titre en script */
    title: "let's do this !",

    /**
     * TON EMAIL DE CONTACT
     * Change cette adresse pour que les clients puissent te joindre
     */
    email: "Lczayache@gmail.com",
  },

  // ──────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────

  footer: {
    /** Texte de copyright — change l'année si besoin */
    copyright: "© 2026 Léa Hattab — All rights reserved",
  },

  // ──────────────────────────────────────────
  // RÉSEAUX SOCIAUX
  // ──────────────────────────────────────────

  /**
   * Mets "" pour masquer un réseau
   * Mets l'URL complète (avec https://) pour l'afficher
   */
  social: {
    instagram: "",
    linkedin: "",
    behance: "",
    dribbble: "",
  },

};

// Ne pas supprimer cette ligne — elle permet au site de lire ce fichier
if (typeof module !== "undefined") module.exports = SITE_CONTENT;
