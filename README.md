# Amateur Radio DXCC Analyzer Pro

A high-performance, browser-based application for analyzing amateur radio logbooks in ADIF format. Track your DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms with complete privacy - all processing happens client-side.

**Developed by Fritz (DK9RC)**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)

## Features

### Complete Privacy
- **100% Client-Side Processing** - Your logbook data never leaves your browser
- **No Server Communication** - No uploads, no tracking, no data storage
- **Secure by Design** - Uses browser's FileReader API for local file access

### Comprehensive Analysis
- **Multi-Band Tracking** - Analyze 160m, 80m, 60m, 40m, 30m, 20m, 17m, 15m, 12m, 10m, 6m bands
- **Confirmation Platforms** - Track confirmations from LOTW, eQSL, QRZ.com, and Paper QSL
- **Smart Status Detection** - Automatic detection of 'Confirmed' vs 'Worked' status
- **DXCC Entity Grouping** - Primary grouping by DXCC ID to eliminate country name inconsistencies
- **Built-in DXCC Lookup Table** - Resolves country names and continents from DXCC codes when ADIF fields are missing (ADIF 3.1.6 compliant, ~400 entities)
- **Deleted Entity Detection** - Identifies and marks deleted DXCC entities (e.g. German Democratic Republic, Canal Zone)
- **Context-Sensitive Display** - QSO counts, band status, and confirmation indicators adapt dynamically to active filters

### Advanced Filtering System
- **Search** - Filter by country name or DXCC ID
- **Status Filter** - View All / Confirmed Only / Worked Only / Not Worked / All Entities
- **Mode Filter** - Filter by operating mode (SSB, CW, Digital)
- **Operator Filter** - Filter by station callsign (e.g. DK9RC vs. 9A/DK9RC), shown only when multiple callsigns are present in the log
- **Continent Filter** - Filter by continent (EU, NA, AF, SA, AS, OC)
- **Confirmation Platform Filter** - Filter by LOTW, eQSL, QRZ, or Paper
- **Band Filter** - Focus analysis on a single band (160m-6m)
- **Date Range Filter** - Analyze specific time periods with presets (This Year, Last Year, Last 12 Months) or custom date range
- **Active Filter Tags** - Visual chips showing active filters with individual remove buttons and "Reset All"
- **Intelligent Filter Interaction** - Filters work together contextually: band status respects platform filter, confirmation checkmarks respect band filter, QSO counts respect both

### Column Sorting
- **All Columns Sortable** - Click any column header to sort
- **Smart Default Direction** - Bands, platforms, and QSOs start descending (C/checkmark/highest first); text columns start ascending
- **Visual Sort Indicators** - Chevron icons show current sort column and direction

### Visual Charts & Graphs
- **DXCC by Continent** - Stacked bar chart showing Confirmed vs Worked entities per continent
- **Band Activity** - Stacked bar chart visualizing DXCC coverage across all HF bands
- **Confirmation Platforms** - Horizontal bar chart comparing LOTW, eQSL, QRZ, and Paper confirmations
- **Band × Continent Heatmap** - Color-intensity grid revealing gaps in your DXCC coverage
- **Filter-Reactive** - All charts update dynamically when filters are applied
- **Collapsible** - Toggle charts on/off via "Show Charts" button
- **Print Charts** - Dedicated button to print all 4 charts in a 2×2 grid on a single A4 landscape page
- **Charts in Print Report** - When charts are visible, "Print Report" includes charts as the first page before the data table

### Interactive Dashboard
- **Real-Time Statistics** - Total QSOs, DXCC Worked, DXCC Confirmed, DXCC Missing, Confirmation Rate
- **DXCC Missing Counter** - Shows how many active DXCC entities have not yet been worked (filter-aware)
- **Not Worked View** - Display only the DXCC entities you haven't worked yet
- **All Entities View** - Combined view of worked and not-worked entities for a complete DXCC overview
- **Filter-Aware Dashboard** - All five statistics update dynamically when filters are active
- **Comparison Display** - Shows "of X total" with absolute unfiltered totals when filters narrow the results
- **Results Counter** - "Showing X of Y entities" below the controls

### Modern Interface
- **Sticky Headers** - Keep columns visible while scrolling
- **Sticky Country Column** - Keep country names visible when scrolling horizontally
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Configurable Pagination** - Choose 10, 15, 25, 50, or All entries per page
- **File Info & Reload** - Displays loaded filename with quick reload button for re-importing

### High Performance
- **Optimized for Large Logs** - Tested with 180,000+ QSOs with smooth performance
- **Efficient Parsing** - Regex-based ADIF tag extraction
- **Smart Memoization** - React hooks for performance optimization
- **Instant Results** - Real-time analysis and visualization

### Export & Print
- **CSV Export** - Download your analysis with current filters applied and filter info header
- **Print Report** - Professional print-friendly reports (A4 landscape), optionally with charts as first page
- **Print Charts** - Print all 4 charts on a single A4 landscape page via dedicated button
- **PDF Generation** - Save reports as PDF via browser print dialog
- **Print-Only Filter Summary** - Active filters displayed in printed output
- **Preserved Filters** - Export and print respect all active filters including context-sensitive QSO counts and band status

