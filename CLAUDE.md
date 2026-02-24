# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amateur Radio DXCC Analyzer Pro** (v2.8.0) is a browser-based, client-side application for analyzing amateur radio logbooks in ADIF format, Log4OM SQLite databases, Ham Radio Deluxe (HRD) databases, and DXKeeper Access databases. It visualizes DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms without server-side data transmission (100% privacy-preserving).

## Technology Stack

- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide-React
- **Charts**: Recharts (BarChart, AreaChart, Heatmap)
- **Maps**: Leaflet 1.9.4 + react-leaflet 4.x — interactive DXCC World Map with OpenStreetMap tiles
- **State Management**: React Hooks (useState, useMemo)
- **Build Tool**: Vite (recommended for fast development)
- **Language**: JavaScript (JSX)
- **SQLite Engine**: sql.js (Emscripten/WASM) — bundled locally via npm, no CDN/network dependency
- **Access Engine**: mdb-reader (pure JS) — reads DXKeeper `.mdb`/`.accdb` files; no WASM, works in standalone build

## Development Commands

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Build Standalone HTML (single self-contained file)
```bash
BUILD_MODE=singlefile npm run build
```
Output: `dist-standalone/index.html` — all JS and CSS inlined, no server required.
Used for the GitHub Release asset (`DXCC-Analyzer-Pro-vX.X.X-standalone.html`).

**Note:** The standalone build supports **ADIF import only**. SQLite/Log4OM import is disabled because the sql.js WASM binary (~1.1 MB) cannot be inlined into a single HTML file. The `__SINGLEFILE__` build flag (injected via Vite `define`) controls this: file picker hides `.sqlite`, upload handler shows a hint directing users to the hosted version or ADIF export.

## Core Architecture

### Single-File Component Design
The application is architected as a **Single-File-Component** for maximum portability. The main component (`DXCCAnalyzer.jsx`, ~2200 lines) contains:

1. **ADIF Parser Module** - Regex-based extraction of ADIF tags
2. **SQLite Parser Module** - Log4OM (`.SQLite`) and HRD (`.hrdsql`) database reader via sql.js WASM (auto-detected by table names)
3. **Analysis Engine** - Band matrix logic and confirmation status calculation with pre-analysis filters (mode, operator, date)
4. **Display Helpers** - Context-sensitive functions (`getDisplayQsos`, `getDisplayBandStatus`, `getDisplayConfirmation`) that adapt output to active filters
5. **Chart Data Aggregation** - Memoized computation of continent breakdown, band activity, platform comparison, band x continent heatmap data (respects column visibility), cumulative DXCC progress over time (`progressData` useMemo), and geographic map data (`mapData` useMemo)
6. **UI Components** - Dashboard, interactive table, filters, and export functionality
7. **Export Module** - CSV (RFC-4180 compliant), JSON, and ADIF export from filtered data
8. **Share Module** - URL-based filter state encoding/decoding via Base64 (`buildShareUrl`, `handleShare`, URL-restore `useEffect`)
9. **Column Config Module** - Persistent band/confirmation column visibility via `localStorage` (`hiddenColumns`, `toggleColumn`, `visibleBands`, `visibleConfirm`)

### ADIF Parsing Logic

**Format Support**: `.adi` and `.adif` files

### SQLite Database Parsing (v2.5.0+)

**Supported Formats**: Log4OM 2 (`.SQLite`) and Ham Radio Deluxe (`.hrdsql`)

**Auto-Detection**: File extensions `.sqlite` or `.hrdsql` (case-insensitive) trigger the SQLite code path. The database type is then auto-detected by table names:

- Table `Log` → Log4OM parser
- Table `TABLE_HRD_CONTACTS_V07` → HRD parser

**Library**: `sql.js` — Emscripten-compiled SQLite3 running as WebAssembly in the browser. Bundled locally as npm dependency; WASM binary served via Vite `?url` import. No CDN or network access required — consistent with the project's zero-network privacy guarantee.

