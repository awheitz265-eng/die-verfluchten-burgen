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
- Die lokale HTTP-Vorschau war durch die Umgebung blockiert; ein lokaler manueller Browsertest war daher zunächst nicht möglich. Eine Prüfung der veröffentlichten Seite wird nach Veröffentlichung separat vermerkt.
- Die KI verwendet ein gemeinsames Navigationsfeld und direkte Sichtprüfung. Es gibt kein komplexes taktisches Gruppenverhalten.
- 400 Welten und drei komplette Durchläufe sind Stichproben, keine Fehlerfreiheitsgarantie für alle Seeds oder hohen Kapitel.
- Drei Bossfiguren teilen drei Grundmuster in anderer Reihenfolge und mit unterschiedlichen Werten. Weitere individuellere Muster sind eine sinnvolle Erweiterung.
- Animationen sind einfache Gehvarianten, Spiegelung, Rollen-/Treffereffekte. Kein vollständig gezeichnetes 8-Richtungs-Animationsset.
- Waffenwirkung ist unterschiedlich, die sichtbare Basisbewaffnung des Helden wechselt noch nicht vollständig passend zur Ausrüstung.
- Physik, Gegnerlogik, Händler und Speicherung sind implementiert. Raumtypen, Art-Direction und Audio sind kompakter als der kommerzielle Zielmassstab des ursprünglichen Auftrags.
- Keine Performance-Messung auf einer repräsentativen Auswahl von Endgeräten; 60 FPS nicht pauschal bestätigt.
