# Portfolio Léa Hattab

Site portfolio professionnel de Léa Hattab — Graphic & UX/UI Designer.

---

## Comment modifier mon portfolio sans coder

Tout ce guide est pensé pour une personne non technique. Tu n'as pas besoin de savoir coder pour faire toutes ces modifications.

---

### Lancer le site en local

Pour voir ton site sur ton ordinateur avant de le mettre en ligne :

1. **Installe l'extension VS Code "Live Server"** (ou utilise n'importe quel serveur local)
2. Ouvre le dossier du projet dans VS Code
3. Clique droit sur `index.html` → **"Open with Live Server"**
4. Ton site s'ouvre automatiquement dans le navigateur

> ⚠️ Le site ne fonctionne pas en ouvrant directement le fichier HTML (il faut passer par un serveur). Utilise Live Server ou héberge sur GitHub Pages.

---

### Modifier les textes

Ouvre le fichier :
```
src/data/siteContent.js
```

Dans ce fichier, chaque texte est expliqué par un commentaire en français juste au-dessus.
Modifie uniquement ce qui est entre guillemets `" "`.

**Exemple :** Pour changer ton titre, trouve la ligne :
```js
tagline: "Graphic & UX/UI Designer",
```
Et remplace le texte entre guillemets.

---

### Modifier mon email

Dans `src/data/siteContent.js`, trouve :
```js
email: "Lczayache@gmail.com",
```
Remplace l'adresse par la tienne.

---

### Modifier les liens sociaux

Dans `src/data/siteContent.js`, trouve la section `social` :
```js
social: {
  instagram: "",   // Mets ton URL Instagram ici
  linkedin: "",    // Mets ton URL LinkedIn ici
  behance: "",     // Mets ton URL Behance ici
  dribbble: "",    // Mets ton URL Dribbble ici
},
```
Colle l'URL complète entre les guillemets.
Laisse `""` pour masquer un réseau.

---

### Changer une image

Les images sont dans le dossier :
```
public/images/projects/nom-du-projet/
```

Pour remplacer une image :
1. Prépare ta nouvelle image (format `.jpg` ou `.png`)
2. Donne-lui **exactement le même nom** que l'ancienne (`cover.jpg`, `image-1.jpg`, etc.)
3. Copie-colle le nouveau fichier dans le bon dossier — il remplace l'ancien

**Conseil :** Utilise des images en format 16:9 ou 4:3 pour les meilleures proportions.

---

### Ajouter un nouveau projet

Ouvre le fichier :
```
src/data/projects.js
```

Copie-colle ce modèle dans la liste (entre les `[` et `]`), en le plaçant à l'endroit voulu :

```js
{
  slug: "nouveau-projet",        // Identifiant unique (pas d'espaces, pas d'accents)
  title: "Nouveau projet",       // Nom affiché sur le site
  category: "Branding",          // Catégorie (peut contenir plusieurs séparées par ,)
  year: "2026",                  // Année
  featured: false,               // true = apparaît sur l'accueil
  visible: true,                 // false = masqué du site
  coverImage: "/images/projects/nouveau-projet/cover.jpg",
  description: "Description du projet.",
  images: [
    "/images/projects/nouveau-projet/image-1.jpg",
    "/images/projects/nouveau-projet/image-2.jpg",
  ],
  credits: "Design graphique",
  externalLink: "",              // URL du site live (laisser "" si aucun)
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
```

Puis crée le dossier :
```
public/images/projects/nouveau-projet/
```
Et ajoute tes images dedans.

---

### Ajouter plusieurs images à un projet

Dans `src/data/projects.js`, trouve ton projet et modifie le tableau `images` :

```js
images: [
  "/images/projects/nom-du-projet/image-1.jpg",
  "/images/projects/nom-du-projet/image-2.jpg",
  "/images/projects/nom-du-projet/image-3.jpg",
  "/images/projects/nom-du-projet/image-4.jpg",
],
```

---

### Changer l'ordre des projets

Dans `src/data/projects.js`, les projets apparaissent dans l'ordre où ils sont écrits.
Déplace le bloc entier d'un projet vers le haut pour le faire apparaître en premier.

---

### Masquer temporairement un projet

Dans `src/data/projects.js`, trouve ton projet et change :
```js
visible: true,
```
En :
```js
visible: false,
```

