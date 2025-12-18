// import React, { useState, useEffect } from 'react';
// import { ChevronLeft, ChevronRight, Trash2, ArrowRight } from 'lucide-react';
// import { trips } from '../../api/action/userAction';
// import { type Trip } from '../../types/interface/userInterface';
// import type { PaginationInfo, TripsListTableProps } from './interface/IUser';
// import { ConfirmationModal } from '../common/ConfirmationModal';

// const TripsListTable: React.FC<TripsListTableProps> = ({
//   onTripSelect,
//   onDelete,
//   onOpen,
// }) => {
//   const [tripsList, setTripsList] = useState<Trip[]>([]);
//   const [pagination, setPagination] = useState<PaginationInfo | null>(null);
//   const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const limit = 10;

//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [openModalOpen, setOpenModalOpen] = useState(false);

//   const fetchTrips = async (page: number) => {
//     try {
//       setLoading(true);
//       const response = await trips(page, limit);
//       if (response.success) {
//         setTripsList(response.trips || []);
//         setPagination(response.pagination || null);
//       }
//     } catch (error) {
//       console.error('Failed to fetch trips:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTrips(currentPage);
//   }, [currentPage]);

//   const handleTripSelect = (tripId: string) => {
//     const newSelected = selectedTrips.includes(tripId)
//       ? selectedTrips.filter((id) => id !== tripId)
//       : [...selectedTrips, tripId];
//     setSelectedTrips(newSelected);
//     onTripSelect?.(newSelected);
//   };

//   const confirmDelete = () => {
//     if (selectedTrips.length > 0) {
//       onDelete?.(selectedTrips);
//       setSelectedTrips([]);
//       setDeleteModalOpen(false);
//     }
//   };

//   const confirmOpen = () => {
//     if (selectedTrips.length === 1) {
//       onOpen?.(selectedTrips[0]);
//       setOpenModalOpen(false);
//     }
//   };

//   const goToPage = (page: number) => {
//     setCurrentPage(page);
//     setSelectedTrips([]);
//   };

//   const goToPreviousPage = () => {
//     if (pagination?.hasPrevPage) goToPage(currentPage - 1);
//   };

//   const goToNextPage = () => {
//     if (pagination?.hasNextPage) goToPage(currentPage + 1);
//   };

//   const getPageNumbers = () => {
//     if (!pagination) return [];
//     const pages: (number | string)[] = [];
//     const maxVisible = 5;

//     if (pagination.totalPages <= maxVisible) {
//       for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 4; i++) pages.push(i);
//         pages.push('...');
//         pages.push(pagination.totalPages);
//       } else if (currentPage >= pagination.totalPages - 2) {
//         pages.push(1);
//         pages.push('...');
//         for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) pages.push(i);
//       } else {
//         pages.push(1);
//         pages.push('...');
//         pages.push(currentPage - 1);
//         pages.push(currentPage);
//         pages.push(currentPage + 1);
//         pages.push('...');
//         pages.push(pagination.totalPages);
//       }
//     }
//     return pages;
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow p-8 text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//         <p className="mt-4 text-gray-600">Loading trips...</p>
//       </div>
//     );
//   }

//   const selectedCount = selectedTrips.length;

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>

//           <div className="flex items-center gap-4">
//             {/* Show selected count */}
//             {selectedCount > 0 && (
//               <span className="text-sm font-medium text-gray-600">
//                 {selectedCount} selected
//               </span>
//             )}

//             {/* Desktop: Total count when nothing selected */}
//             {selectedCount === 0 && pagination && (
//               <p className="hidden md:block text-sm text-gray-600">
//                 Total: {pagination.totalCount} trips
//               </p>
//             )}

//             {/* Desktop: Action buttons */}
//             {selectedCount > 0 && (
//               <div className="hidden md:flex gap-2">
//                 <button
//                   onClick={() => setDeleteModalOpen(true)}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
//                 >
//                   <Trash2 size={16} />
//                   Delete
//                 </button>
//                 {selectedCount === 1 && (
//                   <button
//                     onClick={() => setOpenModalOpen(true)}
//                     className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
//                   >
//                     <ArrowRight size={16} />
//                     Open
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mobile & Tablet: List View with Row-Level Action Icons */}
//         <div className="md:hidden divide-y divide-gray-200">
//           {tripsList.length === 0 ? (
//             <div className="px-6 py-12 text-center text-gray-500">
//               No trips found. Upload your first trip to get started!
//             </div>
//           ) : (
//             tripsList.map((trip) => {
//               const isSelected = selectedTrips.includes(trip.id);

