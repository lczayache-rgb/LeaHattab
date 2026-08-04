# Prompt maître + Plan d'exécution détaillé — CRM-TC ⟵ enseignements de `trycompai/crm`

> **Nature du document.** Ceci est à la fois un *prompt maître* et un *plan d'exécution* destiné
> à un agent **Claude Code** intervenant sur le dépôt **CRM-TC**. Il traduit l'audit de graphe du
> dépôt open-source **`trycompai/crm`** (MIT) en lots livrables — ordonnés, contractualisés,
> testables — en respectant les invariants réglementaires et architecturaux de CRM-TC.
>
> **Il ne s'agit PAS d'un feu vert pour tout coder.** Le document sépare explicitement :
> — ce qui est **codable immédiatement** ;
> — ce qui **exige un ADR arbitré par un humain avant la moindre ligne de code** ;
> — ce qui est **rédigeable en spécification mais bloqué** en aval d'un ADR reporté.
> Respecter cette frontière est la règle n°1.

**Table des matières**

- [0. Comment lire et utiliser ce document](#0-comment-lire-et-utiliser-ce-document)
- [1. Contexte](#1-contexte)
- [2. Sources & provenance](#2-sources--provenance)
- [3. Méthode d'exécution](#3-méthode-dexécution)
- [4. Ordonnancement — les trois pistes](#4-ordonnancement--les-trois-pistes)
- [5. Lots détaillés](#5-lots-détaillés)
- [6. Réutilisation de code MIT — cartographie](#6-réutilisation-de-code-mit--cartographie)
- [7. Anti-objectifs](#7-anti-objectifs--ce-quil-ne-faut-pas-reprendre)
- [8. Séquence de PRs & rappel de gouvernance](#8-séquence-de-prs--rappel-de-gouvernance)
- [Annexes](#annexes)

---

## 0. Comment lire et utiliser ce document

**Audience.** Un agent Claude Code (et son opérateur humain) qui va implémenter, ADR par ADR et
lot par lot, une série d'améliorations dans CRM-TC en s'inspirant — et parfois en reprenant le
code MIT — de `trycompai/crm`.

**Les cinq règles d'or (non négociables).**

1. **Échouer fermé.** Partout, préférer *ne rien écrire* à *écrire une demi-vérité*. C'est la
   thèse de conception de CRM-TC (cf. §2.2) ; chaque lot la sert.
2. **Reconnaissance avant diff.** Avant d'écrire du code, localiser et lire les fichiers/tables
   cités. Si une hypothèse du plan (nom de table, ADR, composant) ne se vérifie pas :
   **s'arrêter et le signaler**, ne pas deviner.
3. **La gate ADR prime sur tout.** Un lot marqué « ADR requis » se solde par la **rédaction d'un
   ADR**, puis **arrêt**. Aucun code applicatif tant que l'ADR n'est pas `Accepted` par un humain.
   Disposer du code source MIT à copier **ne lève pas** cette gate.
4. **Multi-tenant d'abord.** La source est mono-tenant ; CRM-TC ne l'est pas. Tout accès aux
   données réintègre `tenant_id` + RLS. On reprend la *mécanique*, on réécrit la *frontière*.
5. **Une branche + une PR par lot.** Diff minimal, style du voisinage, tests verts, pas de secret
   ni d'identifiant de modèle dans le code ou les commits.

**Comment naviguer.** Lire §1 (contexte) et §2 (sources) une fois pour se cadrer, puis travailler
§5 lot par lot selon l'ordre de §4/§8. §3 décrit la méthode commune. §6 dit quoi copier du code MIT.

---

## 1. Contexte

### 1.1 Ce qu'est CRM-TC (architecture & invariants)

CRM-TC est un **SaaS CRM multi-tenant** avec un positionnement différenciant explicite :
métamodèle configurable, **isolation multi-tenant par RLS**, traçabilité, conformité RGPD,
workflows, et **4 agents**. Sur les trois axes qui le structurent — *métamodèle configurable*,
*multi-tenant RLS*, *traçabilité/RGPD* — il fait délibérément **l'inverse** du dépôt source.
`trycompai/crm` n'est donc **pas un concurrent** : c'est une **source d'idées sur l'agent**, où il
se trouve être en avance.

**Invariants à ne jamais casser** (tout lot qui les menace doit s'arrêter et escalader) :

| Invariant | Ce que ça implique concrètement |
|-----------|--------------------------------|
| **Multi-tenant** | Toute ligne, toute file, tout cache porte `tenant_id`. Jamais de structure globale qui sérialise ou mélange les tenants. |
| **RLS + `acl_scope`** | L'isolation passe par Row-Level Security en base + un périmètre d'accès applicatif (`acl_scope`). On ne filtre **jamais** en mémoire après un fetch large : la sélection est côté requête, sous RLS. |
| **Niveaux A/B/C/N + chiffrement par personne** | Les données sont classées par sensibilité (A/B/C/N) et chiffrées par personne. L'agent n'a **pas** un droit de lecture universel : sa frontière de lecture respecte ces niveaux (≠ source, cf. §7). |
| **Traçabilité** | Toute action d'agent est journalisée et attribuable. Une approbation est une **décision** documentée, pas un clic. |
| **RGPD / AI Act de premier ordre** | Voir §1.2. La conformité n'est pas un ajout : elle contraint le design de chaque lot agent. |

### 1.2 Cadre réglementaire — ce que chaque article impose *ici*

Ces articles ne sont pas décoratifs : plusieurs lots existent **précisément** pour les servir.

| Référence | Intitulé | Traduction opérationnelle dans CRM-TC |
|-----------|----------|----------------------------------------|
| **AI Act art. 14** | Surveillance humaine effective | L'humain doit pouvoir *superviser réellement*, pas entériner. → Modèle de preuve (**1.1**), `schedule_recheck` motivé (**1.3**). |
| **AI Act art. 22** *(rattaché RGPD art. 22)* | Décision automatisée / « l'approbation devient un réflexe » | Le risque mesuré par `app.agent_suggestion_actions` : on quantifie le réflexe de clic. **1.1** en **traite la cause**. |
| **AI Act art. 50** | Transparence / marquage des contenus générés par IA | Marquage **par ligne** (pas par écran) → support = la puce d'état (**F**). |
| **RGPD art. 5.1.d** | Exactitude des données | Un modèle de preuve empêche d'écrire un fait non étayé (**1.1**). |
| **RGPD art. 14** | Information quand la donnée ne vient **pas** de la personne | Bloque l'enrichissement LinkedIn/data-providers sans base légale (**§7**, décision d'arbitrage, pas de code). |
| **RGPD — transferts** | Un transfert de données à chaque rendu | Une URL de CDN tiers stockée sur une fiche = transfert récurrent → images copiées localement (**1.8**). |

### 1.3 Modèle de gouvernance ADR

CRM-TC décide par **ADR** (Architecture Decision Records, `docs/adr/`). Certains lots **modifient
un contrat existant** ou **figent un choix structurant** : pour ceux-là, l'ADR est un préalable
bloquant. État connu (à re-vérifier en reconnaissance) :

- **ADR-004** — boucle/loop LLM de l'agent : **reporté**. Tout ce qui exécute du LLM sur données
  réelles en dépend. Les lots concernés sont *rédigeables* (spec) mais **non exécutables**.
- **ADR-015** — **contrat d'approbation** des propositions d'agent. Le lot **1.1** le *modifie* →
  amendement d'ADR-015 requis.
- **ADR-033 / 034 / 035** — **en attente d'arbitrage humain**. Aucun code applicatif ne doit les devancer.
- **Nouveaux ADR à créer** : *file d'agent* (**1.2**, choix de partitionnement + équité
  inter-tenants), *manifeste de capacités* (**1.4**, surface de cloisonnement).

> **Si la reconnaissance contredit cet état** (ex. ADR-004 finalement accepté, ou ADR-033/034/035
> déjà arbitrés), **s'arrêter et demander** : l'ordonnancement des Pistes B/C en dépend directement.

### 1.4 Inventaire des briques existantes (à confirmer en reconnaissance)

Ce que CRM-TC possède déjà et sur quoi les lots s'appuient — **ne rien recréer de ce qui existe** :

| Brique | Rôle | Sert le(s) lot(s) |
|--------|------|-------------------|
| `listView.ts` | Helpers d'état d'URL (`q`, `sort`, `vue`) | A, D |
| `DataTable`, `ListToolbar` | Tableau + barre de liste | A, C, D, F |
| Cartes-KPI du dashboard | Indicateurs | B |
| `lot7a_deal_stage_events` | **Journal des changements d'étape d'affaire** (donnée déjà présente) | C |
| Composants d'anneau/donut + « règle de couleur maison » (≤ 2 marques remplies) | Dataviz | G |
| **Catalogue d'outils L6.3** | Registre des outils exposés à l'agent | 1.7, 1.4 |
| `app.agent_proposals` (`action, reversible, decided_by/at/note`) | Propositions d'agent à approuver | 1.1 |
| `app.agent_suggestion_actions` (2026-07-31) | **Mesure** du réflexe d'approbation (art. 22) | 1.1 (contexte) |
| Opt-in par tenant | Activation d'outils/features par tenant | 1.4 |
| `agent_budget_et_journal_llm` | Budget + journal des appels LLM | 1.4, 1.5 |
| `agent_settings` | Réglages agent, dont **le modèle (une ligne, pas un env)** | 1.5 |
| Dock agent **global** | Chat agent transverse | E |
| RLS + `acl_scope`, niveaux **A/B/C/N** | Isolation & sensibilité | transverse |
| Notions **L0.5** / ADR-004 | Couche fondation LLM (préalable) | Piste C |

### 1.5 La colonne vertébrale — « échouer fermé »

L'audit fait remonter trois « connexions surprenantes » du code source qui disent, sous trois
angles, **la même chose** (cf. §2.2). La synthèse : **échouer fermé plutôt que produire une
demi-réponse.** C'est la thèse de CRM-TC. Trois corollaires guident tous les lots agent :

1. **Pas de score de confiance auto-évalué** — on rapporte des *preuves* observées, un registre pondère.
2. **Une contradiction retient le fait entièrement** — elle ne *baisse* pas un score.
3. **Un vide a un coût nul, une demi-réponse a un coût réel** — dans le doute, ne rien afficher.

---

## 2. Sources & provenance

### 2.1 Le dépôt source et son audit de graphe

Source : **`trycompai/crm`** (GitHub, licence **MIT**). L'audit de graphe du dépôt donne l'échelle
et les points de tension repris ci-dessous.

- **Échelle du graphe** : 3 574 nœuds · 8 262 arêtes · 224 communautés · 361 374 tokens d'entrée.
- **Avertissement de santé du graphe** : 1 122 arêtes à extrémité pendante (imports vers
  `node_modules`, hors corpus), 117 arêtes fusionnées → **les décomptes d'arêtes sous-estiment le
  couplage externe**. À garder en tête : la lisibilité réelle des modules peut différer du graphe.
- **God nodes** (nœuds les plus connectés — points de couplage) :
  `cn()` 269 · `useTRPC` 83 · `Db` 81 · `InjectDatabase()` 59 · `Input()` 59 · `useCrmCache()` 51 ·
  `Button()` 45 · `AuthedTrpcContext` 35 · `useOpenRecord()` 30 · `ActivityStampService` 28.
  → Ces symboles sont les endroits où toute reprise de code touchera le plus de voisinage :
  les isoler avant de copier.

### 2.2 Connexions surprenantes → la thèse

Trois observations du code source, convergentes :

1. *« Il n'y a pas d'organisations — mono-tenant par design »* ↔ tient le fait entièrement plutôt que d'abaisser un score.
2. *`ALLOWED_SIGN_IN` non défini échoue fermé* ↔ soit `employerMatches` **et** `nameMatches`, soit ce n'est pas eux.
3. *Remplissages réservés à « go » et « stop » seulement* ↔ quand ne rien écrire — un panneau vide ne coûte rien au commercial.

**Interprétation retenue :** les trois disent, sous trois angles, *échouer fermé plutôt que
produire une demi-réponse*. C'est la colonne vertébrale du dépôt — et, par choix, celle de CRM-TC.

### 2.3 Verdict licence

**MIT, pas AGPL. Lecture (et reprise) sans risque, en clean-room.** Conséquence pratique : on peut
**copier du code**, pas seulement s'en inspirer, **à condition de conserver la notice de copyright
+ le texte MIT** de la source dans tout fichier repris substantiellement (cf. §6). **Re-vérifier le
`LICENSE` du dépôt avant de copier** ; si un sous-dossier porte une autre licence, s'arrêter.

**Ce que le dépôt source fait à l'inverse de nous (leurs choix assumés, à ne pas importer) :**
mono-tenant, auth = une variable d'environnement, zéro RGPD, zéro scale. Notre avance reste entière
sur métamodèle configurable, multi-tenant RLS, traçabilité, RGPD, workflows, 4 agents. **Rien à
prendre de ce côté.** Ce qu'on prend est **côté agent** (cf. §5, §6).

### 2.4 Correspondance symbole-source → lot

Symboles nommés dans le code source, à retrouver par `grep` dans un clone (cf. §3.1). **Chemins à
confirmer** — cette session n'a pas eu accès au dépôt ; on référence par *symbole*, pas par chemin supposé.

| Symbole / module source | Ce qu'il fait | Lot cible |
|-------------------------|---------------|-----------|
| `dispatch.ts` | Draine **deux voies** indépendantes (visible / recherche) | 1.2 |
| `claimDue()` + `FOR UPDATE SKIP LOCKED` | Réclamation concurrente de tâches dues | 1.2 |
| `collapsing()` | Replie N *pokes* sur une entité en un seul drain | 1.2 |
| `lib/capabilities.ts` | Endroit unique « ce qui est configuré » : impression au boot, injection en session, court-circuit outil | 1.4 |
| `search_crm` | Recherche **sans rapprochement flou** | 1.7 |
| catalogue `kind` (`crm.signature-block`, `github.account-identity`, …) | Observations typées, registre pondérant, `contradiction` | 1.1 |
| `schedule_recheck(entity, when, reason)` | L'agent réserve son passage **et dit pourquoi** | 1.3 |
| safe-fetch (refus `169.254.169.254`) + hash des octets | Récupération d'images durcie + adressage par contenu | 1.8 |
| bloc « qui nous sommes » borné + cache de prompt | Contexte entreprise en tête de préambule | 1.6 |
| onglet Agent Radix (par fiche) + 4 correctifs | Chat par fiche, threads persistés | E |

---

## 3. Méthode d'exécution

### 3.1 Setup — cloner la référence MIT (lecture seule)

```bash
# Référence MIT, à côté de CRM-TC, jamais modifiée
git clone https://github.com/trycompai/crm /tmp/trycomp-crm

# Retrouver les chemins réels par symbole (l'audit nomme les symboles, pas les chemins)
rg -n "claimDue|FOR UPDATE SKIP LOCKED|collapsing|schedule_recheck|capabilities|169\.254\.169\.254|search_crm|signature-block" /tmp/trycomp-crm
```

Vérifier `/tmp/trycomp-crm/LICENSE` = MIT avant toute copie (cf. §2.3, §6).

### 3.2 Reconnaissance obligatoire (avant tout diff, pour chaque lot)

Localiser et **lire** dans CRM-TC les briques de §1.4 pertinentes au lot. Confirmer que chaque
hypothèse tient. Établir la liste exacte des fichiers à toucher **avant** de proposer un diff.
Toute divergence → **stop + signalement**, pas de contournement.

### 3.3 Workflow par lot

1. Brancher : `feat/crm-tc-<id-lot>` (ex. `feat/crm-tc-A-toggle-scope`).
2. Écrire le(s) test(s) couvrant les critères d'acceptation du lot (TDD ou en parallèle).
3. Implémenter le diff minimal, calqué sur le style du voisinage (densité de commentaires, nommage, idiomes).
4. **Revue RLS/tenant** obligatoire : prouver par un test qu'aucune donnée hors périmètre ne fuit.
5. Lancer lint + tests ; pas de merge tant que rouge.
6. Ouvrir la PR (uniquement si demandé) avec : lot, piste, ADR lié, ce qui reste bloqué.

### 3.4 Workflow ADR (Piste B — 1.1, 1.2, 1.4)

1. Rédiger l'ADR (gabarit en **Annexe A**) : contexte, décision proposée, alternatives, conséquences, migration.
2. Le déposer en `Proposed` sous `docs/adr/`.
3. **S'arrêter.** Attendre le passage humain à `Accepted`.
4. **Après acceptation seulement** : dérouler le workflow §3.3 pour le code.
   → Disposer du code source MIT prêt à copier **ne lève pas** l'étape 3.

### 3.5 Workflow spec (Piste C — 1.3, 1.5, 1.6, E)

Produire une **spécification technique** par lot (contrat d'API, schéma, comportements, tests
prévus), la classer dans le dossier de conception, la marquer **« Bloqué : ADR-004 (reporté) + L0.5 »**.
**Ne pas coder, ne pas exécuter sur données réelles.**

### 3.6 Definition of Done (globale)

- [ ] Diff minimal, style du voisinage.
- [ ] Critères d'acceptation couverts par des tests **verts**.
- [ ] **Aucune régression RLS/`acl_scope`** — test de non-fuite inter-périmètre.
- [ ] **Aucun secret, aucune clé, aucun identifiant de modèle interne** dans le code, les commits, la PR.
- [ ] PR documentée (lot, piste, ADR, blocages).
- [ ] Piste B : livrable = **ADR** en `Proposed`. Piste C : livrable = **spec** marquée bloquée.

### 3.7 Garde-fous sécurité & licence (transverses)

- Aucun accès data repris de la source sans `tenant_id` + RLS réinjectés.
- Notice MIT + attribution conservées sur tout fichier repris substantiellement ; entrée `THIRD_PARTY`/`NOTICE`.
- Aucune config fournisseur (Vercel/Neon/eve) importée avec le code.
- Tout egress réseau nouveau (safe-fetch, appels externes) passe une revue SSRF (cf. 1.8).
- Envisager un passage de revue de sécurité dédié sur les lots 1.2 et 1.8.

---

## 4. Ordonnancement — les trois pistes

| Lot | Titre | Prio | Piste | Gate | Coût |
|-----|-------|------|-------|------|------|
| **A** | Bascule *Moi / Toute l'équipe* ancrée dans l'URL | 🔴 | A | — | S |
| **B** | Sous-ligne de contexte sous chaque KPI | 🔴 | A | — | S |
| **C** | Colonne *temps dans l'étape* (pipeline) | 🔴 | A | — | S |
| **D** | Compteur de colonnes dans le libellé du sélecteur | 🟡 | A | — | XS |
| **F** | Puce d'état par ligne + support art. 50 | 🟡 | A | — | S |
| **G** | Anneau pipeline par étape + légende chiffrée | 🟡 | A | — | S |
| **1.7** | Lectures rendant les `id` des voisins ; `search_crm` sans flou | 🟢 | A | — | S |
| **1.8** | Images copiées (hash) + safe-fetch anti-SSRF | 🟢 | A | — | S |
| **1.2** | File d'agent à deux voies + priorité (par tenant) | 🔴 | B | **ADR file** | M |
| **1.1** | Modèle de preuve, jamais de score de confiance | 🔴 | B | **ADR-015** | M |
| **1.4** | Manifeste de capacités par tenant, injecté au prompt | 🟡 | B | **ADR manifeste** | M |
| **1.3** | `schedule_recheck` avec sa raison, affichée | 🟡 | C | ADR-004 + L0.5 | S |
| **1.5** | Deux détails de coût sur le choix de modèle | 🟡 | C | ADR-004 + L0.5 | S |
| **1.6** | Bloc « qui nous sommes » en tête de prompt | 🟡 | C | ADR-004 + L0.5 | S |
| **E** | Onglet Agent par fiche, threads persistés, `?thread=` | 🟡 | C | ADR-004 + L0.5 | M |

- **PISTE A — codable maintenant :** `A, B, C, D, F, G, 1.7, 1.8`. Livrer d'abord.
- **PISTE B — ADR d'abord, code ensuite :** `1.2, 1.1, 1.4`. Livrable immédiat = l'ADR.
- **PISTE C — aval ADR-004 (reporté) + L0.5 :** `1.3, 1.5, 1.6, E`. Spec seulement.

---

## 5. Lots détaillés

> **Gabarit.** Chaque lot suit : *Problème (cité) · Pourquoi chez nous · Source · Reconnaissance ·
> Contrat/Schéma · Adaptation multi-tenant · Critères d'acceptation · Tests · Anti-patterns · Gate/Coût.*

### PISTE A — codable immédiatement

---

#### Lot A — Bascule *Moi / Toute l'équipe*, ancrée dans l'URL

- **Problème.** *« Contrôle le plus utilisé d'un tableau de bord commercial. »* Un segmenteur
  `Moi | Toute l'équipe` dont l'état vit dans l'URL (partageable, rechargeable, back/forward).
- **Pourquoi chez nous.** `listView` sait déjà écrire `q/sort/vue` dans l'URL — on ajoute **un
  4ᵉ paramètre**, pas une refonte. La sélection doit rester **sous `acl_scope`/RLS**.
- **Source.** Concept UI (captures). Pas de reprise de code — réécrire dans nos composants.
- **Reconnaissance.** `listView.ts` (mécanisme d'écriture d'URL), `DataTable`, `ListToolbar`,
  le point où la requête liste applique `acl_scope`.
- **Contrat.** Param `scope=me|team` (défaut = défaut produit existant). Propagé par le même
  helper que `q/sort/vue` — **source de vérité = l'URL**, pas un état React local. Le filtre
  s'applique **côté requête** via `acl_scope`.
- **Adaptation multi-tenant.** `team` = équipe visible du user **dans son tenant**, jamais au-delà de RLS.
- **Critères d'acceptation.**
  - [ ] Basculer met à jour l'URL sans rechargement dur ; recharger conserve la vue.
  - [ ] `scope=team` ne renvoie jamais de lignes hors `acl_scope` (test RLS).
  - [ ] Back/forward restaure l'état précédent.
- **Tests.** Test d'intégration URL↔état ; test RLS multi-user ; test navigation historique.
- **Anti-patterns.** Filtrer en mémoire après un fetch large (fuite de périmètre).
- **Gate : aucune. Coût : S.**

---

#### Lot B — Sous-ligne de contexte sous chaque KPI

- **Problème.** *« Un nombre seul ne décide rien. La sous-ligne dit quoi en faire. »* Ex. sous
  `756 K€` : `15 affaires · 275 K€ à échéance ce mois`.
- **Pourquoi chez nous.** Faible coût, fort effet décisionnel ; cohérent avec la règle de couleur maison.
- **Source.** Concept UI. Réécriture.
- **Reconnaissance.** Composant carte-KPI ; agrégations déjà disponibles (montant, count, échéances).
- **Contrat.** KPI = `{ value, sublineParts: [{label, value}] }`. Rendu : valeur en gros,
  sous-ligne discrète (points médians `·`). **≤ 2 marques remplies** côté couleur. Sous-ligne
  issue de la **même source** que la valeur (pas de recomputation divergente).
- **Critères d'acceptation.**
  - [ ] Chaque KPI a une sous-ligne actionnable, **ou aucune** — jamais un placeholder `-` vide.
  - [ ] Réconciliation : `Σ sous-ligne` cohérent avec la valeur quand c'est sémantiquement attendu.
- **Tests.** Snapshot de rendu ; test de cohérence des agrégats.
- **Anti-patterns.** Recalculer la sous-ligne depuis une autre requête (divergence).
- **Gate : aucune. Coût : S.**

---

#### Lot C — Colonne *temps dans l'étape* (pipeline)

- **Problème.** *« Transforme une liste en liste de tâches. »* Depuis combien de temps chaque
  affaire stagne dans son étape.
- **Pourquoi chez nous.** *« La donnée existe déjà »* : `lot7a_deal_stage_events`.
- **Source.** Concept UI + données internes. Réécriture.
- **Reconnaissance.** `lot7a_deal_stage_events` (schéma, event « entrée d'étape ») ; vue pipeline.
- **Contrat.** `temps_dans_l_étape = now - max(event.entered_at pour l'étape courante)`. Rendu
  humain (`3 j`, `2 sem`), **triable**, seuil visuel discret au-delà d'un âge (≤ 2 marques).
  Calcul **en base/vue** (pas de N+1 en front).
- **Critères d'acceptation.**
  - [ ] Colonne présente, triable ASC/DESC.
  - [ ] Une affaire qui vient de changer d'étape repart à `0 j`.
  - [ ] **Aucune requête par ligne** (vérifier le plan / le nombre de requêtes).
- **Tests.** Test du calcul (event récent → 0) ; test anti-N+1 (compter les requêtes).
- **Anti-patterns.** Dériver l'âge côté client en bouclant sur les events.
- **Gate : aucune. Coût : S.**

---

#### Lot D — Compteur de colonnes dans le libellé du sélecteur

- **Problème.** *« C'est le compteur qui signale qu'une vue est réduite. »* Sans lui, on cherche une colonne absente.
- **Source.** Concept UI. Réécriture.
- **Reconnaissance.** État de visibilité des colonnes dans `DataTable`.
- **Contrat.** Le sélecteur affiche `Colonnes (6/11)` (visibles/total). Purement présentationnel.
- **Critères d'acceptation.**
  - [ ] Masquer/afficher une colonne met à jour le compteur en direct.
  - [ ] Le total reflète **toutes** les colonnes configurables.
- **Tests.** Test unitaire d'affichage du compteur.
- **Gate : aucune. Coût : XS.**

---

#### Lot F — Puce d'état par ligne + support du marquage art. 50

- **Problème.** *« Un champ vide ne dit pas s'il est vide ou en cours. »* Remplacer le vide par une
  puce `en file | en cours | fait | indisponible`. **C'est aussi le bon support du marquage art. 50 — par ligne, pas par écran.**
- **Pourquoi chez nous.** Conformité art. 50 au bon grain + lisibilité opérationnelle.
- **Source.** Concept UI. Réécriture.
- **Reconnaissance.** Colonnes rendues vides pendant une production d'agent.
- **Contrat.** États : `queued`, `running`, `done`, `unavailable`. **Ne jamais confondre**
  `unavailable` (un *fait* : non configuré, irrécupérable) et `running` (une *affirmation* sur la
  session, temporaire). La puce porte le **marquage art. 50** (contenu généré/assisté par IA) au niveau ligne.
- **Critères d'acceptation.**
  - [ ] Aucune cellule « agentique » n'est un blanc ambigu.
  - [ ] Marquage art. 50 présent et attribuable **ligne par ligne**.
- **Tests.** Test d'états ; test de présence du marquage sur ligne assistée.
- **Anti-patterns.** Marquage global « cet écran contient de l'IA » (trop grossier).
- **Gate : aucune. Coût : S.**

---

#### Lot G — Anneau pipeline par étape + légende chiffrée

- **Problème.** *« L'anneau seul est décoratif ; la légende chiffrée à côté le rend lisible. »*
  `étape · nombre · montant`.
- **Source.** Concept UI. Réécriture.
- **Reconnaissance.** Composant donut ; agrégat par étape (réutiliser celui du pipeline si existant).
- **Contrat.** Anneau + légende `Prospection · 12 · 340 K€`, etc. **≤ 2 marques remplies** ; reste
  en nuances neutres.
- **Critères d'acceptation.**
  - [ ] Chaque segment a sa ligne de légende chiffrée (jamais un anneau muet).
  - [ ] Total légende = total pipeline affiché ailleurs (réconciliation).
- **Tests.** Test de réconciliation des totaux.
- **Gate : aucune. Coût : S.**

---

#### Lot 1.7 — Lectures rendant les `id` des voisins ; `search_crm` sans flou

- **Problème.** *« Un préambule ou un résultat d'outil qui nomme une fiche sans son `id` est un
  bug. »* Le seul recours de l'agent sinon est de re-demander à l'humain ; le CRM doit rendre sa
  propre jointure. **Corollaire :** *« Northwind » → « Northwind Savings Group »* est utile ;
  *« Marchetti » → « Marchetta »* est une **mauvaise fiche sur une vraie personne**.
- **Pourquoi chez nous.** Coût quasi nul, règle de catalogue d'outils, gain d'autonomie de l'agent.
- **Source.** `search_crm` + pattern « toute lecture rend les `id` ».
- **Reconnaissance.** Catalogue d'outils **L6.3** ; chaque outil de lecture / `search_crm` ; points de sérialisation d'entité.
- **Contrat.**
  - Tout résultat d'outil (et préambule) qui **nomme** une entité inclut son `id` stable + les `id`
    des voisins directs référencés (société↔contacts↔affaires).
  - `search_crm` = matching **exact / préfixe / sous-chaîne insensible à la casse**. **Pas** de
    trigram / Levenshtein / fuzzy sur les noms de personnes.
- **Adaptation multi-tenant.** Les jointures « voisins » restent sous RLS/`acl_scope` (pas de fuite via un `id` voisin hors périmètre).
- **Critères d'acceptation.**
  - [ ] Test de contrat : chaque outil de lecture renvoie les `id` des entités nommées.
  - [ ] Test : `search_crm` renvoie ∅ sur `Marchetta` vs `Marchetti`, et la fiche sur une inclusion (`Northwind`).
- **Tests.** Tests de contrat d'outil ; tests de non-flou.
- **Anti-patterns.** Renvoyer un nom sans `id` ; activer un matching approximatif « pour aider ».
- **Gate : aucune. Coût : S.**

---

#### Lot 1.8 — Images copiées (hash) + safe-fetch anti-SSRF

- **Problème.** *« Clé = hash des octets (idempotent + une refonte de logo donne une nouvelle URL
  au lieu de la même derrière un mois de cache CDN). Récupération via un safe-fetch qui refuse
  169.254.169.254 — l'URL vient de la réponse d'un fournisseur, donc c'est une SSRF depuis
  l'intérieur du réseau. »*
- **Pourquoi chez nous.** Sécurité (SSRF) **+ angle RGPD** que la source ne mentionne pas : une URL
  de CDN tiers stockée sur une fiche est un **transfert de données à chaque rendu**.
- **Source.** Reprise **quasi verbatim** du safe-fetch + du hash-adressage (cf. §6).
- **Reconnaissance.** Stockage d'assets (logos/portraits) ; point d'entrée des URLs fournisseurs.
- **Contrat.**
  - **Clé = SHA-256 des octets.** Idempotent ; une refonte produit un **nouvel** objet/URL.
  - **safe-fetch durci** :
    - Résoudre le DNS puis **refuser les IP privées/réservées** : `169.254.0.0/16` (dont
      `169.254.169.254`), `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `::1`, `fc00::/7`, `fe80::/10`.
    - **Revalider l'IP à chaque redirection** (anti-DNS-rebinding), pas seulement l'URL initiale.
    - Timeouts + plafond de taille + `Content-Type` image validé.
    - Commentaire de code obligatoire : *l'URL vient de la réponse d'un fournisseur → SSRF interne.*
  - Consigner l'angle RGPD (suppression du transfert tiers récurrent).
- **Critères d'acceptation.**
  - [ ] `safe-fetch` rejette `http://169.254.169.254/…` **et** une redirection `→ 10.x` (test).
  - [ ] Deux imports du même octet-stream ⇒ un seul objet stocké (idempotence par hash).
  - [ ] Après import, aucune fiche ne référence une URL externe pour une image.
- **Tests.** Tests SSRF (IP directe + redirection) ; test d'idempotence ; test de non-référence externe.
- **Anti-patterns.** Se fier au hostname sans résoudre l'IP effective.
- **Gate : aucune. Coût : S.** *(Revue de sécurité recommandée.)*

---

### PISTE B — rédiger l'ADR d'abord, coder ensuite

> Livrable immédiat = **l'ADR** en `Proposed`. Aucun code applicatif avant `Accepted` humain.

---

#### Lot 1.2 — File d'agent à deux voies + priorité *(ADR requis : partitionnement inter-tenants)*

- **Problème.** *« dispatch.ts draine deux voies indépendantes. »*

  | Voie | Contenu | Exécution |
  |------|---------|-----------|
  | **Visible** | logo, portrait | direct, **sans modèle**, ~60/tick |
  | **Recherche** | tout le reste | 1 session LLM par ligne, ~12/tick |

  *Raison :* ce qu'un utilisateur lit avant d'ouvrir quoi que ce soit **ne doit jamais faire la
  queue derrière du LLM** (leçon vécue deux fois : `stripe.com` en carré gris pendant que l'agent
  rédigeait des paragraphes sur ses employés). Mécanique : `claimDue()` avec `FOR UPDATE SKIP
  LOCKED`, table de priorités unique, `collapsing()` qui replie N pokes en un seul drain.
- **Pourquoi un ADR.** **Une file append-only ne se re-partitionne pas** → le choix se **fige tôt**.
  La source est mono-tenant : une file **globale** leur suffit. Chez nous, une file globale
  **sérialise les tenants** — un tenant bavard **affame** les autres. Il faut **voie × tour de rôle
  (round-robin) par tenant**. Décision structurante ⇒ ADR. *(N'exige **pas** ADR-004 : c'est de
  l'infra, pas du LLM.)*
- **Constat actuel.** Aucune file d'agent durable ; l'agent de page est requête→réponse.
- **Source.** `dispatch.ts`, `claimDue()`, `collapsing()`, table de priorités (reprise adaptée, cf. §6).
- **Contenu attendu de l'ADR.**
  - Schéma de table : `id, tenant_id, lane, priority, entity_ref, poke_key (collapsing), claimed_at, attempts, state`.
  - **Politique d'équité + anti-famine** (`voie × round-robin par tenant`, quotas/tick), avec le raisonnement « ne se re-partitionne pas ».
  - Reprise sur crash mid-claim ; idempotence des drains.
  - Métriques : âge en file par voie **et** par tenant.
- **Critères d'acceptation (post-ADR, pour le code).**
  - [ ] 10 000 tâches d'un tenant n'empêchent pas un autre tenant d'être servi au tick suivant (équité).
  - [ ] La voie *visible* n'est jamais bloquée par la voie *recherche* (latence).
  - [ ] `collapsing()` : 100 pokes sur une entité ⇒ 1 drain.
  - [ ] `FOR UPDATE SKIP LOCKED` : deux workers ne réclament pas la même ligne (concurrence).
- **Gate : ADR file. Coût : M.** *(Revue de sécurité recommandée sur l'isolation tenant.)*

---

#### Lot 1.1 — Modèle de preuve, jamais de score de confiance *(ADR requis : amende ADR-015)*

- **Problème.** *« Aucun outil n'accepte de `confidence`. L'outil rapporte ce qu'il a observé
  (`crm.signature-block`, `github.account-identity`), un registre pondère. Source primaire + bande
  haute → écrit sur la fiche. Sinon → suggestion sous le champ vide. Contradiction → retient le
  fait entièrement, ne baisse pas le score. »* Citation-clé : *« Un modèle à qui on demande de
  noter sa propre certitude le fera, et se trompera dans la direction qui le fait paraître utile. »*
- **Pourquoi chez nous (précis).** `app.agent_proposals` porte `action, reversible,
  decided_by/at/note` — **pas le pourquoi**. L'écran d'approbation affiche « l'agent propose X »
  **sans provenance**. On a construit `app.agent_suggestion_actions` (2026-07-31) pour **mesurer**
  le réflexe de clic (art. 22) — *« on mesure la maladie sans traiter la cause »*. Une colonne de
  preuve transforme l'**approbation** en **décision**. Exigences servies : **AI Act art. 14**
  (surveillance effective) et **RGPD art. 5.1.d** (exactitude).
- **Pourquoi un ADR.** Le lot **modifie le contrat d'approbation d'ADR-015** → amendement requis.
- **Source.** Le **catalogue fermé de `kind`** + le registre pondérant + l'état `contradiction` (inspiration de contenu, cf. §6).
- **Contenu attendu de l'ADR (amendement ADR-015).**
  - Nouveau contrat : *« une proposition sans `evidence` n'est pas approuvable ».*
  - Schéma : `app.agent_proposals.evidence jsonb` = liste `{ kind, source_ref, observed_at, detail }`.
  - **Catalogue fermé de `kind`** (enum applicatif + contrainte DB) ; gouvernance d'ajout d'un `kind`.
  - **Bande** (primaire/secondaire, haute/basse) dérivée du **registre**, jamais fournie par le modèle.
  - **`contradiction` = état bloquant** : non approuvable tant que non levée ; l'UI montre les deux observations opposées + la provenance (`kind` + `source_ref`).
  - Migration de `agent_proposals` (colonne, nullable/backfill, transition).
- **Critères d'acceptation (post-ADR).**
  - [ ] Un outil qui tente de fournir `confidence` est rejeté au niveau contrat.
  - [ ] Une proposition en `contradiction` est **non approuvable** (UI **et** API).
  - [ ] L'écran d'approbation rend chaque `evidence.kind` + `source_ref`.
  - [ ] `kind` hors catalogue ⇒ rejet (contrainte DB + validation applicative).
- **Gate : ADR-015. Coût : M.**

---

#### Lot 1.4 — Manifeste de capacités par tenant, injecté au prompt *(ADR requis)*

- **Problème.** *« `lib/capabilities.ts` : un seul endroit qui sait ce qui est configuré. Imprime
  au démarrage, l'énonce dans les instructions de session (l'agent planifie sur ce qu'il a au lieu
  de découvrir les trous un appel raté à la fois), et donne aux outils un résultat partagé "non
  configuré, réessayer n'aidera pas" — vérifié avant de débiter le budget. »*
- **Pourquoi chez nous.** On a déjà le **catalogue L6.3**, l'**opt-in par tenant**, le **budget**
  (`agent_budget_et_journal_llm`) — *« il manque la jonction »*. Un manifeste **par tenant** évite
  de payer des appels qui ne peuvent aboutir **et** exprime ce que ce tenant autorise → **surface
  de cloisonnement**.
- **Pourquoi un ADR.** Le manifeste devient une **frontière de sécurité** ; sa forme se fige ⇒ ADR.
- **Source.** `lib/capabilities.ts` (structure + pattern « court-circuit avant budget », cf. §6).
- **Contenu attendu de l'ADR.**
  - Résolution `manifest(tenant_id)` = { catalogue L6.3 } × { opt-in tenant } × { budget/état config }.
  - **Injection** dans le préambule de session (mis en cache de prompt) : capacités *disponibles pour ce tenant*.
  - **Court-circuit outil** : un outil non disponible renvoie un résultat terminal `unavailable:
    retrying won't help` **avant** toute dépense de budget LLM.
  - **Autorité** : un outil hors manifeste n'est pas appelable côté serveur, même si le modèle le tente (relation avec `acl_scope` + opt-in).
  - Fraîcheur/caching du manifeste ; ordre `manifeste → budget → appel`.
- **Critères d'acceptation (post-ADR).**
  - [ ] Tenant sans opt-in sur X : l'agent ne tente jamais X, **aucun token débité**.
  - [ ] Le préambule liste exactement les capacités du tenant courant (test multi-tenant : 2 tenants ⇒ 2 manifestes).
  - [ ] Un appel hors manifeste est refusé **côté serveur** (pas seulement caché du prompt).
- **Gate : ADR manifeste. Coût : M.**

---

### PISTE C — aval ADR-004 (reporté) + L0.5 — SPEC uniquement

> **Ne pas coder, ne pas exécuter sur données réelles.** Produire une spec par lot, la marquer
> **« Bloqué : ADR-004 + L0.5 »**.

---

#### Lot 1.3 — `schedule_recheck` avec sa raison, affichée *(spec)*

- **Problème.** L'agent **réserve lui-même** son prochain passage **et doit dire pourquoi** ; la
  raison est **montrée à l'utilisateur**. *« Un agent qui ne peut pas dire pourquoi il repassera
  dans quatorze jours n'a pas une raison, il a un défaut. »*
- **Pourquoi chez nous.** Coût quasi nul ; **pièce art. 14 gratuite**. Nos workflows planifient
  déjà ; l'agent ne réserve pas son propre retour **motivé**.
- **Source.** `schedule_recheck(entity, when, reason)` (forme d'API, cf. §6).
- **Spec.** Outil `schedule_recheck(entity_ref, when, reason)` ; `reason` **obligatoire et non
  vide** ; persisté ; rendu dans l'UI à côté de l'échéance.
- **Gate : ADR-004 + L0.5. Coût : S (spec).**

---

#### Lot 1.5 — Deux détails de coût sur le choix de modèle *(spec)*

- **Contexte.** On a déjà `agent_settings` (le modèle est **une ligne, pas un env** — même
  conclusion qu'eux). Deux détails qu'ils ont **payés** et pas nous :
  1. **Une conversation ouverte finit sur le modèle avec lequel elle a commencé.** Les **caches de
     prompt sont par modèle** : basculer en cours de route **ré-ingère tout le fil au prix non-caché**.
  2. **Ne jamais hériter `modelContextWindowTokens` du repli.** Un modèle à fenêtre plus petite se
     fait compacter contre un chiffre qu'il n'a pas → **le tour échoue chez le fournisseur après
     que le contexte a été assemblé et payé**.
- **Spec.** Épingler `model_id` au niveau conversation à sa création ; propager la **vraie** fenêtre
  de contexte du modèle effectif (jamais celle du repli) au compacteur.
- **Source.** Deux **règles**, pas du code à copier.
- **Gate : ADR-004 + L0.5. Coût : S (spec).**

---

#### Lot 1.6 — Bloc « qui nous sommes » en tête de chaque prompt *(spec)*

- **Problème.** *« Un agent qui sait tout de la personne et rien de l'entreprise qui l'emploie
  écrit un dossier, pas un briefing. »* Correctif source : bloc **borné par le chemin d'écriture**
  (~320 caractères de narratif + une ligne courte : ce qu'on vend / à qui / contre qui), **mis en
  cache de prompt**, présent dans **tous** les préambules ; + une ligne explicite : *« dis ce que
  cette fiche signifie pour nous, jamais un argumentaire — le commercial sait déjà ce qu'on vend ».*
- **Pourquoi chez nous.** **Profil d'espace de travail par tenant.** Peu cher, gros effet. Se marie avec **1.4**.
- **Spec.** Champ `workspace_profile` par tenant (borné) ; injecté en tête de préambule ; caché ;
  garde-fou anti-argumentaire.
- **Gate : ADR-004 + L0.5. Coût : S (spec).**

---

#### Lot E — Onglet Agent par fiche, threads persistés, `?thread=` *(spec)*

- **Contexte.** On a un **dock global**. Le leur est **par fiche**, avec **question d'ouverture
  propre au type** (personne / société / affaire). Proposer « Qui est cette personne ? » sur une
  société est le symptôme d'un chat vissé sur le côté.
- **Spec fonctionnelle.** Onglet Agent par fiche ; conversations **persistées** ; `?thread=` dans
  l'URL ; question d'ouverture dépendante du type d'entité.
- **Détails d'implémentation à NE PAS réapprendre — ils les ont tous payés (à graver dans la spec) :**
  1. **Ne pas démonter le panneau au changement d'onglet.** Radix jette l'onglet inactif → **flux
     avorté en plein milieu** → « je suis allé sur un autre onglet et la réponse n'est jamais
     revenue ». → garder monté (`forceMount` + masquage CSS).
  2. **Ne rien monter avant que la liste des threads soit chargée.** Sinon session créée puis
     remontée sur la vraie → « l'historique n'apparaît qu'après rafraîchissement ». → attendre la liste, puis monter.
  3. **Fil injoignable = hors ligne, jamais « en cours ».** L'un est un *fait* sur nous (réseau),
     l'autre une *affirmation* sur la session — **fausse et irrécupérable**.
  4. **Fil terminé = un bouton, pas une boîte verrouillée.** *Terminé* et *en-cours* désactivent
     tous deux la saisie mais **n'ont rien à voir** — ne pas les représenter pareil.
- **Source.** Onglet Agent Radix + les 4 correctifs (check-list de bugs à éviter, cf. §6).
- **Gate : ADR-004 + L0.5. Coût : M (spec).**

---

## 6. Réutilisation de code MIT — cartographie

**Posture licence.** MIT (cf. §2.3) → reprise autorisée. Conserver notice de copyright + texte MIT
dans tout fichier repris substantiellement ; créditer l'origine (en-tête ou `NOTICE`/`THIRD_PARTY`).
**Re-confirmer le `LICENSE` avant de copier.**

**Règle d'or de transposition.** La source est **mono-tenant**. Chaque morceau repris est **re-lu
sous l'angle multi-tenant / RLS / A-B-C-N avant intégration**. On reprend la *mécanique*, on réécrit
la *frontière*. Jamais de copier-coller d'un accès data sans y réinjecter `tenant_id` + RLS.

| Lot | Ce qu'on reprend (par symbole) | Verbatim vs Adapter | Ce qu'on NE reprend PAS |
|-----|--------------------------------|---------------------|--------------------------|
| **1.2** | `dispatch.ts`, `claimDue()` (`FOR UPDATE SKIP LOCKED`), `collapsing()`, table de priorités | **Adapter** : la mécanique SQL `SKIP LOCKED` + collapsing quasi verbatim ; **ordonnancement FIFO global → `voie × round-robin par tenant`** | La file **globale** mono-tenant ; leur schéma sans `tenant_id` |
| **1.4** | `lib/capabilities.ts` (endroit unique, impression boot, injection session, court-circuit « non configuré ») | **Adapter** : structure + « court-circuit avant budget » ; **résolution → `manifest(tenant_id)`** = L6.3 × opt-in × budget | Un manifeste **process-global** ; absence de dimension tenant |
| **1.8** | **safe-fetch** (refus `169.254.169.254` & IP privées, validation type/taille) + **hash des octets** comme clé | **Quasi verbatim** : durcissement SSRF + hash-adressage transposables | Rien à retirer — **compléter** : revalider l'IP à chaque redirection, ajouter `fc00::/7`, consigner l'angle RGPD |
| **1.7** | Logique de `search_crm` (exact/préfixe/inclusion, **sans flou**) + pattern « toute lecture rend les `id` » | **Adapter** : règle + matching repris ; **jointures sous RLS/`acl_scope`** | Tout rapprochement flou ; accès non filtré par tenant |
| **1.1** | Catalogue fermé de `kind` + registre pondérant + `contradiction` bloquant | **Adapter** : `kind` et logique de bande comme **inspiration de contenu** ; **stockage → `agent_proposals.evidence jsonb`** | Un modèle de score ; leur absence d'écran de provenance (à construire chez nous) |
| **1.3** | Signature `schedule_recheck(entity, when, reason)` + `reason` obligatoire affichée | **Verbatim** comme forme d'API ; **spec seulement** (bloqué ADR-004) | — |
| **1.5** | « conversation épinglée à son modèle » + « ne pas hériter `modelContextWindowTokens` du repli » | **Adapter** : **deux règles**, pas du code ; appliquer à `agent_settings` | — |
| **1.6** | Forme du bloc borné (~320 car, cache de prompt, garde-fou anti-argumentaire) | **Adapter** en `workspace_profile` par tenant | Le contenu mono-entreprise en dur |
| **E** | Onglet Radix + **4 correctifs** (pas de démontage, montage après liste, injoignable≠en-cours, terminé=bouton) | **Adapter** : correctifs = **check-list de bugs** ; réécrire pour notre dock/type d'entité | Le chat mono-fiche sans question d'ouverture typée |
| **A–D, F, G** | Références **visuelles** (captures) uniquement | **Réécrire** dans `DataTable`/`ListToolbar`/`listView.ts` | Le markup tel quel (stack/design différents) |

**Garde-fous de reprise.**
- [ ] Aucun accès data repris sans `tenant_id` + RLS réinjectés (revue obligatoire).
- [ ] Notice MIT + attribution conservées ; entrée `THIRD_PARTY`/`NOTICE`.
- [ ] Aucun secret, aucune config fournisseur (Vercel/Neon/eve) importée avec le code.
- [ ] Les lots **1.2, 1.4, 1.1** restent **bloqués par leur ADR** même si le code source est prêt à copier.

---

## 7. Anti-objectifs — ce qu'il NE faut PAS reprendre

| ❌ | Pourquoi c'est incompatible avec CRM-TC |
|----|------------------------------------------|
| Mono-tenant / « il n'y a pas d'organisations » | L'inverse exact de notre contrainte jour 1 (multi-tenant RLS). |
| `ALLOWED_SIGN_IN` comme modèle d'autorisation | Une var d'env, tout le monde voit tout. On a **RLS + `acl_scope`**. Sans objet. |
| « L'agent peut tout lire, y compris les corps d'e-mails » | Incompatible avec **A/B/C/N + chiffrement par personne**. Leur frontière d'**egress** est bonne ; leur frontière de **lecture** n'est **pas** transposable. |
| Enrichissement LinkedIn / data-providers | RGPD **art. 14** + **balance d'intérêt légitime** + **AIPD**. **Décision d'arbitrage, pas de code.** Ne rien coder avant. |
| Verrouillage Vercel / Neon / eve | Pas de dépendance fournisseur bloquante. |

---

## 8. Séquence de PRs & rappel de gouvernance

1. **PR-1 → PR-6 (Piste A, affichage) :** `D` (XS) → `A` → `B` → `C` → `F` → `G`.
2. **PR-7 :** `1.7` (ids voisins + `search_crm` sans flou).
3. **PR-8 :** `1.8` (images par hash + safe-fetch anti-SSRF).
4. **ADR-A / ADR-B / ADR-C (Piste B) :** rédiger **ADR file d'agent (1.2)**, **amendement ADR-015
   (1.1)**, **ADR manifeste (1.4)**. **Stop après rédaction.** Attendre arbitrage humain, puis coder.
5. **Piste C :** rédiger les specs `1.3, 1.5, 1.6, E`, classées « Bloqué : ADR-004 + L0.5 ».

> **Rappel de gouvernance (final).** ADR-033/034/035 attendent l'arbitrage humain ; ADR-004 est
> reporté. **Aucun code applicatif ne doit les devancer.** Tout ce qui précède est une *proposition*
> d'exécution : les Pistes B et C ne franchissent pas la frontière ADR sans un humain qui l'a
> marquée `Accepted`.

---

## Annexes

### Annexe A — Gabarit d'ADR (Piste B)

```markdown
# ADR-XXX : <titre>

- Statut : Proposed        <!-- Proposed → Accepted (humain) → Superseded -->
- Date : <AAAA-MM-JJ>
- Décideurs : <à compléter>
- Lot lié : <1.1 | 1.2 | 1.4>
- Amende : <ADR-015 le cas échéant>

## Contexte
<Le problème, l'état actuel de CRM-TC, la contrainte réglementaire ou d'archi qui force la décision.
 Pourquoi ça se fige tôt / pourquoi ça ne se rattrape pas.>

## Décision
<Le contrat retenu : schéma, invariants, frontières de sécurité, comportement multi-tenant.>

## Alternatives considérées
<Au moins l'option mono-tenant "à la source" et pourquoi elle est rejetée ici.>

## Conséquences
<Migration, impacts sur les contrats existants (ex. approbation ADR-015), métriques, risques,
 réversibilité.>

## Critères d'acceptation du code (post-Accepted)
<Repris depuis §5 du plan.>
```

### Annexe B — Glossaire

| Terme | Définition |
|-------|-----------|
| **CRM-TC** | Le CRM multi-tenant cible de ce plan. |
| **A/B/C/N** | Niveaux de sensibilité des données, avec chiffrement par personne. |
| **`acl_scope`** | Périmètre d'accès applicatif (owner/équipe/tenant) appliqué **côté requête**. |
| **RLS** | Row-Level Security (isolation en base par `tenant_id`). |
| **L6.3** | Catalogue d'outils exposés à l'agent. |
| **L0.5** | Couche fondation (préalable des lots Piste C). *(Définition exacte à confirmer.)* |
| **ADR-004** | Boucle LLM de l'agent — **reporté**. |
| **ADR-015** | Contrat d'approbation des propositions d'agent — amendé par 1.1. |
| **ADR-033/034/035** | En attente d'arbitrage humain. |
| **`lot7a_deal_stage_events`** | Journal des changements d'étape d'affaire. |
| **`app.agent_proposals`** | Propositions d'agent à approuver. |
| **`app.agent_suggestion_actions`** | Mesure du réflexe d'approbation (art. 22). |
| **`agent_settings`** | Réglages agent (dont le modèle). |
| **`agent_budget_et_journal_llm`** | Budget + journal des appels LLM. |
| **art. 14 / 22 / 50 (AI Act)** | Surveillance humaine / décision automatisée / marquage IA. |
| **RGPD art. 5.1.d / 14** | Exactitude / information quand la donnée ne vient pas de la personne. |

### Annexe C — Check-list « avant de commencer un lot »

- [ ] Lot identifié dans §4/§8, piste et gate connues.
- [ ] Reconnaissance §3.2 faite ; hypothèses de §1.4 vérifiées (sinon : stop + signalement).
- [ ] Si Piste B → rédiger l'ADR (Annexe A) et **s'arrêter**.
- [ ] Si Piste C → produire la spec, marquer « Bloqué : ADR-004 + L0.5 ».
- [ ] Si Piste A → brancher `feat/crm-tc-<id>`, tests d'abord, diff minimal, revue RLS, tests verts.
- [ ] Reprise de code MIT ? → §6 (notice + attribution + transposition multi-tenant).
