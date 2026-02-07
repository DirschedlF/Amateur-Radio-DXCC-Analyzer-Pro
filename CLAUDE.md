# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amateur Radio DXCC Analyzer Pro** (v1.5.1) is a browser-based, client-side application for analyzing amateur radio logbooks in ADIF format. It visualizes DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms without server-side data transmission (100% privacy-preserving).

## Technology Stack

- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide-React
- **Charts**: Recharts (BarChart, Heatmap)
- **State Management**: React Hooks (useState, useMemo)
- **Build Tool**: Vite (recommended for fast development)
- **Language**: JavaScript (JSX)

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

## Core Architecture

### Single-File Component Design
The application is architected as a **Single-File-Component** for maximum portability. The main component (`DXCCAnalyzer.jsx`, ~1400 lines) contains:

1. **ADIF Parser Module** - Regex-based extraction of ADIF tags
2. **Analysis Engine** - Band matrix logic and confirmation status calculation with pre-analysis filters (mode, operator, date)
3. **Display Helpers** - Context-sensitive functions (`getDisplayQsos`, `getDisplayBandStatus`, `getDisplayConfirmation`) that adapt output to active filters
4. **Chart Data Aggregation** - Memoized computation of continent breakdown, band activity, platform comparison, and band x continent heatmap data
5. **UI Components** - Dashboard, interactive table, filters, and export functionality
6. **Export Module** - CSV generation from filtered data with filter info header

### ADIF Parsing Logic

**Format Support**: `.adi` and `.adif` files

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
    "bandPlatformQsos": { "160m": { lotw: 0, eqsl: 0, qrz: 0, qsl: 0 }, ... }
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
- **Global Search**: Filter by country name or DXCC ID
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
- **Export to CSV**: Export filtered view with filter info header
- **Print Report**: A4 landscape with compact print styles, all data (no pagination)

### Visual Charts (Collapsible)
- **DXCC by Continent**: Stacked bar chart (Confirmed vs Worked)
- **Band Activity**: Stacked bar chart per band
- **Confirmation Platforms**: Horizontal bar chart (LOTW, eQSL, QRZ, Paper)
- **Band x Continent Heatmap**: Color-intensity grid
- All charts react dynamically to active filters
- Charts hidden for "Not Worked" view; only show worked entries for "All Entities"

### Container Layout
- Main container: `max-w-[1600px]` to accommodate 11 band columns + 4 confirmation columns
- Band and confirmation columns use compact padding (`px-2`) to fit on screen

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
- **FileReader API**: Read files directly from user's local filesystem
- **No Data Persistence**: Unless explicitly saved by user (localStorage optional)
- **No Analytics**: No tracking or external API calls

## Special Considerations

### DXCC Entity Lookup Table (`dxccEntities.js`)
- ~400 entities from ADIF 3.1.6 specification
- Format: `{ id: [name, continent, deleted] }` where deleted is boolean
- `lookupDXCC(id)` returns `{ name, cont, deleted }` or null
- `getAllActiveDXCC()` returns array of `{ id, name, cont }` for non-deleted entities (340 active)
- Continent from lookup table takes **priority** over ADIF `CONT` field for reliability

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
    DXCCAnalyzer.jsx     # Main single-file component (~1400 lines)
  /utils
    dxccEntities.js      # DXCC entity lookup table (ADIF 3.1.6, ~400 entities)
                         # Exports: lookupDXCC(), getAllActiveDXCC()
  /hooks                 # (empty, reserved for future custom hooks)
  App.jsx                # Root component
  main.jsx               # Entry point
  index.css              # Global styles, Tailwind directives, print styles
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
- Validate CSV export with filtered data
- Test print report fits on A4 landscape with all 11 bands
- Test sticky headers/columns on different screen sizes
- Test pagination selector (10/15/25/50/All)
- Test "Not Worked" view with and without band filter
- Test "All Entities" view shows 340 active entities
- Test DXCC Missing counter with various filter combinations
- Test "of X total" shows unfiltered values when mode/operator/date filters active
- Test date range presets (This Year, Last Year, Last 12 Months) and custom range
