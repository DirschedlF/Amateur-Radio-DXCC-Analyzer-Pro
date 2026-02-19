# Design Decisions - Amateur Radio DXCC Analyzer Pro

**Purpose:** This document records key architectural and feature decisions to provide context for future development and prevent revisiting settled questions.

---

## Table of Contents

1. [File Format Support](#file-format-support)
2. [Architecture Decisions](#architecture-decisions)
3. [Feature Scope](#feature-scope)

---

## File Format Support

### ✅ ADIF as Primary Import Format + Log4OM SQLite as Secondary

**Decision Date:** 2024-02-04 (initial), reaffirmed 2026-02-12, extended 2026-02-19 (v2.5.0)

**Decision:** DXCC Analyzer Pro supports **ADIF (.adi, .adif) files** as the primary import format, plus **Log4OM 2 SQLite databases (.SQLite)** as a secondary direct-import path.

**Alternative Considered:** Cabrillo format support for contest logs

**Reasoning:**

#### Why ADIF?
1. **DXCC-Optimized Format:**
   - Native `<DXCC:>` field with entity ID
   - Native `<COUNTRY:>` field with entity name
   - Native `<CONT:>` field for continent
   - All confirmation platforms supported:
     - `<LOTW_QSL_RCVD:>`
     - `<EQSL_QSL_RCVD:>`
     - `<QSL_RCVD:>`
     - `<QRZCOM_QSL_RCVD:>`

2. **Industry Standard:**
   - Supported by **all** major logging programs:
     - Log4OM
     - Ham Radio Deluxe
     - N1MM+
     - WSJT-X (via export)
     - Win-Test
     - DXKeeper
     - etc.
   - Maintained by ADIF specification committee
   - Well-documented, stable format

3. **Complete Data Set:**
   - Band, Mode, Date, Time
   - Operator information
   - QSO notes and comments
   - All custom fields preserved

#### Why NOT Cabrillo?

**Critical Missing Fields:**
- ❌ No DXCC entity ID field
- ❌ No country name field
- ❌ No confirmation status fields (LOTW/eQSL/QRZ/Paper)
- ❌ No continent information

**Cabrillo Limitations:**
1. **Contest-Specific Format:**
   - Cabrillo is designed for **contest log submission**, not archival logbook management
   - Focused on exchange validation, not QSO history

2. **DXCC Derivation Would Require:**
   - **Callsign prefix lookup database** (thousands of entries)
   - Complex parsing rules:
     - Special event stations (e.g., `GB100RN`)
     - Portable operations (`/P`, `/M`, `/MM`, `/AM`)
     - Reciprocal licenses (`VE/W1AW`, `DL/K1ABC`)
     - Vanity callsigns
     - Club stations
     - Historical prefix changes
   - **Continuous maintenance** burden
   - **Error-prone** edge cases

3. **No Confirmation Data:**
   - Cabrillo logs are submitted **immediately after contests**
   - No QSL/LOTW/eQSL information available at submission time
   - Platform comparison charts would be empty

**Example Problem:**

```
Cabrillo QSO line:
QSO: 14000 PH 1999-03-06 0711 HC8N 59 700 W1AW 59 CT 0

Questions we CANNOT answer:
- What is HC8N's DXCC entity? (Could be 120 = Galapagos Islands)
  - Requires prefix database lookup
  - What about HC8/DL1ABC? (German in Galapagos = still DXCC 120)
- Is this QSO confirmed via LOTW? (No data available)
- Which continent? (No data available)
```

**Strategic Positioning:**
- **DXCC Analyzer Pro = Analysis Tool** for existing logbooks
- **NOT:** Logbook management software
- **NOT:** Contest logger
- **NOT:** Callsign database maintainer

**Delegation to Experts:**
- Logging programs (Log4OM, HRD, N1MM+) are **specialized** in:
  - Callsign prefix resolution
  - Real-time DXCC lookup
  - Contest exchange validation
  - Database maintenance
- They all **export ADIF** → our input format

**Conclusion:**
Supporting Cabrillo would:
- ✗ Require 40+ hours initial development
- ✗ Create ongoing maintenance burden
- ✗ Deliver inferior user experience (missing critical data)
- ✗ Blur our product positioning

**Better approach:** Direct users to export ADIF from their logging software.

**Reference:** See `.doc/CABRILLO_FORMAT_ANALYSIS.md` for detailed technical analysis.

---

### ✅ Log4OM SQLite as Secondary Import Format

**Decision Date:** 2026-02-19 (v2.5.0)

**Decision:** Add native Log4OM 2 SQLite database import as a second supported import format, alongside ADIF.

**Reasoning:**

#### Why Log4OM SQLite?

1. **Superior Data Quality vs. ADIF Export:**
   - Log4OM's ADIF export translates confirmation data through field mapping — introducing potential for missing or incorrectly mapped fields
   - The SQLite database stores confirmations natively as structured JSON (`qsoconfirmations` column): `[{"CT":"LOTW","S":"Yes","R":"Yes"}, ...]`
   - `"R": "Yes"` = Received/Confirmed; `"S": "Yes"` = Sent/Uploaded (maps cleanly to our confirmation logic)
   - Direct database read eliminates the translation layer entirely

2. **Elimination of Export Step:**
   - Log4OM users currently must: open Log4OM → File → Export → ADIF → save → switch to browser → upload
   - With SQLite import: drag `.SQLite` file directly into the analyzer
   - Better user experience, no risk of forgetting to export after new QSOs

3. **Technical Feasibility:**
   - Log4OM 2 database has a clean, stable schema with only 2 tables (`Log`, `Informations`)
   - `Log` table maps cleanly to our internal data model (all required fields present)
   - Auto-detection by file extension (`.SQLite`) — no user decision required
   - **sql.js** (Emscripten-compiled SQLite, WASM) runs 100% client-side; maintains privacy guarantee

4. **Privacy Maintained:**
   - sql.js executes entirely in the browser via WebAssembly
   - No data transmission to any server
   - File is read via `FileReader` as `ArrayBuffer` (same as ADIF, different format)

#### Schema Mapping

| Log4OM SQLite Column | Internal ADIF Equivalent | Notes |
|---|---|---|
| `dxcc` (INTEGER) | `DXCC` | Direct, no conversion |
| `country` | `COUNTRY` | Direct |
| `band` | `BAND` | Already in ADIF format (e.g., "20m") |
| `cont` | `CONT` | Direct (lookup table still takes priority) |
| `qsodate` (DATETIME) | `QSO_DATE` | Convert "2024-10-04 07:00:00Z" → "20241004" |
| `mode` | `MODE` | Direct |
| `stationcallsign` | `STATION_CALLSIGN` | Direct |
| `operator` | `OPERATOR` | Direct |
| `qsoconfirmations` (JSON) | Multiple ADIF fields | Parse `{"CT":"LOTW","R":"Yes"}` → `LOTW_QSL_RCVD=Y` |

#### Why NOT Expand to Other Logging Software Databases?

- **Hamlogger (SQLite)**: Different schema, less structured confirmation data
- **HRD (MDB/SQL Server)**: Non-standard database formats requiring additional drivers
- **N1MM+ (SQLite)**: Contest-focused schema, lacks DXCC and confirmation fields
- **WaveLog (MariaDB)**: Server-based database, not a local file

**Log4OM is the only logging program where:**
1. The database is a portable, single-file SQLite
2. The schema maps cleanly to our data model
3. Confirmations are stored as machine-readable JSON (not free-text)
4. The user base has significant overlap with DXCC chasers

**Conclusion:** Log4OM SQLite import delivers a measurably better experience for a large segment of our user base, with minimal added complexity. ADIF remains the universal format for all other logging programs.

---

## Architecture Decisions

### ✅ Single-File Component Design

**Decision Date:** 2024-02-04

**Decision:** Main application logic in a single React component (`DXCCAnalyzer.jsx`, ~1575 lines).

**Reasoning:**
1. **Portability:** Easy to copy/adapt for other projects
2. **No Build Complexity:** All logic in one place
3. **Performance:** Minimal component tree overhead
4. **Maintainability:** For this scope (~1600 lines), single-file is still manageable

**Trade-offs Accepted:**
- Longer file (but well-structured with clear sections)
- Less granular component reuse (acceptable for this application)

**When to Refactor:**
- If component exceeds ~2500 lines
- If multiple developers need to work on different features simultaneously
- If we add significantly different views (e.g., mobile app)

---

### ✅ Client-Side Only Processing (Zero Server Communication)

**Decision Date:** 2024-02-04

**Decision:** All ADIF parsing and analysis happens **100% client-side** in the browser.

**Reasoning:**
1. **Privacy-First:**
   - Ham radio logs may contain personal information
   - No data leaves user's computer
   - No server = no data breach risk

2. **Simplicity:**
   - No backend infrastructure needed
   - No API authentication
   - Static hosting (GitHub Pages, Netlify)

3. **Performance:**
   - No network latency
   - Works offline after initial load
   - Handles 100,000+ QSOs in browser

4. **Cost:**
   - Zero hosting costs for compute
   - No database maintenance

**Trade-offs Accepted:**
- Large log files (>100k QSOs) may stress older browsers
- No cloud sync capabilities
- No collaborative features

**Mitigation:**
- Use `useMemo` for expensive computations
- FileReader API for efficient file processing
- Performance tested with 172,000+ QSO logs

---

### ✅ React 18 with Hooks (No Class Components)

**Decision Date:** 2024-02-04

**Decision:** Use React 18+ functional components with Hooks exclusively.

**Reasoning:**
1. Modern React best practice
2. Better performance (concurrent features)
3. Simpler state management
4. No `this` binding issues

**Key Hooks Used:**
- `useState` - Component state
- `useMemo` - Expensive computations (parsing, filtering, sorting)
- `useEffect` - Print orchestration
- `useRef` - DOM references

---

## Feature Scope

### ✅ Pre-Analysis vs. Post-Analysis Filters

**Decision Date:** 2024-02-11 (v2.0.0)

**Decision:** Two-tier filter architecture:

**Pre-Analysis Filters** (affect `analyzedData`):
- Mode filter (SSB/CW/Digital)
- Operator filter (STATION_CALLSIGN)
- Date range filter

**Post-Analysis Filters** (affect `filteredData`):
- Search (country/DXCC/prefix)
- Status filter (All/Confirmed/Worked/Not Worked)
- Continent filter
- Confirmation platform filter
- Band filter

**Reasoning:**
1. **Performance:**
   - Mode/Operator/Date filters require full re-analysis (expensive)
   - Post-analysis filters are cheap array operations

2. **User Experience:**
   - Pre-analysis filters shown as "active filter tags"
   - Statistics update to reflect filtered dataset
   - "of X total" comparison shows unfiltered baseline

3. **Data Integrity:**
   - Most Wanted rankings adapt to mode filter (SSB rankings for SSB mode)
   - Band-specific confirmation data tracked separately

---

### ✅ Most Wanted Data Integration

**Decision Date:** 2024-02-11 (v2.0.0)

**Decision:** Integrate GDXF Most Wanted 2024 rankings with mode-dependent data.

**Data Source:** German DX Foundation (GDXF) Most Wanted 2024 - Germany
- Digital.csv (FT8, RTTY, PSK, etc.)
- CW.csv (Morse code)
- Phone.csv (SSB, AM)
- Mixed.csv (All modes)

**Reasoning:**
1. **User Value:**
   - Helps operators prioritize rare entities
   - Rankings change by mode (different challenges)

2. **Data Quality:**
   - GDXF maintains authoritative rankings
   - Updated annually
   - Based on real confirmation statistics

3. **Mode Awareness:**
   - CQ WPX rankings differ by mode
   - Mode filter automatically switches ranking source

**Trade-offs:**
- Rankings are Germany-specific (other regions have different "most wanted" lists)
- Requires manual update for new years
- Adds ~50KB to application size

**Future Consideration:**
- Add regional ranking options (US, EU, AS, etc.) if requested by users

---

### ❌ No Logbook Editing Capabilities

**Decision Date:** 2024-02-04

**Decision:** DXCC Analyzer Pro is a **read-only analysis tool**. No QSO editing, adding, or deletion.

**Reasoning:**
1. **Scope Control:**
   - Editing requires full CRUD operations
   - Undo/redo functionality
   - Data validation
   - Export back to ADIF with all fields preserved

2. **Quality Assurance:**
   - Logging programs are specialized for data entry
   - They handle field validation, dupes, time sync
   - Risk of data corruption if we modify logs

3. **User Workflow:**
   - Users maintain "source of truth" in their logging software
   - Export ADIF → analyze → return to logging software
   - Clear separation of concerns

**Exceptions:**
- CSV export of **filtered views** is allowed (read-only operation)
- Print reports (read-only operation)

---

### ❌ No QSL Card Management

**Decision Date:** 2024-02-04

**Decision:** No QSL card image upload, tracking, or bureau management features.

**Reasoning:**
1. **Out of Scope:**
   - QSL management is a complex domain
   - Requires image storage
   - Printing, labeling, mailing workflows

2. **Existing Solutions:**
   - Log4OM has excellent QSL management
   - QRZ.com Logbook
   - eQSL.cc platform

3. **Focus:**
   - Our core competency is DXCC progress visualization
   - Not card logistics

---

### ❌ No Real-Time Log Integration

**Decision Date:** 2024-02-04

**Decision:** No live integration with WSJT-X, JTDX, or contest loggers.

**Reasoning:**
1. **Complexity:**
   - Requires UDP socket listeners
   - Protocol parsing (WSJT-X uses custom UDP format)
   - Connection state management

2. **Use Case:**
   - DXCC Analyzer is for **periodic review** of progress
   - Not for real-time contest operation
   - Users reload file when they want updated analysis

3. **Existing Tools:**
   - JTAlert provides real-time DXCC alerts for WSJT-X
   - N1MM+ has built-in DXCC tracking
   - Contest loggers have live multiplier windows

**Alternative:**
- Users can export ADIF periodically and reload
- "Reload" button in header for quick re-analysis

---

## Revision History

| Date | Section | Change | Reason |
|------|---------|--------|--------|
| 2026-02-19 | File Format Support | Added Log4OM SQLite as secondary import format (v2.5.0) | Direct database import eliminates ADIF export step |
| 2026-02-12 | File Format Support | Added Cabrillo analysis and rejection | User inquiry about contest log support |
| 2026-02-12 | Initial | Document created | Capture key decisions for future reference |

---

**73 de DK9RC** 📻
