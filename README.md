# Die verfluchten Burgen

**The Cursed Kingdoms** — ein isometrisches Fantasy-Action-Rollenspiel für Desktopbrowser.

Erkunde eine zufällig erzeugte Landschaft, sammle Ausrüstung, finde die Burg, bezwinge ihren Burghüter und befreie die Prinzessin. Nach einem Besuch beim Händler beginnt ein neues, schwierigeres Kapitel.

## Spielen

**[Spiel im Browser öffnen](https://awheitz265-eng.github.io/die-verfluchten-burgen/)**

Keine Installation und kein Konto erforderlich. Fortschritt wird nur in deinem Browser gespeichert. Über das Pausemenü lässt sich der Spielstand als JSON exportieren und importieren.

| Taste | Aktion |
|---|---|
| WASD | Bewegung in Bildschirmrichtungen |
| Maus + Linksklick | Zielen / angreifen, auch gedrückt halten |
| Rechtsklick | Blocken (ausser mit Bogen) |
| Leertaste | Ausweichrolle |
| E | Beute aufnehmen, Truhe öffnen, Tor benutzen, Prinzessin befreien |
| Q | Heiltrank |
| I / C / M | Inventar / Charakter / Karte |
| ESC | Pause und Optionen |

Gold und Tränke werden in unmittelbarer Nähe automatisch aufgehoben. Ausrüstung wird mit E aufgenommen und im Inventar angelegt. Die goldene Markierung weist zum nächsten Hauptziel.

## Enthalten

- Deterministische, geprüfte Aussenwelten und verbundene Burggrundrisse.
- Sechs zyklisch wechselnde Landschaftsstimmungen.
- Fünf reguläre Gegner und drei Burghüter mit angekündigten Angriffsmustern.
- Schwert, Zweihänder, Axt, Speer und Bogen mit unterschiedlichen Kampfwerten.
- Trefferzonen, Projektile, Blocken, Ausweichen, Ausdauer und Heiltränke.
- Fünf Seltenheitsstufen, sechs Ausrüstungsplätze und direkt wirksame Werte.
- Inventarvergleich, Sortieren, Kaufen, Verkaufen und Waffenverbesserung.
- Erfahrung, Stufenaufstieg und fortlaufende Kapitel mit steigender Schwierigkeit.
- Tod mit Kapitelneustart und 10 % Goldverlust; Erfahrung und Ausrüstung bleiben.
- Ursprüngliche Laufzeitillustrationen, Fackellicht, Partikel, Wasser und Nebel.
- Synthetische Musik und Geräusche; getrennte Lautstärkeregler.
- Lokaler, versionierter Spielstand mit Export und geprüftem Import.

## Entwicklung

Für Spieler ist kein Node.js nötig. Für Entwicklung und Tests genügt Node.js 22 oder neuer; keine Paketinstallation erforderlich.

```sh
node --test tests/*.test.mjs
node tests/playthrough.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

Die Vorschau läuft unter `http://127.0.0.1:4173`. Der Build erzeugt `dist/index.html` und `dist/Die_verfluchten_Burgen.html`, jeweils als vollständige einzelne HTML-Datei inklusive Grafikcode, Stilen und Spiel. Diese Datei kann auch heruntergeladen und direkt in einem Desktopbrowser geöffnet werden. Lokale Dateispeicherung kann je nach Browser abweichen; Spielstände deshalb zusätzlich exportieren.

## Aufbau

| Modul | Aufgabe |
|---|---|
| `src/world.js` | Seed-Zufall, Landschaft und Räume, Erreichbarkeit, Kollision, Navigationsfelder |
| `src/game.js` | Spielzustand, Kampf, KI, Beute, Kapitel und Übergänge |
| `src/items.js` | Ausrüstung, Gegenstandswerte, Handel, Erfahrung |
| `src/art.js` | Originale prozedurale Canvas-Illustrationen |
| `src/render.js` | Isometrische Projektion, Sortierung, Kamera, Licht und Effekte |
| `src/ui.js` / `style.css` | Menüs, HUD, Inventar, Händler, Karte |
| `src/audio.js` | Eigene Web-Audio-Synthese |
| `src/storage.js` | Versionierte Speicherung und Eingabevalidierung |
| `src/main.js` | Eingaben und Hauptschleife |

Canvas 2D und JavaScript-ES-Module wurden statt einer externen Engine gewählt, um den vollständigen Offline-Build ohne Abhängigkeiten zu ermöglichen. Weltkoordinaten und Kollisionen bleiben von der Projektion getrennt. Dies ist bewusst JavaScript, kein TypeScript-/Phaser-Projekt.

## Veröffentlichung

Der Workflow `.github/workflows/pages.yml` testet, baut und veröffentlicht nach einem Push auf `main`. In GitHub unter **Settings → Pages → Source** muss **GitHub Actions** ausgewählt sein. Die Ausgabe hat keine absoluten Assetpfade und benötigt kein Backend.

Referenz: [GitHub: Custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), geprüft am 16.11.2026.

## Qualitätsstand

Details zu tatsächlich ausgeführten Prüfungen, Verbesserungsdurchgängen und Grenzen stehen in [QA.md](QA.md).

Die Grafik ist eine eigene illustrierte 2D-Interpretation. Sie erreicht nicht die Detailfülle eines kommerziellen handgemalten Assetpakets. Figuren haben mehrphasige Gelenkanimationen für Gehen, Angriff, Treffer und Blocken; die Bewegung ist frei, die Figurenansicht ist gespiegelt und nicht in acht Richtungen separat gezeichnet. Fünf Waffenarten wechseln auch sichtbar am Helden; Rüstungsteile werden weiterhin nur teilweise sichtbar. Touchsteuerung ist seit Version 1.2 enthalten. Cloud-Synchronisation ist nicht enthalten. 60 FPS sind ein Ziel und keine Hardware-unabhängige Zusicherung.

Nächste sinnvolle Ausbaustufen: acht Richtungen für Figurenanimationen, reichere Raumtypen und variable Burgarchitektur, ausgedehntes Langzeit-Balancing, professionellere Musik sowie optionale Cloud-Spielstände.

Alle Grafik- und Audiobausteine dieses Projekts sind original und werden aus dem enthaltenen Code erzeugt. Es werden keine externen Grafik-, Musik- oder Schriftdateien geladen.

## Grafik-Update 1.1

- Acht Gehphasen, getrennt bewegte Beine, Arme und Stoff sowie Atem-, Treffer- und Blockposen. Gegner holen vor dem Treffer aus; Heldenangriffe zeigen die Kontakt- und Erholungsphase passend zum sofortigen Schaden.
- Schwert, Zweihänder, Axt, Speer und Bogen haben eigene Darstellungen. Ausweichrollen drehen die Figur.
- Sieben Laub-/Nadelbaumvarianten, sechs Unterholz-Sprites, bodenverankerte Windbewegung und zusätzliche Bodentexturen/Schatten.
- Bestehende Weltgeometrie und Spielstände bleiben verwendbar; das neue Unterholz ist rein dekorativ.

## Touch-Update 1.2

Auf Touchgeräten erscheinen die Bedienelemente automatisch. Im Start- und Pausemenü lässt sich die Touchsteuerung auch manuell ein-/ausschalten; die Wahl wird im Browser gespeichert. Querformat wird empfohlen, Hochformat bleibt bedienbar.

- Linker Stick: Bewegung in Bildschirmrichtungen.
- Angriff halten: wiederholte Angriffe mit automatischer Ausrichtung auf den nächsten lebenden, sichtbaren Gegner innerhalb der Zielhilfe-Reichweite (Nahkampf 3,2; Bogen 9 Welt-Einheiten). Die tatsächliche Waffenreichweite bleibt unverändert. Ohne Ziel gilt Bewegungs-/Blickrichtung.
- Block halten, Rolle antippen, kontextabhängige Aktion für Beute/Truhe/Tor/Prinzessin.
- Heiltrank, Inventar, Charakter, Karte und Pause bleiben als Touchflächen erreichbar.
- Getrennte Pointer-IDs erlauben gleichzeitiges Bewegen und Kämpfen. Abbruch, Fokusverlust, Pause und Grössenänderung lösen gehaltene Eingaben.
- Safe-Area-Abstände, scrollbare Menüs und angepasste Hoch-/Querformat-Anordnung. Maus/Tastatur bleiben unterstützt.

`src/touch.js` enthält Pointer-Steuerung und Zielhilfe; `tests/touch.test.mjs` prüft tatsächliche Eventhandler mit simulierten Event-Targets.
