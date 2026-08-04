# Prompt + Plan d'intégration — CRM-TC ⟵ enseignements de `trycompai/crm`

> **Nature du document.** Ceci est un *prompt maître* + *plan d'exécution* destiné à être
> collé tel quel à un agent **Claude Code** travaillant sur le dépôt **CRM-TC**.
> Il traduit l'audit du graphe de `trycompai/crm` (MIT, lecture clean-room) en lots
> livrables, ordonnés, avec contrats, critères d'acceptation et garde-fous.
>
> **Ce document n'autorise pas à tout coder.** Il distingue explicitement ce qui est
> *codable maintenant* de ce qui *exige un ADR arbitré avant la moindre ligne de code*.
> Respecter cette frontière est la première règle.

---

## 0. Méta-instructions pour Claude Code (à lire en premier, non négociable)

**Ton rôle.** Tu interviens sur CRM-TC : SaaS CRM **multi-tenant**, isolation par **RLS +
`acl_scope`**, niveaux de sensibilité **A/B/C/N** avec chiffrement par personne,
contraintes **RGPD** et **AI Act (art. 14, art. 22, art. 50)** de premier ordre,
métamodèle configurable, 4 agents. Tu n'es **pas** sur un mono-tenant jetable.

**Colonne vertébrale du design à respecter partout : *échouer fermé plutôt que produire
une demi-réponse.*** Trois corollaires opérationnels :
1. Pas de score de confiance auto-évalué : on rapporte des **preuves**, un registre pondère.
2. Une **contradiction** retient le fait entièrement — elle ne baisse pas un score.
3. Un panneau/champ vide a un coût nul ; une demi-réponse a un coût réel. Dans le doute, ne rien écrire.

