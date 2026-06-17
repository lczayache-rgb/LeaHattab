# Léa Hattab — Portfolio

## Comment modifier mon portfolio sans coder

Ce guide t'explique tout ce que tu peux modifier facilement, sans toucher au code.

---

## Lancer le site

Ouvre simplement le fichier `index.html` dans ton navigateur (double-clic).

Pour partager le site en ligne → voir la section **Déploiement** plus bas.

---

## Structure des fichiers

```
index.html              ← Page d'accueil
work.html               ← Page portfolio (grille de projets)
projects/
  chez-suzanne.html     ← Page du projet Chez Suzanne
  transformit.html      ← Page du projet TransformIT
  _template.html        ← MODÈLE pour ajouter un nouveau projet
css/
  variables.css         ← Couleurs, polices, espacements (modifiable)
  main.css              ← Styles partagés (ne pas modifier)
  home.css              ← Styles page d'accueil (ne pas modifier)
  work.css              ← Styles page portfolio (ne pas modifier)
  project.css           ← Styles pages projet (ne pas modifier)
js/
  main.js               ← Navigation, menu mobile (ne pas modifier)
  animations.js         ← Animations au scroll (ne pas modifier)
images/
  projects/
    chez-suzanne/       ← Mets tes images ici pour ce projet
    transformit/        ← Mets tes images ici pour ce projet
```

---

## Modifier les textes

Ouvre le fichier HTML concerné avec un éditeur de texte (Notepad, TextEdit, VS Code…).

Cherche les commentaires `<!-- MODIFIE :` — ils t'indiquent exactement quoi changer.

**Fichiers à modifier en priorité :**
- `index.html` — Nom, métier, texte d'accroche, section About
- `work.html` — Titre de la page portfolio
- `projects/*.html` — Contenu de chaque projet

---

## Modifier mon email

Cherche `Lczayache@gmail.com` dans les fichiers (Ctrl+H dans un éditeur) et remplace par ton email.

Il apparaît dans :
- `index.html`
- `work.html`
- `projects/chez-suzanne.html`
- `projects/transformit.html`
- `projects/_template.html`

---

## Modifier mes liens sociaux

Ajoute tes liens dans le footer de `index.html` ou `work.html`.
Exemple à ajouter dans `.footer-bar__nav` :
```html
<li><a href="https://instagram.com/tonpseudo" target="_blank" rel="noopener">Instagram</a></li>
<li><a href="https://linkedin.com/in/tonprofil" target="_blank" rel="noopener">LinkedIn</a></li>
```

---

## Changer une image

1. Ajoute ton image dans le bon dossier (`images/projects/nom-du-projet/`)
2. Ouvre la page HTML du projet
3. Cherche le commentaire `<!-- MODIFIE : remplace le div gris par ton image` 
4. Remplace le `<div style="background: ...">` par :
```html
<img src="../images/projects/nom-du-projet/cover.jpg"
     alt="Nom du projet — Description"
     style="width:100%; height:60vh; object-fit:cover;">
```

Pour les images de la grille hero sur l'accueil, cherche `hero__img-placeholder` dans `index.html`.

---

## Ajouter un nouveau projet

### Étape 1 — Créer la page projet
1. Copie le fichier `projects/_template.html`
2. Renomme-le (ex: `projects/mon-nouveau-projet.html`)
3. Ouvre-le et cherche tous les `<!-- MODIFIE :` pour remplir ton contenu

### Étape 2 — Ajouter les images
Crée un dossier `images/projects/mon-nouveau-projet/` et mets-y tes images.

### Étape 3 — Ajouter à la liste dans `index.html`
Dans la section `<!-- LISTE DES PROJETS -->`, copie-colle ce bloc :
```html
<a href="projects/mon-nouveau-projet.html" class="projects-list__item animate-on-scroll">
  <div class="projects-list__left">
    <span class="projects-list__num" aria-hidden="true">·</span>
    <span class="projects-list__title">Nom du projet</span>
  </div>
  <div class="projects-list__right">
    <span class="projects-list__tag">Catégorie</span>
    <span class="projects-list__year">2026</span>
    <span class="projects-list__arrow" aria-hidden="true">→</span>
  </div>
</a>
```

### Étape 4 — Ajouter à la grille dans `work.html`
Dans la section `<!-- GRILLE DE PROJETS -->`, copie-colle ce bloc :
```html
<a href="projects/mon-nouveau-projet.html" class="project-card animate-on-scroll">
  <img src="images/projects/mon-nouveau-projet/cover.jpg" alt="Nom du projet" class="project-card__image">
  <div class="project-card__overlay">
    <p class="project-card__category">Catégorie · 2026</p>
    <h2 class="project-card__title">Nom du projet</h2>
    <span class="project-card__cta">Voir le projet →</span>
  </div>
</a>
```

---

## Retirer un projet

Supprime (ou mets en commentaire) le bloc `<a class="projects-list__item">` dans `index.html`
et le bloc `<a class="project-card">` dans `work.html`.

---

## Masquer temporairement un projet

Ajoute `style="display:none"` sur le bloc du projet dans `index.html` et `work.html` :
```html
<a href="projects/mon-projet.html" class="projects-list__item" style="display:none">
```

---

## Mettre un projet en avant (grande carte)

Dans `work.html`, ajoute la classe `project-card--featured` à la carte :
```html
<a href="projects/mon-projet.html" class="project-card project-card--featured">
```

---

## Changer l'ordre des projets

Dans `index.html` et `work.html`, déplace les blocs `<a>` vers le haut ou le bas.
Le premier bloc affiché sera le premier dans la liste.

---

## Changer les couleurs

Ouvre `css/variables.css` et modifie les valeurs dans la section `COULEURS PRINCIPALES`.

Exemple — changer la couleur d'accentuation de brun vers violet :
```css
--accent-brown: #87622f;   /* ← change cette valeur */
```

---

## Changer les polices

Dans `css/variables.css`, modifie les variables de polices :
```css
--font-main:    'Montserrat', sans-serif;
--font-cursive: 'Homemade Apple', cursive;
--font-body:    'Kumbh Sans', sans-serif;
```

Pour utiliser une autre police Google Fonts :
1. Cherche la police sur [fonts.google.com](https://fonts.google.com)
2. Remplace le nom dans `variables.css`
3. La police se charge automatiquement

---

## Déploiement — Mettre le site en ligne

### Option 1 — Netlify (gratuit, le plus simple)
1. Va sur [netlify.com](https://netlify.com) et crée un compte gratuit
2. Glisse-dépose ton dossier entier sur la page Netlify Drop
3. Ton site est en ligne en 30 secondes avec une URL du type `ton-nom.netlify.app`

### Option 2 — Vercel (gratuit)
1. Va sur [vercel.com](https://vercel.com)
2. Connecte ton compte GitHub et pousse ton dossier
3. Vercel déploie automatiquement

### Option 3 — Domaine personnalisé
Sur Netlify ou Vercel, tu peux connecter un domaine comme `leahattab.com` depuis les réglages.

---

## Fichiers que tu peux modifier sans risque

✅ `index.html` — textes, projets, about, email  
✅ `work.html` — textes, projets  
✅ `projects/*.html` — tout le contenu  
✅ `css/variables.css` — couleurs, polices, espacements  
✅ `images/` — toutes les images  

## Fichiers à ne pas toucher si tu ne sais pas coder

⛔ `css/main.css`  
⛔ `css/home.css`  
⛔ `css/work.css`  
⛔ `css/project.css`  
⛔ `js/main.js`  
⛔ `js/animations.js`  

---

*Site créé par Claude Code — Fidèle au Figma de Léa Hattab*