Le projet disparaît du site mais reste dans le fichier — tu pourras le réactiver en remettant `true`.

---

### Mettre un projet en avant sur l'accueil

Dans `src/data/projects.js`, change :
```js
featured: false,
```
En :
```js
featured: true,
```

Ce projet apparaîtra dans la section "Selected Work" de la page d'accueil.

---

### Changer les couleurs principales

Ouvre le fichier :
```
src/styles/main.css
```

Au tout début du fichier, dans la section `:root`, tu trouveras les variables de couleurs :
```css
:root {
  --color-cream:       #f9fbf5;   /* Fond principal (hero) */
  --color-cream-green: #f1f3ea;   /* Header et zones claires */
  --color-dark:        #1d1d1d;   /* Sections sombres, texte principal */
  /* ... */
}
```

Change la valeur hexadécimale (`#f9fbf5`) par la couleur de ton choix.
La modification s'applique immédiatement sur tout le site.

---

### Ajouter une nouvelle page simple

Pour ajouter une page contact, une page about dédiée, etc. :

1. Crée une fonction dans `src/pages/` (copie un fichier existant comme modèle)
2. Ajoute la route dans `src/app.js` dans la fonction `route()`
3. Ajoute le lien dans `src/data/siteContent.js` section `nav`

---

### Fichiers que tu peux modifier sans risque

✅ `src/data/siteContent.js` — tous tes textes  
✅ `src/data/projects.js` — tous tes projets  
✅ `src/styles/main.css` — section `:root` uniquement (couleurs)  
✅ `public/images/` — remplacer des images par des nouvelles du même nom  

---

### Fichiers à ne pas toucher (sauf si tu sais ce que tu fais)

⚠️ `src/app.js` — moteur de navigation du site  
⚠️ `src/components/header.js` — structure du header  
⚠️ `src/components/footer.js` — structure du footer  
⚠️ `src/pages/home.js` — structure de la page d'accueil  
⚠️ `src/pages/work.js` — structure de la page portfolio  
⚠️ `src/pages/project.js` — structure des pages projets  
⚠️ `index.html` — point d'entrée du site  
⚠️ `404.html` — redirection GitHub Pages  

---

## Structure du projet

```
/
├── index.html              ← Point d'entrée du site
├── 404.html                ← Redirection (ne pas toucher)
├── README.md               ← Ce guide
├── public/
│   ├── favicon.svg
│   └── images/
│       └── projects/
│           ├── transformit/
│           │   ├── cover.jpg
│           │   ├── image-1.jpg
│           │   └── image-2.jpg
│           ├── chez-suzanne/
│           ├── the-institute-ai/
│           ├── made4me/
│           └── lulu-pilates-studio/
└── src/
    ├── data/
    │   ├── siteContent.js  ← ✅ MODIFIER ICI — tous les textes
    │   └── projects.js     ← ✅ MODIFIER ICI — tous les projets
    ├── styles/
    │   └── main.css        ← ✅ Variables couleurs en haut du fichier
    ├── components/
    │   ├── header.js       ← ⚠️ Ne pas toucher
    │   └── footer.js       ← ⚠️ Ne pas toucher
    ├── pages/
    │   ├── home.js         ← ⚠️ Ne pas toucher
    │   ├── work.js         ← ⚠️ Ne pas toucher
    │   └── project.js      ← ⚠️ Ne pas toucher
    └── app.js              ← ⚠️ Ne pas toucher
```

---

## Hébergement sur GitHub Pages

1. Va dans les **Settings** de ton dépôt GitHub
2. Section **Pages** → Source : **Deploy from a branch**
3. Branche : `main` ou `master`, dossier : `/ (root)`
4. Clique **Save**

Ton site sera disponible à l'adresse que GitHub t'indique.

---

## Typographies utilisées

| Police | Source | Utilisation |
|--------|--------|-------------|
| Montserrat | Google Fonts | Navigation, titres, labels |
| Kumbh Sans | Google Fonts | Corps de texte |
| Homemade Apple | Google Fonts | Textes en script (ton nom, etc.) |
| Assistant | Google Fonts | Boutons |

---

*Portfolio créé avec ❤️ — Structure simple et maintenable par une non-développeuse*
