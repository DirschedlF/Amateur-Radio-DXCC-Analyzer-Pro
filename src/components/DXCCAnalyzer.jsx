import { useState, useMemo } from 'react'
import { Upload, Download, Search, Filter } from 'lucide-react'

/**
 * DXCC Analyzer Pro - Main Component
 *
 * Single-file component for analyzing ADIF amateur radio logbooks.
 * Tracks DXCC entities across multiple bands with confirmation status.
 */
function DXCCAnalyzer() {
  const [logData, setLogData] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'confirmed', 'worked'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Supported bands
  const BANDS = ['40m', '30m', '20m', '17m', '15m', '12m', '10m']

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
        const value = match[4].trim()
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
    ]

    return confirmFields.some(field =>
      ['Y', 'V'].includes(qso[field]?.toUpperCase())
    )
  }

  /**
   * Analyze QSOs and build DXCC matrix
   * @param {Array} qsos - Array of QSO records
   * @returns {Object} DXCC analysis data
   */
  const analyzeQSOs = (qsos) => {
    const dxccData = {}

    qsos.forEach(qso => {
      const dxccId = qso.DXCC
      if (!dxccId) return

      const band = qso.BAND
      const country = qso.COUNTRY || 'Unknown'
      const continent = qso.CONT || ''
      const confirmed = isConfirmed(qso)

      // Initialize DXCC entry if not exists
      if (!dxccData[dxccId]) {
        dxccData[dxccId] = {
          country,
          cont: continent,
          total: 0,
          lotw: false,
          eqsl: false,
          qrz: false,
          qsl: false,
          bands: {}
        }

        BANDS.forEach(b => {
          dxccData[dxccId].bands[b] = null
        })
      }

      dxccData[dxccId].total++

      // Track confirmation platforms
      if (qso.LOTW_QSL_RCVD?.toUpperCase() === 'Y') dxccData[dxccId].lotw = true
      if (qso.EQSL_QSL_RCVD?.toUpperCase() === 'Y') dxccData[dxccId].eqsl = true
      if (qso.QSL_RCVD?.toUpperCase() === 'Y') dxccData[dxccId].qsl = true
      if (['QRZCOM_QSL_RCVD', 'QRZ_QSL_RCVD', 'QRZCOM_QSO_DOWNLOAD_STATUS'].some(
        f => ['Y', 'V'].includes(qso[f]?.toUpperCase())
      )) {
        dxccData[dxccId].qrz = true
      }

      // Update band status
      if (band && BANDS.includes(band.toLowerCase())) {
        const normalizedBand = band.toLowerCase()
        const currentStatus = dxccData[dxccId].bands[normalizedBand]

        if (confirmed) {
          dxccData[dxccId].bands[normalizedBand] = 'C'
        } else if (!currentStatus) {
          dxccData[dxccId].bands[normalizedBand] = 'W'
        }
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

    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target.result
      const qsos = parseADIF(content)
      const analyzed = analyzeQSOs(qsos)

      setLogData({
        qsos,
        dxccData: analyzed,
        totalQSOs: qsos.length
      })
      setCurrentPage(1)
    }

    reader.readAsText(file)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!logData) return null

    const dxccEntries = Object.entries(logData.dxccData)
    const worked = dxccEntries.length
    const confirmed = dxccEntries.filter(([_, data]) =>
      BANDS.some(band => data.bands[band] === 'C')
    ).length

    return {
      totalQSOs: logData.totalQSOs,
      worked,
      confirmed,
      percentage: worked > 0 ? ((confirmed / worked) * 100).toFixed(1) : 0
    }
  }, [logData])

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!logData) return []

    let entries = Object.entries(logData.dxccData)

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      entries = entries.filter(([id, data]) =>
        data.country.toLowerCase().includes(term) ||
        id.includes(term)
      )
    }

    // Apply status filter
    if (filterStatus === 'confirmed') {
      entries = entries.filter(([_, data]) =>
        BANDS.some(band => data.bands[band] === 'C')
      )
    } else if (filterStatus === 'worked') {
      entries = entries.filter(([_, data]) =>
        BANDS.every(band => data.bands[band] !== 'C') &&
        BANDS.some(band => data.bands[band] === 'W')
      )
    }

    return entries.sort((a, b) => a[1].country.localeCompare(b[1].country))
  }, [logData, searchTerm, filterStatus])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  /**
   * Export to CSV
   */
  const exportToCSV = () => {
    if (!filteredData.length) return

    const headers = ['DXCC ID', 'Country', 'Continent', 'Total QSOs', ...BANDS, 'LOTW', 'eQSL', 'QRZ', 'Paper']
    const rows = filteredData.map(([id, data]) => [
      id,
      data.country,
      data.cont,
      data.total,
      ...BANDS.map(band => data.bands[band] || ''),
      data.lotw ? 'Yes' : 'No',
      data.eqsl ? 'Yes' : 'No',
      data.qrz ? 'Yes' : 'No',
      data.qsl ? 'Yes' : 'No'
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dxcc-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center">DXCC Analyzer Pro</h1>
        <p className="text-gray-400 text-center">Amateur Radio Logbook Analysis Tool</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Total QSOs</div>
              <div className="text-3xl font-bold">{stats.totalQSOs}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">DXCC Worked</div>
              <div className="text-3xl font-bold text-yellow-500">{stats.worked}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">DXCC Confirmed</div>
              <div className="text-3xl font-bold text-green-500">{stats.confirmed}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">Confirmation Rate</div>
              <div className="text-3xl font-bold text-blue-500">{stats.percentage}%</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search country or DXCC ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'confirmed' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilterStatus('worked')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === 'worked' ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Worked Only
              </button>
            </div>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-gray-900 z-10">Country</th>
                    <th className="px-4 py-3 text-left">DXCC</th>
                    <th className="px-4 py-3 text-left">Cont</th>
                    <th className="px-4 py-3 text-center">QSOs</th>
                    {BANDS.map(band => (
                      <th key={band} className="px-4 py-3 text-center">{band}</th>
                    ))}
                    <th className="px-4 py-3 text-center" title="Logbook of the World">LOTW</th>
                    <th className="px-4 py-3 text-center" title="eQSL.cc">eQSL</th>
                    <th className="px-4 py-3 text-center" title="QRZ.com">QRZ</th>
                    <th className="px-4 py-3 text-center" title="Paper QSL">Paper</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(([id, data]) => (
                    <tr key={id} className="border-t border-gray-700 hover:bg-gray-700 transition">
                      <td className="px-4 py-3 sticky left-0 bg-gray-800 font-medium">{data.country}</td>
                      <td className="px-4 py-3 text-gray-400">{id}</td>
                      <td className="px-4 py-3 text-gray-400">{data.cont}</td>
                      <td className="px-4 py-3 text-center">{data.total}</td>
                      {BANDS.map(band => (
                        <td key={band} className="px-4 py-3 text-center">
                          {data.bands[band] === 'C' && (
                            <span className="inline-block w-6 h-6 bg-green-600 rounded-full text-xs leading-6">C</span>
                          )}
                          {data.bands[band] === 'W' && (
                            <span className="inline-block w-6 h-6 bg-yellow-600 rounded-full text-xs leading-6">W</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">{data.lotw && '✓'}</td>
                      <td className="px-4 py-3 text-center">{data.eqsl && '✓'}</td>
                      <td className="px-4 py-3 text-center">{data.qrz && '✓'}</td>
                      <td className="px-4 py-3 text-center">{data.qsl && '✓'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
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
            </div>
          )}

          {/* Reset */}
          <div className="text-center mt-6">
            <button
              onClick={() => setLogData(null)}
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
