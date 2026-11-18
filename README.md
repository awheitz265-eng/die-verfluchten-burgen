# Die verfluchten Burgen

**The Cursed Kingdoms** — ein isometrisches Fantasy-Action-Rollenspiel für Desktopbrowser.

Erkunde eine zufällig erzeugte Landschaft, sammle Ausrüstung, finde die Burg, bezwinge ihren Burghüter und befreie die Prinzessin. Die Kampagne führt durch zehn Burgen. Nach Kapitel 1 bis 9 wartet der Händler. Die Rettung in der Aschenkrone schliesst das Spiel ab.

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

Gold und Tränke werden in unmittelbarer Nähe automatisch aufgehoben. Ausrüstung wird mit E aufgenommen und im Inventar angelegt. Die Karte deckt sich beim Erkunden auf. Ab Kapitel 2 nennt die Zielanzeige die nächste Spur und ihre Richtung auf dem Bildschirm.

### Musik, Figuren und Nebenaufgaben

Im Pausemenü lässt sich unter «Bildrate anzeigen» die gemessene Bildrate einblenden. Die Musik wechselt zwischen Erkundung, Burghallen, Gefechten und Bosskämpfen. In der Aussenwelt kannst du nach der ersten Spur eine freiwillige Aufgabe erfüllen. Halte ein Signalfeuer am Brennen, finde Botensiegel in Truhen oder begleite eine Laternenmotte zum Tor. Ein warmer Wimpel kennzeichnet den Scharfschützen, ein mintfarbener den Knochentrommler. Weiche der angezeigten Schusslinie aus oder trenne den Trommler von seinen Verbündeten.

### Bogen und mobile Darstellung

Beim Bogen markiert ein goldener Ring das erfasste Ziel. Mit der Maus kannst du auf den Oberkörper zielen. Auf dem Touchscreen bevorzugt die Zielhilfe sichtbare Gegner in Stickrichtung. Sie berücksichtigt die Bewegung des Gegners beim Abschuss. Der Pfeil fliegt danach geradeaus, und Deckung hält ihn auf.

Im Schloss sind Boden, Gänge und Bildschirmränder heller. Auf Touchgeräten zeichnet das Spiel bei ausreichender Leistung mit bis zu 60 Bildern pro Sekunde und wechselt bei anhaltend hoher Last auf 30.

## Enthalten

- Deterministische, geprüfte Aussenwelten und verbundene Burggrundrisse.
- Zehn Aussenrouten und Burggrundrisse, darunter die Sturmküste, Glockengruft, Spiegelfeste, Schwarze Schleuse und Aschenkrone. Glocken und Schützen öffnen in zwei Burgen den Zugang zum Boss.
- Acht Gegnertypen (Räuber, Bogenschütze, Skelett, Ritter mit Schild, Magier, Berserker, Assassine, Kultist), Elitegegner und zehn Bossbegegnungen mit angekündigten Angriffsmustern. In der Spiegelfeste kämpfen zwei Ritter gemeinsam.
- Schwert, Zweihänder, Axt, Speer und Bogen mit unterschiedlichen Kampfwerten.
- Trefferzonen, Projektile, Blocken, Ausweichen, Ausdauer und Heiltränke.
- Fünf Seltenheitsstufen, sechs Ausrüstungsplätze und direkt wirksame Werte.
- Inventarvergleich, Sortieren, Kaufen, Verkaufen und Waffenverbesserung.
- Erfahrung, Stufenaufstieg und zehn Kapitel mit steigender Schwierigkeit. Der Gürtel fasst sieben Tränke. Beim Händler kostet der erste 40 Gold, jeder weitere 25 Gold mehr.
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
| `src/game.js` | Spielzustand, Kampf, Beute, Kapitel und Übergänge |
| `src/ai.js` | Gegner- und Bossverhalten, Angriffsarten mit Vorwarnung |
| `src/items.js` | Ausrüstung, Gegenstandswerte, Handel, Erfahrung |
| `src/art.js` | Originale prozedurale Canvas-Illustrationen (Kulissen) |
| `src/figures.js` | Skelettbasierte Figuren mit Lauf-, Angriffs- und Trefferphasen |
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

## Update 2.0 — Wege, Figuren, Biome, Endgegner

