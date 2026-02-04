# Amateur Radio DXCC Analyzer Pro

A high-performance, browser-based application for analyzing amateur radio logbooks in ADIF format. Track your DXCC progress (Worked/Confirmed) across multiple bands and confirmation platforms with complete privacy - all processing happens client-side.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)

## Features

### 🔒 Complete Privacy
- **100% Client-Side Processing** - Your logbook data never leaves your browser
- **No Server Communication** - No uploads, no tracking, no data storage
- **Secure by Design** - Uses browser's FileReader API for local file access

### 📊 Comprehensive Analysis
- **Multi-Band Tracking** - Analyze 40m, 30m, 20m, 17m, 15m, 12m, 10m bands
- **Confirmation Platforms** - Track confirmations from LOTW, eQSL, QRZ.com, and Paper QSL
- **Smart Status Detection** - Automatic detection of 'Confirmed' vs 'Worked' status
- **DXCC Entity Grouping** - Primary grouping by DXCC ID to eliminate country name inconsistencies

### 🎨 Modern Interface
- **Interactive Dashboard** - Real-time statistics (Total QSOs, Worked, Confirmed, %)
- **Advanced Filtering** - Search by country name or DXCC ID
- **Status Filters** - View All / Confirmed Only / Worked Only
- **Sticky Headers** - Keep columns visible while scrolling
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### ⚡ High Performance
- **Optimized for Large Logs** - Handle 10,000+ QSOs without UI blocking
- **Efficient Parsing** - Regex-based ADIF tag extraction
- **Smart Memoization** - React hooks for performance optimization
- **Instant Results** - Real-time analysis and visualization

### 📤 Export Capabilities
- **CSV Export** - Download your analysis with current filters applied
- **Preserved Filters** - Export respects search and status filters

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/amateur-radio-dxcc-analyzer-pro.git

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
   - Dashboard shows Total QSOs, DXCC Worked, DXCC Confirmed, and confirmation percentage

3. **Explore Your Data**
   - Use the search bar to find specific countries or DXCC entities
   - Filter by status: All, Confirmed Only, or Worked Only
   - Navigate through pages (15 entries per page)

4. **Export Results**
   - Click "Export CSV" to download your filtered analysis
   - Open in Excel, Google Sheets, or any spreadsheet application

## ADIF Field Support

### Required Fields
- `DXCC` - DXCC Entity ID (primary grouping key)
- `BAND` - Operating band

### Optional Fields
- `COUNTRY` - Country name (used as display name)
- `CONT` - Continent code
- `LOTW_QSL_RCVD` - LOTW confirmation status
- `EQSL_QSL_RCVD` - eQSL confirmation status
- `QSL_RCVD` - Paper QSL confirmation status
- `QRZCOM_QSL_RCVD` / `QRZ_QSL_RCVD` / `QRZCOM_QSO_DOWNLOAD_STATUS` - QRZ.com confirmation

### Confirmation Logic
A QSO is marked as **Confirmed** if ANY confirmation field contains `Y` or `V`:
- LOTW: `LOTW_QSL_RCVD = Y`
- eQSL: `EQSL_QSL_RCVD = Y`
- Paper: `QSL_RCVD = Y`
- QRZ.com: `QRZCOM_QSL_RCVD = Y` or `V`

## Log4OM Compatibility

The analyzer includes special handling for **Log4OM** ADIF extensions, particularly for QRZ.com confirmation tracking:
- `QRZCOM_QSO_DOWNLOAD_STATUS`
- `QRZ_QSL_RCVD`

These fields are automatically recognized alongside standard ADIF fields.

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons
- **JavaScript ES6+** - Modern JavaScript features

## Project Structure

```
Amateur Radio DXCC Analyzer Pro/
├── src/
│   ├── components/
│   │   └── DXCCAnalyzer.jsx    # Main application component
│   ├── utils/                   # Utility functions (future)
│   ├── hooks/                   # Custom React hooks (future)
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles with Tailwind
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
2. **Analysis Engine** - Band matrix calculation and confirmation logic
3. **React Components** - UI rendering with hooks for state management
4. **Export Module** - CSV generation from filtered data

See `CLAUDE.md` for detailed architecture documentation.

## Performance Considerations

- **Optimized Parsing**: Efficient regex patterns avoid backtracking
- **Memoized Calculations**: `useMemo` prevents unnecessary re-renders
- **Pagination**: Default 15 items per page keeps DOM size manageable
- **Incremental Rendering**: Large logs are processed without blocking the UI

Tested with logs containing over 10,000 QSOs with smooth performance.

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
3. Test with large ADIF files (10,000+ QSOs)
4. Follow existing code style (ESLint configuration)
5. Update CLAUDE.md for architectural changes

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built for the amateur radio community
- ADIF format specification by ADIF.org
- Inspired by the need for privacy-preserving logbook analysis tools

## Support

For questions, issues, or feature requests, please open an issue on GitHub.

## Roadmap

Future enhancements under consideration:
- [ ] Additional band support (6m, 2m, 70cm, etc.)
- [ ] Mode-specific analysis (SSB, CW, Digital)
- [ ] Visual charts and graphs (continent breakdown, band activity)
- [ ] Dark/Light theme toggle
- [ ] Multi-file comparison
- [ ] Print-friendly report generation

---

**73 de [Your Callsign]** 📻

*Happy DXing!*