## Live Demo

Try it now — no installation required:

**[▶ Launch DXCC Analyzer Pro](https://dirschedlf.github.io/Amateur-Radio-DXCC-Analyzer-Pro/)**

Just upload your ADIF file and start analyzing. Everything runs in your browser — no data is sent anywhere.

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro.git

# Navigate to project directory
cd "Amateur Radio DXCC Analyzer Pro"

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Usage

1. **Upload Your Logbook**
   - Click "Choose File" and select your ADIF file (.adi or .adif)
   - Supported formats: ADIF 3.x.x (standard amateur radio interchange format)

2. **View Your Statistics**
   - Dashboard shows Total QSOs, DXCC Worked, DXCC Confirmed, DXCC Missing, and Confirmation Rate
   - All statistics update dynamically when filters are applied
   - "of X total" comparison shows absolute unfiltered values when filters are active

3. **Visualize Your Progress**
   - Click "Show Charts" to reveal interactive charts
   - View DXCC breakdown by continent, band activity, confirmation platforms, and band × continent heatmap
   - Charts update dynamically as you apply filters

4. **Explore Your Data**
   - Use the search bar to find specific countries or DXCC entities
   - Filter by status (All/Confirmed/Worked Only/Not Worked/All Entities), mode, operator, continent, confirmation platform, band, or date range
   - Use date presets (This Year, Last Year, Last 12 Months) or set a custom date range
   - Combine multiple filters for detailed analysis
   - Sort any column by clicking its header
   - Navigate through pages and adjust entries per page (10/15/25/50/All)

5. **Export & Print Results**
   - Click "Export CSV" to download your filtered analysis as spreadsheet (includes filter info)
   - Click "Print Charts" to print the 4 charts on a single A4 page
   - Click "Print Report" to generate a professional print-friendly report (includes charts as first page when visible)
   - Save as PDF using your browser's print dialog
   - All exports and prints respect your current filters with context-sensitive data

## ADIF Field Support

### Required Fields
- `DXCC` - DXCC Entity ID (primary grouping key)
- `BAND` - Operating band

### Optional Fields
- `QSO_DATE` - QSO date in YYYYMMDD format (for date range filtering)
- `COUNTRY` - Country name (used as display name; resolved from built-in DXCC lookup table if missing)
- `CONT` - Continent code (resolved from built-in DXCC lookup table if missing)
- `MODE` - Operating mode (for mode filtering)
- `STATION_CALLSIGN` - Station callsign used (for operator filtering)
- `OPERATOR` - Operator callsign (fallback for operator filtering)
- `LOTW_QSL_RCVD` - LOTW confirmation status
- `EQSL_QSL_RCVD` - eQSL confirmation status
- `QSL_RCVD` - Paper QSL confirmation status
- `QRZCOM_QSL_RCVD` / `QRZ_QSL_RCVD` / `QRZCOM_QSO_DOWNLOAD_STATUS` - QRZ.com confirmation

**Note:** `QRZCOM_QSO_UPLOAD_STATUS` is intentionally **not** used for confirmation detection — it only indicates that a QSO was uploaded to QRZ.com, not that it was confirmed by the other station.

### Confirmation Logic
A QSO is marked as **Confirmed** if ANY confirmation field contains `Y` (Yes) or `V` (Verified):
- LOTW: `LOTW_QSL_RCVD = Y` or `V`
- eQSL: `EQSL_QSL_RCVD = Y` or `V`
- Paper: `QSL_RCVD = Y` or `V`
- QRZ.com: `QRZCOM_QSL_RCVD = Y` or `V`, `QRZ_QSL_RCVD = Y` or `V`, `QRZCOM_QSO_DOWNLOAD_STATUS = Y` or `V`

### Mode Categorization
QSOs are automatically categorized by operating mode:
- **SSB**: USB, LSB, AM
- **CW**: Morse code (CW)
- **Digital**: FT8, FT4, VARA HF, RTTY, PSK31, PSK63, JT65, JT9, WINMOR, ARDOP, PACTOR, and other HF digital modes
- **Unknown**: VHF/UHF modes (FM, DMR) and other modes not categorized above

## Logging Software Compatibility

The analyzer supports QRZ.com confirmation fields from multiple logging applications:

| Software | QRZ Fields Recognized |
|----------|----------------------|
| **Log4OM** | `QRZCOM_QSO_DOWNLOAD_STATUS`, `QRZ_QSL_RCVD` |
| **WaveLog** | `QRZCOM_QSO_DOWNLOAD_STATUS` |
| **Standard ADIF** | `QRZCOM_QSL_RCVD` |

Country names and continents are automatically resolved from the built-in DXCC lookup table when ADIF files do not contain `COUNTRY` or `CONT` fields (common with Logger32, WSJT-X, N1MM, and WaveLog exports).

### Tested ADIF Sources

| Source | Status | Notes |
|--------|--------|-------|
| **Log4OM** Export | ✅ Works | Full support including Log4OM-specific QRZ fields |
| **WaveLog** Export | ✅ Works | Country/continent resolved via built-in lookup table |
| **QRZ.com** Export | ✅ Works | QRZ confirmation fields fully recognized |
| **LOTW** Export | ✅ Works | LOTW confirmation status correctly detected |
| **Club Log** Export | ✅ Works | Confirmations displayed as Paper QSL |
| **World Radio League** Export | ⚠️ Partial | Works, but no confirmation status included — all QSOs shown as Worked only |
| **eQSL** Export | ❌ Not supported | eQSL ADIF exports do not include the DXCC entity field, which is required for analysis |

### Tested Log Sizes

- Successfully tested with logs containing up to **170,000+ QSO records**
- QSO history dating back to **1976**
- Includes handling of **deleted DXCC entities** (e.g., German Democratic Republic, Canal Zone)

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **Vite 7** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library built on React and D3
- **Lucide React** - Beautiful, consistent icons
- **JavaScript ES6+** - Modern JavaScript features

## Project Structure

```
Amateur Radio DXCC Analyzer Pro/
├── src/
│   ├── components/
│   │   └── DXCCAnalyzer.jsx    # Main application component
│   ├── utils/
│   │   └── dxccEntities.js      # DXCC entity lookup table (ADIF 3.1.6)
│   ├── hooks/                   # Custom React hooks (future)
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind & print
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── CLAUDE.md                    # AI assistant guidance
└── README.md                    # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Code Architecture

The application uses a **single-file component architecture** for the main analyzer:

1. **ADIF Parser** - Regex-based extraction of ADIF tags
2. **Analysis Engine** - Band matrix calculation with per-band/per-platform QSO tracking and confirmation logic
3. **Display Helpers** - Context-sensitive functions (`getDisplayQsos`, `getDisplayBandStatus`, `getDisplayConfirmation`) that adapt output to active filters
4. **Chart Data Aggregation** - Memoized computation of continent breakdown, band activity, platform comparison, and band × continent heatmap data
5. **React Components** - UI rendering with hooks for state management
6. **Export Module** - CSV generation from filtered data with filter info header

See `CLAUDE.md` for detailed architecture documentation.

## Performance Considerations

- **Optimized Parsing**: Efficient regex patterns avoid backtracking
- **Memoized Calculations**: `useMemo` prevents unnecessary re-renders
- **Pagination**: Configurable items per page (default 15) keeps DOM size manageable
- **Incremental Rendering**: Large logs are processed without blocking the UI

Tested with logs containing over 180,000 QSOs with smooth performance.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires modern browser with ES6+ support and FileReader API.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Guidelines

1. Maintain the single-file component architecture
2. Preserve client-side-only processing (no API calls)
3. Test with large ADIF files (100,000+ QSOs)
4. Follow existing code style (ESLint configuration)
5. Update CLAUDE.md for architectural changes

## License

MIT License - See LICENSE file for details

## Author

**Fritz Dirschedl (DK9RC)**
- GitHub: [@DirschedlF](https://github.com/DirschedlF)
- Repository: [Amateur-Radio-DXCC-Analyzer-Pro](https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro)

## Acknowledgments

- Built for the amateur radio community
- ADIF format specification by ADIF.org
- Inspired by the need for privacy-preserving logbook analysis tools

## Support

For questions, issues, or feature requests, please open an issue on GitHub.

## Roadmap

Future enhancements under consideration:
- [x] 160m, 60m, and 6m band support
- [x] Visual charts and graphs (continent breakdown, band activity, confirmation platforms, band × continent heatmap)
- [x] Built-in DXCC entity lookup table with deleted entity detection
- [x] WaveLog QRZ.com confirmation field support
- [ ] Dark/Light theme toggle
- [ ] Multi-file comparison
- [x] Print-friendly report generation
- [x] Mode-specific analysis (SSB, CW, Digital)
- [x] 80m, 160m, 60m, 6m band support
- [x] Column sorting with smart default directions
- [x] Continent filter
- [x] Confirmation platform filter (LOTW, eQSL, QRZ, Paper)
- [x] Band filter
- [x] Operator/callsign filter
- [x] Context-sensitive filter interaction
- [x] Active filter tags with reset
- [x] Filter-aware dashboard statistics
- [x] Results counter
- [x] CSV export with filter info
- [x] Print-only filter summary
- [x] Configurable pagination (10/15/25/50/All)
- [x] Filename display with reload button
- [x] Date range filter with presets and custom range
- [x] Not Worked / All Entities status views
- [x] DXCC Missing dashboard counter
- [x] Continent lookup table priority over ADIF data for reliability
- [x] Unfiltered totals comparison in dashboard ("of X total")
- [x] Printable charts (dedicated "Print Charts" button + charts in Print Report)

---

**73 de DK9RC**

*Happy DXing!*
