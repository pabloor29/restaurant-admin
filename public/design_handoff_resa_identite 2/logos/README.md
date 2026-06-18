# Fichiers logo — RESA

Vecteurs source des 3 directions. Couleurs et géométrie sont définitives.

| Fichier | Contenu | Portabilité |
|---|---|---|
| `resa-A-monogramme.svg` | Monogramme « R » (carré arrondi) — sert de favicon / app-icon | Texte → **à vectoriser** |
| `resa-A-lockup.svg` | Logo principal recommandé : monogramme + `RESA.` | Texte → **à vectoriser** |
| `resa-B-symbole.svg` | Assiette + coche (icône de statut « confirmée ») | **100 % géométrie, portable** |
| `resa-B-lockup.svg` | Symbole assiette + `RESA` | Symbole portable, wordmark à vectoriser |
| `resa-C-cartouche.svg` | Cartouche éditorial (filet + losange + baseline) | Losange/filet portables, texte à vectoriser |

## ⚠️ Vectorisation du texte
Les éléments typographiques (`R`, `RESA`, baseline) utilisent **Schibsted Grotesk** et **Newsreader italic** via `<text>`. Ils s'affichent correctement seulement si la police est chargée (navigateur avec les Google Fonts, ou police installée).

Pour un logo de production réellement portable, **convertir le texte en tracés (outline)** :
- dans Figma / Illustrator (Objet → Convertir en tracés), ou
- via Claude Code avec le fichier de police et un outil type `text-to-path`.

Une fois vectorisé, le logo ne dépend plus d'aucune police installée.

## Favicon / app-icons à générer depuis `resa-A-monogramme.svg`
`favicon.ico` (16/32px), `favicon-32.png`, `apple-touch-icon.png` (180px), `icon-192.png`, `icon-512.png`, plus le SVG monochrome pour `mask-icon`.
