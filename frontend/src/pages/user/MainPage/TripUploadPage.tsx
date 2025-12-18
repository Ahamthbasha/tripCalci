import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import Header from '../../../components/common/Header'; 
import WelcomeBar from '../../../components/userComponent/WelcomeBar';
import HeroSection from '../../../components/userComponent/HeroSection'; 
import UploadModal from '../../../components/userComponent/UploadModal';
import TripsListTable from '../../../components/userComponent/TripListTable'; 
import { uploadTrip, deleteTrip, trips } from '../../../api/action/userAction';

interface ErrorResponse {
  success: boolean;
  message: string;
}

const TripUploadPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasTrips, setHasTrips] = useState(false);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const navigate = useNavigate();

  // Check if user has trips on component mount
  useEffect(() => {
    checkUserTrips();
  }, []);

  const checkUserTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const response = await trips();
      if (response.success && response.trips) {
        setHasTrips(response.trips.length > 0);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (tripName: string, file: File | null) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!tripName.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tripName', tripName.trim());

      const response = await uploadTrip(formData);

      if (response.success) {
        toast.success('Trip uploaded successfully!');
        setIsModalOpen(false);
        
        // Refresh the page to show updated UI
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to upload trip');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data as ErrorResponse | undefined;
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else if (error.response?.status === 400) {
          toast.error(errorResponse?.message || 'Invalid file format');
        } else {
          toast.error(errorResponse?.message || 'Failed to upload trip. Please try again.');
        }
      } else if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred');
      } else {
        toast.error('Failed to upload trip. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTripSelect = (tripIds: string[]) => {
    console.log('Selected trips:', tripIds);
  };

  const handleDelete = async (tripIds: string[]) => {
    if (tripIds.length === 0) return;

    try {
      const deletePromises = tripIds.map((id) => deleteTrip(id));
      await Promise.all(deletePromises);

      toast.success(`${tripIds.length} trip(s) deleted successfully`);
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data as ErrorResponse | undefined;
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(errorResponse?.message || 'Failed to delete trip(s). Please try again.');
        }
      } else if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred');
      } else {
        toast.error('Failed to delete trip(s). Please try again.');
      }
    }
  };

  const handleOpen = (tripId: string) => {
    navigate(`/trips/${tripId}`);
  };

  // Loading state
  if (isLoadingTrips) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-5xl">
        <WelcomeBar />
        
        {/* Show different UI based on whether user has trips */}
        {!hasTrips ? (
          // No trips - Show full hero section with illustration
          <HeroSection onUploadClick={handleUploadClick} />
        ) : (
          // Has trips - Show compact upload button and trips list
          <>
            {/* Compact Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleUploadClick}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg transition duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  Upload Trip
                </button>
                <p className="text-sm text-gray-500">
                  Upload the Excel sheet of your trip
                </p>
              </div>
            </div>

            {/* Trips List Table */}
            <TripsListTable
              onTripSelect={handleTripSelect}
              onDelete={handleDelete}
              onOpen={handleOpen}
            />
          </>
        )}
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        isLoading={isUploading}
      />
    </div>
  );
};

export default TripUploadPage;