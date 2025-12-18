import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker, useMap } from 'react-leaflet';
import { toast } from 'react-toastify';
import Header from '../../../components/common/Header';
import { getMultipleTripsVisualization, getTripVisualization } from "../../../api/action/userAction";
import { 
  type IMultipleTripsVisualizationDTO, 
  type ITripSummaryDTO, 
  type ITableRowDTO 
} from "../../../types/interface/userInterface";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const MultiTripVisualizationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState<IMultipleTripsVisualizationDTO | null>(null);
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [activeSummary, setActiveSummary] = useState<ITripSummaryDTO | null>(null);
  const [activeTableData, setActiveTableData] = useState<{ 
    rows: ITableRowDTO[]; 
    totalRows: number; 
    currentPage: number; 
    pageSize: number 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const tripIds = location.state?.tripIds as string[] | undefined;

  useEffect(() => {
    if (!tripIds || tripIds.length < 2) {
      toast.error('Invalid selection for multiple trips');
      navigate('/trips');
      return;
    }

    const fetchMultiVisualization = async () => {
      try {
        setLoading(true);
        const response = await getMultipleTripsVisualization(tripIds);
        
        if (response.success && response.visualization) {
          setVisualization(response.visualization);
          if (response.visualization.trips.length > 0) {
            setActiveSummary(response.visualization.trips[0].summary);
          }
        } else {
          toast.error(response.message || 'Failed to load multiple trips visualization');
          navigate('/trips');
        }
      } catch (error) {
        toast.error('Failed to load multiple trips details');
        console.error(error);
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };

    fetchMultiVisualization();
  }, [tripIds, navigate]);

  // Wrap fetchTableForActiveTrip in useCallback to satisfy exhaustive-deps
  const fetchTableForActiveTrip = useCallback(async (page: number) => {
    if (!visualization || !visualization.trips[activeTripIndex]) return;
    
    try {
      setTableLoading(true);
      const tripId = visualization.trips[activeTripIndex].tripId;
      const response = await getTripVisualization(tripId, page, pageSize);
      
      if (response.success && response.visualization) {
        setActiveTableData(response.visualization.tableData);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setTableLoading(false);
    }
  }, [visualization, activeTripIndex]);

  // Now include fetchTableForActiveTrip in dependencies
  useEffect(() => {
    if (visualization && visualization.trips[activeTripIndex]) {
      setActiveSummary(visualization.trips[activeTripIndex].summary);
      fetchTableForActiveTrip(currentPage);
    }
  }, [activeTripIndex, visualization, currentPage, fetchTableForActiveTrip]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
      </div>
    );
  }

  if (!visualization || visualization.trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">No trips data available</p>
      </div>
    );
  }

  const { mapBounds, trips } = visualization;
  const totalPages = activeTableData ? Math.ceil(activeTableData.totalRows / pageSize) : 0;

  const getMarkerIcon = (color: string) => {
    const iconColors: Record<string, string> = {
      red: '#EF4444',
      blue: '#3B82F6',
      magenta: '#EC4899',
    };
    
    const markerHtmlStyles = `
      background-color: ${iconColors[color] || iconColors.blue};
      width: 2rem;
      height: 2rem;
      display: block;
      left: -1rem;
      top: -1rem;
      position: relative;
      border-radius: 2rem 2rem 0;
      transform: rotate(45deg);
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    return L.divIcon({
      className: "custom-marker-icon",
      html: `<span style="${markerHtmlStyles}" />`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  const FitBounds: React.FC<{ bounds: { north: number; south: number; east: number; west: number } }> = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
      map.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]]);
    }, [map, bounds]);
    return null;
  };

  return (
    // ... rest of JSX remains exactly the same as before
    // (no changes needed in render part)
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multiple Trips View</h1>
                <p className="text-sm text-gray-500">
                  Viewing {trips.length} trips
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/trips/upload')}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition shadow-md"
            >
              New Trip
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow"></div>
              <span className="font-medium">Stopped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-pink-600 border-2 border-white shadow"></div>
              <span className="font-medium">Idle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow"></div>
              <span className="font-medium">Over speeding</span>
            </div>
            {trips.map((trip, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-1 rounded" style={{ backgroundColor: trip.color }}></div>
                <span className="font-medium">{trip.tripName} Route</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <MapContainer 
              center={[0, 0]} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds bounds={mapBounds} />

              {trips.map((trip, tripIndex) => (
                trip.pathSegments.map((segment, segIndex) => (
                  <Polyline
                    key={`trip-${tripIndex}-segment-${segIndex}`}
                    positions={segment.points.map(p => [p.latitude, p.longitude])}
                    color={segment.color === 'cyan' ? '#06B6D4' : trip.color}
                    weight={segment.type === 'overspeeding' ? 7 : 5}
                    opacity={activeTripIndex === tripIndex ? 1 : 0.6}
                  />
                ))
              ))}

              {trips.map((trip, tripIndex) => (
                trip.markers.map((marker, i) => {
                  const opacity = activeTripIndex === tripIndex ? 1 : 0.6;
                  if (marker.type === 'start' || marker.type === 'end') {
                    return (
                      <Marker
                        key={`trip-${tripIndex}-marker-${i}`}
                        position={[marker.location.latitude, marker.location.longitude]}
                        icon={getMarkerIcon(marker.color)}
                        opacity={opacity}
                      >
                        <Popup>
                          <div className="text-sm font-semibold">{marker.label} - {trip.tripName}</div>
                        </Popup>
                      </Marker>
                    );
                  }

                  return (
                    <CircleMarker
                      key={`trip-${tripIndex}-marker-${i}`}
                      center={[marker.location.latitude, marker.location.longitude]}
                      radius={10}
                      fillColor={marker.color === 'blue' ? '#2563EB' : '#EC4899'}
                      color={marker.color === 'blue' ? '#1E40AF' : '#BE185D'}
                      weight={3}
                      fillOpacity={opacity}
                      opacity={opacity}
                    >
                      <Popup>
                        <div className="text-sm">
                          <b>{marker.label} - {trip.tripName}</b>
                          {marker.startTime && marker.endTime && (
                            <>
                              <br />
                              <span className="text-gray-600">
                                {new Date(marker.startTime).toLocaleString()} →{' '}
                                {new Date(marker.endTime).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex space-x-4 border-b border-gray-200">
            {trips.map((trip, index) => (
              <button
                key={trip.tripId}
                onClick={() => {
                  setActiveTripIndex(index);
                  setCurrentPage(1);
                }}
                className={`py-2 px-4 font-medium ${
                  activeTripIndex === index
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {trip.tripName}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {activeSummary && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-gray-900">{activeSummary.totalDistanceTravelled}</div>
              <div className="text-sm text-gray-600 mt-1">Total Distance Travelled</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-gray-900">{activeSummary.totalTravelledDuration}</div>
              <div className="text-sm text-gray-600 mt-1">Total Travelled Duration</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-cyan-600">{activeSummary.overspeedingDuration}</div>
              <div className="text-sm text-gray-600 mt-1">Over Speeding Duration</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-gray-900">{activeSummary.overspeedingDistance}</div>
              <div className="text-sm text-gray-600 mt-1">Over Speeding Distance</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600">{activeSummary.stoppedDuration}</div>
              <div className="text-sm text-gray-600 mt-1">Stopped Duration</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
              <div className="text-3xl font-bold text-pink-600">{activeSummary.idlingDuration}</div>
              <div className="text-sm text-gray-600 mt-1">Idling Duration</div>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Trip Events - {trips[activeTripIndex]?.tripName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Detailed breakdown of all events during this trip</p>
            </div>
            {tableLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : activeTableData ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ignition</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeTableData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No events recorded for this trip
                          </td>
                        </tr>
                      ) : (
                        activeTableData.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.timeRange}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.point}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                row.ignition === 'ON' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {row.ignition}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.speed}</td>
                            <td className="px-6 py-4 text-sm">
                              <div className="space-y-1">
                                {row.summary.travelDuration && (
                                  <div className="text-green-600 font-medium">✓ Travel Duration: {row.summary.travelDuration}</div>
                                )}
                                {row.summary.stoppedFrom && (
                                  <div className="text-blue-600 font-medium">⏸ Stopped: {row.summary.stoppedFrom}</div>
                                )}
                                {row.summary.idlingDuration && (
                                  <div className="text-pink-600 font-medium">⏱ Idling: {row.summary.idlingDuration}</div>
                                )}
                                {row.summary.overspeedingDuration && (
                                  <div className="text-cyan-600 font-medium">⚡ Overspeeding: {row.summary.overspeedingDuration}</div>
                                )}
                                {row.summary.distance && (
                                  <div className="text-gray-600">📍 Distance: {row.summary.distance}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {activeTableData.totalRows > 0 && (
                  <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * pageSize + 1} to{' '}
                      {Math.min(currentPage * pageSize, activeTableData.totalRows)} of {activeTableData.totalRows} entries
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition text-sm font-medium"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
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
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                currentPage === pageNum
                                  ? 'bg-gray-900 text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition text-sm font-medium"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No table data available
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiTripVisualizationPage;