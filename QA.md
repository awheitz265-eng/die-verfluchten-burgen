# Qualitätsbericht — 16. November 2026

## Prüfung der Spielsysteme

`node --test tests/game.test.mjs`: 11 Testgruppen.

- 400 generierte Aussen- und Innenwelten (100 Seeds, Kapitel 1 und 8): Start, Eingang/Ausgang, alle erzeugten Gegner und Truhen sowie Prinzessin erreichbar; Gegner nicht in Wänden.
- Gleicher Seed liefert gleiche Welt; verschiedene Seeds unterscheiden sich.
- Kollisionsschutz gegen Wanddurchtritt; Navigation vom Start zum Burgtor.
- Anlegen/Ablegen verändert Werte und dupliziert keine Gegenstände.
- Alle fünf Waffen unterscheiden sich in Reichweite/Angriffsintervall.
- Käufe sind an Gold gebunden; wiederholter Kauf derselben Ware wird verhindert; Verkaufserlös und Stufenaufstieg geprüft.
- Nahkampftreffer berücksichtigen Richtung und Reichweite; Fernkampfprojektile verursachen Schaden; Angriff verbraucht Ausdauer und hat Abklingzeit.
- Blocken, Ausweichimmunität, Trankverbrauch und Tod/Neustart geprüft.
- Serialisieren/Wiederherstellen erhält Welten, geöffnete Truhen, Gold und Ausrüstung; beschädigte Daten werden abgefangen.
- Prinzessin vor Boss-Sieg gesperrt; Boss-Beute, Befreiung, Händler und stärkeres Folgekapitel verbunden.
- Alle drei Bossarchetypen kündigen Angriffe an und führen ihre Muster aus.
- Manipulierte Gegenstands-IDs und beschädigte Weltstruktur werden beim Import zurückgewiesen; ein toter Held setzt am Neustartbildschirm fort.

## Automatisierte vollständige Durchläufe

`node tests/playthrough.mjs` steuert dieselbe Spiellogik mit einem einfachen Testspieler. Normale Startwerte, normale Ausrüstung, keine Unverwundbarkeit, keine Teleports und kein direktes Töten von Gegnern. Der Testspieler navigiert, zielt, kämpft, weicht aus, heilt sich, nimmt Beute auf, rüstet geeignete Schwerter aus und interagiert mit Tor und Prinzessin. Nach dem Shop wechselt er in Kapitel 2.

| Seed | Simulierte Spielzeit | Besiegte Gegner | Erreichte Charakterstufe | Resultat |
|---|---:|---:|---:|---|
| 73 | 115 s | 25 | 3 | Befreiung → Einkauf/Verbesserung → Kapitel 2 |
| 283 | 158 s | 28 | 4 | Befreiung → Einkauf/Verbesserung → Kapitel 2 |
| 14297 | 137 s | 23 | 3 | Befreiung → Einkauf/Verbesserung → Kapitel 2 |

Diese Zeiten sind deterministische Simulationsergebnisse, keine Aussage über typische menschliche Spielzeit. Die Tests prüfen die Spielsysteme, ersetzen aber keine menschliche Bewertung des Spielgefühls oder langfristigen Balancings.

## Drei Verbesserungsdurchgänge

1. **Gameplay:** Echte Angriffstreffer und komplette Abläufe geprüft. Wiedereinstieg nach Tod korrigiert. Automatisches Goldaufnehmen, erreichbare Wege, Zielmarkierung und Mindesttränke nach Tod unterstützen den Spielfluss.
2. **Grafik und Atmosphäre:** Tatsächliche Renderer-Ausgabe als Wald- und Burgszene angesehen. Burg zunächst zu leer: Teppiche, Runenkreis, Bücherregale, Banner, Statuen und Fässer ergänzt. Versetzte Fackelflamme korrigiert. Gehvarianten und Verdeckungstransparenz ergänzt.
3. **Technik und Veröffentlichung:** Standalone-Build ohne externe Laufzeitdateien erstellt. Importvalidierung vertieft. GitHub-Pages-Workflow mit offizieller Dokumentation abgeglichen, aktuelle Artifact-/Checkout-Versionen übernommen. Tests werden vor jedem Deployment ausgeführt.

## Prüfumfang und Grenzen

