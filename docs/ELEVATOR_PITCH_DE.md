# Amateur Radio DXCC Analyzer Pro - Elevator Pitch (Deutsch)

**Version 2.4.1** | Entwickelt von Fritz DK9RC | [GitHub Repository](https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro)

---

## Ihre komplette DXCC-Tracking-Lösung - 100% Privat, 100% Browser-basiert

### 🔒 **Datenschutz First**
- **Alle Verarbeitung erfolgt im Browser** - Ihre Logbuch-Daten verlassen niemals Ihren Computer
- **Keine Uploads, kein Tracking, keine Cloud-Speicherung** - komplette Datensouveränität
- **Vollständig offline-fähig** nach dem ersten Laden der Seite
- **Sicher by Design** - nutzt die FileReader-API des Browsers für lokalen Dateizugriff

### 📊 **Umfassende DXCC-Analyse**
- **Tracking gearbeiteter und bestätigter DXCC-Gebiete** über 11 KW-Bänder (160m-6m)
- **Multi-Plattform Bestätigungs-Tracking**: LOTW, eQSL, QRZ.com, Paper QSL
- **Echtzeit-Statistiken**: Gebiete gearbeitet, bestätigt, fehlend, Bestätigungsrate
- **Betriebsarten-spezifische Analyse**: SSB, CW, Digital-Modi mit intelligenter Kategorisierung
- **Kontext-sensitive Darstellung**: Alle Daten passen sich dynamisch an aktive Filter an

