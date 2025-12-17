import React, { useState } from 'react';
import Header from '../../../components/common/Header'; 
import WelcomeBar from '../../../components/userComponent/WelcomeBar';
import HeroSection from '../../../components/userComponent/HeroSection'; 
import UploadModal from '../../../components/userComponent/UploadModal'; 

const TripUploadPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (tripName: string, file: File | null) => {
    console.log('Trip Name:', tripName);
    console.log('File:', file);
    
    // Here you would typically handle the file upload to your backend
    // Example API call structure:
    /*
    const formData = new FormData();
    formData.append('tripName', tripName);
    if (file) {
      formData.append('file', file);
    }
    
    try {
      const response = await uploadTrip(formData);
      if (response.success) {
        toast.success('Trip uploaded successfully!');
        setIsModalOpen(false);
        // Navigate or refresh data as needed
      }
    } catch (error) {
      toast.error('Failed to upload trip');
    }
    */
    
    alert(`Trip "${tripName}" uploaded successfully!`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-5xl">
        {/* Welcome Bar */}
        <WelcomeBar />

        {/* Hero Section */}
        <HeroSection onUploadClick={handleUploadClick} />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
};

export default TripUploadPage;