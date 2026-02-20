import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Maximize2, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

/**
 * DXCCWorldMap Component
 *
 * Interactive world map displaying DXCC entities as colored markers.
 * Marker color indicates confirmation status, size indicates Most Wanted rank.
 *
 * @param {Array} entities - Array of entity objects with coordinates and status
 * @param {string} printMode - Print mode state ('none', 'charts', 'report')
 */
export default function DXCCWorldMap({ entities, printMode = 'none' }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!entities || entities.length === 0) {
    return null;
  }

  // Map dimensions based on print mode and fullscreen state
  const mapHeight = isFullscreen ? '100vh' : (printMode !== 'none' ? 250 : 400);
  const mobileHeight = printMode !== 'none' ? 200 : 300;

  // Get marker color based on status
  const getMarkerColor = (entity) => {
    if (entity.status === 'confirmed') {
      return '#22c55e'; // Green (Tailwind green-500)
    } else if (entity.status === 'worked') {
      return '#eab308'; // Amber (Tailwind amber-400)
    } else if (entity.mostWantedRank && entity.mostWantedRank <= 50) {
      return '#ef4444'; // Red (Tailwind red-500) for Most Wanted not-worked
    } else {
      return '#9ca3af'; // Gray (Tailwind gray-400) for regular not-worked
    }
  };

  // Get marker radius - uniform size for all markers
  const getMarkerRadius = (entity) => {
    // All markers same size - color differentiation is sufficient
    return 8;
  };

  // Get marker opacity based on status
  const getMarkerOpacity = (entity) => {
    // Confirmed entities are de-emphasized (70% opacity)
    if (entity.status === 'confirmed') return 0.7;
    // All others at full opacity
    return 1.0;
  };

  // Get marker className (no animation - static display)
  const getMarkerClassName = (entity) => {
    // Static markers only - no pulsing animation
    return '';
  };

  // Format last QSO date for tooltip
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    // YYYYMMDD -> YYYY-MM-DD
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={`dxcc-world-map ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : 'bg-gray-800 rounded-lg mb-6'} ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Header with title and fullscreen button */}
      <div className={`flex items-center justify-between mb-3 ${isFullscreen ? 'px-4 pt-4' : ''}`}>
        <h3 className="text-lg font-semibold text-center flex-1">DXCC World Map</h3>
        {printMode === 'none' && (
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="ml-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={20} /> : <Maximize2 size={20} />}
          </button>
        )}
      </div>

      <div
        className={`rounded-lg overflow-hidden border border-gray-700 ${isFullscreen ? 'mx-4 mb-4' : ''}`}
        style={{
          height: isFullscreen ? 'calc(100vh - 140px)' : typeof mapHeight === 'number' ? `${mapHeight}px` : mapHeight,
        }}
      >
        <MapContainer
          key={isFullscreen ? 'fullscreen' : 'normal'}
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={!printMode || printMode === 'none'}
          dragging={!printMode || printMode === 'none'}
          zoomControl={!printMode || printMode === 'none'}
          doubleClickZoom={!printMode || printMode === 'none'}
          touchZoom={!printMode || printMode === 'none'}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container-dark"
        >
          {/* OpenStreetMap tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* DXCC entity markers */}
          {entities.map((entity) => {
            if (!entity.coords || entity.coords.length !== 2) return null;

            const [lat, lng] = entity.coords;
            const color = getMarkerColor(entity);
            const radius = getMarkerRadius(entity);
            const opacity = getMarkerOpacity(entity);
            const className = getMarkerClassName(entity);

            return (
              <CircleMarker
                key={entity.dxccId}
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: opacity,
                  color: color,
                  weight: 2,
                  opacity: opacity,
                }}
                className={className}
              >
                <Tooltip direction="top" opacity={0.95} className="dxcc-marker-tooltip">
                  <div className="text-xs">
                    <div className="font-semibold text-white">{entity.country}</div>
                    <div className="text-gray-300">
                      DXCC: {entity.dxccId} | {entity.cont}
                    </div>
                    <div className="text-gray-300">
                      Status:{' '}
                      <span
                        className={
                          entity.status === 'confirmed'
                            ? 'text-green-400 font-semibold'
                            : entity.status === 'worked'
                            ? 'text-amber-400 font-semibold'
                            : 'text-gray-400'
                        }
                      >
                        {entity.status === 'confirmed'
                          ? 'Confirmed'
                          : entity.status === 'worked'
                          ? 'Worked'
                          : 'Not Worked'}
                      </span>
                    </div>
                    {entity.total > 0 && (
                      <div className="text-gray-300">QSOs: {entity.total}</div>
                    )}
                    {entity.lastQso && (
                      <div className="text-gray-300">
                        Last QSO: {formatDate(entity.lastQso)}
                      </div>
                    )}
                    {entity.mostWantedRank && (
                      <div className="text-amber-400">
                        Most Wanted Rank: #{entity.mostWantedRank}
                      </div>
                    )}
                    {!entity.hasSpecificCoords && (
                      <div className="text-gray-500 italic text-xs mt-1">
                        (approximate location)
                      </div>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className={`mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-400 ${isFullscreen ? 'px-4 pb-4' : ''}`}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span>Worked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Most Wanted (Not Worked)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Not Worked</span>
        </div>
      </div>
    </div>
  );
}
