# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Amateur Radio DXCC Analyzer Pro** is a browser-based, client-side application for analyzing amateur radio logbooks in ADIF format. It visualizes DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms without server-side data transmission (100% privacy-preserving).

## Technology Stack

- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide-React
- **State Management**: React Hooks (useState, useMemo)
- **Build Tool**: Vite (recommended for fast development)
- **Language**: JavaScript/TypeScript

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

**Supported Bands**: 40m, 30m, 20m, 17m, 15m, 12m, 10m

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
      "40m": "C | W | null",
      "30m": "C | W | null",
      "20m": "C | W | null",
      "17m": "C | W | null",
      "15m": "C | W | null",
      "12m": "C | W | null",
      "10m": "C | W | null"
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

### Interactive Table Features
- **Pagination**: 15 entries per page (default)
- **Global Search**: Filter by country name or DXCC ID
- **Status Filter**: All / Confirmed Only / Worked Only
- **Sticky Headers**: Keep band columns visible while scrolling
- **Sticky Country Column**: Keep country names visible when scrolling horizontally
- **Export to CSV**: Export filtered view preserving current filters

## Performance Considerations

### Critical Performance Requirements
- Must handle logs with **>10,000 QSOs** without UI blocking
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

## File Structure (Recommended)

```
/src
  /components
    DXCCAnalyzer.jsx     # Main single-file component
  /utils
    adifParser.js        # ADIF parsing logic (if separated)
    bandMatrix.js        # Band matrix calculation
  /hooks
    useADIFParser.js     # Custom hook for file parsing
  App.jsx
  main.jsx
```

## Testing Considerations

- Test with various ADIF file sizes (100 QSOs, 1,000 QSOs, 10,000+ QSOs)
- Verify all confirmation platform fields (LOTW, eQSL, QRZ, Paper)
- Test edge cases: missing DXCC field, malformed records, unusual band designations
- Validate CSV export with filtered data
- Test sticky headers/columns on different screen sizes