//               return (
//                 <div
//                   key={trip.id}
//                   className={`px-4 py-4 flex items-center justify-between transition cursor-pointer ${
//                     isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
//                   }`}
//                   onClick={() => handleTripSelect(trip.id)}
//                 >
//                   <div className="flex items-center gap-4">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => handleTripSelect(trip.id)}
//                       onClick={(e) => e.stopPropagation()}
//                       className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                     <div>
//                       <p className="font-medium text-gray-900">{trip.tripName}</p>
//                       {!trip.isProcessed && (
//                         <span className="text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded mt-1 inline-block">
//                           Processing...
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     {/* Always show faint arrow when not selected */}
//                     {!isSelected && (
//                       <ArrowRight size={20} className="text-gray-400" />
//                     )}

//                     {/* Show action buttons only when selected */}
//                     {isSelected && (
//                       <>
//                         {/* Open button - only if exactly one item selected */}
//                         {selectedCount === 1 && (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setOpenModalOpen(true);
//                             }}
//                             className="p-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
//                           >
//                             <ArrowRight size={18} />
//                           </button>
//                         )}

//                         {/* Delete button - always shown when selected */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             // For consistency in modal message, force single selection for delete from row
//                             setSelectedTrips([trip.id]);
//                             setDeleteModalOpen(true);
//                           }}
//                           className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* Desktop: Table View */}
//         <table className="w-full hidden md:table">
//           <thead className="bg-gray-50 border-t border-b">
//             <tr>
//               <th className="w-12 px-4 py-3 text-left">
//                 <input
//                   type="checkbox"
//                   checked={tripsList.length > 0 && tripsList.every((t) => selectedTrips.includes(t.id))}
//                   onChange={(e) => {
//                     if (e.target.checked) {
//                       const allIds = tripsList.map((t) => t.id);
//                       setSelectedTrips(allIds);
//                       onTripSelect?.(allIds);
//                     } else {
//                       setSelectedTrips([]);
//                       onTripSelect?.([]);
//                     }
//                   }}
//                   className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trips</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {tripsList.length === 0 ? (
//               <tr>
//                 <td colSpan={2} className="px-4 py-12 text-center text-gray-500">
//                   No trips found. Upload your first trip to get started!
//                 </td>
//               </tr>
//             ) : (
//               tripsList.map((trip) => (
//                 <tr
//                   key={trip.id}
//                   className="hover:bg-gray-50 cursor-pointer"
//                   onClick={() => handleTripSelect(trip.id)}
//                 >
//                   <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
//                     <input
//                       type="checkbox"
//                       checked={selectedTrips.includes(trip.id)}
//                       onChange={() => handleTripSelect(trip.id)}
//                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                   </td>
//                   <td className="px-4 py-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-gray-900">{trip.tripName}</span>
//                       {!trip.isProcessed && (
//                         <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
//                           Processing...
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         {/* Pagination */}
//         {pagination && pagination.totalPages > 1 && (
//           <div className="flex items-center justify-center gap-2 p-4 border-t">
//             <button
//               onClick={goToPreviousPage}
//               disabled={!pagination.hasPrevPage}
//               className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft size={20} className="text-gray-600" />
//             </button>

//             {getPageNumbers().map((page, index) => (
//               <React.Fragment key={index}>
//                 {page === '...' ? (
//                   <span className="px-3 py-2 text-gray-500">...</span>
//                 ) : (
//                   <button
//                     onClick={() => goToPage(page as number)}
//                     className={`min-w-[40px] h-10 px-3 rounded transition ${
//                       currentPage === page
//                         ? 'bg-blue-600 text-white'
//                         : 'hover:bg-gray-100 text-gray-700'
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 )}
//               </React.Fragment>
//             ))}

//             <button
//               onClick={goToNextPage}
//               disabled={!pagination.hasNextPage}
//               className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronRight size={20} className="text-gray-600" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modals - Used for ALL actions */}
//       <ConfirmationModal
//         isOpen={deleteModalOpen}
//         title="Delete Trips?"
//         message={
//           selectedCount === 1
//             ? 'Are you sure you want to delete this trip? This action cannot be undone.'
//             : `Are you sure you want to delete ${selectedCount} trips? This action cannot be undone.`
//         }
//         confirmLabel="Delete"
//         onConfirm={confirmDelete}
//         onCancel={() => setDeleteModalOpen(false)}
//         isDestructive={true}
//       />

//       <ConfirmationModal
//         isOpen={openModalOpen}
//         title="Open Trip"
//         message="Do you want to open this trip?"
//         confirmLabel="Open"
//         onConfirm={confirmOpen}
//         onCancel={() => setOpenModalOpen(false)}
//       />
//     </>
//   );
// };

// export default TripsListTable;



























import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trips } from '../../api/action/userAction';
import { type Trip } from '../../types/interface/userInterface';
import type { PaginationInfo, TripsListTableProps } from './interface/IUser';
import { ConfirmationModal } from '../common/ConfirmationModal';

