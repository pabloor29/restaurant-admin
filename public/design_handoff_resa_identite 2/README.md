# Handoff : Direction artistique RESA (resa-service.com)

## Overview
RESA est l'espace d'administration livré à chaque restaurant client : l'interface où le gérant pilote ses réservations, sa salle et ses créneaux. Ce package définit l'**identité de marque complète** (nom, logo, couleurs, typographie, composants) à appliquer au site actuel `resa-service.com`, en commençant par l'écran de connexion existant.

Le nom de la marque reste **RESA** et le nom de domaine **resa-service.com** est **inchangé**.

## About the Design Files
Le fichier `RESA - Direction artistique.dc.html` est une **référence design créée en HTML** — un document qui montre l'apparence et les specs voulues, **pas du code de production à copier tel quel**. La tâche est de **recréer cette identité dans l'environnement existant du site** (vérifier la stack actuelle : framework, CSS, composants) en suivant ses patterns établis. S'il n'existe pas encore d'environnement structuré, choisir la stack la plus adaptée et y implémenter l'identité.

> Le fichier `.dc.html` utilise un petit runtime (`support.js`, fourni à côté) uniquement pour s'afficher. Il sert de référence visuelle — n'embarquez ni le format `.dc.html` ni `support.js` dans le site final.

## Fidelity
**High-fidelity (hifi).** Couleurs, typographie, espacements et rayons sont définitifs. Recréez l'UI au pixel près avec les librairies et patterns du codebase cible. Les valeurs hex et tailles ci-dessous font foi.

---

## Identité de marque

### Nom
- Marque affichée : **RESA** (toujours en capitales).
- Domaine : `resa-service.com` (inchangé).
- Baseline produit : « Gestion des réservations ».
- Accroche positionnement : « L'espace d'administration qui pilote les réservations du restaurant — du carnet du matin au dernier service. »

### Logo — 3 directions explorées
Trois territoires ont été proposés. **La direction A (« Signal ») est recommandée** comme logo principal car elle fonctionne en favicon 16 px, en app-icon et en pleine page.

**Direction A — « Signal » (RECOMMANDÉE)**
- Logiciel, minimal, décidé.
- Lockup : monogramme « R » dans un carré arrondi (vert pin) + wordmark `RESA.` avec un **point final ambre** (#C77E3A).
- Monogramme : carré `border-radius: 14px`, fond `#13503B`, lettre `R` en Schibsted Grotesk 800, couleur `#F5F1E9`, `letter-spacing: -0.03em`.
- Wordmark : Schibsted Grotesk 800, `letter-spacing: -0.03em`, couleur encre `#16201B`, le `.` final en `#C77E3A`.
- Favicon / app-icon : carré arrondi `#13503B` + `R` crème ; variante carré `#C77E3A` + `R` blanc.
- Sur fond foncé (`#13503B`) : monogramme inversé (fond crème, R vert), wordmark crème, point final `#E0A05E`.

**Direction B — « Couvert » (alternative hospitalière)**
- Symbole : une assiette (cercle, contour `#13503B`, `stroke-width` ~2.6 sur viewBox 48) contenant une **coche ambre** (`#C77E3A`, `stroke-width` ~3.4, `stroke-linecap/linejoin: round`, tracé `M15 24.5 L21 30.5 L33.5 16.5`).
- Wordmark `RESA` en Schibsted Grotesk 700, `letter-spacing: 0.01em`.
- Usage retenu même si non principal : l'assiette validée sert d'**icône de statut « confirmée »** dans l'interface.

**Direction C — « Maison » (alternative éditoriale)**
- Cartouche centré : `RESA` en Schibsted Grotesk 600, `letter-spacing: 0.24em` ; sous-titre filet + losange ambre 6px (rotation 45°) ; baseline `Maison de réservation` en Newsreader italic.
- App-icon : cercle `#13503B` + `R` en Newsreader serif 500.
- Usage retenu : habillage des **e-mails de confirmation** et supports imprimés.

---

## Design Tokens

### Couleurs — Marque
| Rôle | Hex | Usage |
|---|---|---|
| Vert pin (primaire) | `#13503B` | boutons primaires, logo, accents forts |
| Vert profond | `#0C3528` | hover du primaire, fonds très foncés |
| Vert clair | `#E7F0EB` | fonds de tags/chips, surfaces teintées |
| Ambre (accent) | `#C77E3A` | CTA d'action, point du logo, coche |
| Ambre clair | `#F3E5D3` | fonds d'accent doux |
| Ambre lumineux | `#E0A05E` | accent sur fond foncé uniquement |

### Couleurs — Neutres
| Rôle | Hex |
|---|---|
| Encre (texte principal) | `#16201B` |
| Ardoise (texte secondaire) | `#5E665E` |
| Gris léger (texte tertiaire / hex labels) | `#9A9587` |
| Ligne / bordures | `#E5DED0` |
| Ligne intérieure douce | `#F0EADD` / `#ECE4D4` |
| Papier (fond de page) | `#F5F1E9` |
| Surface alternative | `#FCFAF5` |
| Surface (cartes) | `#FFFFFF` |

### Couleurs — Statuts de réservation
| Statut | Texte | Fond |
|---|---|---|
| Confirmée | `#1E7A52` | `#E4F1EA` |
| En attente | `#B97D2B` | `#F6EBD6` |
| Annulée | `#A8473A` | `#F4E2DD` |
| Honorée | `#3A6B8F` | `#E3ECF2` |

### Typographie
Trois familles (Google Fonts) :
- **Schibsted Grotesk** — logo, titres, chiffres. Poids 400/500/600/700/800.
- **Hanken Grotesk** — interface, tableaux, texte courant. Poids 400/500/600/700.
- **Newsreader italic** — accent éditorial (citations, notes, signatures, e-mails). Italic 400/500 uniquement, à doser.

Import :
```html
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&family=Newsreader:ital,wght@1,400;1,500&display=swap" rel="stylesheet">
```

Échelle type :
| Niveau | Famille | Taille / line-height | Poids | Letter-spacing |
|---|---|---|---|---|
| Display | Schibsted Grotesk | 80–140px (`clamp(80px,13vw,140px)`) / 0.92 | 800 | -0.04em |
| Titre | Schibsted Grotesk | 30–32px | 700 | -0.01em |
| Sous-titre | Schibsted Grotesk | 21–22px | 500 | normal (couleur `#13503B`) |
| Corps | Hanken Grotesk | 16px / 1.6 | 400 | normal |
| Légende | Hanken Grotesk | 13px | 400/500 | normal |
| Accent | Newsreader | 15px italic | 400/500 | normal |

### Rayons & bordures
- Cartes / panneaux : `border-radius: 14px`, bordure `1px solid #E5DED0`.
- Grands blocs (cartes logo, bloc recommandation) : `border-radius: 18px`.
- Boutons & inputs : `border-radius: 10px`.
- Chips / time-slots : `border-radius: 8px`.
- Badges / pills de statut : `border-radius: 999px`.
- App-icon carré : `border-radius: 14px` (44px : `12px`).

### Ombres
Le système privilégie les **bordures hairline (`#E5DED0`)** plutôt que les ombres portées. Pas d'ombre par défaut sur les cartes. Réserver d'éventuelles ombres très douces aux overlays (menus, modales).

### Espacements
Rythme basé sur 4px. Valeurs récurrentes : padding cartes `26px`, padding blocs `18–24px`, gaps `10/12/14/16/20/24px`, marges de section `40–80px`. Conteneur de page max `1080px`, gouttières `40px`.

---

## Composants

### Boutons
- **Primaire** : texte `#F5F1E9`, fond `#13503B`, `border:none`, `border-radius:10px`, padding `12px 20px`, Hanken Grotesk 600, 14px. (hover suggéré : fond `#0C3528`.)
- **Accent (action)** : texte `#fff`, fond `#C77E3A`, mêmes métriques. Pour les actions clés type « Confirmer ».
- **Secondaire** : texte `#13503B`, fond `#fff`, bordure `1.5px solid #13503B`, padding `11px 19px`.
- **Texte / ghost** : texte `#5E665E`, fond transparent, pas de bordure.

### Champ de saisie
- Label : 13px, weight 600, `#16201B`, `margin-bottom:7px`.
- Champ : bordure `1.5px solid #E5DED0`, `border-radius:10px`, padding `12px 14px`, fond `#fff`, texte `#16201B` 15px. (focus suggéré : bordure `#13503B`.)
- Time-slots (chips créneaux) : sélectionné = fond `#13503B` texte `#fff` ; non sélectionné = fond `#E7F0EB` texte `#13503B` ; `border-radius:8px`, padding `8px 12px`, 13px.

### Étiquettes de statut (pills)
Format : `display:inline-flex; align-items:center; gap:7px; padding:7px 13px; border-radius:999px; font-weight:600; font-size:13px;` avec une pastille `7px` ronde de la couleur de texte. Couleurs selon le tableau Statuts ci-dessus.

### Carte de réservation
- Conteneur : fond `#FCFAF5`, bordure `1px solid #E5DED0`, `border-radius:14px`, padding `18px 20px`.
- Avatar initiales : cercle 46px, fond `#13503B`, texte `#F5F1E9`, Schibsted Grotesk 700 17px.
- Nom client : Schibsted Grotesk 700, 18px, `#16201B`.
- Méta : 14px `#5E665E` — format « 4 couverts · 20 h 30 · Table 12 ».
- Badge de statut aligné à droite (voir pills).
- Note : séparée par un filet `1px solid #ECE4D4` ; petite coche-assiette ambre 16px + texte Newsreader italic 15px `#5E665E`.

---

## Interactions & Behavior
- États hover à définir dans le codebase : primaire → `#0C3528` ; secondaire → fond `#E7F0EB` ; ghost → texte `#16201B`.
- Focus inputs : bordure `#13503B` (anneau optionnel `#E7F0EB`).
- Sélection texte : fond `#13503B`, texte `#F5F1E9`.
- Transitions douces (~150–200ms ease) sur fond/bordure des éléments interactifs.

## State Management
Hors périmètre de l'identité. La direction définit l'apparence ; la logique réservations existe déjà côté produit. Les 4 statuts (Confirmée / En attente / Annulée / Honorée) doivent mapper aux couleurs de statut.

## Assets
- **Polices** : Google Fonts (Schibsted Grotesk, Hanken Grotesk, Newsreader) — voir lien d'import.
- **Logo & icônes** : aucun fichier binaire — le monogramme et la coche-assiette se reconstruisent en CSS/SVG d'après les specs ci-dessus. Générer ensuite favicon (16/32px), app-icons (180/192/512px) et un SVG vectoriel propre à partir de la direction A.
- Pas d'images photo dans ce package.

## Files
- `RESA - Direction artistique.dc.html` — document de direction artistique complet (référence visuelle).
- `support.js` — runtime nécessaire seulement pour afficher le `.dc.html` localement.
- `logos/` — **vecteurs source des logos** (SVG) pour les 3 directions + note d'usage (`logos/README.md`). Voir cette note pour la vectorisation du texte et la génération des favicons.

## Premier chantier suggéré
Refondre l'**écran de connexion** de `resa-service.com` avec cette identité : fond papier `#F5F1E9`, carte blanche centrée (`border-radius:18px`, bordure `#E5DED0`), logo direction A en tête, champ email/mot de passe selon specs, bouton « Se connecter » primaire vert pin.
