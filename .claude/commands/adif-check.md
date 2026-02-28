# ADIF Parser Check

$ARGUMENTS

Prüfe, ob die beschriebene Änderung (oder die aktuelle Codeänderung laut `git diff`) korrekt alle vier Parser-Pfade berücksichtigt:

| Parser | Datei | Relevante Felder |
|--------|-------|-----------------|
| **ADIF** | `parseADIF()` | Direkte ADIF-Tags |
| **Log4OM** | `parseLog4OM()` | Spaltenname ohne Unterstrich (z.B. `rstsent`) |
| **HRD** | `parseHRD()` | `COL_`-Präfix (z.B. `COL_RST_SENT`) |
| **DXKeeper** | `parseDXKeeperFile()` | Access-Spaltennamen (z.B. `RST_Sent`) |

Für jeden Parser prüfen:
1. Wird das neue Feld gelesen?
2. Ist das Feldname-Mapping korrekt?
3. Ist die Konvertierung (Typ, Format) korrekt?
4. Gibt es Edge Cases (null, leer, Sonderformat)?

Gib eine klare Tabelle aus: ✅ korrekt / ⚠️ fehlt / ❌ fehlerhaft — mit konkreten Zeilennummern.