**Safety**: Database is opened read-only (`PRAGMA query_only = ON`) and integrity-checked (`PRAGMA integrity_check`) before reading. The original file is never modified. Database is always closed in a `finally` block.

**Schema Discovery**: Column names are discovered dynamically via `PRAGMA table_info()` with case-insensitive matching. This ensures compatibility across software versions even if column casing changes. Column index is built from the SELECT order (npm sql.js builds may omit `result[0].columns`).

**Architecture**: Shared helpers `openSQLiteDB()` and `discoverColumns()` handle database setup and schema discovery. Format-specific parsers `parseLog4OM()` and `parseHRD()` handle the data extraction. Both return the same QSO array format as `parseADIF()`.

#### Log4OM Parser

**Tables Used**: Only `Log` table is read (97 columns). `Informations` table is ignored.

**Field Mapping**:
| SQLite Column | Maps To | Conversion |
|---|---|---|
| `dxcc` (INTEGER) | `DXCC` | `.toString()` |
| `country` | `COUNTRY` | Direct |
| `band` | `BAND` | Already ADIF format (e.g., `"20m"`) |
| `cont` | `CONT` | Direct (lookup table still takes priority) |
| `qsodate` (ISO datetime) | `QSO_DATE` | `"2024-10-04 07:00:00Z"` → `"20241004"` |
| `mode` | `MODE` | Direct |
| `stationcallsign` | `STATION_CALLSIGN` | Direct |
| `operator` | `OPERATOR` | Direct |
| `qsoconfirmations` (JSON) | Multiple fields | Parse array; `{"CT":"LOTW","R":"Yes"}` → `LOTW_QSL_RCVD=Y` |

**Confirmation JSON Mapping** (from `qsoconfirmations` column):
```javascript
// CT values → internal field names
const CT_MAP = {
  'LOTW':   'LOTW_QSL_RCVD',
  'EQSL':   'EQSL_QSL_RCVD',
  'QSL':    'QSL_RCVD',
  'QRZCOM': 'QRZCOM_QSL_RCVD',
};
// "R": "Yes" → field = "Y", "R": "No" → field = "N"
```

#### HRD Parser (v2.5.1+)

**Tables Used**: `TABLE_HRD_CONTACTS_V07` (207 columns). Column naming follows `COL_<ADIF_FIELD_NAME>` pattern.

**Field Mapping**:

| HRD Column | Maps To | Conversion |
| --- | --- | --- |
| `COL_DXCC` (TEXT) | `DXCC` | Direct (already string) |
| `COL_COUNTRY` | `COUNTRY` | Direct |
| `COL_BAND` | `BAND` | Already ADIF format (e.g., `"40m"`) |
| `COL_CONT` | `CONT` | Direct (lookup table still takes priority) |
| `COL_QSO_DATE` (DATE) | `QSO_DATE` | `"2024-10-08"` → `"20241008"` (remove hyphens) |
| `COL_MODE` | `MODE` | Direct |
| `COL_STATION_CALLSIGN` | `STATION_CALLSIGN` | Direct |
| `COL_OPERATOR` | `OPERATOR` | Direct |
| `COL_LOTW_QSL_RCVD` | `LOTW_QSL_RCVD` | Direct (`Y`/`V`/`N`) |
| `COL_EQSL_QSL_RCVD` | `EQSL_QSL_RCVD` | Direct |
| `COL_QSL_RCVD` | `QSL_RCVD` | Direct |
| `COL_QRZCOM_QSO_DOWNLOAD_STATUS` | `QRZCOM_QSO_DOWNLOAD_STATUS` | Direct (this is QRZ confirmation, not upload) |

**Key difference from Log4OM**: HRD stores confirmations as individual columns (standard ADIF field names with `COL_` prefix) — no JSON parsing needed.

**Output**: `parseSQLiteFile(arrayBuffer)` returns the same QSO array format as `parseADIF()`, so the analysis engine (`analyzeQSOs()`) requires zero changes.

### DXKeeper Access Database Parsing (v2.6.0+)

**Supported Formats**: DXKeeper `.mdb` (Access 97–2003) and `.accdb` (Access 2010–2019)