### 🎯 **GDXF Most Wanted Integration** *(NEU in v2.0.0)*
- **Eingebaute Rankings** von der German DX Foundation (340 aktive DXCC-Gebiete)
- **Betriebsarten-abhängige Rankings** wechseln automatisch (Digital/CW/SSB/Mixed)
- **Rufzeichen-Präfix Anzeige** und Suchbarkeit (z.B. P5, BS7, VE, KH7K)
- **Identifizieren Sie sofort Ihre seltensten Fänge** und planen Sie Ihre nächste DXpedition
- **Datenquelle**: [GDXF Most Wanted 2024 - Deutschland](https://gdxf.de/mostwanted/index.php?year=2024)

### 🔍 **Erweiterte Filter & Analyse**
- **Mehrdimensionale Filterung**: Betriebsart, Operator, Kontinent, Band, Bestätigungsplattform, Datumsbereich
- **Suche nach Ländername, DXCC-ID oder Rufzeichen-Präfix** - finden Sie alles sofort
- **Fehlende Gebiete anzeigen** und Lücken in Ihrer DXCC-Abdeckung identifizieren
- **Interaktive Charts**: Kontinente-Aufschlüsselung, Band-Aktivität, Band × Kontinent Heatmap
- **Intelligente Filter-Interaktion**: Filter arbeiten kontextbezogen zusammen
- **Aktive Filter-Tags** mit visuellen Chips und Ein-Klick-Entfernung

### 🕐 **Letztes QSO Tracking & Veraltete Bestätigungen** *(NEU in v2.3.0)*
- **Hover-Tooltips** auf Ländernamen und Band-Zellen zeigen letztes QSO-Datum, Band und Rufzeichen
- **Veraltete Bestätigungs-Warnung** — Uhr-Symbol bei W-Status-Bändern ohne Bestätigung seit 5+ Jahren
- **Erweiterter CSV-Export** mit neuen Spalten: Letztes QSO-Datum, Band, Rufzeichen, Stale-Indikator
- **Intelligente CSV-Dateinamen** — aktive Filter werden automatisch eingebettet (z.B. `dxcc-analysis_cw_confirmed_eu.csv`)
- **"Nicht Gearbeitet" Chart-Segment** — "Alle Gebiete"-Ansicht zeigt ungearbeitete Gebiete als drittes Segment in Kontinent- und Band-Charts

### 🔗 **Teilen, Export & Tastaturkürzel** *(NEU in v2.2.0)*
- **Share-Link** — URL mit allen aktiven Filtern Base64-kodiert kopieren; jeder mit dem Link sieht exakt dieselbe Ansicht (`Strg+Umschalt+S`)
- **JSON-Export** — gefilterte Gebietsdaten als JSON für externe Werkzeuge exportieren
- **ADIF-Export** — QSOs gefilterter Gebiete als gültige ADIF-Datei exportieren
- **Spalten-Konfiguration** — einzelne Band- und Bestätigungsspalten ein-/ausblenden; Einstellungen bleiben in localStorage erhalten
- **Tastaturkürzel** — `/` fokussiert Suche, `Esc` löscht sie, `←`/`→` navigiert Seiten, `Strg+Umschalt+S` kopiert Share-Link

### 🌿 **Obsidian-Export** *(NEU in v2.4.0)*
- **Export nach Obsidian** — ZIP-Datei mit Obsidian Flavored Markdown-Notizen für den gesamten DXCC-Log
- **Eine Notiz pro Gebiet** — YAML-Frontmatter, Obsidian-Callouts, Band-Status-Tabelle mit letzten QSO-Daten, QSL-Plattform-Icons
- **Übersichts-Notizen** — `DXCC Overview.md` mit Top-10-Tabelle und vollständiger Gebietsliste; `DXCC Overview - Not Worked.md` nach Kontinent gruppiert
- **Fertige Dataview-Abfragen** — 6 Abfragen enthalten (unbestätigt, nach Kontinent, Top 20, kein LoTW, Wikipedia-Links, Zeitstrahl)
- **Sicherer Re-Export** — alle Dateien können überschrieben werden, ohne vom Nutzer hinzugefügte Inhalte zu verlieren; respektiert alle aktiven Filter

### 🌐 **Wikipedia-Integration** *(NEU in v2.4.1)*
- **Wikipedia-Links** in der Gebiets-Tabelle — anklickbare Links zum Wikipedia-Artikel jedes DXCC-Gebiets
- **Wikipedia-URLs im CSV- und JSON-Export** — für Verwendung in externen Werkzeugen und Workflows
- **Manuell gepflegte Slugs** für alle Sonderfälle (Abkürzungen, Sonderzeichen, historische Namen, Begriffsklärungen)

### 📤 **Professioneller Export & Reporting**
- **Export gefilterter Analyse nach CSV** mit vollständigem Filter-Kontext im Header und filterbewusstem Dateinamen
- **Druckfertige Reports** (A4 Querformat, alle 21 Spalten sichtbar); zeigt letztes QSO-Datum im Ausdruck
- **Dediziertes Chart-Drucken** (4 Charts auf einer Seite)
- **PDF-Generierung** über Browser-Druckdialog
- **Alle Exports respektieren Ihre aktuellen Filter** - Was Sie sehen, ist was Sie bekommen

### ⚡ **Performance & Kompatibilität**
- **Verarbeitet 170.000+ QSO-Logs** mühelos
- **Funktioniert mit allen gängigen Logging-Programmen**: Log4OM, WaveLog, N1MM+, Ham Radio Deluxe, und mehr
- **Eingebaute ADIF 3.1.6 Gebiets-Lookup** (löst fehlende/inkonsistente Daten auf)
- **Gelöschte Gebiete-Erkennung** (z.B. Deutsche Demokratische Republik, Kanalzone)
- **Effizientes Parsing** mit Memoization für sofortige Filter-Updates

### 🎨 **Überlegene Benutzererfahrung**
- **Sortierbare Spalten** mit intelligenten Vorgaben (21 Spalten insgesamt)
- **Band-Spalten-Hervorhebung** bei aktivem Band-Filter (blauer Rahmen + gedimmte andere Bänder)
- **Sticky Headers** für einfache Navigation bei großen Datensätzen
- **Konfigurierbare Paginierung** (10/15/25/50/Alle Einträge); Einstellung bleibt in localStorage erhalten
- **Spalten-Konfiguration** — einzelne Bänder und Bestätigungsplattformen ein-/ausblenden; bleibt in localStorage erhalten
- **Visuelle Filter-Chips** mit individuellen Entfernen-Buttons und "Alle zurücksetzen"
- **Responsives Design** das alle Spalten auf dem Bildschirm unterbringt
- **Datumsbereich-Vorlagen** (Dieses Jahr, Letztes Jahr, Letzte 12 Monate) + benutzerdefinierter Bereich

---

## Das Wesentliche

**Amateur Radio DXCC Analyzer Pro** ist ein professionelles DXCC-Tracking-Tool, das Ihre Privatsphäre respektiert, riesige Logs mühelos verarbeitet und Einblicke bietet, die Sie nirgendwo anders finden - alles läuft vollständig in Ihrem Browser.

### Perfekt für:
- Contest-Operatoren, die Multi-Mode-Performance analysieren
- DXer, die seltene Gebiete tracken
- DXCC-Jäger, die ihre nächsten Bestätigungen planen
- Multi-Op-Stationen mit mehreren Rufzeichen
- Jeden, der seine Amateurfunk-Erfolge professionell tracken möchte

### Technologie-Stack:
- **React 18** mit modernen Hooks
- **Vite 7** für blitzschnellen Build und Development
- **Tailwind CSS** für responsives Design
- **Recharts** für interaktive Charts
- **100% JavaScript** - kein Backend erforderlich

---

## Schlüssel-Differenzierungsmerkmale

1. **Privacy-First Architektur** - Ihre Daten verlassen niemals Ihren Browser
2. **GDXF Most Wanted Integration** - Kein anderer ADIF-Analyzer bietet dies
3. **Betriebsarten-abhängige Rankings** - Rankings passen sich automatisch an Ihre Filter-Auswahl an
4. **Enterprise-Grade Performance** - Getestet mit 170.000+ QSOs
5. **Umfassender Export** - CSV, JSON, ADIF und Obsidian-Export mit Filter-Kontext, Last-QSO-Spalten und filterbewussten Dateinamen
6. **Kontext-sensitive Darstellung** - Alle Daten passen sich dynamisch an aktive Filter an
7. **Professioneller Druck-Support** - A4-Querformat-Reports mit allen 21 Spalten
8. **Veraltete Bestätigungs-Erkennung** - W-Status-Bänder ohne Bestätigung seit 5+ Jahren sofort erkennen
9. **Teilbare Filter-Ansichten** - Exakte Analyse-Ansichten per URL mit allen kodierten Filtern teilen
10. **Obsidian-Integration** - Gesamten DXCC-Log als strukturiertes Obsidian-Vault exportieren
11. **Wikipedia-Links** - Direkte Links zu Wikipedia-Artikeln für jedes DXCC-Gebiet

---

## Hauptfunktionen im Detail

### Multi-Band DXCC-Tracking
- **11 KW-Bänder**: 160m, 80m, 60m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m
- **Band-Matrix**: Sofortige Übersicht welche Gebiete auf welchen Bändern gearbeitet/bestätigt sind
- **Band-Filter**: Konzentrieren Sie sich auf ein einzelnes Band
- **Band-Aktivitäts-Chart**: Visualisieren Sie Ihre DXCC-Abdeckung über alle Bänder

### Bestätigungs-Plattformen
- **LOTW** (Logbook of the World)
- **eQSL** (elektronische QSL)
- **QRZ.com** (vollständige Log4OM und WaveLog Integration)
- **Paper QSL** (Papier-Karten)
- **Plattform-Filter**: Filtern Sie nach spezifischen Bestätigungsmethoden
- **Plattform-Vergleichs-Chart**: Vergleichen Sie Ihre Bestätigungsraten

### Betriebsarten-Analyse
- **SSB**: USB, LSB, AM
- **CW**: Morsetelegrafie
- **Digital**: FT8, FT4, VARA HF, RTTY, PSK31, PSK63, JT65, JT9, WINMOR, ARDOP, PACTOR
- **Betriebsarten-Filter**: Analysieren Sie Ihre Performance pro Betriebsart
- **Most Wanted Rankings wechseln automatisch** basierend auf der gewählten Betriebsart

### Operator-Tracking
- **Multi-Operator Support**: Unterscheiden Sie zwischen verschiedenen Rufzeichen
- **Operator-Filter**: Filtern Sie nach STATION_CALLSIGN (z.B. DK9RC vs. 9A/DK9RC)
- **Ideal für Contest-Stationen** mit mehreren Operatoren

### Kontinente & Geografie
- **6 Kontinente**: EU, NA, AF, SA, AS, OC
- **Kontinente-Filter**: Fokussieren Sie sich auf spezifische Kontinente
- **Kontinente-Chart**: Visualisieren Sie Ihre geografische Abdeckung
- **Band × Kontinent Heatmap**: Identifizieren Sie Lücken in Ihrer Abdeckung

### Zeitbasierte Analyse
- **Datumsbereich-Filter** mit Vorlagen:
  - Dieses Jahr
  - Letztes Jahr
  - Letzte 12 Monate
  - Benutzerdefinierter Bereich
- **Vergleichen Sie Fortschritt über Zeit**
- **Analysieren Sie Contest-Perioden**

### Status-Filter
- **Alle**: Zeige alle DXCC-Gebiete
- **Nur Bestätigt**: Nur Gebiete mit mindestens einer Bestätigung
- **Nur Gearbeitet**: Gebiete ohne Bestätigung
- **Nicht Gearbeitet**: Zeige fehlende Gebiete (340 aktive minus Ihre)
- **Alle Gebiete**: Kombiniert gearbeitete und fehlende (immer 340 Gebiete)

### Such-Funktionalität
- **Suche nach Ländername**: z.B. "Germany", "Japan"
- **Suche nach DXCC-ID**: z.B. "230", "339"
- **Suche nach Rufzeichen-Präfix**: z.B. "P5", "BS7", "VE", "KH7K"
- **Echtzeit-Filterung**: Ergebnisse während der Eingabe

---

## Open Source & Community

- **Frei und Open Source** - MIT Lizenz
- **Aktive Entwicklung** - Version 2.4.1 veröffentlicht Februar 2026
- **Community-getrieben** - Von Funkamateuren für Funkamateure entwickelt
- **Gut dokumentiert** - Umfassendes README und Entwickler-Anleitungen
- **Deutsche und internationale Community** - GDXF Most Wanted Daten speziell für Deutschland

---

## Technische Highlights

### Privacy & Sicherheit
- **100% Client-Side Processing** - Zero Server Communication
- **Keine Daten-Uploads** - Ihre Logbücher bleiben lokal
- **Kein Tracking** - Keine Analytics, keine Cookies
- **Offline-fähig** - Funktioniert ohne Internet nach erstem Laden
- **DSGVO-konform** - Keine personenbezogenen Daten werden verarbeitet

### Performance-Optimierung
- **Getestet mit 170.000+ QSOs** - Keine Performance-Degradation
- **Memoization** - Effiziente Neuberechnung bei Filter-Änderungen
- **Lazy Loading** - Nur sichtbare Daten werden gerendert
- **Optimiertes Parsing** - Regex-basierte ADIF-Verarbeitung
- **Schnelle Filter-Updates** - Sofortige UI-Reaktion

### Datenqualität
- **ADIF 3.1.6 konform** - ~400 DXCC-Gebiete
- **Built-in Lookup-Tabelle** - Löst fehlende ADIF-Felder auf
- **Gelöschte Gebiete** - Markiert und trackt historische Gebiete
- **Kontinente-Lookup-Priorität** - Verwendet zuverlässige interne Daten
- **Inkonsistenz-Auflösung** - Gruppiert nach DXCC-ID statt Ländername

---

**Jetzt testen**: [Amateur Radio DXCC Analyzer Pro](https://dirschedlf.github.io/Amateur-Radio-DXCC-Analyzer-Pro/)

**Quellcode**: [GitHub Repository](https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro)

**Entwickler**: Fritz DK9RC

**73 und viel Erfolg beim DXen!** 📻
