import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';
import type { HeroSectionProps } from './interface/IUser';

const HeroSection: React.FC<HeroSectionProps> = ({ onUploadClick }) => {
  const navigate = useNavigate();
  const { userId, email } = useSelector((state: RootState) => state.user);

  const handleUploadClick = () => {
    // Check if user is logged in
    if (!userId || !email) {
      toast.error('Please login to upload a trip');
        navigate('/login');
      return;
    }

    // User is logged in, proceed with upload
    onUploadClick();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Illustration */}
        <div className="w-64 h-64 relative">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Map Background */}
            <rect x="50" y="30" width="300" height="220" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="8"/>
            
            {/* Map Lines */}
            <path d="M 80 60 Q 150 100, 220 80" stroke="#9ca3af" strokeWidth="2" fill="none"/>
            <path d="M 100 150 L 180 130 L 250 160" stroke="#9ca3af" strokeWidth="2" fill="none"/>
            <path d="M 120 200 Q 200 180, 280 210" stroke="#9ca3af" strokeWidth="2" fill="none"/>
            
            {/* Location Pins */}
            <g transform="translate(150, 100)">
              <path d="M 0 0 Q -8 -15, 0 -25 Q 8 -15, 0 0 Z" fill="#ef4444"/>
              <circle cx="0" cy="-15" r="3" fill="white"/>
            </g>
            <g transform="translate(220, 130)">
              <path d="M 0 0 Q -8 -15, 0 -25 Q 8 -15, 0 0 Z" fill="#3b82f6"/>
              <circle cx="0" cy="-15" r="3" fill="white"/>
            </g>
            <g transform="translate(180, 180)">
              <path d="M 0 0 Q -8 -15, 0 -25 Q 8 -15, 0 0 Z" fill="#10b981"/>
              <circle cx="0" cy="-15" r="3" fill="white"/>
            </g>
            
            {/* Left Person */}
            <g transform="translate(20, 150)">
              {/* Head */}
              <circle cx="0" cy="0" r="15" fill="#fbbf24"/>
              {/* Body */}
              <rect x="-12" y="15" width="24" height="35" fill="#1e3a8a" rx="5"/>
              {/* Arms */}
              <rect x="-20" y="20" width="8" height="25" fill="#1e3a8a" rx="3"/>
              <rect x="12" y="20" width="8" height="25" fill="#fbbf24" rx="3"/>
              {/* Legs */}
              <rect x="-10" y="50" width="8" height="30" fill="#1e3a8a" rx="3"/>
              <rect x="2" y="50" width="8" height="30" fill="#1e3a8a" rx="3"/>
            </g>
            
            {/* Right Person */}
            <g transform="translate(380, 150)">
              {/* Head */}
              <circle cx="0" cy="0" r="15" fill="#fbbf24"/>
              {/* Body */}
              <rect x="-12" y="15" width="24" height="35" fill="#1e3a8a" rx="5"/>
              {/* Arms */}
              <rect x="-20" y="20" width="8" height="25" fill="#fbbf24" rx="3"/>
              <rect x="12" y="20" width="8" height="25" fill="#1e3a8a" rx="3"/>
              {/* Legs */}
              <rect x="-10" y="50" width="8" height="30" fill="#eab308" rx="3"/>
              <rect x="2" y="50" width="8" height="30" fill="#eab308" rx="3"/>
            </g>
          </svg>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          Upload Trip
        </button>

        {/* Helper Text */}
        <p className="text-sm text-gray-500">
          Upload the Excel sheet of your trip
        </p>
      </div>
    </div>
  );
};

export default HeroSection;