**Auto-Detection**: File extension `.mdb` or `.accdb` (case-insensitive) triggers the DXKeeper code path.

**Library**: `mdb-reader` — pure JavaScript Microsoft Access reader, no WebAssembly required. Works in standalone build. Requires `Buffer` polyfill (`buffer` npm package) set globally via `main.jsx`. `process` polyfill set via inline `<script>` in `index.html`.

**Safety / Read-Only Guarantee**: The DXKeeper database is never modified:

- The browser `FileReader.readAsArrayBuffer()` creates a complete in-memory copy; no file handle is retained after reading.
- mdb-reader parses the Access binary format in pure JavaScript — it does NOT use the Windows Jet/ACE engine, so no lock files (`.ldb`/`.laccdb`) are created and no write-back to disk occurs.
- Verified: `mtime` (content modification time) and `ctime` (metadata change time) are unchanged after import. Only `atime` (OS-level read marker) may be updated by the OS at the filesystem level, which is outside application control.
- Contrast with SQLite: sql.js requires explicit `PRAGMA query_only = ON` because SQLite has journaling/WAL mechanisms; mdb-reader has no write capability at all.

**Table Used**: `QSOs` (126 columns). `QSO_Begin` is a JavaScript `Date` object; DXKeeper uses year 4000 as null-date placeholder (skipped).

**Field Mapping**:

| Access Column | Maps To | Conversion |
| --- | --- | --- |
| `DXCCID` (INTEGER) | `DXCC` | `.toString()` |
| `Band` | `BAND` | Lowercase (`"17M"` → `"17m"`) |
| `QSO_Begin` (Date) | `QSO_DATE` | UTC date → `"YYYYMMDD"`; skip if year ≥ 3000 |
| `Mode` | `MODE` | Direct |
| `CONT` | `CONT` | Direct (lookup table still takes priority) |
| `STATION_CALLSIGN` | `STATION_CALLSIGN` | Direct |
| `Operator` | `OPERATOR` | Direct |
| `APP_DXKeeper_LotW_QSL_RCVD` | `LOTW_QSL_RCVD` | Direct (`Y`/`R`/`N`) |
| `APP_DXKeeper_EQSL_QSL_RCVD` | `EQSL_QSL_RCVD` | Direct |
| `QSL_Rcvd` | `QSL_RCVD` | Direct |
| `APP_DXKeeper_QRZcom_QSL_Rcvd` | `QRZCOM_QSL_RCVD` | Direct |

**Key difference from HRD/Log4OM**: `COUNTRY` not stored — resolved from `lookupDXCC(DXCCID)` in `analyzeQSOs()`. `R` = Requested (not confirmed); only `Y`/`V` count as confirmed (handled by existing `isConfirmed()`).

