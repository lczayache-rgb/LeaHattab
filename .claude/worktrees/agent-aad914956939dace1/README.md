# Portfolio — Léa Hattab

Site portfolio statique en HTML/CSS/JS vanilla. Aucune dépendance, aucun framework.

---

## 1. Lancer le site

### Option A — Ouvrir directement
Double-cliquer sur `index.html` pour ouvrir dans le navigateur.  
⚠️ Les polices Google Fonts nécessitent une connexion internet.

### Option B — Serveur local (recommandé)
Pour éviter les problèmes de CORS et tester le site comme en production :

```bash
# Avec Node.js
npx serve .

# Avec Python 3
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans le navigateur.

---

## 2. Modifier les textes

### Page d'accueil (`index.html`)
| Élément | Où le trouver |
|---|---|
| Titre de l'onglet | `<title>` en haut du fichier |
| Nom dans le logo | `<a class="logo">` dans le header |
| Phrase de présentation (hero) | `<p class="hero-bio">` |
| Texte des boutons | `<a class="btn">` dans `.hero-buttons` |
| Projets en liste | `<ul class="project-list">` |
| Texte "À propos" | `<p class="about-text">` |
| Email de contact | `<a class="contact-email">` |
| Copyright | `<p class="footer-text">` |

### Page Work (`work.html`)
| Élément | Où le trouver |
|---|---|
| Sous-titre | `<p class="work-subtitle">` |
| Noms des cartes | `<h2 class="card-title">` |
| Catégories des cartes | `<p class="card-meta">` |

### Pages projets (`projects/*.html`)
Chaque section est commentée avec `<!-- MODIFIER : ... -->` pour guider les modifications.

---

## 3. Changer l'email

L'email apparaît à plusieurs endroits. Rechercher `Lczayache@gmail.com` dans tous les fichiers et remplacer par votre adresse :

**Dans `index.html` :**
- `<a href="mailto:Lczayache@gmail.com" class="contact-email">`
- `<a href="mailto:Lczayache@gmail.com">Contact</a>` (footer nav)

**Dans `work.html` :**
- `<a href="mailto:Lczayache@gmail.com">` (section footer)
- `<a href="mailto:Lczayache@gmail.com">Contact</a>` (footer nav)

**Dans chaque fichier projet (`projects/*.html`) :**
- Même chose dans le footer de chaque page

> Astuce : Faire une recherche globale (Ctrl+Shift+F dans VS Code) pour trouver toutes les occurrences.

---

## 4. Ajouter un nouveau projet

### Étape 1 — Créer le fichier HTML
Copier `projects/_template.html` et le renommer :
```
projects/nom-du-projet.html
```

### Étape 2 — Remplir le template
Remplacer tous les `[MODIFIER: ...]` et `[...]` par le vrai contenu.  
Chaque section est commentée pour guider les modifications.

### Étape 3 — Créer le dossier d'images
```
images/projects/nom-du-projet/
```
Y placer les images : `cover.jpg`, `sketch-1.jpg`, `sketch-2.jpg`, `mockup-1.jpg`, `mockup-2.jpg`, `mockup-3.jpg`

### Étape 4 — Ajouter à la grille Work (`work.html`)
Dans la section `<div class="projects-grid">`, copier-coller ce bloc :

```html
<a href="projects/nom-du-projet.html" class="project-card">
  <div class="project-card-image">
    <img src="images/projects/nom-du-projet/cover.jpg" alt="Nom du projet" style="width:100%; height:100%; object-fit:cover;">
    <div class="card-overlay">
      <span class="card-overlay-text">Voir le projet →</span>
    </div>
  </div>
  <div class="project-card-footer">
    <h2 class="card-title">Nom du Projet</h2>
    <p class="card-meta">Catégorie · Année</p>
  </div>
</a>
```

### Étape 5 — Ajouter à la liste d'accueil (`index.html`)
Dans `<ul class="project-list">`, ajouter un élément :

```html
<li>
  <a href="projects/nom-du-projet.html" class="project-item animate-on-scroll" data-delay="300">
    <span class="project-num">03</span>
    <span class="project-name">Nom du Projet</span>
    <div class="project-meta">
      <span class="project-tag">Catégorie</span>
      <span class="project-year">2026</span>
    </div>
  </a>
</li>
```

### Étape 6 — Mettre à jour les liens "projet suivant"
Dans chaque page projet, mettre à jour la section `.next-project-section` pour créer une boucle logique entre les projets.

---

## 5. Masquer un projet

Pour masquer temporairement un projet sans le supprimer :

**Dans `work.html`** — Commenter la carte :
```html
<!-- 
<a href="projects/mon-projet.html" class="project-card">
  ...
</a>
-->
```

**Dans `index.html`** — Commenter l'élément de liste :
```html
<!--
<li>
  <a href="projects/mon-projet.html" class="project-item ...">
    ...
  </a>
</li>
-->
```

---

## 6. Changer les couleurs

Toutes les couleurs sont centralisées dans `css/variables.css`.

| Variable | Usage | Valeur par défaut |
|---|---|---|
| `--bg-light` | Fond principal (pages claires) | `#f1f3ea` |
| `--bg-off-white` | Fond sections alternées | `#f9fbf5` |
| `--bg-warm` | Fond cartes process | `#f1ece0` |
| `--bg-dark` | Fond sections sombres | `#1d1d1d` |
| `--text-dark` | Texte principal | `#1d1d1d` |
| `--text-light` | Texte sur fond sombre | `#f1f3ea` |
| `--text-grey` | Texte secondaire | `#797c7f` |
| `--accent-brown` | Couleur d'accent (marron doré) | `#87622f` |

Exemple — changer la couleur d'accent en bleu marine :
```css
--accent-brown: #1a3a5c;
```

---

## 7. Changer les polices

Les polices sont définies dans `css/variables.css`.

### Étape 1 — Choisir une nouvelle police sur Google Fonts
Aller sur [fonts.google.com](https://fonts.google.com), sélectionner la police et copier le lien `@import`.

### Étape 2 — Remplacer le lien d'import
En haut de `css/variables.css`, remplacer l'URL dans `@import url(...)`.

### Étape 3 — Mettre à jour les variables
```css
--font-main: 'NouvellePolice', sans-serif;
```

| Variable | Usage |
|---|---|
| `--font-main` | Montserrat — titres, navigation, labels |
| `--font-cursive` | Homemade Apple — textes manuscrits décoratifs |
| `--font-body` | Kumbh Sans — paragraphes de corps de texte |
| `--font-cta` | Assistant — textes d'appel à l'action |

---

## 8. Déployer le site

### Option A — Vercel (recommandé)
1. Créer un compte sur [vercel.com](https://vercel.com)
2. Glisser-déposer le dossier du projet dans l'interface Vercel
3. Le site est en ligne en 30 secondes avec une URL gratuite

Ou via GitHub :
1. Pousser le code sur un dépôt GitHub
2. Dans Vercel : "Import Project" → sélectionner le dépôt
3. Déploiement automatique à chaque `git push`

### Option B — Netlify
1. Créer un compte sur [netlify.com](https://www.netlify.com)
2. Glisser-déposer le dossier sur la page d'accueil Netlify
3. Site en ligne immédiatement

Ou via GitHub (même principe que Vercel).

### Option C — GitHub Pages
1. Pousser le code sur un dépôt GitHub public
2. Aller dans Settings → Pages
3. Source : "Deploy from a branch" → branch `main` → dossier `/` (root)
4. URL : `https://votre-pseudo.github.io/nom-du-repo`

---

## Structure des fichiers

```
LeaHattab/
├── index.html                    # Page d'accueil
├── work.html                     # Page de tous les projets
├── css/
│   ├── variables.css             # Couleurs, polices, espacements
│   ├── main.css                  # Styles globaux (header, boutons, etc.)
│   ├── home.css                  # Styles page d'accueil
│   ├── work.css                  # Styles page Work
│   └── project.css               # Styles pages projets
├── js/
│   ├── main.js                   # Navigation, scroll, menu mobile
│   └── animations.js             # Animations au scroll
├── projects/
│   ├── _template.html            # Template pour nouveaux projets
│   ├── chez-suzanne.html         # Projet Chez Suzanne
│   └── transformit.html          # Projet TransformIT
├── images/
│   └── projects/
│       ├── chez-suzanne/         # Images du projet Chez Suzanne
│       └── transformit/          # Images du projet TransformIT
└── README.md                     # Ce fichier
```
