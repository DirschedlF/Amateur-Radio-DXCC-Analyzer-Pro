# Amateur Radio DXCC Analyzer Pro - Elevator Pitch

**Version 2.4.1** | Built by Fritz DK9RC | [GitHub Repository](https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro)

---

## Your Complete DXCC Tracking Solution - 100% Private, 100% Browser-Based

### 🔒 **Privacy First**
- **All processing happens in your browser** - your logbook data never leaves your computer
- **No uploads, no tracking, no cloud storage** - complete data sovereignty
- **Completely offline-capable** after initial page load
- **Secure by design** - uses browser's FileReader API for local file access

### 📊 **Comprehensive DXCC Analysis**
- **Track worked and confirmed DXCC entities** across 11 HF bands (160m-6m)
- **Multi-platform confirmation tracking**: LOTW, eQSL, QRZ.com, Paper QSL
- **Real-time statistics**: entities worked, confirmed, missing, confirmation rate
- **Mode-specific analysis**: SSB, CW, Digital modes with intelligent categorization
- **Context-sensitive display**: All data adapts dynamically to active filters

### 🎯 **GDXF Most Wanted Integration** *(NEW in v2.0.0)*
- **Built-in rankings** from German DX Foundation (340 active DXCC entities)
- **Mode-dependent rankings** automatically switch (Digital/CW/SSB/Mixed)
- **Callsign prefix display** and searchability (e.g., P5, BS7, VE, KH7K)
- **Instantly identify your rarest catches** and plan your next DXpedition
- **Data source**: [GDXF Most Wanted 2024 - Germany](https://gdxf.de/mostwanted/index.php?year=2024)

### 🔍 **Advanced Filtering & Analysis**
- **Multi-dimensional filtering**: mode, operator, continent, band, confirmation platform, date range
- **Search by country name, DXCC ID, or callsign prefix** - find anything instantly
- **View missing entities** and identify gaps in your DXCC coverage
- **Interactive charts**: continent breakdown, band activity, band × continent heatmap
- **Intelligent filter interaction**: filters work together contextually
- **Active filter tags** with visual chips and one-click removal

### 🕐 **Last QSO Tracking & Stale Confirmations** *(NEW in v2.3.0)*
- **Hover tooltips** on country names and band cells showing last QSO date, band, and callsign
- **Stale confirmation warning** — clock icon on W-status bands with no confirmation for 5+ years
- **Extended CSV export** with new columns: Last QSO date, Last QSO band, Last QSO callsign, Stale indicator
- **Smart CSV filenames** — active filters automatically embedded (e.g., `dxcc-analysis_cw_confirmed_eu.csv`)
- **"Not Worked" chart segment** — "All Entities" view shows unworked entities as a third stacked segment in continent and band charts; bar heights remain stable when switching bands or platform filters

### 🔗 **Share, Export & Keyboard Shortcuts** *(NEW in v2.2.0)*
- **Share Link** — copy a URL with all active filters Base64-encoded; anyone with the link restores the exact same view (`Ctrl+Shift+S`)
- **JSON Export** — export filtered entity data as JSON for use with external tools
- **ADIF Export** — export QSOs of filtered entities as a valid ADIF file for re-import or sharing
- **Column Configuration** — show/hide individual band and confirmation columns; settings persist across sessions in localStorage
- **Keyboard Shortcuts** — `/` focuses search, `Esc` clears it, `←`/`→` navigate pages, `Ctrl+Shift+S` copies share link

### 🌿 **Obsidian Export** *(NEW in v2.4.0)*
- **Export to Obsidian** — generate a ZIP file with Obsidian Flavored Markdown notes for your entire DXCC log
- **One note per entity** — YAML frontmatter, Obsidian callouts, band status table with last QSO dates, QSL platform icons
- **Overview notes** — `DXCC Overview.md` with top 10 table and full entity list; `DXCC Overview - Not Worked.md` grouped by continent
- **Ready-to-use Dataview queries** — 6 queries included (unconfirmed, by continent, top 20, no LoTW, Wikipedia links, timeline)
- **Safe re-export** — all files can be overwritten without losing user-added content; respects all active filters

### 🌐 **Wikipedia Integration** *(NEW in v2.4.1)*
- **Wikipedia links** in the entity table — clickable links to each DXCC entity's Wikipedia article
- **Wikipedia URLs in CSV and JSON export** — included for use in external tools and workflows
- **Manually curated slugs** for all edge cases (abbreviations, special characters, historical names, disambiguation)

### 📤 **Professional Export & Reporting**
- **Export filtered analysis to CSV** with full filter context in header and filter-aware filename
- **Print-ready reports** (A4 landscape, all 21 columns visible); shows Last QSO date in printed output
- **Dedicated chart printing** (4 charts on single page)
- **PDF generation** via browser print dialog
- **All exports respect your current filters** - what you see is what you get

### ⚡ **Performance & Compatibility**
- **Handles 170,000+ QSO logs** without breaking a sweat
- **Works with major logging software**: Log4OM, WaveLog, N1MM+, Ham Radio Deluxe, and more
- **Built-in ADIF 3.1.6 entity lookup** (resolves missing/inconsistent data)
- **Deleted entity detection** (e.g., German Democratic Republic, Canal Zone)
- **Efficient parsing** with memoization for instant filter updates

### 🎨 **Superior User Experience**
- **Sortable columns** with smart defaults (21 columns total)
- **Band column highlighting** when band filter is active (blue border + dimmed other bands)
- **Sticky headers** for easy navigation on large datasets
- **Configurable pagination** (10/15/25/50/All entries); preference remembered across sessions
- **Column configuration** — show/hide individual bands and confirmation platforms; persists in localStorage
- **Visual filter chips** with individual remove buttons and "Reset All"
- **Responsive design** that fits all columns on screen
- **Date range presets** (This Year, Last Year, Last 12 Months) + custom range

---

## The Bottom Line

**Amateur Radio DXCC Analyzer Pro** is a professional-grade DXCC tracking tool that respects your privacy, handles massive logs effortlessly, and provides insights you won't find anywhere else - all running entirely in your browser.

### Perfect for:
- Contest operators analyzing multi-mode performance
- DXers tracking rare entity progress
- DXCC chasers planning their next confirmations
- Multi-op stations with multiple callsigns
- Anyone serious about tracking amateur radio achievements

### Technology Stack:
- **React 18** with modern hooks
- **Vite 7** for lightning-fast build and dev
- **Tailwind CSS** for responsive design
- **Recharts** for interactive charts
- **100% JavaScript** - no backend required

---

## Key Differentiators

1. **Privacy-First Architecture** - Your data never leaves your browser
2. **GDXF Most Wanted Integration** - No other ADIF analyzer offers this
3. **Mode-Dependent Rankings** - Rankings automatically adapt to your filter selection
4. **Enterprise-Grade Performance** - Tested with 170,000+ QSOs
5. **Comprehensive Export** - CSV, JSON, ADIF, and Obsidian export with filter context, Last QSO columns, and filter-aware filenames
6. **Context-Sensitive Display** - All data dynamically adapts to active filters
7. **Professional Print Support** - A4 landscape reports with all 21 columns
8. **Stale Confirmation Detection** - Instantly spot W-status bands not confirmed in 5+ years
9. **Shareable Filter Views** - Share exact analysis views via URL with all filters encoded
10. **Obsidian Integration** - Export your entire DXCC log as a structured Obsidian vault
11. **Wikipedia Links** - Direct links to Wikipedia articles for every DXCC entity

---

## Open Source & Community

- **Free and Open Source** - MIT Licensed
- **Active Development** - Version 2.4.1 released February 2026
- **Community Driven** - Built by amateur radio operators, for amateur radio operators
- **Well Documented** - Comprehensive README and developer guidance

---

**Try it now**: [Amateur Radio DXCC Analyzer Pro](https://dirschedlf.github.io/Amateur-Radio-DXCC-Analyzer-Pro/)

**Source Code**: [GitHub Repository](https://github.com/DirschedlF/Amateur-Radio-DXCC-Analyzer-Pro)

**Developer**: Fritz DK9RC

**73 and Happy DXing!** 📻