- Grafikszenen mit derselben Rendering-Implementierung in einer Canvas-Laufzeit erzeugt und visuell geprüft. Das prüft Zeichnung und Bildaufbau, nicht CSS-Layout oder Browserbedienung.
- Die lokale HTTP-Vorschau war durch die Umgebung blockiert. Die anschliessend veröffentlichte GitHub-Pages-Version wurde im Browser bei 1280 × 720 geprüft: Startmenü, neues Spiel, Tastaturbewegung, Inventar, Ablegen/Anlegen mit sichtbarer Änderung von 16 auf 8 und zurück auf 16 Angriff, Charakterwerte, Karte, Pause sowie Fortsetzen nach Neuladen. Start- und Inventaransicht wurden visuell angesehen. Im dabei erfassten Browser-Fehlerprotokoll standen keine Fehler. Kein vollständiger manueller Durchlauf; die vollständigen Durchläufe oben sind automatisierte Tests der Spiellogik.
- GitHub Actions führte die 11 Testgruppen, drei vollständigen Simulationen, Build und Pages-Deployment erfolgreich aus. Die 20 übertragenen Projektdateien wurden anhand ihrer Git-Blob-Hashes mit dem lokalen Teststand verglichen; keine Abweichung. Veröffentlichter Stand: Commit `fdae03828238e2dd6d3349bbb1afad6881e740b9`; diese spätere Ergänzung verändert ausschliesslich den Bericht.
- Die KI verwendet ein gemeinsames Navigationsfeld und direkte Sichtprüfung. Es gibt kein komplexes taktisches Gruppenverhalten.
- 400 Welten und drei komplette Durchläufe sind Stichproben, keine Fehlerfreiheitsgarantie für alle Seeds oder hohen Kapitel.
- Drei Bossfiguren teilen drei Grundmuster in anderer Reihenfolge und mit unterschiedlichen Werten. Weitere individuellere Muster sind eine sinnvolle Erweiterung.
- Update 1.1 ersetzt die einfachen Gehvarianten durch Gelenkanimationen. Die Figurenansicht bleibt gespiegelt; kein separat gezeichnetes 8-Richtungs-Set.
- Update 1.1 wechselt die sichtbare Heldenwaffe passend zu den fünf Waffenarten. Nicht jeder Rüstungsslot hat ein eigenes vollständiges Kostüm.
- Physik, Gegnerlogik, Händler und Speicherung sind implementiert. Raumtypen, Art-Direction und Audio sind kompakter als der kommerzielle Zielmassstab des ursprünglichen Auftrags.
- Keine Performance-Messung auf einer repräsentativen Auswahl von Endgeräten; 60 FPS nicht pauschal bestätigt.

## Grafik-Update 1.1 – 16.11.2026

Lokale Prüfungen: 13 Testgruppen (11 bestehende plus zwei Prüfungen der Animations-/Trefferzeitpunkte), drei vollständige Spielsimulationen unverändert erfolgreich. Wald-/Burgszene und ein Kontaktbogen der Geh-/Angriffsphasen mit dem tatsächlichen Canvas-Renderer gerendert und angesehen. 336 vorberechnete Animationsbilder und 13 Waldassets. Zusätzliche Pixelprüfung kontrolliert unterschiedliche Phasen und abgeschnittene Bildränder. Keine neue Hardware-übergreifende Performance-Zusage.

## Touch-Update 1.2 – 16.11.2026

Fünf neue Tests prüfen Stick-Totzone/Begrenzung/Bildschirmrichtungen, unabhängige gleichzeitige Pointer für Bewegung/Angriff/Block, Freigabe bei Pause/Pointerverlust/Rotation, Zielhilfe ohne tote oder durch Wände verdeckte Gegner sowie Truhe und Ausweichrichtung. Das sind Tests der echten Pointer-Handler mit simulierten DOM-Event-Targets, kein Test auf einem physischen Telefon. Die bestehenden 13 Testgruppen und drei vollständigen Spielsimulationen bleiben erfolgreich. Standalone-Build wird ebenfalls geprüft.

