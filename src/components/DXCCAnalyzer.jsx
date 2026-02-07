import { useState, useMemo } from 'react'
import { Upload, Download, Search, Filter, Printer, ChevronUp, ChevronDown, X, BarChart3, RefreshCw } from 'lucide-react'
import { Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { lookupDXCC } from '../utils/dxccEntities'

/**
 * DXCC Analyzer Pro - Main Component
 *
 * Single-file component for analyzing ADIF amateur radio logbooks.
 * Tracks DXCC entities across multiple bands with confirmation status.
 */
function DXCCAnalyzer() {
  const [logData, setLogData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'confirmed', 'worked'
  const [filterMode, setFilterMode] = useState('all') // 'all', 'ssb', 'cw', 'digital'
  const [filterOperator, setFilterOperator] = useState('all')
  const [filterContinent, setFilterContinent] = useState('all')
  const [filterConfirmation, setFilterConfirmation] = useState('all')
  const [filterBand, setFilterBand] = useState('all')
  const [sortColumn, setSortColumn] = useState('country')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCharts, setShowCharts] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Supported bands
  const BANDS = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m']

  // Mode categories (HF modes only - VHF/UHF modes like FM, DMR excluded)
  const MODE_CATEGORIES = {
    ssb: ['SSB', 'USB', 'LSB', 'AM'],
    cw: ['CW'],
    digital: [
      // WSJT-X Modes
      'FT8', 'FT4', 'JT65', 'JT9', 'JT4', 'WSPR', 'Q65',
      // RTTY & PSK
      'RTTY', 'PSK', 'PSK31', 'PSK63', 'PSK125', 'QPSK', 'BPSK',
      // Other Digital
      'MFSK', 'OLIVIA', 'CONTESTIA', 'HELL', 'MT63', 'DOMINO', 'THROB',
      // Winlink & Data Modes
      'VARA', 'WINMOR', 'ARDOP', 'PACTOR',
      // Packet & APRS
      'PACKET', 'APRS', 'AX25',
      // Other HF Digital
      'FSK', 'AFSK'
    ]
  }

  /**
   * Categorize mode into SSB, CW, or Digital
   * @param {string} mode - Mode from ADIF
   * @returns {string} Category: 'ssb', 'cw', 'digital', or 'unknown'
   */
  const categorizeMode = (mode) => {
    if (!mode) return 'unknown'
    const upperMode = mode.toUpperCase().trim()

    // Check digital modes first (more specific)
    for (const digitalMode of MODE_CATEGORIES.digital) {
      if (upperMode === digitalMode || upperMode.startsWith(digitalMode + ' ') || upperMode.includes(digitalMode)) {
        return 'digital'
      }
    }

    // Then check CW
    if (upperMode === 'CW' || upperMode.startsWith('CW ')) {
      return 'cw'
    }

    // Finally check SSB modes
    for (const ssbMode of MODE_CATEGORIES.ssb) {
      if (upperMode === ssbMode || upperMode.startsWith(ssbMode + ' ')) {
        return 'ssb'
      }
    }

    return 'unknown'
  }

  /**
   * Parse ADIF file content
   * @param {string} content - Raw ADIF file content
   * @returns {Array} Array of QSO objects
   */
  const parseADIF = (content) => {
    const qsos = []
    const adifTagRegex = /<(\w+):(\d+)(?::(\w))?>([^<]*)/gi

    // Split by <EOR> or <eor> to get individual records
    const records = content.split(/<eor>/i)

    records.forEach(record => {
      if (!record.trim()) return

      const qso = {}
      let match

      // Extract all fields from the record
      while ((match = adifTagRegex.exec(record)) !== null) {
        const fieldName = match[1].toUpperCase()
        const declaredLength = parseInt(match[2], 10)
        const rawValue = match[4]
        // Respect ADIF declared field length to avoid capturing extra data
        const value = (declaredLength > 0 && rawValue.length > declaredLength)
          ? rawValue.substring(0, declaredLength).trim()
          : rawValue.trim()
        qso[fieldName] = value
      }

      if (Object.keys(qso).length > 0) {
        qsos.push(qso)
      }
    })

    return qsos
  }

  /**
   * Check if a QSO is confirmed
   * @param {Object} qso - QSO record
   * @returns {boolean} True if confirmed
   */
  const isConfirmed = (qso) => {
    const confirmFields = [
      'LOTW_QSL_RCVD',
      'EQSL_QSL_RCVD',
      'QSL_RCVD',
      'QRZCOM_QSL_RCVD',
      'QRZ_QSL_RCVD',
      'QRZCOM_QSO_DOWNLOAD_STATUS'
      // Note: QRZCOM_QSO_UPLOAD_STATUS is intentionally excluded - it only means
      // "uploaded to QRZ" not "confirmed by QRZ". Upload ≠ Confirmation.
    ]

    return confirmFields.some(field =>
      ['Y', 'V'].includes(qso[field]?.toUpperCase())
    )
  }

  /**
   * Analyze QSOs and build DXCC matrix (with optional mode and operator filter)
   * @param {Array} qsos - Array of QSO records
   * @param {string} modeFilter - Optional mode filter: 'all', 'ssb', 'cw', 'digital'
   * @param {string} operatorFilter - Optional operator callsign filter
   * @returns {Object} DXCC analysis data
   */
  const analyzeQSOs = (qsos, modeFilter = 'all', operatorFilter = 'all') => {
    const dxccData = {}

    // Filter QSOs by mode category and operator if specified
    let filteredQsos = modeFilter === 'all'
      ? qsos
      : qsos.filter(qso => categorizeMode(qso.MODE) === modeFilter)

    if (operatorFilter !== 'all') {
      filteredQsos = filteredQsos.filter(qso => {
        const call = (qso.STATION_CALLSIGN || qso.OPERATOR || '').toUpperCase()
        return call === operatorFilter
      })
    }

    filteredQsos.forEach(qso => {
      const dxccId = qso.DXCC
      if (!dxccId) return

      const band = qso.BAND
      const confirmed = isConfirmed(qso)

      // Resolve country and continent: ADIF fields first, then DXCC lookup table fallback
      const dxccLookup = lookupDXCC(dxccId)
      const country = qso.COUNTRY || dxccLookup?.name || 'Unknown'
      const continent = qso.CONT || dxccLookup?.cont || ''
      const deleted = dxccLookup?.deleted || false

      // Initialize DXCC entry if not exists
      if (!dxccData[dxccId]) {
        dxccData[dxccId] = {
          country,
          cont: continent,
          deleted,
          total: 0,
          lotw: false,
          eqsl: false,
          qrz: false,
          qsl: false,
          bands: {},
          bandQsos: {},
          bandConfirmations: {},
          platformQsos: { lotw: 0, eqsl: 0, qrz: 0, qsl: 0 },
          bandPlatformQsos: {}
        }

        BANDS.forEach(b => {
          dxccData[dxccId].bands[b] = null
          dxccData[dxccId].bandQsos[b] = 0
          dxccData[dxccId].bandConfirmations[b] = { lotw: false, eqsl: false, qrz: false, qsl: false }
          dxccData[dxccId].bandPlatformQsos[b] = { lotw: 0, eqsl: 0, qrz: 0, qsl: 0 }
        })
      }

      dxccData[dxccId].total++

      // Track confirmation platforms and count confirmed QSOs per platform
      // ADIF standard: Y = Yes (confirmed), V = Verified (confirmed) - both count as confirmed
      const isLotw = ['Y', 'V'].includes(qso.LOTW_QSL_RCVD?.toUpperCase())
      const isEqsl = ['Y', 'V'].includes(qso.EQSL_QSL_RCVD?.toUpperCase())
      const isQsl = ['Y', 'V'].includes(qso.QSL_RCVD?.toUpperCase())
      const isQrz = ['QRZCOM_QSL_RCVD', 'QRZ_QSL_RCVD', 'QRZCOM_QSO_DOWNLOAD_STATUS'].some(
        f => ['Y', 'V'].includes(qso[f]?.toUpperCase())
      )
      // Note: QRZCOM_QSO_UPLOAD_STATUS is excluded - it means "uploaded to QRZ", not "confirmed"

      if (isLotw) { dxccData[dxccId].lotw = true; dxccData[dxccId].platformQsos.lotw++ }
      if (isEqsl) { dxccData[dxccId].eqsl = true; dxccData[dxccId].platformQsos.eqsl++ }
      if (isQsl) { dxccData[dxccId].qsl = true; dxccData[dxccId].platformQsos.qsl++ }
      if (isQrz) { dxccData[dxccId].qrz = true; dxccData[dxccId].platformQsos.qrz++ }

      // Update band status, count, and per-band confirmations
      if (band && BANDS.includes(band.toLowerCase())) {
        const normalizedBand = band.toLowerCase()
        const currentStatus = dxccData[dxccId].bands[normalizedBand]
        dxccData[dxccId].bandQsos[normalizedBand]++

        if (confirmed) {
          dxccData[dxccId].bands[normalizedBand] = 'C'
        } else if (!currentStatus) {
          dxccData[dxccId].bands[normalizedBand] = 'W'
        }

        // Track per-band confirmation platforms and counts
        const bc = dxccData[dxccId].bandConfirmations[normalizedBand]
        const bpq = dxccData[dxccId].bandPlatformQsos[normalizedBand]
        if (isLotw) { bc.lotw = true; bpq.lotw++ }
        if (isEqsl) { bc.eqsl = true; bpq.eqsl++ }
        if (isQsl) { bc.qsl = true; bpq.qsl++ }
        if (isQrz) { bc.qrz = true; bpq.qrz++ }
      }
    })

    return dxccData
  }

  /**
   * Handle file upload
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target.result
      const qsos = parseADIF(content)

      setLogData({
        qsos,
        totalQSOs: qsos.length
      })
      setCurrentPage(1)
    }

    reader.readAsText(file)
  }

  // Extract available operator callsigns from QSO data
  const availableOperators = useMemo(() => {
    if (!logData) return []
    const operators = new Set()
    logData.qsos.forEach(qso => {
      const call = qso.STATION_CALLSIGN || qso.OPERATOR
      if (call) operators.add(call.toUpperCase())
    })
    return [...operators].sort()
  }, [logData])

  // Reanalyze data when mode or operator filter changes
  const analyzedData = useMemo(() => {
    if (!logData) return null
    return analyzeQSOs(logData.qsos, filterMode, filterOperator)
  }, [logData, filterMode, filterOperator])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!analyzedData) return null

    const dxccEntries = Object.entries(analyzedData)
    const worked = dxccEntries.length
    const confirmed = dxccEntries.filter(([_, data]) =>
      BANDS.some(band => data.bands[band] === 'C')
    ).length

    // Calculate total QSOs for current mode filter
    const totalQSOs = dxccEntries.reduce((sum, [_, data]) => sum + data.total, 0)

    return {
      totalQSOs,
      worked,
      confirmed,
      percentage: worked > 0 ? ((confirmed / worked) * 100).toFixed(1) : 0
    }
  }, [analyzedData])

  // Derive available continents from data
  const availableContinents = useMemo(() => {
    if (!analyzedData) return []
    const continents = new Set()
    Object.values(analyzedData).forEach(data => {
      if (data.cont) continents.add(data.cont)
    })
    return [...continents].sort()
  }, [analyzedData])

  // Get display QSO count (respects band and confirmation filters)
  const getDisplayQsos = (data) => {
    if (filterBand !== 'all' && filterConfirmation !== 'all') {
      return data.bandPlatformQsos[filterBand]?.[filterConfirmation] || 0
    }
    if (filterBand !== 'all') return data.bandQsos[filterBand] || 0
    if (filterConfirmation !== 'all') return data.platformQsos[filterConfirmation] || 0
    return data.total
  }

  // Get display confirmation status (respects band filter)
  const getDisplayConfirmation = (data, platform) => {
    if (filterBand !== 'all') return data.bandConfirmations[filterBand]?.[platform] || false
    return data[platform]
  }

  // Get display band status (respects confirmation platform filter)
  const getDisplayBandStatus = (data, band) => {
    const status = data.bands[band]
    if (!status) return null
    if (filterConfirmation !== 'all') {
      if (data.bandConfirmations[band]?.[filterConfirmation]) return 'C'
      if (data.bandQsos[band] > 0) return 'W'
      return null
    }
    return status
  }

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!analyzedData) return []

    let entries = Object.entries(analyzedData)

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      entries = entries.filter(([id, data]) =>
        data.country.toLowerCase().includes(term) ||
        id.includes(term)
      )
    }

    // Apply continent filter
    if (filterContinent !== 'all') {
      entries = entries.filter(([_, data]) => data.cont === filterContinent)
    }

    // Apply band filter
    if (filterBand !== 'all') {
      entries = entries.filter(([_, data]) =>
        data.bands[filterBand] === 'C' || data.bands[filterBand] === 'W'
      )
    }

    // Apply confirmation platform filter (respects band filter)
    if (filterConfirmation !== 'all') {
      if (filterBand !== 'all') {
        entries = entries.filter(([_, data]) => data.bandConfirmations[filterBand]?.[filterConfirmation] === true)
      } else {
        entries = entries.filter(([_, data]) => data[filterConfirmation] === true)
      }
    }

    // Apply status filter (respects active band filter)
    const bandsToCheck = filterBand !== 'all' ? [filterBand] : BANDS
    if (filterStatus === 'confirmed') {
      entries = entries.filter(([_, data]) =>
        bandsToCheck.some(band => data.bands[band] === 'C')
      )
    } else if (filterStatus === 'worked') {
      entries = entries.filter(([_, data]) =>
        bandsToCheck.every(band => data.bands[band] !== 'C') &&
        bandsToCheck.some(band => data.bands[band] === 'W')
      )
    }

    // Sort
    return entries.sort((a, b) => {
      const [idA, dataA] = a
      const [idB, dataB] = b
      let comparison = 0

      if (sortColumn === 'country') {
        comparison = dataA.country.localeCompare(dataB.country)
      } else if (sortColumn === 'dxcc') {
        comparison = parseInt(idA) - parseInt(idB)
      } else if (sortColumn === 'cont') {
        comparison = (dataA.cont || '').localeCompare(dataB.cont || '')
      } else if (sortColumn === 'qsos') {
        comparison = getDisplayQsos(dataA) - getDisplayQsos(dataB)
      } else if (BANDS.includes(sortColumn)) {
        const statusOrder = { 'C': 2, 'W': 1 }
        const valA = statusOrder[getDisplayBandStatus(dataA, sortColumn)] || 0
        const valB = statusOrder[getDisplayBandStatus(dataB, sortColumn)] || 0
        comparison = valA - valB
      } else if (['lotw', 'eqsl', 'qrz', 'qsl'].includes(sortColumn)) {
        const confA = filterBand !== 'all' ? (dataA.bandConfirmations[filterBand]?.[sortColumn] || false) : dataA[sortColumn]
        const confB = filterBand !== 'all' ? (dataB.bandConfirmations[filterBand]?.[sortColumn] || false) : dataB[sortColumn]
        comparison = (confA === confB) ? 0 : confA ? 1 : -1
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [analyzedData, searchTerm, filterStatus, filterContinent, filterConfirmation, filterBand, sortColumn, sortDirection])

  // Check if any filter is active
  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterMode !== 'all' || filterOperator !== 'all' || filterContinent !== 'all' || filterConfirmation !== 'all' || filterBand !== 'all'

  // Calculate filtered statistics (based on what's shown in the table)
  const filteredStats = useMemo(() => {
    if (!filteredData.length) return { totalQSOs: 0, worked: 0, confirmed: 0, percentage: 0 }

    const bandsToCheck = filterBand !== 'all' ? [filterBand] : BANDS
    const worked = filteredData.length
    const confirmed = filteredData.filter(([_, data]) =>
      bandsToCheck.some(band => data.bands[band] === 'C')
    ).length
    const totalQSOs = filteredData.reduce((sum, [_, data]) => sum + getDisplayQsos(data), 0)

    return {
      totalQSOs,
      worked,
      confirmed,
      percentage: worked > 0 ? ((confirmed / worked) * 100).toFixed(1) : 0
    }
  }, [filteredData, filterBand, filterConfirmation])

  // Chart data aggregation
  const chartData = useMemo(() => {
    if (!filteredData.length) return null

    // Continent breakdown
    const contMap = {}
    filteredData.forEach(([_, data]) => {
      const cont = data.cont || 'Unknown'
      if (!contMap[cont]) contMap[cont] = { worked: 0, confirmed: 0 }
      contMap[cont].worked++
      const bandsToCheck = filterBand !== 'all' ? [filterBand] : BANDS
      if (bandsToCheck.some(band => data.bands[band] === 'C')) {
        contMap[cont].confirmed++
      }
    })
    const continentData = Object.entries(contMap)
      .map(([name, counts]) => ({ name, ...counts, workedOnly: counts.worked - counts.confirmed }))
      .sort((a, b) => b.worked - a.worked)

    // Band activity (respects all filters)
    const bandsToShow = filterBand !== 'all' ? [filterBand] : BANDS
    const bandData = bandsToShow.map(band => {
      let confirmed = 0
      let workedOnly = 0
      filteredData.forEach(([_, data]) => {
        const status = getDisplayBandStatus(data, band)
        if (status === 'C') confirmed++
        else if (status === 'W') workedOnly++
      })
      return { name: band, confirmed, workedOnly }
    })

    // Platform comparison
    const platformCounts = { lotw: 0, eqsl: 0, qrz: 0, qsl: 0 }
    filteredData.forEach(([_, data]) => {
      if (filterBand !== 'all') {
        if (data.bandConfirmations[filterBand]?.lotw) platformCounts.lotw++
        if (data.bandConfirmations[filterBand]?.eqsl) platformCounts.eqsl++
        if (data.bandConfirmations[filterBand]?.qrz) platformCounts.qrz++
        if (data.bandConfirmations[filterBand]?.qsl) platformCounts.qsl++
      } else {
        if (data.lotw) platformCounts.lotw++
        if (data.eqsl) platformCounts.eqsl++
        if (data.qrz) platformCounts.qrz++
        if (data.qsl) platformCounts.qsl++
      }
    })
    const platformData = [
      { name: 'LOTW', count: platformCounts.lotw, fill: '#3b82f6' },
      { name: 'eQSL', count: platformCounts.eqsl, fill: '#8b5cf6' },
      { name: 'QRZ', count: platformCounts.qrz, fill: '#f59e0b' },
      { name: 'Paper', count: platformCounts.qsl, fill: '#ef4444' }
    ]

    // Band x Continent heatmap (respects all filters)
    const allConts = [...new Set(filteredData.map(([_, d]) => d.cont).filter(Boolean))].sort()
    const heatmapData = allConts.map(cont => {
      const row = { continent: cont }
      bandsToShow.forEach(band => {
        let confirmed = 0
        let worked = 0
        filteredData.forEach(([_, data]) => {
          if (data.cont !== cont) return
          const status = getDisplayBandStatus(data, band)
          if (status === 'C') confirmed++
          else if (status === 'W') worked++
        })
        row[band] = confirmed + worked
        row[`${band}_c`] = confirmed
        row[`${band}_w`] = worked
      })
      return row
    })

    return { continentData, bandData, platformData, heatmapData, allConts, bandsToShow }
  }, [filteredData, filterBand, filterConfirmation])

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm('')
    setFilterMode('all')
    setFilterOperator('all')
    setFilterStatus('all')
    setFilterContinent('all')
    setFilterConfirmation('all')
    setFilterBand('all')
    setCurrentPage(1)
  }

  // Active filter labels for display
  const activeFilterLabels = {
    mode: { ssb: 'SSB', cw: 'CW', digital: 'Digital' },
    status: { confirmed: 'Confirmed', worked: 'Worked Only' },
    confirmation: { lotw: 'LOTW', eqsl: 'eQSL', qrz: 'QRZ', qsl: 'Paper' }
  }

  // Pagination
  const showAll = itemsPerPage === 0
  const totalPages = showAll ? 1 : Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = showAll
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )

  /**
   * Export to CSV
   */
  const exportToCSV = () => {
    if (!filteredData.length) return

    // Build filter info line
    const filters = []
    if (searchTerm) filters.push(`Search: ${searchTerm}`)
    if (filterStatus !== 'all') filters.push(`Status: ${activeFilterLabels.status[filterStatus]}`)
    if (filterMode !== 'all') filters.push(`Mode: ${activeFilterLabels.mode[filterMode]}`)
    if (filterOperator !== 'all') filters.push(`Operator: ${filterOperator}`)
    if (filterContinent !== 'all') filters.push(`Continent: ${filterContinent}`)
    if (filterConfirmation !== 'all') filters.push(`Platform: ${activeFilterLabels.confirmation[filterConfirmation]}`)
    if (filterBand !== 'all') filters.push(`Band: ${filterBand}`)

    const headers = ['DXCC ID', 'Country', 'Deleted', 'Continent', 'Total QSOs', ...BANDS, 'LOTW', 'eQSL', 'QRZ', 'Paper']
    const rows = filteredData.map(([id, data]) => [
      id,
      data.country,
      data.deleted ? 'Yes' : '',
      data.cont,
      getDisplayQsos(data),
      ...BANDS.map(band => getDisplayBandStatus(data, band) || ''),
      getDisplayConfirmation(data, 'lotw') ? 'Yes' : 'No',
      getDisplayConfirmation(data, 'eqsl') ? 'Yes' : 'No',
      getDisplayConfirmation(data, 'qrz') ? 'Yes' : 'No',
      getDisplayConfirmation(data, 'qsl') ? 'Yes' : 'No'
    ])

    const csvRows = []
    if (filters.length > 0) {
      csvRows.push([`Filtered by: ${filters.join(' | ')}`])
    }
    csvRows.push(headers)
    csvRows.push(...rows)

    const csv = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dxcc-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Print report
   */
  const handlePrint = () => {
    window.print()
  }

  /**
   * Handle column sort
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      // Bands and confirmation columns default to descending (show C/✓ first)
      const descFirst = BANDS.includes(column) || ['lotw', 'eqsl', 'qrz', 'qsl', 'qsos'].includes(column)
      setSortDirection(descFirst ? 'desc' : 'asc')
    }
    setCurrentPage(1)
  }

  const sortIndicator = (column) => {
    if (sortColumn !== column) return <span className="ml-1 text-gray-600 text-xs">&#9650;</span>
    return sortDirection === 'asc'
      ? <ChevronUp className="inline w-4 h-4 ml-1" />
      : <ChevronDown className="inline w-4 h-4 ml-1" />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center">DXCC Analyzer Pro</h1>
        <p className="text-gray-400 text-center">Amateur Radio Logbook Analysis Tool v1.4.3</p>
        {logData && fileName && (
          <div className="flex items-center justify-center gap-3 mt-3 print:hidden">
            <span className="text-gray-400 text-sm">📄 {fileName}</span>
            <label className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition text-sm">
              <RefreshCw className="w-4 h-4" />
              Reload
              <input
                type="file"
                accept=".adi,.adif"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* File Upload */}
      {!logData && (
        <div className="bg-gray-800 rounded-lg p-12 text-center border-2 border-dashed border-gray-600">
          <Upload className="mx-auto mb-4 w-16 h-16 text-gray-500" />
          <h2 className="text-2xl font-semibold mb-2">Upload Your ADIF Logbook</h2>
          <p className="text-gray-400 mb-6">Supports .adi and .adif files - All processing happens locally in your browser</p>
          <label className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition">
            <span>Choose File</span>
            <input
              type="file"
              accept=".adi,.adif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Dashboard */}
      {logData && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total QSOs</div>
              <div className="text-3xl font-bold">
                {hasActiveFilters ? filteredStats.totalQSOs : stats.totalQSOs}
              </div>
              {hasActiveFilters && (
                <div className="text-gray-500 text-xs mt-1 print:hidden">of {stats.totalQSOs} total</div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">DXCC Worked</div>
              <div className="text-3xl font-bold text-yellow-500">
                {hasActiveFilters ? filteredStats.worked : stats.worked}
              </div>
              {hasActiveFilters && (
                <div className="text-gray-500 text-xs mt-1 print:hidden">of {stats.worked} total</div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">DXCC Confirmed</div>
              <div className="text-3xl font-bold text-green-500">
                {hasActiveFilters ? filteredStats.confirmed : stats.confirmed}
              </div>
              {hasActiveFilters && (
                <div className="text-gray-500 text-xs mt-1 print:hidden">of {stats.confirmed} total</div>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Confirmation Rate</div>
              <div className="text-3xl font-bold text-blue-500">
                {hasActiveFilters ? filteredStats.percentage : stats.percentage}%
              </div>
              {hasActiveFilters && (
                <div className="text-gray-500 text-xs mt-1 print:hidden">overall {stats.percentage}%</div>
              )}
            </div>
          </div>

          {/* Charts Toggle */}
          <div className="mb-4 print:hidden">
            <button
              onClick={() => setShowCharts(prev => !prev)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                showCharts ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
          </div>

          {/* Charts Section */}
          {showCharts && chartData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
              {/* Continent Breakdown - Stacked Bar Chart */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-center">DXCC by Continent</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.continentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#f3f4f6', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#d1d5db' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      formatter={(value, name) => [value, name === 'confirmed' ? 'Confirmed' : 'Worked Only']}
                    />
                    <Legend formatter={(value) => value === 'confirmed' ? 'Confirmed' : 'Worked Only'} />
                    <Bar dataKey="confirmed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="workedOnly" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Band Activity - Stacked Bar Chart */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-center">Band Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.bandData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#f3f4f6', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#d1d5db' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      formatter={(value, name) => [value, name === 'confirmed' ? 'Confirmed' : 'Worked Only']}
                    />
                    <Legend formatter={(value) => value === 'confirmed' ? 'Confirmed' : 'Worked Only'} />
                    <Bar dataKey="confirmed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="workedOnly" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Confirmation Platforms - Horizontal Bar Chart */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-center">Confirmation Platforms</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.platformData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} width={50} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ color: '#f3f4f6', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ color: '#d1d5db' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      formatter={(value) => [`${value} entities`, 'Confirmed']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {chartData.platformData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Band x Continent Heatmap */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-center">Band x Continent</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left text-gray-400"></th>
                        {chartData.bandsToShow.map(band => (
                          <th key={band} className="px-2 py-1 text-center text-gray-400 text-xs">{band}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.heatmapData.map(row => {
                        const maxVal = Math.max(...chartData.bandsToShow.map(b => row[b] || 0), 1)
                        return (
                          <tr key={row.continent}>
                            <td className="px-2 py-1 font-medium text-gray-300">{row.continent}</td>
                            {chartData.bandsToShow.map(band => {
                              const total = row[band] || 0
                              const confirmed = row[`${band}_c`] || 0
                              const worked = row[`${band}_w`] || 0
                              const intensity = total / maxVal
                              return (
                                <td key={band} className="px-1 py-1 text-center" title={`${row.continent} ${band}: ${confirmed}C / ${worked}W`}>
                                  <div
                                    className="rounded mx-auto flex items-center justify-center text-xs font-medium"
                                    style={{
                                      width: '36px',
                                      height: '28px',
                                      backgroundColor: total === 0
                                        ? '#374151'
                                        : confirmed >= worked
                                          ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`
                                          : `rgba(234, 179, 8, ${0.2 + intensity * 0.8})`,
                                      color: total === 0 ? '#6b7280' : '#fff'
                                    }}
                                  >
                                    {total || '-'}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.6)' }}></span> Mostly Confirmed</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.6)' }}></span> Mostly Worked</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-gray-700"></span> None</span>
                </div>
              </div>
            </div>
          )}

          {/* Print-only filter summary */}
          {hasActiveFilters && (
            <div className="hidden print:block text-sm mb-4 border-b border-gray-300 pb-2">
              Filtered by: {[
                filterMode !== 'all' && `Mode: ${activeFilterLabels.mode[filterMode]}`,
                filterOperator !== 'all' && `Operator: ${filterOperator}`,
                filterStatus !== 'all' && `Status: ${activeFilterLabels.status[filterStatus]}`,
                filterContinent !== 'all' && `Continent: ${filterContinent}`,
                filterConfirmation !== 'all' && `Platform: ${activeFilterLabels.confirmation[filterConfirmation]}`,
                filterBand !== 'all' && `Band: ${filterBand}`,
                searchTerm && `Search: "${searchTerm}"`
              ].filter(Boolean).join(' | ')}
            </div>
          )}

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  &quot;{searchTerm}&quot;
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setSearchTerm(''); setCurrentPage(1) }} />
                </span>
              )}
              {filterMode !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {activeFilterLabels.mode[filterMode]}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterMode('all'); setCurrentPage(1) }} />
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {activeFilterLabels.status[filterStatus]}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterStatus('all'); setCurrentPage(1) }} />
                </span>
              )}
              {filterContinent !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {filterContinent}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterContinent('all'); setCurrentPage(1) }} />
                </span>
              )}
              {filterConfirmation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {activeFilterLabels.confirmation[filterConfirmation]}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterConfirmation('all'); setCurrentPage(1) }} />
                </span>
              )}
              {filterOperator !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {filterOperator}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterOperator('all'); setCurrentPage(1) }} />
                </span>
              )}
              {filterBand !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm">
                  {filterBand}
                  <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => { setFilterBand('all'); setCurrentPage(1) }} />
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-sm text-red-400 hover:text-red-300 transition ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center print:hidden">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search country or DXCC ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilterStatus('all'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterStatus('confirmed'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'confirmed' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => { setFilterStatus('worked'); setCurrentPage(1) }}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'worked' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Worked Only
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition"
              >
                <option value="all">All Modes</option>
                <option value="ssb">SSB</option>
                <option value="cw">CW</option>
                <option value="digital">Digital</option>
              </select>
              {availableOperators.length > 1 && (
                <select
                  value={filterOperator}
                  onChange={(e) => {
                    setFilterOperator(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition"
                >
                  <option value="all">All Operators</option>
                  {availableOperators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              )}
              <select
                value={filterContinent}
                onChange={(e) => {
                  setFilterContinent(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition"
              >
                <option value="all">All Continents</option>
                {availableContinents.map(cont => (
                  <option key={cont} value={cont}>{cont}</option>
                ))}
              </select>
              <select
                value={filterConfirmation}
                onChange={(e) => {
                  setFilterConfirmation(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition"
              >
                <option value="all">All Platforms</option>
                <option value="lotw">LOTW</option>
                <option value="eqsl">eQSL</option>
                <option value="qrz">QRZ</option>
                <option value="qsl">Paper</option>
              </select>
              <select
                value={filterBand}
                onChange={(e) => {
                  setFilterBand(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition"
              >
                <option value="all">All Bands</option>
                {BANDS.map(band => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 print:hidden"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-2 print:hidden"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          </div>

          {/* Results Counter */}
          <div className="text-gray-400 text-sm mb-2 px-1 print:hidden">
            Showing {filteredData.length} of {Object.keys(analyzedData).length} entities
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-gray-900 z-10 cursor-pointer select-none hover:bg-gray-800" onClick={() => handleSort('country')}>
                      Country {sortIndicator('country')}
                    </th>
                    <th className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-800" onClick={() => handleSort('dxcc')}>
                      DXCC {sortIndicator('dxcc')}
                    </th>
                    <th className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-800" onClick={() => handleSort('cont')}>
                      Cont {sortIndicator('cont')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer select-none hover:bg-gray-800" onClick={() => handleSort('qsos')}>
                      QSOs {sortIndicator('qsos')}
                    </th>
                    {BANDS.map(band => (
                      <th key={band} className="px-2 py-3 text-center cursor-pointer select-none hover:bg-gray-800 whitespace-nowrap" onClick={() => handleSort(band)}>
                        {band} {sortIndicator(band)}
                      </th>
                    ))}
                    <th className="px-2 py-3 text-center cursor-pointer select-none hover:bg-gray-800 whitespace-nowrap" onClick={() => handleSort('lotw')} title="Logbook of the World">
                      LOTW {sortIndicator('lotw')}
                    </th>
                    <th className="px-2 py-3 text-center cursor-pointer select-none hover:bg-gray-800 whitespace-nowrap" onClick={() => handleSort('eqsl')} title="eQSL.cc">
                      eQSL {sortIndicator('eqsl')}
                    </th>
                    <th className="px-2 py-3 text-center cursor-pointer select-none hover:bg-gray-800 whitespace-nowrap" onClick={() => handleSort('qrz')} title="QRZ.com">
                      QRZ {sortIndicator('qrz')}
                    </th>
                    <th className="px-2 py-3 text-center cursor-pointer select-none hover:bg-gray-800 whitespace-nowrap" onClick={() => handleSort('qsl')} title="Paper QSL">
                      Paper {sortIndicator('qsl')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show paginated data on screen, all data when printing */}
                  {paginatedData.map(([id, data]) => (
                    <tr key={id} className="border-t border-gray-700 hover:bg-gray-700 transition print:hidden">
                      <td className="px-4 py-3 sticky left-0 bg-gray-800 font-medium">
                        {data.country}
                        {data.deleted && <span className="ml-2 text-xs text-red-400 font-normal">(deleted)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{id}</td>
                      <td className="px-4 py-3 text-gray-400">{data.cont}</td>
                      <td className="px-4 py-3 text-center">{getDisplayQsos(data)}</td>
                      {BANDS.map(band => {
                        const status = getDisplayBandStatus(data, band)
                        return (
                          <td key={band} className="px-2 py-3 text-center">
                            {status === 'C' && (
                              <span className="inline-block w-6 h-6 bg-green-600 rounded-full text-xs leading-6">C</span>
                            )}
                            {status === 'W' && (
                              <span className="inline-block w-6 h-6 bg-yellow-600 rounded-full text-xs leading-6">W</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'lotw') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'eqsl') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'qrz') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'qsl') && '✓'}</td>
                    </tr>
                  ))}
                  {/* Print all data */}
                  {filteredData.map(([id, data]) => (
                    <tr key={`print-${id}`} className="border-t border-gray-700 print-show">
                      <td className="px-4 py-3 font-medium">
                        {data.country}
                        {data.deleted && <span className="ml-2 text-xs font-normal">(deleted)</span>}
                      </td>
                      <td className="px-4 py-3">{id}</td>
                      <td className="px-4 py-3">{data.cont}</td>
                      <td className="px-4 py-3 text-center">{getDisplayQsos(data)}</td>
                      {BANDS.map(band => {
                        const status = getDisplayBandStatus(data, band)
                        return (
                          <td key={band} className="px-2 py-3 text-center">
                            {status === 'C' && (
                              <span className="inline-block w-6 h-6 bg-green-600 rounded-full text-xs leading-6">C</span>
                            )}
                            {status === 'W' && (
                              <span className="inline-block w-6 h-6 bg-yellow-600 rounded-full text-xs leading-6">W</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'lotw') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'eqsl') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'qrz') && '✓'}</td>
                      <td className="px-2 py-3 text-center">{getDisplayConfirmation(data, 'qsl') && '✓'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 print:hidden">
            {!showAll && totalPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
                >
                  Next
                </button>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-600 transition text-sm"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={0}>All</option>
              </select>
              <span className="text-gray-400 text-sm">per page</span>
            </div>
          </div>

          {/* Reset */}
          <div className="text-center mt-6 print:hidden">
            <button
              onClick={() => { setLogData(null); setFileName('') }}
              className="text-gray-400 hover:text-white transition underline"
            >
              Upload Different File
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default DXCCAnalyzer
