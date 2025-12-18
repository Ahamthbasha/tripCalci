// // pages/TripVisualizationPage.tsx
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker } from 'react-leaflet';
// import { toast } from 'react-toastify';
// import Header from '../../../components/common/Header';
// import { getTripVisualization } from '../../../api/action/userAction';
// import { type ITripVisualizationDTO } from '../../../types/interface/userInterface'; 
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix Leaflet marker icons
// import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
// import iconUrl from 'leaflet/dist/images/marker-icon.png';
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// // Fix for default marker icons in Leaflet
// delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: iconRetina,
//   iconUrl: iconUrl,
//   shadowUrl: shadowUrl,
// });

// const TripVisualizationPage: React.FC = () => {
//   const { tripId } = useParams<{ tripId: string }>();
//   const navigate = useNavigate();
//   const [visualization, setVisualization] = useState<ITripVisualizationDTO | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   const fetchVisualization = React.useCallback(async (page: number) => {
//     if (!tripId) return;
    
//     try {
//       setLoading(true);
//       const response = await getTripVisualization(tripId, page, pageSize);
      
//       if (response.success && response.visualization) {
//         setVisualization(response.visualization);
//       } else {
//         toast.error(response.message || 'Failed to load trip visualization');
//         navigate('/trips');
//       }
//     } catch (error) {
//       toast.error('Failed to load trip details');
//       console.error(error);
//       navigate('/trips');
//     } finally {
//       setLoading(false);
//     }
//   }, [tripId, pageSize, navigate]);

//   useEffect(() => {
//     fetchVisualization(currentPage);
//   }, [currentPage, fetchVisualization]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (!visualization) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-xl text-gray-600">No trip data available</p>
//       </div>
//     );
//   }

//   const { mapData, summary, tableData, tripName, uploadDate } = visualization;
//   const totalPages = Math.ceil(tableData.totalRows / pageSize);

//   // Get marker color as Leaflet icon
//   const getMarkerIcon = (color: string) => {
//     const iconColors: Record<string, string> = {
//       red: '#EF4444',
//       blue: '#3B82F6',
//       magenta: '#EC4899',
//     };
    
//     const markerHtmlStyles = `
//       background-color: ${iconColors[color] || iconColors.blue};
//       width: 2rem;
//       height: 2rem;
//       display: block;
//       left: -1rem;
//       top: -1rem;
//       position: relative;
//       border-radius: 2rem 2rem 0;
//       transform: rotate(45deg);
//       border: 3px solid #FFFFFF;
//       box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//     `;

//     return L.divIcon({
//       className: "custom-marker-icon",
//       html: `<span style="${markerHtmlStyles}" />`,
//       iconSize: [32, 32],
//       iconAnchor: [16, 32],
//     });
//   };

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         {/* Top Bar */}
//         <div className="bg-white shadow-sm border-b">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition"
//                 aria-label="Go back"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                 </svg>
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">{tripName}</h1>
//                 <p className="text-sm text-gray-500">
//                   Uploaded on {new Date(uploadDate).toLocaleDateString('en-US', {
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })}
//                 </p>
//               </div>
//             </div>
//             <button 
//               onClick={() => navigate('/trips/upload')}
//               className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition shadow-md"
//             >
//               New Trip
//             </button>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center justify-center gap-6 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow"></div>
//               <span className="font-medium">Stopped</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-5 rounded-full bg-pink-600 border-2 border-white shadow"></div>
//               <span className="font-medium">Idle</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow"></div>
//               <span className="font-medium">Over speeding</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-5 h-1 bg-blue-600 rounded"></div>
//               <span className="font-medium">Normal Route</span>
//             </div>
//           </div>
//         </div>

//         {/* Map */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
//             <MapContainer 
//               center={[mapData.center.latitude, mapData.center.longitude]} 
//               zoom={mapData.zoom} 
//               scrollWheelZoom={true} 
//               style={{ height: '100%', width: '100%' }}
//             >
//               <TileLayer
//                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />

//               {/* Path Segments */}
//               {mapData.pathSegments.map((segment, i) => (
//                 <Polyline
//                   key={`segment-${i}`}
//                   positions={segment.points.map(p => [p.latitude, p.longitude])}
//                   color={segment.color === 'cyan' ? '#06B6D4' : '#3B82F6'}
//                   weight={segment.type === 'overspeeding' ? 7 : 5}
//                   opacity={0.8}
//                 />
//               ))}

//               {/* Markers */}
//               {mapData.markers.map((marker, i) => {
//                 if (marker.type === 'start' || marker.type === 'end') {
//                   return (
//                     <Marker
//                       key={`marker-${i}`}
//                       position={[marker.location.latitude, marker.location.longitude]}
//                       icon={getMarkerIcon(marker.color)}
//                     >
//                       <Popup>
//                         <div className="text-sm font-semibold">{marker.label}</div>
//                       </Popup>
//                     </Marker>
//                   );
//                 }

//                 return (
//                   <CircleMarker
//                     key={`marker-${i}`}
//                     center={[marker.location.latitude, marker.location.longitude]}
//                     radius={10}
//                     fillColor={marker.color === 'blue' ? '#2563EB' : '#EC4899'}
//                     color={marker.color === 'blue' ? '#1E40AF' : '#BE185D'}
//                     weight={3}
//                     fillOpacity={0.9}
//                   >
//                     <Popup>
//                       <div className="text-sm">
//                         <b>{marker.label}</b>
//                         {marker.startTime && marker.endTime && (
//                           <>
//                             <br />
//                             <span className="text-gray-600">
//                               {new Date(marker.startTime).toLocaleString()} →{' '}
//                               {new Date(marker.endTime).toLocaleString()}
//                             </span>
//                           </>
//                         )}
//                       </div>
//                     </Popup>
//                   </CircleMarker>
//                 );
//               })}
//             </MapContainer>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-gray-900">{summary.totalDistanceTravelled}</div>
//             <div className="text-sm text-gray-600 mt-1">Total Distance Travelled</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-gray-900">{summary.totalTravelledDuration}</div>
//             <div className="text-sm text-gray-600 mt-1">Total Travelled Duration</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-cyan-600">{summary.overspeedingDuration}</div>
//             <div className="text-sm text-gray-600 mt-1">Over Speeding Duration</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-gray-900">{summary.overspeedingDistance}</div>
//             <div className="text-sm text-gray-600 mt-1">Over Speeding Distance</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-blue-600">{summary.stoppedDuration}</div>
//             <div className="text-sm text-gray-600 mt-1">Stopped Duration</div>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition">
//             <div className="text-3xl font-bold text-pink-600">{summary.idlingDuration}</div>
//             <div className="text-sm text-gray-600 mt-1">Idling Duration</div>
//           </div>
//         </div>

