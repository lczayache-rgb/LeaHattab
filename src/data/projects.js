/**
 * ============================================================
 *  FICHIER DES PROJETS — À MODIFIER LIBREMENT
 *
 *  Chaque projet est un bloc entre { } que tu peux :
 *    - Modifier (titre, description, images...)
 *    - Copier-coller pour ajouter un nouveau projet
 *    - Masquer temporairement (visible: false)
 *    - Mettre en avant sur l'accueil (featured: true)
 *    - Supprimer complètement
 *
 *  L'ordre dans cette liste = l'ordre d'affichage sur le site.
 *  Déplace un bloc vers le haut pour le faire apparaître en premier.
 * ============================================================
 */

const PROJECTS = [

  // ══════════════════════════════════════════════════════════
  // PROJET 1 — TRANSFORMIT
  // ══════════════════════════════════════════════════════════
  {
    /** Identifiant unique — utilisé dans l'URL : /projects/transformit */
    slug: "transformit",

    /** Nom du projet affiché sur le site */
    title: "TransformIT",

    /** Catégorie affichée comme badge */
    category: "UX/UI",

    /** Année du projet */
    year: "2026",

    /** true = apparaît dans la section "Selected Work" de l'accueil */
    featured: true,

    /** false = projet caché du site public (mais conservé ici) */
    visible: true,

    /** Image principale du projet (chemin depuis le dossier /public) */
    coverImage: "/images/projects/transformit/cover.jpg",

    /** Courte description affichée dans la liste */
    description:
      "Création d'une landing page pour TransformIT, cabinet de conseil tech israélo-européen.",

    /** Liste des images pour la galerie du projet */
    images: [
      "/images/projects/transformit/image-1.jpg",
      "/images/projects/transformit/image-2.jpg",
      "/images/projects/transformit/image-3.jpg",
    ],

    /** Tes crédits sur ce projet */
    credits: "Direction artistique, UX/UI Design",

    /** URL du site live (laisser "" si aucun) */
    externalLink: "",

    // ── Détails pour la page case study ────────────────────

    client: "TransformIT",
    service: "Website Creation",
    industry: "Tech",

    overview:
      "Designing a modern landing page from scratch for TransformIT, a tech consulting firm bridging Israeli innovation and European investment. With no existing digital presence, the challenge was to build a premium, future-focused website that instantly communicates credibility, expertise, and ambition.",

    quote:
      '"Standing out in a crowded, outdated market"',

    challenges: [
      {
        number: "01",
        title: "No Existing Digital Presence",
        text:
          "The client had only a logo, no website, no digital assets, no design system. Everything had to be built from scratch while respecting the existing visual identity.",
      },
      {
        number: "02",
        title: "Old-School Competition",
        text:
          "After a competitive benchmark, I found most players in this space had outdated, static websites that did not reflect their actual expertise. A clear opportunity to differentiate.",
      },
      {
        number: "03",
        title: "Dual Audience: Israel & Europe",
        text:
          "The design needed to communicate credibility and innovation to both Israeli tech professionals and European investors — two audiences with different visual expectations.",
      },
    ],

    process: [
      {
        number: "01",
        title: "Benchmark",
        text:
          "Analyzed 10+ competitors in Israeli and European tech consulting. Identified visual patterns to avoid, spotted market gaps, defined differentiation levers.",
      },
      {
        number: "02",
        title: "Brief & Strategy",
        text:
          "Deep dive with the client to map positioning and key messages. Audience mapping, content hierarchy definition, brand tone alignment.",
      },
      {
        number: "03",
        title: "Wireframes",
        text:
          "Lo-fi structure to validate page flow before any visual work. Page architecture, navigation flow, CTA placement strategy.",
      },
      {
        number: "04",
        title: "UI Design",
        text:
          "High-fidelity Figma prototype aligned with the existing logo. Full design system, responsive layouts, developer handoff.",
      },
    ],

    designDecisions: [
      {
        title: "Dynamic Hero Section",
        tag: "differentiation",
        text:
          "While competitors used static, text-heavy heroes, I designed a bold, animated hero with a city visual — immediately communicating ambition and modernity to both Israeli and European audiences.",
      },
      {
        title: "Logo-First Color System",
        tag: "brand consistency",
        text:
          "Built the entire visual system around the existing logo palette, using its violet and orange tones as the foundation for a cohesive, premium design language.",
      },
      {
        title: "Clear Value Architecture",
        tag: "ux strategy",
        text:
          "Structured the page to answer visitors' key questions: Who are you → What do you do → Why trust you. Reduced cognitive load and increased intent through clear information hierarchy.",
      },
    ],

    takeaways: [
      {
        number: "01",
        title: "No Existing Digital Presence",
        text:
          "The client had only a logo, no website, no digital assets, no design system.",
      },
      {
        number: "02",
        title: "Old-School Competition",
        text:
          "Most players in this space had outdated, static websites that did not reflect their actual expertise.",
      },
      {
        number: "03",
        title: "Dual Audience: Israel & Europe",
        text:
          "The design needed to communicate credibility and innovation to two very different audiences.",
      },
    ],

    testimonial: {
      quote:
        "Designing a modern landing page from scratch for a tech consulting firm positioning them as a credible, forward-looking player in the Israeli and European markets.",
      author: "Stéphane Ayache",
      role: "CEO",
      avatar: "/images/projects/transformit/avatar.jpg",
    },
  },

  // ══════════════════════════════════════════════════════════
  // PROJET 2 — CHEZ SUZANNE
  // ══════════════════════════════════════════════════════════
  {
    slug: "chez-suzanne",
    title: "Chez Suzanne",
    category: "Re-Branding",
    year: "2025",
    featured: true,
    visible: true,
    coverImage: "/images/projects/chez-suzanne/cover.jpg",
    description:
      "Refonte identitaire complète pour Chez Suzanne, boulangerie artisanale parisienne.",
    images: [
      "/images/projects/chez-suzanne/image-1.jpg",
      "/images/projects/chez-suzanne/image-2.jpg",
    ],
    credits: "Direction artistique, Identité visuelle",
    externalLink: "",

    client: "Chez Suzanne",
    service: "Re-Branding",
    industry: "Bakery",
    overview:
      "Refonte complète de l'identité visuelle de Chez Suzanne, une boulangerie artisanale qui souhaitait moderniser son image tout en conservant son âme chaleureuse et authentique.",
    quote: '"Une boulangerie qui sent bon la modernité"',
    challenges: [
      {
        number: "01",
        title: "Conserver l'âme artisanale",
        text:
          "Moderniser sans perdre le caractère chaleureux et authentique qui fait la force de la marque.",
      },
      {
        number: "02",
        title: "Cibler une nouvelle clientèle",
        text:
          "Attirer une clientèle plus jeune et urbaine sans aliéner les clients fidèles existants.",
      },
    ],
    process: [
      {
        number: "01",
        title: "Audit de marque",
        text: "Analyse de l'identité existante, benchmark concurrentiel, interviews clients.",
      },
      {
        number: "02",
        title: "Exploration créative",
        text: "Plusieurs directions artistiques testées et validées avec le client.",
      },
      {
        number: "03",
        title: "Déploiement",
        text: "Application sur tous les supports : signalétique, packaging, digital.",
      },
    ],
    designDecisions: [],
    takeaways: [],
    testimonial: {
      quote: "",
      author: "",
      role: "",
      avatar: "",
    },
  },

  // ══════════════════════════════════════════════════════════
  // PROJET 3 — THE INSTITUTE AI
  // ══════════════════════════════════════════════════════════
  {
    slug: "the-institute-ai",
    title: "The Institute AI",
    category: "UX/UI",
    year: "2025",
    featured: true,
    visible: true,
    coverImage: "/images/projects/the-institute-ai/cover.jpg",
    description:
      "Interface utilisateur pour une plateforme d'intelligence artificielle dédiée à la formation.",
    images: [
      "/images/projects/the-institute-ai/image-1.jpg",
    ],
    credits: "UX Research, UI Design",
    externalLink: "",
    client: "The Institute AI",
    service: "UX/UI Design",
    industry: "Education / AI",
    overview: "",
    quote: "",
    challenges: [],
    process: [],
    designDecisions: [],
    takeaways: [],
    testimonial: { quote: "", author: "", role: "", avatar: "" },
  },

  // ══════════════════════════════════════════════════════════
  // PROJET 4 — MADE4ME
  // ══════════════════════════════════════════════════════════
  {
    slug: "made4me",
    title: "Made4me",
    category: "Community Management",
    year: "2024",

    /** Mettre à true pour afficher sur l'accueil */
    featured: false,
    visible: true,
    coverImage: "/images/projects/made4me/cover.jpg",
    description:
      "Stratégie de community management et campagnes ads pour une marque de mode.",
    images: [],
    credits: "Community Management, Ads Campaigns, Direction artistique",
    externalLink: "",
    client: "Made4me",
    service: "Community Management",
    industry: "Fashion",
    overview: "",
    quote: "",
    challenges: [],
    process: [],
    designDecisions: [],
    takeaways: [],
    testimonial: { quote: "", author: "", role: "", avatar: "" },
  },

  // ══════════════════════════════════════════════════════════
  // PROJET 5 — LULU PILATES STUDIO
  // ══════════════════════════════════════════════════════════
  {
    slug: "lulu-pilates-studio",
    title: "Lulu Pilates Studio",
    category: "Branding",
    year: "2024",
    featured: false,
    visible: true,
    coverImage: "/images/projects/lulu-pilates-studio/cover.jpg",
    description:
      "Identité visuelle et branding complet pour un studio de pilates.",
    images: [],
    credits: "Branding, Direction artistique",
    externalLink: "",
    client: "Lulu Pilates Studio",
    service: "Branding",
    industry: "Wellness / Fashion",
    overview: "",
    quote: "",
    challenges: [],
    process: [],
    designDecisions: [],
    takeaways: [],
    testimonial: { quote: "", author: "", role: "", avatar: "" },
  },

  // ══════════════════════════════════════════════════════════
  //  MODÈLE — COPIE-COLLE CE BLOC POUR AJOUTER UN PROJET
  // ══════════════════════════════════════════════════════════
  /*
  {
    slug: "nouveau-projet",
    title: "Nouveau projet",
    category: "Catégorie",
    year: "2026",
    featured: false,
    visible: true,
    coverImage: "/images/projects/nouveau-projet/cover.jpg",
    description: "Description du projet.",
    images: [
      "/images/projects/nouveau-projet/image-1.jpg",
      "/images/projects/nouveau-projet/image-2.jpg",
    ],
    credits: "Design graphique",
    externalLink: "",
    client: "Nom du client",
    service: "Type de service",
    industry: "Secteur",
    overview: "Résumé du projet.",
    quote: '"Une citation sur le projet"',
    challenges: [],
    process: [],
    designDecisions: [],
    takeaways: [],
    testimonial: { quote: "", author: "", role: "", avatar: "" },
  },
  */

];

// Ne pas supprimer cette ligne
if (typeof module !== "undefined") module.exports = PROJECTS;