Die veröffentlichte Version 1.2 wurde im Browser bei 390 × 844 und 844 × 390 geprüft: Touchmodus automatisch erkannt, gespeichertes Spiel fortgesetzt, Steuerflächen innerhalb des Viewports, Ausweichen über die neue Taste mit sichtbarem Ausdauerverbrauch, Inventar geöffnet/geschlossen und Touchflächen im Menü ausgeblendet. Das Inventar ist bei 390 px ohne horizontales Überlaufen scrollbar. Ein gemessener Überlappungsbereich zwischen Kapitelanzeige und Menüleiste wurde anschliessend korrigiert. Im gelesenen Browser-Fehlerprotokoll standen keine Fehler. Browser-Screenshots konnten in dieser Sitzung nicht aufgenommen werden; die Layoutprüfung verwendete DOM-Geometrie, keinen visuellen Screenshot. Ein physischer Android-/iOS-Mehrfingertest steht weiterhin aus; Geräteperformance wird nicht pauschal zugesichert.

## Update 2.0 — Prüfungen (17. November 2026)

`node --test tests/*.test.mjs`: 24 Tests, alle bestanden. Neu sind:

- Sechs Endgegner haben sechs verschiedene Angriffssets; jede Attacke hat eine Vorwarnung; bei niedriger Gesundheit tritt Raserei ein.
- Alle zehn Angriffsarten (Hiebkegel, Erdschlag, Ansturm, Nova, Salve, Spirale, Beschwörung, Blinzeln, Sprung, Regen) werden von mindestens einem Boss tatsächlich ausgeführt.
- Beschworene Schergen sind begrenzt, geben keine Beute und sterben mit dem Boss.
- Alle acht Gegnertypen kündigen an und verletzen einen untätigen Spieler; Ritter blocken frontal nur ausserhalb ihres Angriffs; Elitegegner sind stärker und selten.
- Jedes Kapitel liefert ein anderes Layout, eine andere Flüssigkeit und den passenden Boss; Flüsse werden von Brücken gequert; Burggrundrisse variieren und bleiben verbunden.

`CHAPTERS=6 node tests/playthrough.mjs`: Der einfache Testspieler schliesst mit allen drei Seeds alle sechs Kapitel inklusive aller Endgegner ab (Laufzeit etwa 3 s). Der Workflow führt diesen Lauf aus.

Sichtprüfung: `scripts/render-check.mjs` rendert alle Biome (`qa/biome-1..6.jpg`) und alle Bossarenen mitten im Angriff (`qa/boss-1..6.jpg`); `scripts/figure-sheet.mjs` erzeugt das Kontaktblatt `qa/figures.png` und prüft, dass kein Figurenframe den Rand berührt. Der gebaute Einzeldatei-Build wurde im Browser gestartet, ein Spiel begonnen, keine Konsolenfehler.

Grenzen: Die Figuren sind weiterhin eigene prozedurale 2D-Illustrationen und erreichen nicht die Fotorealität eines kommerziellen Charaktermodells. Das Balancing der neuen Gegner und Bosse beruht auf dem einfachen Testspieler, nicht auf menschlichen Testrunden. Mobile Geräte wurden nicht neu getestet.

## Update 2.1 — Prüfungen (17. November 2026)

`node --test tests/*.test.mjs`: 27 Tests, alle bestanden. Neu sind: Die Burg ist von aussen über 40 Seeds massiv und das Tor bleibt erreichbar. Der Schwierigkeitsgrad skaliert Gegneranzahl, Lebenspunkte und Schaden streng steigend, eine Umstellung skaliert lebende Gegner, und alte Spielstände ohne Einstellung laden als „Normal“. Burgmöbel sind massiv, und Wandfackeln und Banner hängen nur an echten Wänden.

Testspieler mit `CHAPTERS=6`: Auf „Normal“ schafft er mit allen drei Seeds alle sechs Kapitel. Auf „Albtraum“ stirbt er mit allen drei Seeds im ersten Kapitel.

Sichtprüfung: `qa/castle.png` (Thronsaal mit Licht), `qa/castle-outside.jpg` (Burg von aussen), `qa/death.jpg` (drei Sterbephasen), `qa/biome-*.jpg` und `qa/boss-*.jpg` wurden neu gerendert, dazu das Kontaktblatt `qa/figures.png` mit 730 Frames, keiner berührt den Rand. Im Browser wurden die Schwierigkeitsauswahl, die Umstellung im Pausemenü und das Burginnere geprüft, ohne Konsolenfehler.

Grenzen: Das Balancing beruht auf dem einfachen Testspieler. Mobile Geräte wurden nicht neu getestet. Speicherbedarf und Bildrate auf schwachen Geräten wurden nicht gemessen; die Figurenframes sind auf 240 bis 360 zwischengespeicherte Bilder begrenzt.