**Browser Polyfills** (required by mdb-reader's dependencies `cipher-base`, `readable-stream`):

- `process` global: inline `<script>` in `index.html` (runs before any module)
- `Buffer` global: static import in `src/main.jsx` → `globalThis.Buffer = Buffer`

**Output**: `parseDXKeeperFile(arrayBuffer)` returns the same QSO array format as `parseADIF()`.

**Regex Pattern**: `<FIELDNAME:LENGTH[:TYPE]>VALUE`
- Case-insensitive field names
- Handle line breaks within records
- Respect ADIF declared field length to avoid capturing extra data
- Use FileReader API for client-side file processing

**Critical Fields**:
- `DXCC` - Primary grouping key (DXCC Entity ID)
- `COUNTRY` - Country name (secondary, may have inconsistencies; resolved from lookup table if missing)
- `BAND` - Operating band
- `CONT` - Continent (lookup table takes priority over ADIF data for reliability)
- `QSO_DATE` - QSO date in YYYYMMDD format (for date range filtering)
- `MODE` - Operating mode (for mode categorization: SSB, CW, Digital)
- `STATION_CALLSIGN` / `OPERATOR` - Operator callsign (for operator filtering)

### Confirmation Status Logic

A QSO is **confirmed** if ANY of these fields contains `Y` or `V`:
- `LOTW_QSL_RCVD` (Logbook of the World)
- `EQSL_QSL_RCVD` (eQSL.cc)
- `QSL_RCVD` (Paper QSL)
- `QRZCOM_QSL_RCVD` / `QRZ_QSL_RCVD` / `QRZCOM_QSO_DOWNLOAD_STATUS` (QRZ.com)

**Important**: `QRZCOM_QSO_UPLOAD_STATUS` is intentionally **excluded** - it only means "uploaded to QRZ", not "confirmed by QRZ". Upload ≠ Confirmation.

**Special Consideration**: Log4OM-specific ADIF extensions for QRZ confirmations must be handled.

### Band Matrix

**Supported Bands**: 160m, 80m, 60m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m (11 bands)

**Status Values**:
- `'C'` (Confirmed) - At least one confirmed QSO on this band for the DXCC entity
- `'W'` (Worked) - At least one QSO present, but no confirmation for this band
- `null` - No QSO on this band

### Filter Architecture

Filters are organized in two layers:

**Pre-Analysis Filters** (applied inside `analyzeQSOs()`, affect `analyzedData`):
- Mode filter (SSB, CW, Digital)
- Operator filter (STATION_CALLSIGN)
- Date range filter (presets + custom range)

**Post-Analysis Filters** (applied in `filteredData` useMemo):
- Search (country name or DXCC ID)
- Status filter (All, Confirmed, Worked Only, Not Worked, All Entities)
- Continent filter
- Confirmation platform filter (LOTW, eQSL, QRZ, Paper)
- Band filter

### Statistics Architecture

Three levels of statistics:

1. **`unfilteredStats`** - Absolute totals with NO filters applied (computed from raw `logData`). Used for "of X total" comparison display.
2. **`stats`** - Pre-analysis filtered totals (mode/operator/date applied). Used as the base dashboard values.
3. **`filteredStats`** - Post-analysis filtered totals (all filters applied). Shown when filters are active.

### Not Worked / All Entities

- **`missingDXCC`** useMemo builds entries for active DXCC entities not in `analyzedData`, with empty band structures (total: 0, all bands: null)
- **Not Worked + Band Filter**: Includes both globally missing entities AND entities that exist in `analyzedData` but have `null` on the filtered band
- **All Entities**: Merges `analyzedData` entries with `missingDXCC` entries
- Charts hide for "Not Worked" view; for "All Entities" they only show worked entries

### DXCC Missing Calculation

- Global: `getAllActiveDXCC().length - Object.keys(analyzedData).length`
- Band-sensitive (when band filter active): `totalActive - entities with activity on that band`
- Always uses `Math.max(0, ...)` to prevent negative values from deleted entities in log

### Internal Data Structure

```javascript
{
  "dxcc_id": {
    "country": "string",
    "cont": "string",
    "deleted": "boolean",        // Deleted DXCC entity flag
    "prefix": "string",          // Main callsign prefix (e.g., "VE", "P5", "BS7")
    "mostWantedRank": "number",  // Most Wanted ranking (1-340, 1=most wanted)
    "total": "number",
    "lotw": "boolean",           // Has LOTW confirmation
    "eqsl": "boolean",           // Has eQSL confirmation
    "qrz": "boolean",            // Has QRZ.com confirmation
    "qsl": "boolean",            // Has paper QSL confirmation
    "bands": {
      "160m": "C | W | null",
      "80m": "C | W | null",
      "60m": "C | W | null",
      "40m": "C | W | null",
      "30m": "C | W | null",
      "20m": "C | W | null",
      "17m": "C | W | null",
      "15m": "C | W | null",
      "12m": "C | W | null",
      "10m": "C | W | null",
      "6m": "C | W | null"
    },
    "bandQsos": { "160m": 0, ... },
    "bandConfirmations": { "160m": { lotw: false, eqsl: false, qrz: false, qsl: false }, ... },
    "platformQsos": { "lotw": 0, "eqsl": 0, "qrz": 0, "qsl": 0 },
    "bandPlatformQsos": { "160m": { lotw: 0, eqsl: 0, qrz: 0, qsl: 0 }, ... },
    "lastQso": "YYYYMMDD",           // Most recent QSO date (global)
    "lastQsoCall": "string",         // Callsign of most recent QSO
    "lastQsoBand": "string",         // Band of most recent QSO
    "bandLastQso": { "20m": "YYYYMMDD", ... },     // Most recent QSO date per band
    "bandLastQsoCall": { "20m": "string", ... },   // Callsign of most recent QSO per band
    "firstQso": "YYYYMMDD",          // Earliest QSO date (global) — for progress chart
    "firstConfirmedDate": "YYYYMMDD",// Earliest confirmed QSO date — reserved for future use
    "bandFirstQso": { "20m": "YYYYMMDD", ... }     // Earliest QSO date per band — for band-filtered progress chart
  }
}
```

## UI/UX Requirements

### Dashboard Statistics (5 cards)
- Total QSOs
- DXCC Worked (unique entities with at least one QSO)
- DXCC Confirmed (unique entities with at least one confirmed QSO)
- DXCC Missing (active entities not yet worked, filter-aware)
- Confirmation Rate (percentage)
- "of X total" comparison shows absolute unfiltered totals when filters narrow results

### File Info & Reload
- Display loaded filename in header after upload
- Reload button to re-import a different file without scrolling down

### Interactive Table Features
- **Configurable Pagination**: 10 / 15 (default) / 25 / 50 / All entries per page
- **Global Search**: Filter by country name, DXCC ID, or callsign prefix (e.g., "VE", "P5", "BS7")
- **Status Filter**: All / Confirmed Only / Worked Only / Not Worked / All Entities (5 buttons)
- **Mode Filter**: SSB / CW / Digital / All (pre-analysis filter)
- **Operator Filter**: Filter by STATION_CALLSIGN or OPERATOR (shown only when multiple callsigns present)
- **Continent Filter**: Dynamic based on loaded data + lookup table
- **Confirmation Platform Filter**: LOTW / eQSL / QRZ / Paper
- **Band Filter**: Focus on a single band (160m-6m)
- **Date Range Filter**: Presets (This Year, Last Year, Last 12 Months) + custom date range (pre-analysis filter)
- **Active Filter Tags**: Visual chips with individual remove and "Reset All"
- **Column Sorting**: All columns sortable, smart default direction (desc for bands/platforms/QSOs, asc for text)
- **Sticky Headers**: Keep band columns visible while scrolling
- **Sticky Country Column**: Keep country names visible when scrolling horizontally
- **Export to CSV**: RFC-4180 compliant export with filter info header (handles country names with commas)
- **Export to JSON**: Export filtered entity data as JSON for external tools
- **Export to ADIF**: Export QSOs of filtered entities as ADIF file
- **Export to Obsidian**: Export DXCC entities as a ZIP file containing Obsidian Flavored Markdown notes. ZIP contents:
  - `DXCC/` — one `.md` per worked entity with YAML frontmatter (dxcc_id, status, QSL flags, wikipedia URL, tags), Obsidian callouts, band status table with last QSO dates, and QSL platform icons. No Notes section (intentionally omitted to allow safe re-export without overwriting user content).
  - `DXCC Overview.md` — summary with top 10 table and full entity list with wikilinks
  - `DXCC Overview - Not Worked.md` — all active entities not yet worked, grouped by continent with DXCC#, name, and Wikipedia link
  - `DXCC Dataview Queries.md` — 6 ready-to-use Dataview queries (unconfirmed, by continent, top 20, no LoTW, Wikipedia links, timeline)
  - All files safe to re-export and overwrite; respects all active filters.
- **Share Link**: Copy URL with all active filters Base64-encoded; restores exact view on load (`Ctrl+Shift+S`)
- **Column Configuration**: Show/hide individual band and confirmation columns; settings persist in `localStorage`
- **Persistent Pagination**: Selected rows-per-page (10/15/25/50/All) saved to `localStorage` (`dxcc-items-per-page`), restored on next load
- **Keyboard Shortcuts**: `/` focuses search, `Esc` clears search, `←`/`→` navigate pages, `Ctrl+Shift+S` copies share link
- **Print Report**: A4 landscape with compact print styles, all data (no pagination)

### Visual Charts (Collapsible)
- **DXCC by Continent**: Stacked bar chart (Confirmed vs Worked)
- **Band Activity**: Stacked bar chart per band
- **Confirmation Platforms**: Horizontal bar chart (LOTW, eQSL, QRZ, Paper)
- **Band x Continent Heatmap**: Color-intensity grid
- **DXCC World Map** *(NEW in v2.8.0)* - Interactive geographic visualization of all DXCC entities
  - Leaflet.js map with OpenStreetMap tiles (privacy-friendly)
  - Color-coded CircleMarkers: Green (Confirmed), Amber (Worked), Red (Most Wanted not worked), Gray (Not worked)
  - All 338 active DXCC entities with accurate coordinates from [dxcc-world-map](https://github.com/amazingproducer/dxcc-world-map) GeoJSON
  - Hover tooltips showing entity name, DXCC ID, continent, status, QSO count, last QSO date/callsign, Most Wanted rank
  - Fullscreen mode with toggle button (Maximize2/X icons from lucide-react)
  - Uniform 8px markers (no animation for clarity)
  - Fully filter-reactive: responds to mode, band, continent, platform, search, and status filters
  - Data source: `mapData` useMemo computed from filtered `analyzedData` entries
  - Component: `DXCCWorldMap.jsx` with coordinates utility `dxccCoordinates.js`
  - Dark theme styling with `.leaflet-container-dark` and `.dxcc-marker-tooltip` classes
  - Print mode support with reduced height
  - Rendered below chart grid, before Progress Over Time chart
- **DXCC Progress Over Time**: Cumulative AreaChart — new DXCC entities worked over time (v2.7.0)
  - Full-width chart rendered **outside** the 2-column `.chart-section` grid (avoids Chrome `grid-column: span` + `page-break-before` rendering bug)
  - `type="linear"` (no dots, `dot={false}`) with amber fill gradient
  - Auto-granularity: monthly when log spans ≤ 3 years, yearly when span > 3 years
  - Zero-point prepended one period before first QSO so curve always starts at 0
  - **Filter behaviour**: Respects Mode, Operator, Band, Continent filters
  - **Intentionally ignores the Date Range filter** — always shows full log history so the award journey remains visible regardless of the table's date zoom
  - Data source: `progressData` useMemo computed directly from `logData.qsos` (not `analyzedData`) to bypass the date pre-filter
  - `analyzeQSOs()` additionally tracks `firstQso` and `firstConfirmedDate` per entity for this chart
  - **Print fix**: `ResponsiveContainer` gets explicit `width={1040}` in print mode (instead of `"100%"`) to bypass ResizeObserver timing — Recharts SVGs have no `viewBox`, so CSS `max-width` alone cannot reliably constrain SVG dimensions before `window.print()` fires
- All charts (except Progress) react dynamically to active filters
- Charts hidden for "Not Worked" view; only show worked entries for "All Entities"

### Container Layout
- Main container: `max-w-[1800px]` to accommodate all columns:
  - Text columns: Country, DXCC ID, Prefix, MW Rank, Continent, QSOs (6 columns)
  - Band columns: 160m-6m (11 columns)
  - Confirmation columns: LOTW, eQSL, QRZ, Paper (4 columns)
  - **Total: 21 columns**
- Band and confirmation columns use compact padding (`px-2`) to fit on screen
- Prefix and MW Rank columns use medium padding (`px-3`)

## Performance Considerations

### Critical Performance Requirements
- Must handle logs with **>100,000 QSOs** without UI blocking (tested with 172,000+)
- Use `useMemo` for expensive computations (parsing, filtering, sorting)
- Implement efficient regex patterns to avoid backtracking
- `unfilteredStats` is computed once from raw logData (not re-computed on filter changes)

### Optimization Tips
- Parse ADIF files incrementally if possible
- Cache parsed results in state
- Debounce search input
- Virtualize table rows for very large datasets (react-window or similar)

## Privacy & Security

- **No Server Communication**: All processing happens client-side
- **No Network Access**: Zero runtime network requests — all dependencies (including sql.js WASM) are bundled locally
- **FileReader API**: Read files directly from user's local filesystem
- **Read-Only Database Access**: SQLite files opened with `PRAGMA query_only = ON` and integrity-checked before use
- **No Data Persistence**: Unless explicitly saved by user (localStorage optional)
- **No Analytics**: No tracking or external API calls

## Special Considerations

### DXCC Entity Lookup Table (`dxccEntities.js`)
- ~400 entities from ADIF 3.1.6 specification
- Format: `{ id: [name, continent, deleted, wikipediaSlug] }` where deleted is boolean and wikipediaSlug is either a string (exact Wikipedia article slug) or null (auto-generate from name)
- `lookupDXCC(id)` returns `{ name, cont, deleted }` or null
- `getAllActiveDXCC()` returns array of `{ id, name, cont }` for non-deleted entities (340 active)
- `getWikipediaUrl(id)` returns full `https://en.wikipedia.org/wiki/...` URL; uses slug if set, otherwise auto-generates from entity name
- Continent from lookup table takes **priority** over ADIF `CONT` field for reliability
- Wikipedia slugs manually curated for all problematic cases (abbreviations, special characters, historical names, disambiguation)

### Most Wanted Data Integration (`mostWantedData.js`)
- **Data Source**: GDXF Most Wanted 2024 - Germany (https://gdxf.de/mostwanted/index.php?year=2024) by German DX Foundation (4 CSV files)
  - `Digital.csv` - FT8, FT4, RTTY, PSK, and other digital modes
  - `CW.csv` - Morse code rankings
  - `Phone.csv` - SSB, AM voice modes
  - `Mixed.csv` - All modes combined
- **CSV Format**: Rank, Prefix, Entity, ADIF Code, Needed %
- **Rankings**: 1-340 (1 = most wanted, 340 = least wanted)
- **Mode-Dependent**: Rankings automatically switch based on active mode filter
  - Mode filter "All" → uses Mixed.csv
  - Mode filter "SSB" → uses Phone.csv
  - Mode filter "CW" → uses CW.csv
  - Mode filter "Digital" → uses Digital.csv
- **Exported Functions**:
  - `getMostWantedData(dxccId, mode)` - Returns `{ prefix, rank, neededPercent }`
  - `getDXCCPrefix(dxccId, mode)` - Returns callsign prefix only
  - `getMostWantedRank(dxccId, mode)` - Returns rank only
- **Fallback Logic**: If DXCC not found in specified mode, searches other modes
- **Table Display**:
  - "Prefix" column shows main callsign prefix (e.g., P5, BS7, VE)
  - "MW Rank" column shows Most Wanted ranking number
  - Both columns sortable (rank sorts ascending by default - lower is better)
  - Entities without data show "-"

### Log4OM Integration
Handle Log4OM-specific ADIF field extensions, particularly for QRZ.com confirmation status fields (`QRZ_QSL_RCVD`, `QRZCOM_QSO_DOWNLOAD_STATUS`).

### Data Sanitization
- Primary grouping by `DXCC` field (Entity ID) to eliminate country name inconsistencies
- Normalize band designations (handle variations like "20M", "20m", "14MHz")
- Handle missing or malformed ADIF fields gracefully
- Deleted DXCC entities are marked but not counted towards "Missing"

### Mode Categorization
- **SSB**: USB, LSB, AM
- **CW**: Morse code (CW)
- **Digital**: FT8, FT4, VARA HF, RTTY, PSK31, PSK63, JT65, JT9, WINMOR, ARDOP, PACTOR, and other HF digital modes
- **Unknown**: VHF/UHF modes (FM, DMR) and other modes not categorized above

## Common Development Patterns

### ADIF Tag Extraction Example
```javascript
const adifTagRegex = /<(\w+):(\d+)(?::(\w))?>([^<]*)/gi;
```

### Confirmation Check Pattern
```javascript
const isConfirmed = (qso) => {
  const confirmFields = [
    'LOTW_QSL_RCVD',
    'EQSL_QSL_RCVD',
    'QSL_RCVD',
    'QRZCOM_QSL_RCVD',
    'QRZ_QSL_RCVD',
    'QRZCOM_QSO_DOWNLOAD_STATUS'
    // QRZCOM_QSO_UPLOAD_STATUS intentionally excluded
  ];
  return confirmFields.some(field =>
    ['Y', 'V'].includes(qso[field]?.toUpperCase())
  );
};
```

## File Structure

```
/src
  /components
    DXCCAnalyzer.jsx     # Main single-file component (~2200 lines)
    DXCCWorldMap.jsx     # Interactive DXCC World Map component (v2.8.0)
                         # Leaflet map with color-coded markers, fullscreen mode
  /utils
    dxccEntities.js      # DXCC entity lookup table (ADIF 3.1.6, ~400 entities)
                         # Format: { id: [name, continent, deleted, wikipediaSlug] }
                         # Exports: lookupDXCC(), getAllActiveDXCC(), getWikipediaUrl()
    dxccCoordinates.js   # Geographic coordinates for 338 active DXCC entities (v2.8.0)
                         # Source: dxcc-world-map GeoJSON (amazingproducer)
                         # Exports: getCoordinates(), hasSpecificCoordinates(), CONTINENT_FALLBACKS
    mostWantedData.js    # Most Wanted DXCC rankings (GDXF data)
                         # Exports: getMostWantedData(), getDXCCPrefix(), getMostWantedRank()
    Digital.csv          # Most Wanted rankings for digital modes (340 entities)
    CW.csv               # Most Wanted rankings for CW (340 entities)
    Phone.csv            # Most Wanted rankings for SSB/Phone (340 entities)
    Mixed.csv            # Most Wanted rankings for all modes (340 entities)
  /hooks                 # (empty, reserved for future custom hooks)
  App.jsx                # Root component
  main.jsx               # Entry point
  index.css              # Global styles, Tailwind directives, print styles, Leaflet dark theme
```

## Print Styles (index.css)

- `@page`: A4 landscape, 0.5cm margins
- Table: 7px font, 1px/2px padding, compact 14px status circles, `table-layout: fixed`
- Container: `max-width: 100%`, overflow visible (no clipping)
- Statistics cards: 5-column grid with compact padding
- Print-only rows via `.print-show` class (screen-hidden, print-visible)
- Interactive elements hidden via `print:hidden` Tailwind class
- Footer: "Generated by DXCC Analyzer Pro - 73 de DK9RC"

## Testing Considerations

- Test with various ADIF file sizes (100 QSOs, 1,000 QSOs, 100,000+ QSOs)
- Test data in `.testdata/` directory (git-ignored)
- Verify all confirmation platform fields (LOTW, eQSL, QRZ, Paper)
- Test edge cases: missing DXCC field, malformed records, unusual band designations
- Validate CSV export with filtered data; verify RFC-4180 escaping for country names with commas
- Validate JSON export contains correct entity structure
- Validate ADIF export can be re-imported into logging software
- Test Share Link: copy URL, open in new tab, verify all filters restored correctly
- Test Column Config: hide bands, verify charts and table update; reload page, verify settings persist
- Test Keyboard Shortcuts: `/` (focus search), `Esc` (clear search), `←`/`→` (pagination), `Ctrl+Shift+S` (share)
- Test print report fits on A4 landscape with all 11 bands (or fewer when bands hidden)
- Test sticky headers/columns on different screen sizes
- Test pagination selector (10/15/25/50/All); verify selection persists after page reload
- Test "Not Worked" view with and without band filter
- Test "All Entities" view shows 340 active entities
- Test DXCC Missing counter with various filter combinations
- Test "of X total" shows unfiltered values when mode/operator/date filters active
- Test date range presets (This Year, Last Year, Last 12 Months) and custom range