- **Organische Wege und Gewässer:** Pfade werden als geschwungene Spuren mit weichen Rändern gezeichnet, nicht mehr als Rautenraster. Flüsse, Moorteiche, Lava, Eis und Giftlachen verwenden dieselbe weiche Pinseltechnik; wo ein Weg Flüssigkeit quert, entsteht eine Brücke.
- **Realistischere Figuren:** Alle Figuren werden aus einem Gelenkskelett (Becken, Wirbelsäule, Schultern, Knie, Ellbogen) mit schattierten, konischen Gliedmassen gezeichnet. Echte Laufzyklen, Ausholen, Treffer und Nachschwung pro Waffe; Held mit fünf Waffen, acht Gegnertypen, sechs Bosse.
- **Abwechslungsreiche Level:** Jedes Kapitel hat ein anderes Aussenlayout (Fluss, Teiche, Lavaspalten und Felsgrate, Eissee, Dornendickicht, Ruinen mit Erdspalten), eigene Gegnerlisten mit Rudeln, Elitegegnern und Wetter. Burgen haben drei Grundrissvarianten, Säulen und eine Palette je Biom.
- **Härtere Gegner:** Räuber und Skelette schlagen in Serien, Bogenschützen schiessen Salven und umkreisen dich, Magier blinzeln weg, Ritter halten den Schild vor und sind nur im Schwung oder von der Seite verwundbar, Berserker stampfen und stürmen, Assassinen springen an und weichen aus, Kultisten beschwören Skelette.
- **Sechs Endgegner mit eigener Technik:**

| Kapitel | Endgegner | Kampfstil |
|---|---|---|
| 1 Flüsternder Forst | Gorm, der eiserne Eidbrecher | Hiebserie, Erdschlag, Schildansturm |
| 2 Moor der verlorenen Eide | Mirela, Herrin des Nebels | Geschossfächer, Nebelring, Beschwörung, Blinzeln |
| 3 Tal der letzten Glut | Tharok Aschenaxt | Sprungangriff, Ansturm, Axtwirbel, Erdschlag |
| 4 Weisse Wacht | Skadi, die Frostkönigin | Eisspirale, Eisregen, Blinzeln, Splitterfächer |
| 5 Dornenfluch | Vael, der Dornenfürst | Dornenausbruch, Schergen, Sprung, Erdschlag |
| 6 Asche über Falkenstein | Malakar, der Aschefürst | Alle Techniken in drei Phasen |

  Jede Bossattacke zeigt eine Vorwarnung auf dem Boden (Kreis, Kegel oder Linie) und kann durch Ausweichen vermieden werden; Bodenangriffe lassen sich nicht blocken. Bei halber Gesundheit geraten Bosse in Raserei (Malakar zweistufig). Ab Kapitel 7 beginnt der Zyklus mit gestärkten Gegnern von vorn.

## Update 2.1 — Burg, Bewegung, Schwierigkeit

- **Die Burg ist ein festes Gebäude:** Von aussen ist die Grundfläche hinter der Torfassade gesperrt, man kann nicht mehr durch oder hinter die Burg laufen. Sie ist grösser gezeichnet und betreten wird sie weiterhin am Tor. Auch innen sind Bücherregale, Statuen, Kisten, Fässer, Waffenständer und Feuerschalen jetzt massiv.
- **Burginneres neu gestaltet:** Ziegelmauern mit Abdeckstein, Moos und vergitterten Fenstern; Steinplattenböden mit Fugen und Rissen; Wandfackeln und Banner hängen an den Wänden; Säulen statt Klötzen; Läufer in den Gängen und gewebte Teppiche in den Räumen. Eine Lichtschicht verdunkelt die Burg; Fackeln, Feuerschalen, Fenster, Held, Prinzessin, Boss und Geschosse leuchten.
- **Figuren und Bewegungen:** Laufzyklus mit 12 Phasen (Fersenaufsatz, Abrollen über die Zehen), Atem- und Gewichtsverlagerung im Stand; der Laufzyklus folgt der tatsächlich zurückgelegten Strecke (keine rutschenden Füsse). Figuren neigen sich in die Bewegung, stauchen bei Treffern und werden leicht zurückgestossen. Gegner sacken beim Tod zusammen, kippen vom Schlag weg und lösen sich in Staub auf. Einheitliche Lichtführung mit Lichtkante, weicher Bodenschatten, Kontur, feinere Gesichter; auf hochauflösenden Bildschirmen schärfer gezeichnet. Staub bei Schritten, Rollen und Stampfangriffen, Waffenspuren als Sichel.
- **Brücken** sind durchgehende Holzbrücken mit Geländer statt treppenförmiger Planken.
- **Schwierigkeitsgrad einstellbar** (beim neuen Spiel und jederzeit im Pausemenü): Leicht, Normal, Schwer, Albtraum. Er ändert Lebenspunkte, Schaden, Tempo, Anzahl, Elite-Anteil, Pausen zwischen Angriffen, Vorwarnzeit, Wahrnehmungsreichweite und das vorausschauende Zielen der Fernkämpfer. „Normal“ ist härter als bisher. Gegner ohne Sichtlinie suchen sich jetzt eine Schussposition, statt stehen zu bleiben.