const TripsListTable: React.FC<TripsListTableProps> = ({
  onTripSelect,
  onDelete,
  onOpen,
}) => {
  const navigate = useNavigate();
  const [tripsList, setTripsList] = useState<Trip[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [openModalOpen, setOpenModalOpen] = useState(false);

  // Removed unused viewMultiModalOpen & setViewMultiModalOpen

  const fetchTrips = async (page: number) => {
    try {
      setLoading(true);
      const response = await trips(page, limit);
      if (response.success) {
        setTripsList(response.trips || []);
        setPagination(response.pagination || null);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

  const handleTripSelect = (tripId: string) => {
    const newSelected = selectedTrips.includes(tripId)
      ? selectedTrips.filter((id) => id !== tripId)
      : [...selectedTrips, tripId];
    setSelectedTrips(newSelected);
    onTripSelect?.(newSelected);
  };

  const confirmDelete = () => {
    if (selectedTrips.length > 0) {
      onDelete?.(selectedTrips);
      setSelectedTrips([]);
      setDeleteModalOpen(false);
    }
  };

  const confirmOpen = () => {
    if (selectedTrips.length === 1) {
      onOpen?.(selectedTrips[0]);
      setOpenModalOpen(false);
    }
  };

  const handleViewSelected = () => {
    if (selectedTrips.length > 1) {
      navigate('/trips/multi', { state: { tripIds: selectedTrips } });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedTrips([]);
  };

  const goToPreviousPage = () => {
    if (pagination?.hasPrevPage) goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (pagination?.hasNextPage) goToPage(currentPage + 1);
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (pagination.totalPages <= maxVisible) {
      for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(pagination.totalPages);
      } else if (currentPage >= pagination.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(pagination.totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading trips...</p>
      </div>
    );
  }

  const selectedCount = selectedTrips.length;

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>

          <div className="flex items-center gap-4">
            {selectedCount > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {selectedCount} selected
              </span>
            )}

            {selectedCount === 0 && pagination && (
              <p className="hidden md:block text-sm text-gray-600">
                Total: {pagination.totalCount} trips
              </p>
            )}

            {selectedCount > 0 && (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                {selectedCount === 1 && (
                  <button
                    onClick={() => setOpenModalOpen(true)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <ArrowRight size={16} />
                    Open
                  </button>
                )}
                {selectedCount > 1 && (
                  <button
                    onClick={handleViewSelected}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    View Selected
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet: List View */}
        <div className="md:hidden divide-y divide-gray-200">
          {tripsList.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No trips found. Upload your first trip to get started!
            </div>
          ) : (
            tripsList.map((trip) => {
              const isSelected = selectedTrips.includes(trip.id);

              return (
                <div
                  key={trip.id}
                  className={`px-4 py-4 flex items-center justify-between transition cursor-pointer ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleTripSelect(trip.id)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTripSelect(trip.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{trip.tripName}</p>
                      {!trip.isProcessed && (
                        <span className="text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded mt-1 inline-block">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isSelected && (
                      <ArrowRight size={20} className="text-gray-400" />
                    )}

                    {isSelected && (
                      <>
                        {selectedCount === 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenModalOpen(true);
                            }}
                            className="p-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
                          >
                            <ArrowRight size={18} />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrips([trip.id]);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: Table View */}
        <table className="w-full hidden md:table">
          <thead className="bg-gray-50 border-t border-b">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={tripsList.length > 0 && tripsList.every((t) => selectedTrips.includes(t.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = tripsList.map((t) => t.id);
                      setSelectedTrips(allIds);
                      onTripSelect?.(allIds);
                    } else {
                      setSelectedTrips([]);
                      onTripSelect?.([]);
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trips</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tripsList.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-gray-500">
                  No trips found. Upload your first trip to get started!
                </td>
              </tr>
            ) : (
              tripsList.map((trip) => (
                <tr
                  key={trip.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTripSelect(trip.id)}
                >
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTrips.includes(trip.id)}
                      onChange={() => handleTripSelect(trip.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{trip.tripName}</span>
                      {!trip.isProcessed && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Processing...
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button
              onClick={goToPreviousPage}
              disabled={!pagination.hasPrevPage}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`min-w-[40px] h-10 px-3 rounded transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            <button
              onClick={goToNextPage}
              disabled={!pagination.hasNextPage}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Trips?"
        message={
          selectedCount === 1
            ? 'Are you sure you want to delete this trip? This action cannot be undone.'
            : `Are you sure you want to delete ${selectedCount} trips? This action cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={openModalOpen}
        title="Open Trip"
        message="Do you want to open this trip?"
        confirmLabel="Open"
        onConfirm={confirmOpen}
        onCancel={() => setOpenModalOpen(false)}
      />
    </>
  );
};

export default TripsListTable;