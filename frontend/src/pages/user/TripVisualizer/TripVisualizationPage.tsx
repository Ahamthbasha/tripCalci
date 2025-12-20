import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import { Clock, MapPin, ArrowLeft, Pause } from 'lucide-react';
import L from 'leaflet';
import { getTripVisualization } from '../../../api/action/userAction';
import { type ITripVisualizationDTO } from '../../../types/interface/userInterface';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Type-safe way to handle Leaflet icon default
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}

const iconDefault = L.Icon.Default.prototype as LeafletIconDefault;
delete iconDefault._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const TripVisualizationPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState<ITripVisualizationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchVisualization = useCallback(async (page: number) => {
    if (!tripId) return;
    try {
      setLoading(true);
      const response = await getTripVisualization(tripId, page, pageSize);
      if (response.success && response.visualization) {
        setVisualization(response.visualization);
      } else {
        toast.error(response.message || 'Failed to load trip visualization');
        navigate('/trips');
      }
    } catch (error) {
      toast.error('Failed to load trip details');
      console.error(error);
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  }, [tripId, navigate]);

  useEffect(() => {
    fetchVisualization(currentPage);
  }, [currentPage, fetchVisualization]);

  // Custom icon for start/end markers
  const createCustomIcon = (color: string) => {
    const iconColors: Record<string, string> = {
      red: '#EF4444',
      blue: '#3B82F6',
      magenta: '#EC4899',
    };
    const selectedColor = iconColors[color] || iconColors.blue;
    const markerHtmlStyles = `
      background-color: ${selectedColor};
      width: 1.75rem;
      height: 1.75rem;
      display: block;
      left: -0.875rem;
      top: -0.875rem;
      position: relative;
      border-radius: 1.75rem 1.75rem 0;
      transform: rotate(45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    return L.divIcon({
      className: 'custom-marker-icon',
      html: `<span style="${markerHtmlStyles}" />`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!visualization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">No trip data available</p>
      </div>
    );
  }

  const { mapData, summary, tableData, tripName } = visualization;
  const totalPages = Math.ceil(tableData.totalRows / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{tripName}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-3 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Stopped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-sm"></div>
            <span className="font-medium text-gray-700">Over speeding</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '500px' }}>
          <MapContainer
            center={[mapData.center.latitude, mapData.center.longitude]}
            zoom={mapData.zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Continuous path + overspeeding overlay */}
            {(() => {
              const allPoints = mapData.pathSegments.reduce((acc, segment, i) => {
                if (i === 0) return segment.points;
                const last = acc[acc.length - 1];
                const first = segment.points[0];
                if (last.latitude === first.latitude && last.longitude === first.longitude) {
                  return [...acc, ...segment.points.slice(1)];
                }
                return [...acc, ...segment.points];
              }, [] as Array<{ latitude: number; longitude: number }>);
              return (
                <>
                  <Polyline
                    positions={allPoints.map(p => [p.latitude, p.longitude])}
                    color="#3B82F6"
                    weight={5}
                    opacity={1}
                  />
                  {mapData.pathSegments
                    .filter(segment => segment.type === 'overspeeding')
                    .map((segment, i) => (
                      <Polyline
                        key={`overspeed-${i}`}
                        positions={segment.points.map(p => [p.latitude, p.longitude])}
                        color="#06B6D4"
                        weight={7}
                        opacity={1}
                      />
                    ))}
                </>
              );
            })()}
            {/* Markers */}
            {(() => {
              const markerGroups = new Map<string, typeof mapData.markers>();
              mapData.markers.forEach(marker => {
                if (marker.type !== 'start' && marker.type !== 'end') {
                  const key = `${marker.location.latitude},${marker.location.longitude}`;
                  if (!markerGroups.has(key)) markerGroups.set(key, []);
                  markerGroups.get(key)!.push(marker);
                }
              });
              const renderedMarkers: React.ReactElement[] = [];

              // Start/End markers
              mapData.markers.forEach((marker, i) => {
                if (marker.type === 'start' || marker.type === 'end') {
                  renderedMarkers.push(
                    <Marker
                      key={`marker-${i}`}
                      position={[marker.location.latitude, marker.location.longitude]}
                      icon={createCustomIcon(marker.color)}
                    >
                      <Popup>
                        <div className="text-sm font-semibold">{marker.label}</div>
                      </Popup>
                    </Marker>
                  );
                }
              });

              // Grouped stoppage/idle markers
              markerGroups.forEach((markers, key) => {
                const [lat, lng] = key.split(',').map(Number);
                const sorted = [...markers].sort((a, b) =>
                  a.type === 'stoppage' && b.type === 'idling' ? -1 : 1
                );
                const hasStoppage = sorted.some(m => m.type === 'stoppage');
                const pinColor = hasStoppage ? '#2563EB' : '#EC4899';
                const borderColor = hasStoppage ? '#1E40AF' : '#BE185D';
                const labelsHtml = sorted
                  .map((marker, index) => {
                    const bg = marker.color === 'blue' ? '#3B82F6' : '#EC4899';
                    const offset = 25 + index * 40;
                    return `
                      <div style="
                        position: absolute;
                        bottom: ${offset}px;
                        left: 50%;
                        transform: translateX(-50%);
                        background-color: ${bg};
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        white-space: nowrap;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        pointer-events: none;
                        z-index: ${1000 + index};
                      ">
                        ${marker.label}
                      </div>
                    `;
                  })
                  .join('');
                const groupedIcon = L.divIcon({
                  className: 'custom-label-marker',
                  html: `
                    <div style="position: relative;">
                      ${labelsHtml}
                      <div style="
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background-color: ${pinColor};
                        border: 3px solid ${borderColor};
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                      "></div>
                    </div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                });
                renderedMarkers.push(
                  <Marker
                    key={`grouped-${key}`}
                    position={[lat, lng]}
                    icon={groupedIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        {sorted.map((marker, idx) => (
                          <div
                            key={idx}
                            className={idx > 0 ? 'mt-2 pt-2 border-t border-gray-300' : ''}
                          >
                            <div className="font-semibold">{marker.label}</div>
                            {marker.startTime && marker.endTime && (
                              <div className="text-xs text-gray-600 mt-1">
                                {new Date(marker.startTime).toLocaleTimeString()} →{' '}
                                {new Date(marker.endTime).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Popup>
                  </Marker>
                );
              });
              return renderedMarkers;
            })()}
          </MapContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{summary.totalDistanceTravelled}</div>
            <div className="text-xs text-gray-600">Total Distance Travelled</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{summary.totalTravelledDuration}</div>
            <div className="text-xs text-gray-600">Total Travelled Duration</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-600 mb-1">{summary.overspeedingDuration}</div>
            <div className="text-xs text-gray-600">Over Speeding Duration</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <MapPin className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{summary.overspeedingDistance}</div>
            <div className="text-xs text-gray-600">Over Speeding Distance</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{summary.stoppedDuration}</div>
            <div className="text-xs text-gray-600">Stopped Duration</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Pause className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-pink-600 mb-1">{summary.idlingDuration}</div>
            <div className="text-xs text-gray-600">Idle Duration</div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Point</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ignition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No events recorded for this trip
                    </td>
                  </tr>
                ) : (
                  tableData.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.timeRange}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.point}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            row.ignition === 'ON'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {row.ignition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.speed}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {row.summary.travelDuration && (
                          <div className="mb-1">
                            <span className="font-medium">Travel Duration:</span> {row.summary.travelDuration}
                          </div>
                        )}
                        {row.summary.stoppedFrom && (
                          <div className="mb-1">
                            <span className="font-medium">Stopped from:</span> {row.summary.stoppedFrom}
                          </div>
                        )}
                        {row.summary.distance && (
                          <div className="mb-1">
                            <span className="font-medium">Distance:</span> {row.summary.distance}
                          </div>
                        )}
                        {row.summary.idlingDuration && (
                          <div className="mb-1 text-pink-600">
                            <span className="font-medium">Idling:</span> {row.summary.idlingDuration}
                          </div>
                        )}
                        {row.summary.overspeedingDuration && (
                          <div className="text-cyan-700">
                            <span className="font-medium">Overspeeding:</span> {row.summary.overspeedingDuration}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {tableData.totalRows > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripVisualizationPage;