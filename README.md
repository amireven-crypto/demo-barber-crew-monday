# The Barber Crew – Modern Redesign (Demo)

Demo eines modernen Redesigns für **The Barber Crew**, Taborstraße 20/G3, 1020 Wien (aktuelle Seite: https://barber-crew.at/).
Gleiche Markenfarben, Inhalte und Übergänge (fadeIn / slideInDown) wie das Original – nur moderner.

## Aufbau des Repos
| Pfad | Inhalt |
|---|---|
| `index.html`, `wp-content/…` | Statische Vorschau (gerenderte WordPress-Seite) für GitHub Pages |
| `.nojekyll` | GitHub Pages ohne Jekyll ausliefern |
| `wordpress/wp-content/themes/barbercrew-modern/` | Child-Theme für **Colibri WP** (Vorlage „Barber Crew Landing“, CSS, JS, Bilder, Logo) |
| `wordpress/barbercrew-startseite.WordPress.xml` | WordPress-Export (WXR) der Seite „Startseite“ (Gutenberg-Blöcke) |
| `wordpress/treatwell-prices-2026-10-31.json` | Leistungen & Preise aus dem Treatwell-Menü (Stand 31.10.2026) |

## Installation in WordPress (Deutsch)
1. **Backup** der bestehenden Seite anlegen.
2. *Design → Themes → Installieren*: **Colibri WP** installieren (Parent-Theme, ist auf barber-crew.at bereits aktiv).
3. Den Ordner `wordpress/wp-content/themes/barbercrew-modern` als ZIP packen und unter *Design → Themes → Theme hochladen* installieren, dann **aktivieren**.
4. *Werkzeuge → Daten importieren → WordPress* → `barbercrew-startseite.WordPress.xml` importieren.
5. Seite „Startseite“ öffnen → *Seiten-Attribute → Template* = **Barber Crew Landing**.
6. *Einstellungen → Lesen* → „Eine statische Seite“ → Startseite = **Startseite**.

Hinweise: Die Bilder liegen im Child-Theme; der Platzhalter `{{bc}}` im Seiteninhalt wird automatisch zur Theme-URL – keine Medien-Migration nötig.
„Termin buchen“ verlinkt auf Treatwell, Telefon ist antippbar (`tel:+4319553551`), Impressum/Datenschutz verlinken auf die bestehenden Seiten.
Preise vor dem Livegang mit Treatwell abgleichen.

## Installation (English, short)
1. Back up the live site. 2. Install the **Colibri WP** parent theme. 3. Zip and upload `wordpress/wp-content/themes/barbercrew-modern`, activate it.
4. *Tools → Import → WordPress*: import `barbercrew-startseite.WordPress.xml`. 5. Set the page template to **Barber Crew Landing**.
6. *Settings → Reading*: static front page = **Startseite**.
The repo root is a static preview for GitHub Pages (branch `main`, folder `/`).