//         {/* Events Table */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="px-6 py-4 border-b bg-gray-50">
//               <h2 className="text-lg font-semibold text-gray-900">Trip Events</h2>
//               <p className="text-sm text-gray-600 mt-1">Detailed breakdown of all events during this trip</p>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time Range
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Location
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Ignition
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Speed
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Summary
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {tableData.rows.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
//                         No events recorded for this trip
//                       </td>
//                     </tr>
//                   ) : (
//                     tableData.rows.map((row, i) => (
//                       <tr key={i} className="hover:bg-gray-50 transition">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {row.timeRange}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                           {row.point}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                             row.ignition === 'ON' 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {row.ignition}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {row.speed}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           <div className="space-y-1">
//                             {row.summary.travelDuration && (
//                               <div className="text-green-600 font-medium">
//                                 ✓ Travel Duration: {row.summary.travelDuration}
//                               </div>
//                             )}
//                             {row.summary.stoppedFrom && (
//                               <div className="text-blue-600 font-medium">
//                                 ⏸ Stopped: {row.summary.stoppedFrom}
//                               </div>
//                             )}
//                             {row.summary.idlingDuration && (
//                               <div className="text-pink-600 font-medium">
//                                 ⏱ Idling: {row.summary.idlingDuration}
//                               </div>
//                             )}
//                             {row.summary.overspeedingDuration && (
//                               <div className="text-cyan-600 font-medium">
//                                 ⚡ Overspeeding: {row.summary.overspeedingDuration}
//                               </div>
//                             )}
//                             {row.summary.distance && (
//                               <div className="text-gray-600">
//                                 📍 Distance: {row.summary.distance}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {tableData.totalRows > 0 && (
//               <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
//                 <div className="text-sm text-gray-600">
//                   Showing {(currentPage - 1) * pageSize + 1} to{' '}
//                   {Math.min(currentPage * pageSize, tableData.totalRows)} of {tableData.totalRows} entries
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition text-sm font-medium"
//                   >
//                     Previous
//                   </button>
//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setCurrentPage(pageNum)}
//                           className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
//                             currentPage === pageNum
//                               ? 'bg-gray-900 text-white'
//                               : 'border border-gray-300 hover:bg-gray-100'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>
//                   <button
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages}
//                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition text-sm font-medium"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TripVisualizationPage;































// pages/TripVisualizationPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, Marker } from 'react-leaflet';
import { toast } from 'react-toastify';
import Header from '../../../components/common/Header';
import { getTripVisualization } from '../../../api/action/userAction';
import { type ITripVisualizationDTO } from '../../../types/interface/userInterface';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl,
  shadowUrl,
});

const TripVisualizationPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState<ITripVisualizationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchVisualization = React.useCallback(
    async (page: number) => {
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
    },
    [tripId, pageSize, navigate]
  );

  useEffect(() => {
    fetchVisualization(currentPage);
  }, [currentPage, fetchVisualization]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900" />
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

  const { mapData, summary, tableData, tripName, uploadDate } = visualization;
  const totalPages = Math.ceil(tableData.totalRows / pageSize);

  // Get marker color as Leaflet icon
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
      className: 'custom-marker-icon',
      html: `<span style="${markerHtmlStyles}" />`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Top Bar */}
        <div className="border-b">
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
                <h1 className="text-xl font-semibold text-gray-900">{tripName}</h1>
                <p className="text-xs text-gray-500">
                  Uploaded on{' '}
                  {new Date(uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/trips/upload')}
              className="bg-gray-900 text-white px-5 py-2 rounded-md hover:bg-gray-800 transition text-sm"
            >
              New Trip
            </button>
          </div>
        </div>

        {/* Summary strip (Figma-style cards) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="border rounded-md px-5 py-4 bg-white">
            <div className="text-xs text-gray-500 mb-1">Total Distance Travelled</div>
            <div className="text-2xl font-semibold text-gray-900">{summary.totalDistanceTravelled}</div>
          </div>
          <div className="border rounded-md px-5 py-4 bg-white">
            <div className="text-xs text-gray-500 mb-1">Total Travelled Duration</div>
            <div className="text-2xl font-semibold text-gray-900">{summary.totalTravelledDuration}</div>
          </div>
          <div className="border rounded-md px-5 py-4 bg-white">
            <div className="text-xs text-gray-500 mb-1">Over Speeding Duration</div>
            <div className="text-2xl font-semibold text-gray-900">{summary.overspeedingDuration}</div>
          </div>
          <div className="border rounded-md px-5 py-4 bg-white">
            <div className="text-xs text-gray-500 mb-1">Over Speeding Distance</div>
            <div className="text-2xl font-semibold text-gray-900">{summary.overspeedingDistance}</div>
          </div>
          <div className="border rounded-md px-5 py-4 bg-white">
            <div className="text-xs text-gray-500 mb-1">Stopped Duration</div>
            <div className="text-2xl font-semibold text-gray-900">{summary.stoppedDuration}</div>
          </div>
        </div>

        {/* Map */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-6">
          <div className="border rounded-md overflow-hidden" style={{ height: '420px' }}>
            <MapContainer
              center={[mapData.center.latitude, mapData.center.longitude]}
              zoom={mapData.zoom}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Path Segments */}
              {mapData.pathSegments.map((segment, i) => (
                <Polyline
                  key={`segment-${i}`}
                  positions={segment.points.map(p => [p.latitude, p.longitude])}
                  color={segment.color === 'cyan' ? '#00BBD4' : '#2196F3'}
                  weight={segment.type === 'overspeeding' ? 6 : 4}
                  opacity={0.9}
                />
              ))}

              {/* Markers */}
              {mapData.markers.map((marker, i) => {
                if (marker.type === 'start' || marker.type === 'end') {
                  return (
                    <Marker
                      key={`marker-${i}`}
                      position={[marker.location.latitude, marker.location.longitude]}
                      icon={getMarkerIcon(marker.color)}
                    >
                      <Popup>
                        <div className="text-sm font-semibold">{marker.label}</div>
                      </Popup>
                    </Marker>
                  );
                }

                return (
                  <CircleMarker
                    key={`marker-${i}`}
                    center={[marker.location.latitude, marker.location.longitude]}
                    radius={8}
                    fillColor={marker.color === 'blue' ? '#2563EB' : '#EC4899'}
                    color={marker.color === 'blue' ? '#1E40AF' : '#BE185D'}
                    weight={2}
                    fillOpacity={0.9}
                  >
                    <Popup>
                      <div className="text-xs">
                        <b>{marker.label}</b>
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
              })}
            </MapContainer>
          </div>
        </div>

        {/* Table + side summary (Figma-style) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="border rounded-md overflow-hidden bg-white">
            <div className="flex flex-col lg:flex-row">
              {/* Main table */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Time</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Point</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Ignition</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-gray-500 border-t"
                          >
                            No events recorded for this trip
                          </td>
                        </tr>
                      ) : (
                        tableData.rows.map((row, i) => (
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                              {row.timeRange}
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                              {row.point}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  row.ignition === 'ON'
                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                    : 'bg-red-50 text-red-600 border border-red-200'
                                }`}
                              >
                                {row.ignition}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                              {row.speed}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination under table */}
                {tableData.totalRows > 0 && (
                  <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-gray-600">
                    <div>
                      Showing {(currentPage - 1) * pageSize + 1} to{' '}
                      {Math.min(currentPage * pageSize, tableData.totalRows)} of{' '}
                      {tableData.totalRows} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 border rounded disabled:opacity-40"
                      >
                        {'<'}
                      </button>
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
                            className={`px-3 py-1 rounded text-xs ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 border rounded disabled:opacity-40"
                      >
                        {'>'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right-side summary panel (no icons, just bold labels) */}
              <div className="w-full lg:w-64 bg-gray-50 px-5 py-4 space-y-2 text-sm">
                {/* Use first row summary to mimic Figma side details */}
                {tableData.rows[0] && (
                  <>
                    {tableData.rows[0].summary.travelDuration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Travel Duration</span>
                        <span className="font-semibold text-gray-900">
                          {tableData.rows[0].summary.travelDuration}
                        </span>
                      </div>
                    )}
                    {tableData.rows[0].summary.stoppedFrom && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stopped from</span>
                        <span className="font-semibold text-gray-900">
                          {tableData.rows[0].summary.stoppedFrom}
                        </span>
                      </div>
                    )}
                    {tableData.rows[0].summary.distance && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Distance</span>
                        <span className="font-semibold text-gray-900">
                          {tableData.rows[0].summary.distance}
                        </span>
                      </div>
                    )}
                    {tableData.rows[0].summary.overspeedingDuration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Overspeeding Duration</span>
                        <span className="font-semibold text-gray-900">
                          {tableData.rows[0].summary.overspeedingDuration}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TripVisualizationPage;
