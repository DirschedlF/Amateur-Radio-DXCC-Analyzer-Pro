# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amateur Radio DXCC Analyzer Pro** is a browser-based, client-side application for analyzing amateur radio logbooks in ADIF format. It visualizes DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms without server-side data transmission (100% privacy-preserving).

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
The application is architected as a **Single-File-Component** for maximum portability. The main component should contain:

1. **ADIF Parser Module** - Regex-based extraction of ADIF tags
2. **Analysis Engine** - Band matrix logic and confirmation status calculation
3. **UI Components** - Dashboard, interactive table, filters, and export functionality

### ADIF Parsing Logic

**Format Support**: `.adi` and `.adif` files

**Regex Pattern**: `<FIELDNAME:LENGTH[:TYPE]>VALUE`
- Case-insensitive field names
- Handle line breaks within records
- Use FileReader API for client-side file processing

**Critical Fields**:
- `DXCC` - Primary grouping key (DXCC Entity ID)
- `COUNTRY` - Country name (secondary, may have inconsistencies)
- `BAND` - Operating band
- `CONT` - Continent

### Confirmation Status Logic

A QSO is **confirmed** if ANY of these fields contains `Y` or `V`:
- `LOTW_QSL_RCVD` (Logbook of the World)
- `EQSL_QSL_RCVD` (eQSL.cc)
- `QSL_RCVD` (Paper QSL)
- `QRZCOM_QSL_RCVD` / `QRZ_QSL_RCVD` / `QRZCOM_QSO_DOWNLOAD_STATUS` (QRZ.com)

**Special Consideration**: Log4OM-specific ADIF extensions for QRZ confirmations must be handled.

### Band Matrix

**Supported Bands**: 160m, 80m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m

**Status Values**:
- `'C'` (Confirmed) - At least one confirmed QSO on this band for the DXCC entity
- `'W'` (Worked) - At least one QSO present, but no confirmation for this band
- `null` - No QSO on this band

### Internal Data Structure

```javascript
{
  "dxcc_id": {
    "country": "string",
    "cont": "string",
    "total": "number",
    "lotw": "boolean",    // Has LOTW confirmation
    "eqsl": "boolean",    // Has eQSL confirmation
    "qrz": "boolean",     // Has QRZ.com confirmation
    "qsl": "boolean",     // Has paper QSL confirmation
    "bands": {
      "160m": "C | W | null",
      "80m": "C | W | null",
      "40m": "C | W | null",
      "30m": "C | W | null",
      "20m": "C | W | null",
      "17m": "C | W | null",
      "15m": "C | W | null",
      "12m": "C | W | null",
      "10m": "C | W | null",
      "6m": "C | W | null"
    }
  }
}
```

## UI/UX Requirements

### Dashboard Statistics
- Total QSOs
- DXCC Worked (unique entities with at least one QSO)
- DXCC Confirmed (unique entities with at least one confirmed QSO)
- Confirmation percentage

### File Info & Reload
- Display loaded filename in header after upload
- Reload button to re-import a different file without scrolling down

### Interactive Table Features
- **Configurable Pagination**: 10 / 15 (default) / 25 / 50 / All entries per page
- **Global Search**: Filter by country name or DXCC ID
- **Status Filter**: All / Confirmed Only / Worked Only
- **Mode Filter**: SSB / CW / Digital / All
- **Operator Filter**: Filter by STATION_CALLSIGN or OPERATOR (shown only when multiple callsigns present)
- **Continent Filter**: Dynamic based on loaded data
- **Confirmation Platform Filter**: LOTW / eQSL / QRZ / Paper
- **Band Filter**: Focus on a single band
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

### Container Layout
- Main container: `max-w-[1600px]` to accommodate 10 band columns + 4 confirmation columns
- Band and confirmation columns use compact padding (`px-2`) to fit on screen

## Performance Considerations

### Critical Performance Requirements
- Must handle logs with **>100,000 QSOs** without UI blocking (tested with 172,000+)
- Use `useMemo` for expensive computations (parsing, filtering, sorting)
- Implement efficient regex patterns to avoid backtracking
- Consider Web Workers for large file parsing if needed

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

### Log4OM Integration
Handle Log4OM-specific ADIF field extensions, particularly for QRZ.com confirmation status fields.

### Data Sanitization
- Primary grouping by `DXCC` field (Entity ID) to eliminate country name inconsistencies
- Normalize band designations (handle variations like "20M", "20m", "14MHz")
- Handle missing or malformed ADIF fields gracefully

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
    DXCCAnalyzer.jsx     # Main single-file component (~1200 lines)
  /utils
    dxccEntities.js      # DXCC entity lookup table (ADIF 3.1.6, ~400 entities)
  /hooks                 # (empty, reserved for future custom hooks)
  App.jsx                # Root component
  main.jsx               # Entry point
  index.css              # Global styles, Tailwind directives, print styles
```

## Print Styles (index.css)

- `@page`: A4 landscape, 1cm margins
- Table: 9px font, 3px/4px padding, compact 18px status circles
- Container: `max-width: 100%`, overflow visible (no clipping)
- Print-only rows via `.print-show` class (screen-hidden, print-visible)
- Interactive elements hidden via `print:hidden` Tailwind class
- Footer: "Generated by DXCC Analyzer Pro - 73 de DK9RC"

## Testing Considerations

- Test with various ADIF file sizes (100 QSOs, 1,000 QSOs, 100,000+ QSOs)
- Test data in `.testdata/` directory (git-ignored)
- Verify all confirmation platform fields (LOTW, eQSL, QRZ, Paper)
- Test edge cases: missing DXCC field, malformed records, unusual band designations
- Validate CSV export with filtered data
- Test print report fits on A4 landscape with all 10 bands
- Test sticky headers/columns on different screen sizes
- Test pagination selector (10/15/25/50/All)