**Règle de gouvernance (bloquante).** Certains lots modifient un contrat d'ADR ou figent
un choix structurant. Pour ceux-là, **tu rédiges l'ADR et tu t'arrêtes.** Tu ne codes
pas tant que l'ADR n'est pas marqué `Accepted` par un humain. Les ADR concernés :
- **ADR-015** (contrat d'approbation) — impacté par le lot **1.1**.
- **Nouvel ADR « file d'agent » ** — requis par le lot **1.2** (partitionnement + équité inter-tenants).
- **Nouvel ADR « manifeste de capacités »** — requis par le lot **1.4**.
- **ADR-004** est **reporté** ; **ADR-033/034/035** attendent arbitrage humain.
  **Aucun code applicatif ne doit les devancer.**

**Workflow imposé pour chaque lot.**
1. **Reconnaissance** (§2) : localise et lis les fichiers/tables cités *avant* de proposer un diff.
   Si une hypothèse du plan (nom de table, ADR, composant) ne se vérifie pas, **arrête-toi et signale-le** — ne devine pas.
2. **Une branche + une PR par lot.** Nomme la branche `feat/crm-tc-<id-lot>` (ex. `feat/crm-tc-A-toggle-scope`).
3. **Diff minimal, style du voisinage.** Reproduis la densité de commentaires, le nommage et les idiomes du code existant.
4. **Tests d'abord ou avec.** Chaque lot a des critères d'acceptation testables (§ dédiée). Pas de merge sans test vert.
5. **Rien de destructif sans confirmation** (migrations irréversibles, changements de schéma d'auth, egress réseau).

**Anti-objectifs — ne PAS reproduire de la source (voir §5).** Mono-tenant, auth = 1 var
d'env, agent lisant les corps d'e-mails, enrichissement LinkedIn/data-providers sans base
légale, verrouillage fournisseur.

---

## 1. Vue d'ensemble & ordonnancement

| Lot | Titre | Prio | Piste | Gate |
|-----|-------|------|-------|------|
| **A** | Bascule *Moi / Toute l'équipe* ancrée dans l'URL | 🔴 | Affichage | Aucun |
| **B** | Sous-ligne de contexte sous chaque KPI | 🔴 | Affichage | Aucun |
| **C** | Colonne *temps dans l'étape* (pipeline) | 🔴 | Affichage | Aucun |
| **D** | Compteur de colonnes dans le libellé du sélecteur | 🟡 | Affichage | Aucun |
| **F** | Puce d'état par ligne (en file / fait / indispo) + support art. 50 | 🟡 | Affichage | Aucun |
| **G** | Anneau pipeline par étape + légende chiffrée | 🟡 | Affichage | Aucun |
| **1.7** | Toute lecture rend les `id` des voisins ; `search_crm` sans flou | 🟢 | Agent/Outils | Aucun |
| **1.8** | Images copiées (hash), jamais liées + safe-fetch anti-SSRF | 🟢 | Infra | Aucun |
| **1.2** | File d'agent à deux voies + priorité (par tenant) | 🔴 | Infra | **ADR file** |
| **1.1** | Modèle de preuve, jamais de score de confiance | 🔴 | Agent/Data | **ADR-015** |
| **1.4** | Manifeste de capacités par tenant, injecté au prompt | 🟡 | Agent | **ADR manifeste** |
| **1.3** | `schedule_recheck` avec sa raison, affichée | 🟡 | Agent | Aval ADR-004 + L0.5 |
| **1.5** | Deux détails de coût sur le choix de modèle | 🟡 | Agent | Aval ADR-004 + L0.5 |
| **1.6** | Bloc « qui nous sommes » en tête de prompt | 🟡 | Agent | Aval ADR-004 + L0.5 |
| **E** | Onglet Agent par fiche, conversations persistées, `?thread=` | 🟡 | Affichage/Agent | Aval ADR-004 + L0.5 |

### Trois pistes d'exécution

- **PISTE A — Codable maintenant, sans ADR :** `A, B, C, D, F, G, 1.7, 1.8`.
  → Livrer en premier. Valeur immédiate, risque faible, aucune décision structurante.
- **PISTE B — Rédiger l'ADR, puis (et seulement puis) coder :** `1.2, 1.1, 1.4`.
  → Chacun fige un contrat ou un partitionnement. **Livrable de cette piste = l'ADR**, pas le code.
- **PISTE C — En aval d'ADR-004 (reporté) + L0.5 :** `1.3, 1.5, 1.6, E`.
  → **Rédigeables (specs), non exécutables sur données réelles.** Produire la spec, marquer « bloqué : ADR-004 ».

---

# PISTE A — Lots codables immédiatement

## Lot A — Bascule *Moi / Toute l'équipe*, ancrée dans l'URL

**Objectif.** Le contrôle le plus utilisé d'un tableau de bord commercial : un segmenteur
`Moi | Toute l'équipe` dont l'état vit dans l'URL (partageable, rechargeable, back/forward).

**Reconnaissance.** Localiser `listView.ts` (helpers d'URL : `q`, `sort`, `vue`), la `DataTable`
et la `ListToolbar`. Confirmer le mécanisme d'écriture d'URL existant — on **ajoute un 4ᵉ paramètre**,
on ne réécrit rien.

**Contrat.**
- Nouveau param d'URL : `scope=me|team` (défaut `me` — ou reprendre le défaut produit existant).
- Le param se propage via le même helper que `q/sort/vue` (source de vérité unique = l'URL, pas un état React local).
- Le filtre `scope` s'applique côté requête via l'`acl_scope` **déjà en place** (owner = utilisateur courant vs équipe visible). **Ne pas** contourner la RLS.

**Critères d'acceptation.**
- [ ] Basculer met à jour l'URL sans rechargement dur ; recharger la page conserve la vue.
- [ ] `scope=team` ne renvoie **jamais** de lignes hors périmètre `acl_scope` du user (test RLS).
- [ ] Back/forward navigateur restaure l'état précédent.

**À ne pas faire.** Filtrer en mémoire après un fetch large (fuite de périmètre). Le filtre est côté requête, sous RLS.

**Coût : S.**

---

## Lot B — Sous-ligne de contexte sous chaque KPI

**Objectif.** Un nombre seul ne décide rien. Sous `756 K€`, afficher `15 affaires · 275 K€ à échéance ce mois`.
La sous-ligne dit *quoi en faire*.

**Reconnaissance.** Localiser le composant carte-KPI du dashboard. Vérifier quelles agrégations
sont déjà disponibles (montant total, count, échéances).

**Contrat.**
- Chaque KPI expose `{ value, sublineParts: [{label, value}] }`. Rendu : valeur en gros, sous-ligne discrète (une ligne, points médians `·`).
- Deux marques remplies au maximum côté couleur (règle de couleur maison) : le KPI ne doit pas devenir un feu d'artifice.
- Les chiffres de la sous-ligne viennent de la **même source** que la valeur principale (pas de recomputation divergente).

**Critères d'acceptation.**
- [ ] Chaque KPI du dashboard a une sous-ligne actionnable (ou aucune, jamais un placeholder vide « - »).
- [ ] Cohérence : `Σ sous-ligne` réconcilie avec la valeur quand c'est sémantiquement attendu.

**Coût : S.**

---

## Lot C — Colonne *temps dans l'étape* (pipeline)

**Objectif.** Transformer une liste en liste de tâches : afficher depuis combien de temps chaque affaire stagne dans son étape.

**Reconnaissance.** **La donnée existe déjà** : localiser `lot7a_deal_stage_events` (événements de changement d'étape). Confirmer qu'on peut dériver « entré dans l'étape courante le … ».

**Contrat.**
- Colonne `temps_dans_l_étape` = `now - max(event.entered_at pour l'étape courante)`.
- Rendu humain (`3 j`, `2 sem`), triable, et **seuil visuel** discret au-delà d'un âge (ex. surlignage léger) — deux marques max.
- Calcul en base/vue de préférence (pas de N+1 en front).

**Critères d'acceptation.**
- [ ] La colonne apparaît sur la vue pipeline, triable ASC/DESC.
- [ ] Une affaire qui vient de changer d'étape repart à `0 j`.
- [ ] Aucune requête par ligne (vérifier le plan de requête / count de requêtes).

**Coût : S.**

---

## Lot D — Compteur de colonnes dans le libellé du sélecteur

**Objectif.** C'est le compteur qui signale qu'une vue est réduite. Sans lui, on cherche une colonne absente sans comprendre qu'elle est masquée.

**Contrat.**
- Le bouton/sélecteur de colonnes affiche `Colonnes (6/11)` (visibles/total).
- Purement présentationnel, s'appuie sur l'état de visibilité déjà géré par la `DataTable`.

**Critères d'acceptation.**
- [ ] Masquer/afficher une colonne met à jour le compteur en direct.
- [ ] Le total reflète toutes les colonnes configurables, pas seulement les visibles.

**Coût : XS.**

---

## Lot F — Puce d'état par ligne + support du marquage art. 50

**Objectif.** Un champ vide ne dit pas s'il est *vide* ou *en cours*. Remplacer le vide par une
puce d'état par ligne : `en file | fait | indisponible`. **C'est aussi le bon support pour le
marquage AI Act art. 50 — par ligne, pas par écran.**

**Reconnaissance.** Identifier les colonnes actuellement rendues vides quand une valeur est en cours de production par un agent.

**Contrat.**
- États : `queued` (en file), `running` (en cours), `done` (fait, valeur présente), `unavailable` (indisponible — un fait, ex. non configuré).
- **Ne jamais confondre `unavailable` (fait) et `running` (affirmation sur une session)** : `unavailable` est irrécupérable côté données, `running` est temporaire.
- La puce porte, quand la valeur a été produite/assistée par un agent, le **marquage art. 50** (contenu généré par IA) au niveau ligne.

**Critères d'acceptation.**
- [ ] Aucune cellule « agentique » n'est un blanc ambigu : elle est soit une valeur, soit une puce d'état explicite.
- [ ] Le marquage art. 50 est présent et attribuable ligne par ligne.

**À ne pas faire.** Un marquage global « cet écran contient de l'IA » : trop grossier pour l'art. 50 ici.

**Coût : S.**

---

## Lot G — Anneau pipeline par étape + légende chiffrée

**Objectif.** Un anneau seul est décoratif ; la **légende chiffrée** à côté le rend lisible : `étape · nombre · montant`.

**Contrat.**
- Anneau (donut) par étape avec légende `Prospection · 12 · 340 K€`, `Négociation · 5 · 210 K€`…
- **Deux marques remplies au maximum** (règle de couleur maison) ; le reste en nuances neutres.
- Données = agrégat par étape (réutiliser l'agrégat du Lot G/pipeline si déjà calculé).

**Critères d'acceptation.**
- [ ] Chaque segment a sa ligne de légende chiffrée (jamais un anneau muet).
- [ ] Total légende = total pipeline affiché ailleurs (réconciliation).

**Coût : S.**

---

## Lot 1.7 — Toute lecture rend les `id` des voisins ; `search_crm` sans flou

**Objectif.** *Un préambule ou un résultat d'outil qui nomme une fiche sans son `id` est un bug.*
Le seul recours de l'agent sinon est de re-demander à l'humain — le CRM doit rendre sa propre jointure.

**Reconnaissance.** Localiser le **catalogue d'outils L6.3** et les outils de lecture/`search_crm`. Repérer chaque endroit qui sérialise une fiche pour l'agent.

**Contrat (à inscrire comme règle du catalogue d'outils).**
- Tout résultat d'outil (et tout préambule) qui **nomme** une entité inclut son `id` stable et l'`id` de ses voisins directs référencés (société↔contacts↔affaires).
- `search_crm` **ne fait aucun rapprochement flou** :
  - `« Northwind » → « Northwind Savings Group »` = préfixe/inclusion, **utile**.
  - `« Marchetti » → « Marchetta »` = **interdit** (mauvaise fiche sur une vraie personne).
  - Implémentation : matching exact / préfixe / sous-chaîne insensible à la casse. **Pas** de trigram/Levenshtein/fuzzy sur les noms de personnes.

**Critères d'acceptation.**
- [ ] Un test de contrat vérifie que chaque outil de lecture renvoie les `id` des entités nommées.
- [ ] Un test asserte que `search_crm` renvoie ∅ (ou « aucune correspondance ») sur une faute de frappe type `Marchetta` vs `Marchetti`, et renvoie bien la fiche sur une inclusion.

**Coût : nul→S.**

---

## Lot 1.8 — Images copiées (hash), jamais liées + safe-fetch anti-SSRF

**Objectif.** Ne jamais stocker une URL de CDN tiers sur une fiche. Copier les octets, adresser par hash.
Deux raisons : idempotence + invalidation, **et** RGPD (une URL tierce rendue = un transfert de données à chaque affichage).

**Reconnaissance.** Localiser le stockage d'assets (logos, portraits) et le point où une URL fournisseur entre dans le système.

**Contrat.**
- **Clé de stockage = hash des octets** (SHA-256 du contenu). Idempotent ; une refonte de logo produit un **nouvel** objet/URL au lieu de réutiliser l'ancien derrière un cache CDN d'un mois.
- **Récupération via un `safe-fetch` durci** :
  - Résolution DNS puis **refus des IP privées/réservées** : `169.254.0.0/16` (dont `169.254.169.254` métadonnées cloud), `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `::1`, `fc00::/7`, `fe80::/10`.
  - Refus des redirections vers une cible interdite (revalider à **chaque** hop, pas seulement l'URL initiale).
  - Timeouts + plafond de taille + `Content-Type` image validé.
  - **Motivation à documenter dans le code : l'URL vient de la réponse d'un fournisseur → c'est une SSRF depuis l'intérieur du réseau.**
- Note RGPD à consigner : la copie locale supprime le transfert tiers récurrent au rendu.

**Critères d'acceptation.**
- [ ] Un test unitaire prouve que `safe-fetch` rejette `http://169.254.169.254/…` et une redirection `→ 10.x`.
- [ ] Deux imports du même octet-stream ⇒ un seul objet stocké (idempotence par hash).
- [ ] Aucune fiche ne référence une URL externe pour une image après import.

**À ne pas faire.** Se fier au hostname sans résoudre l'IP (contournable par DNS rebinding — revalider l'IP effective).

**Coût : S.**

---

# PISTE B — Rédiger l'ADR d'abord, coder ensuite

> Pour ces trois lots, **le livrable immédiat est un ADR** (`docs/adr/…`). Tu proposes le
> contrat, les alternatives, les conséquences, puis **tu t'arrêtes**. Pas de migration, pas
> de code applicatif tant que l'ADR n'est pas `Accepted` par un humain.

## Lot 1.2 — File d'agent à deux voies + priorité *(ADR requis : partitionnement inter-tenants)*

**Pourquoi un ADR.** Le partitionnement d'une file **append-only ne se re-partitionne pas** :
le choix se fige tôt. La source est **mono-tenant** → une file globale leur suffit. Chez nous
une file globale **sérialise les tenants** : un tenant bavard affame les autres. Il faut
**voie × tour de rôle (round-robin) par tenant**. C'est une décision structurante ⇒ ADR.

**Constat actuel.** Aucune file d'agent durable ; l'agent de page est requête→réponse.

**Contrat proposé (à arbitrer dans l'ADR).**
- **Deux voies indépendantes** drainées séparément :

  | Voie | Contenu | Exécution | Débit/tick (à calibrer) |
  |------|---------|-----------|-------------------------|
  | **Visible** | logo, portrait, ce que l'utilisateur lit avant d'ouvrir quoi que ce soit | **direct, sans LLM** | ~60/tick |
  | **Recherche** | tout le reste | **1 session LLM / ligne** | ~12/tick |

  *Raison :* ce qui s'affiche avant ouverture ne doit **jamais** faire la queue derrière du LLM
  (leçon vécue : `stripe.com` en carré gris pendant que l'agent rédigeait des paragraphes).
- **Mécanique :** `claimDue()` avec `FOR UPDATE SKIP LOCKED` ; table de priorités unique ;
  `collapsing()` qui replie N *pokes* en un seul drain.
- **Équité inter-tenants (le cœur de l'ADR) :** ordonnancement `voie × round-robin par tenant`,
  pas une file FIFO globale. Décider : partition par `(tenant_id, lane)` ? quota par tenant/tick ? anti-famine ?
- **Isolation :** la file porte `tenant_id` et respecte RLS ; un worker ne draine jamais au travers des tenants sans le round-robin.
- **Indépendance :** ne dépend **pas** d'ADR-004 (c'est de l'infra, pas du LLM).

**Contenu attendu de l'ADR.**
- Schéma de table (colonnes : `id, tenant_id, lane, priority, entity_ref, poke_key (collapsing), claimed_at, attempts, state`).
- Politique d'équité + anti-famine, avec le raisonnement « ne se re-partitionne pas ».
- Stratégie de reprise (crash mid-claim), idempotence des drains.
- Métriques (âge en file par voie/par tenant).

**Après acceptation — critères d'acceptation du code.**
- [ ] Un tenant qui injecte 10 000 tâches n'empêche pas un autre tenant d'être servi au tick suivant (test d'équité).
- [ ] La voie *visible* n'est jamais bloquée par la voie *recherche* (test de latence).
- [ ] `collapsing()` : 100 pokes sur la même entité ⇒ 1 drain.
- [ ] `FOR UPDATE SKIP LOCKED` : deux workers ne réclament pas la même ligne (test concurrent).

**Coût : M (infra) — bloqué sur ADR.**

---

## Lot 1.1 — Modèle de preuve, jamais de score de confiance *(ADR requis : modifie ADR-015)*

**Pourquoi un ADR.** Ce lot **modifie le contrat d'approbation d'ADR-015**. Il faut donc amender ADR-015 (ou ADR liant) avant tout code.

**Principe.** *« Un modèle à qui on demande de noter sa propre certitude le fera, et se trompera
dans la direction qui le fait paraître utile. »* Donc : **aucun outil n'accepte de `confidence`.**
L'outil rapporte **ce qu'il a observé** (`kind` d'un catalogue fermé) ; un **registre pondère**.

**Règle de décision.**
- **Source primaire + bande haute** → écrit sur la fiche.
- **Sinon** → **suggestion** affichée sous le champ **vide** (pas d'écriture).
- **Contradiction** → **retient le fait entièrement** (état bloquant), **ne baisse pas un score**.

**Notre trou (précis).** `app.agent_proposals` porte `action, reversible, decided_by/at/note`.
Elle **ne porte pas le pourquoi**. L'écran d'approbation affiche « l'agent propose X » **sans provenance**.
On a construit `app.agent_suggestion_actions` (2026-07-31) pour **mesurer** le réflexe de clic
(risque art. 22 : « l'approbation humaine devient un réflexe ») — **on mesure la maladie sans
traiter la cause.** Une colonne de preuve transforme l'approbation en **décision**.
C'est aussi AI Act **art. 14** (surveillance humaine effective) et RGPD **art. 5.1.d** (exactitude).

**Contrat proposé (à arbitrer dans l'ADR).**
- `app.agent_proposals.evidence jsonb` : liste d'observations `{ kind, source_ref, observed_at, detail }`.
- **Catalogue fermé de `kind`** (enum applicatif + contrainte) — ex. `crm.signature-block`,
  `github.account-identity`, … Aucun `kind` libre.
- **Bande** (primaire/secondaire, haute/basse) dérivée du registre pondérant, **pas** fournie par le modèle.
- **État `contradiction`** = **bloquant** : la proposition n'est pas approuvable tant que la contradiction n'est pas levée ; l'UI montre les deux observations opposées.
- L'écran d'approbation **affiche la provenance** (chaque `evidence.kind` + `source_ref`).

**Contenu attendu de l'ADR (amendement ADR-015).**
- Nouveau contrat : « une proposition sans `evidence` n'est pas approuvable ».
- Le catalogue fermé de `kind` et sa gouvernance (comment on en ajoute un).
- Sémantique de `contradiction` bloquante vs le flux d'approbation actuel.
- Migration de `agent_proposals` (ajout colonne, backfill/nullable, transition).

**Après acceptation — critères d'acceptation.**
- [ ] Un outil qui tente de fournir `confidence` est rejeté au niveau contrat (test).
- [ ] Une proposition en `contradiction` est **non approuvable** dans l'UI et l'API.
- [ ] L'écran d'approbation rend chaque `evidence.kind` + `source_ref` (provenance visible).
- [ ] `kind` hors catalogue ⇒ rejet (contrainte DB + validation applicative).

**Coût : M — bloqué sur ADR-015.**

---

## Lot 1.4 — Manifeste de capacités par tenant, injecté au prompt *(ADR requis)*

**Pourquoi un ADR.** Le manifeste est **la surface où s'exprime ce que le tenant autorise** →
c'est une **surface de cloisonnement**. Sa forme se fige et engage la sécurité ⇒ ADR.

**Principe (source).** `lib/capabilities.ts` : **un seul endroit** qui sait ce qui est configuré.
Il (1) l'imprime au démarrage, (2) l'énonce dans les instructions de session — *l'agent planifie
sur ce qu'il a au lieu de découvrir les trous un appel raté à la fois* —, (3) donne aux outils un
résultat partagé **« non configuré, réessayer n'aidera pas »**, vérifié **avant** de débiter le budget.

**Notre trou.** On a déjà : le **catalogue d'outils L6.3**, l'**opt-in par tenant**, le **budget**
(`agent_budget_et_journal_llm`). **Il manque la jonction.** Un manifeste **par tenant** :
- évite de payer des appels qui ne peuvent pas aboutir (court-circuit avant budget),
- **exprime ce que ce tenant autorise** (cloisonnement).

**Contrat proposé (à arbitrer dans l'ADR).**
- Résolution `manifest(tenant_id)` = jonction { catalogue L6.3 } × { opt-in tenant } × { budget/état config }.
- **Injecté dans le préambule de session** (mis en cache de prompt) : liste des capacités *disponibles pour ce tenant*.
- **Court-circuit outil :** un outil non disponible pour le tenant renvoie un résultat terminal
  `unavailable: retrying won't help` **avant** toute dépense de budget LLM.
- **Point de cloisonnement :** le manifeste est autoritatif — un outil hors manifeste n'est pas appelable, même si le modèle le tente.

**Contenu attendu de l'ADR.**
- Forme du manifeste (schéma), sa dérivation, sa fraîcheur/caching.
- Son rôle de frontière de sécurité (relation avec `acl_scope` et l'opt-in).
- Interaction avec le budget (ordre : manifeste → budget → appel).

**Après acceptation — critères d'acceptation.**
- [ ] Un tenant sans opt-in sur l'outil X : l'agent ne tente jamais X, et aucun token n'est débité.
- [ ] Le préambule de session liste exactement les capacités du tenant courant (test multi-tenant : deux tenants ⇒ deux manifestes).
- [ ] Un appel d'outil hors manifeste est refusé côté serveur (pas seulement caché du prompt).

**Coût : M — bloqué sur ADR manifeste.**

---

# PISTE C — En aval d'ADR-004 (reporté) + L0.5 — SPEC uniquement, pas d'exécution

> **Ne pas coder ni exécuter sur données réelles.** Produire une spec technique par lot,
> l'ajouter au dossier de conception, et la marquer **« Bloqué : ADR-004 + L0.5 »**.
> Ces lots dépendent de la boucle LLM (ADR-004) qui est **reportée**.

## Lot 1.3 — `schedule_recheck` avec sa raison, affichée *(spec)*
- **Principe.** L'agent **réserve lui-même** son prochain passage **et doit dire pourquoi** ; la raison est **montrée à l'utilisateur**.
  *« Un agent qui ne peut pas dire pourquoi il repassera dans quatorze jours n'a pas une raison, il a un défaut. »*
- **Valeur.** Coût quasi nul, **pièce art. 14 gratuite** (traçabilité de la surveillance). Nos workflows planifient déjà ; l'agent, lui, ne réserve pas son propre retour motivé.
- **Spec.** Outil `schedule_recheck(entity_ref, when, reason)` ; `reason` **obligatoire** et non vide ; persisté et rendu dans l'UI à côté de l'échéance.

## Lot 1.5 — Deux détails de coût sur le choix de modèle *(spec)*
On a déjà `agent_settings` (le modèle est **une ligne, pas un env** — même conclusion qu'eux). Deux détails qu'ils ont **payés** et pas nous :
1. **Une conversation ouverte finit sur le modèle avec lequel elle a commencé.** Les **caches de prompt sont par modèle** ; basculer en cours de route **ré-ingère tout le fil au prix non-caché**.
2. **Ne jamais hériter `modelContextWindowTokens` du repli.** Un modèle à fenêtre plus petite se fait compacter contre un chiffre qu'il n'a pas → **le tour échoue chez le fournisseur après que le contexte a été assemblé et payé.**
- **Spec.** Épingler `model_id` au niveau conversation à sa création ; propager la **vraie** fenêtre de contexte du modèle effectif (jamais celle du repli) dans le compacteur.

## Lot 1.6 — Bloc « qui nous sommes » en tête de chaque prompt *(spec)*
- **Principe.** Un agent qui sait tout de la personne et rien de l'entreprise qui l'emploie **écrit un dossier, pas un briefing.**
- **Correctif source.** Bloc **borné par le chemin d'écriture** (~320 caractères de narratif + une ligne courte : ce qu'on vend / à qui / contre qui), **mis en cache de prompt**, présent dans **tous** les préambules. + une ligne explicite : *« dis ce que cette fiche signifie pour nous, jamais un argumentaire — le commercial sait déjà ce qu'on vend ».*
- **Chez nous.** **Profil d'espace de travail par tenant.** Peu cher, gros effet. (Se marie avec le manifeste 1.4.)
- **Spec.** Champ `workspace_profile` par tenant (borné), injecté en tête de préambule, caché ; garde-fou anti-argumentaire.

## Lot E — Onglet Agent par fiche, conversations persistées, `?thread=` *(spec)*
- **État actuel.** On a un **dock global**. Le leur est **par fiche**, avec **question d'ouverture propre au type** (personne / société / affaire). Proposer « Qui est cette personne ? » sur une société est le symptôme d'un chat vissé sur le côté.
- **Spec fonctionnelle.** Onglet Agent par fiche ; conversations **persistées** ; `?thread=` dans l'URL ; question d'ouverture dépendante du type d'entité.
- **Détails d'implémentation à ne PAS réapprendre (ils les ont tous payés) — à graver dans la spec :**
  1. **Ne pas démonter le panneau au changement d'onglet.** Radix jette l'onglet inactif → **flux avorté en plein milieu** → « je suis allé sur un autre onglet et la réponse n'est jamais revenue ». Garder le panneau monté (ex. `forceMount` + masquage CSS).
  2. **Ne rien monter avant que la liste des threads soit chargée.** Sinon nouvelle session créée puis remontée sur la vraie → « l'historique n'apparaît qu'après rafraîchissement ». Attendre la liste, puis monter.
  3. **Fil injoignable = hors ligne, jamais « en cours ».** L'un est un fait sur nous (réseau), l'autre une **affirmation sur la session — fausse et irrécupérable.**
  4. **Fil terminé = un bouton, pas une boîte verrouillée.** *Terminé* et *en-cours* **désactivent tous deux la saisie** mais **n'ont rien à voir** : ne pas les représenter pareil.
- **Dépendance.** S'appuie sur la boucle agent (ADR-004) + persistance de threads → **bloqué**.

---

## 2. Reconnaissance obligatoire (à exécuter avant tout diff)

Avant de coder **quoi que ce soit**, localise et lis — et **signale toute divergence** avec les hypothèses ci-dessous plutôt que de deviner :

**Affichage**
- [ ] `listView.ts` (helpers URL `q`, `sort`, `vue`) — pour A, D.
- [ ] `DataTable`, `ListToolbar` — pour A, C, D, F.
- [ ] Composant carte-KPI du dashboard — pour B.
- [ ] `lot7a_deal_stage_events` (existence + schéma) — pour C.
- [ ] Composants d'anneau/donut + règle de couleur maison (« deux marques remplies max ») — pour G.
- [ ] Radix Tabs / dock agent actuel — pour E (spec).

**Agent / data / infra**
- [ ] Catalogue d'outils **L6.3** + outils de lecture / `search_crm` — pour 1.7.
- [ ] Stockage d'assets + point d'entrée des URLs fournisseurs — pour 1.8.
- [ ] `app.agent_proposals`, `app.agent_suggestion_actions` — pour 1.1.
- [ ] Opt-in par tenant + `agent_budget_et_journal_llm` — pour 1.4.
- [ ] `agent_settings` — pour 1.5 (spec).
- [ ] RLS + `acl_scope`, niveaux A/B/C/N — invariants transverses.
- [ ] `docs/adr/` : **ADR-015** (contrat d'approbation), **ADR-004** (statut *reporté*), **ADR-033/034/035** (en attente d'arbitrage).

> Si `ADR-004` n'est **pas** marqué reporté, ou si `ADR-033/034/035` sont déjà arbitrés,
> **arrête-toi et demande** : l'ordonnancement de la Piste C en dépend.

---

## 3. Definition of Done (global)

Un lot est « fait » quand :
- [ ] Le diff est minimal et calqué sur le style du voisinage.
- [ ] Les critères d'acceptation du lot sont couverts par des tests **verts**.
- [ ] **Aucune régression RLS/`acl_scope`** : un test prouve qu'aucune donnée hors périmètre ne fuit.
- [ ] **Aucun secret, aucun `model_id` interne, aucun identifiant de modèle** dans le code, les commits, ou la PR.
- [ ] La PR décrit : le lot, la piste, l'ADR lié (le cas échéant), et **ce qui reste bloqué**.
- [ ] Pour la **Piste B** : le livrable est **l'ADR**, marqué `Proposed` ; aucun code applicatif tant que `Accepted`.
- [ ] Pour la **Piste C** : le livrable est **la spec**, marquée « Bloqué : ADR-004 + L0.5 ».

---

## 4. Anti-objectifs — à NE PAS reproduire de la source

| ❌ | Pourquoi c'est incompatible avec CRM-TC |
|----|------------------------------------------|
| Mono-tenant / « il n'y a pas d'organisations » | L'inverse exact de notre contrainte jour 1 (multi-tenant RLS). |
| `ALLOWED_SIGN_IN` comme modèle d'autorisation | Une var d'env, tout le monde voit tout. On a **RLS + `acl_scope`**. Sans objet. |
| « L'agent peut tout lire, y compris les corps d'e-mails » | Incompatible avec **A/B/C/N + chiffrement par personne**. Leur frontière d'**egress** est bonne ; leur frontière de **lecture** n'est **pas** transposable. |
| Enrichissement LinkedIn / data-providers | RGPD **art. 14** (info quand la donnée ne vient pas de la personne) + **balance d'intérêt légitime** + **AIPD**. **Décision d'arbitrage, pas de code.** Ne rien coder avant. |
| Verrouillage Vercel / Neon / eve | Ne pas introduire de dépendance fournisseur bloquante. |

---

## 5. Réutilisation de code depuis `trycompai/crm` (MIT) — accélérer le dev

> **Posture licence (à vérifier en tête de tâche).** Le dépôt source est **MIT** — donc on
> peut **reprendre du code**, pas seulement le lire en clean-room. Condition : **conserver la
> notice de copyright + le texte MIT** de la source dans tout fichier repris substantiellement,
> et créditer l'origine (en-tête de fichier ou `NOTICE`/`THIRD_PARTY`). **Re-confirmer que le
> `LICENSE` du dépôt est bien MIT avant de copier** — si un sous-dossier porte une autre licence, s'arrêter.

**Méthode (parce que les chemins exacts sont à confirmer).** Cloner `trycompai/crm` à côté de
CRM-TC (lecture seule) et **localiser par symbole**, pas par chemin supposé :

```bash
git clone https://github.com/trycompai/crm /tmp/trycomp-crm   # référence MIT, lecture seule
rg -n "claimDue|SKIP LOCKED|collapsing|schedule_recheck|capabilities|169\.254\.169\.254|search_crm" /tmp/trycomp-crm
```

**Règle d'or de transposition.** La source est **mono-tenant**. Chaque morceau repris doit être
**re-lu sous l'angle multi-tenant / RLS / A-B-C-N avant intégration**. On reprend la *mécanique*,
on réécrit la *frontière*. Ne jamais copier-coller un accès data sans y réinjecter `tenant_id` + RLS.

| Lot | Ce qu'on reprend (par symbole) | Verbatim vs Adapter | Ce qu'on NE reprend PAS |
|-----|--------------------------------|---------------------|--------------------------|
| **1.2** file d'agent | `dispatch.ts` (boucle de drain deux voies), `claimDue()` (`FOR UPDATE SKIP LOCKED`), `collapsing()` (repli des pokes), la table de priorités | **Adapter** : la *mécanique* SQL `SKIP LOCKED` + collapsing se reprennent presque verbatim ; l'**ordonnancement doit passer de FIFO global → `voie × round-robin par tenant`** | La file **globale** mono-tenant ; leur schéma sans `tenant_id` |
| **1.4** manifeste | `lib/capabilities.ts` (endroit unique, impression au démarrage, injection en session, résultat outil « non configuré ») | **Adapter** : structure et le pattern « court-circuit avant budget » se reprennent ; la **résolution devient `manifest(tenant_id)`** = catalogue L6.3 × opt-in × budget | Un manifeste **process-global** ; leur absence de dimension tenant |
| **1.8** images | Le **`safe-fetch`** (refus `169.254.169.254` & IP privées, validation content-type/size) + le **hash des octets** comme clé | **Verbatim quasi** : le durcissement SSRF et le hash-adressage sont transposables tels quels | Rien de spécifique à retirer — mais **compléter** : revalider l'IP à **chaque** redirection, ajouter la plage `fc00::/7`, consigner l'angle RGPD (transfert tiers) |
| **1.7** ids voisins / `search_crm` | La logique de `search_crm` (match exact/préfixe/inclusion, **sans flou**) + le pattern « toute lecture rend les `id` » | **Adapter** : la règle et le matching se reprennent ; les **jointures passent sous RLS/`acl_scope`** | Tout rapprochement flou (trigram/Levenshtein) s'il existait ; l'accès non filtré par tenant |
| **1.1** modèle de preuve | Le **catalogue fermé de `kind`** (`crm.signature-block`, `github.account-identity`, …) + le registre pondérant + l'état `contradiction` bloquant | **Adapter** : les `kind` et la logique de bande se reprennent comme **inspiration de contenu** ; le **stockage devient `agent_proposals.evidence jsonb`** sous notre schéma | Leur absence d'écran de provenance ? (à construire chez nous) ; ne pas reprendre un modèle de score |
| **1.3** `schedule_recheck` | La **signature d'outil** `schedule_recheck(entity, when, reason)` + `reason` obligatoire affichée | **Verbatim** comme forme d'API ; **spec seulement** (Piste C, bloqué ADR-004) | — |
| **1.5** modèle | Le comportement « conversation épinglée à son modèle » + « ne pas hériter `modelContextWindowTokens` du repli » | **Adapter** : ce sont **deux règles**, pas du code à copier ; les appliquer à `agent_settings` | — |
| **1.6** bloc « qui nous sommes » | La forme du bloc borné (~320 car, cache de prompt, garde-fou anti-argumentaire) | **Adapter** en `workspace_profile` par tenant | Le contenu mono-entreprise en dur |
| **E** onglet Agent | Le composant d'onglet + les **4 correctifs déjà payés** (pas de démontage Radix, montage après chargement liste, injoignable≠en-cours, terminé=bouton) | **Adapter** : reprendre les correctifs comme **check-list de bugs à éviter** ; réécrire pour notre dock/type d'entité | Le chat mono-fiche sans question d'ouverture typée |
| **A–D, F, G** affichage | Références **visuelles** (captures) uniquement | **Réécrire** dans notre `DataTable`/`ListToolbar`/`listView.ts` | Leur markup tel quel (stack/design différents) |

**Garde-fous de reprise de code.**
- [ ] Aucun accès data repris sans `tenant_id` + RLS réinjectés (revue obligatoire).
- [ ] Notice MIT + attribution conservées sur tout fichier repris substantiellement ; entrée `THIRD_PARTY`/`NOTICE`.
- [ ] Aucun secret, aucune clé, aucune config fournisseur (Vercel/Neon/eve) importée avec le code.
- [ ] Les lots **1.2, 1.4, 1.1** restent **bloqués par leur ADR** même si le code source est prêt à copier — **avoir le code ne lève pas la gate ADR.**

---

## 6. Séquence recommandée de PRs

1. **PR-1 → PR-6 (Piste A, affichage) :** `D` (XS) → `A` → `B` → `C` → `F` → `G`. Valeur visible immédiate, risque minimal.
2. **PR-7 :** `1.7` (ids voisins + `search_crm` sans flou) — règle de catalogue + tests.
3. **PR-8 :** `1.8` (images par hash + safe-fetch anti-SSRF) — sécurité, autonome.
4. **ADR-A / ADR-B / ADR-C (Piste B) :** rédiger **ADR file d'agent (1.2)**, **amendement ADR-015 (1.1)**, **ADR manifeste (1.4)**. **Stop après rédaction.** Attendre arbitrage humain.
5. **Piste C :** rédiger les specs `1.3, 1.5, 1.6, E`, les classer « Bloqué : ADR-004 + L0.5 ».

> **Rappel de gouvernance final.** ADR-033/034/035 attendent l'arbitrage humain, ADR-004 est
> reporté. **Aucun code applicatif ne doit les devancer.** Tout ce qui précède est une
> proposition d'exécution ; les Pistes B et C ne franchissent pas la frontière ADR sans un
> humain qui l'a marquée `Accepted`.
