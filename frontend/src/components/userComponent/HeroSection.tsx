import React from 'react';
import type { HeroSectionProps } from './interface/IUser';

const HeroSection: React.FC<HeroSectionProps> = ({ onUploadClick }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Responsive SVG Illustration */}
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-auto drop-shadow-xl"
              aria-hidden="true"
            >
              {/* Background Map */}
              <rect
                x="60"
                y="50"
                width="480"
                height="300"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="4"
                rx="20"
              />

              {/* Curved Roads */}
              <path
                d="M 100 100 Q 250 150, 400 120"
                stroke="#94a3b8"
                strokeWidth="6"
                fill="none"
                opacity="0.7"
              />
              <path
                d="M 120 250 Q 300 200, 480 260"
                stroke="#94a3b8"
                strokeWidth="6"
                fill="none"
                opacity="0.7"
              />

              {/* Location Pins */}
              <g transform="translate(180, 140)">
                <path
                  d="M 0 -40 A 16 20 0 1 1 0 0 L -12 20 L 12 20 Z"
                  fill="#ef4444"
                />
                <circle cx="0" cy="-18" r="6" fill="white" />
              </g>
              <g transform="translate(300, 170)">
                <path
                  d="M 0 -40 A 16 20 0 1 1 0 0 L -12 20 L 12 20 Z"
                  fill="#3b82f6"
                />
                <circle cx="0" cy="-18" r="6" fill="white" />
              </g>
              <g transform="translate(420, 220)">
                <path
                  d="M 0 -40 A 16 20 0 1 1 0 0 L -12 20 L 12 20 Z"
                  fill="#10b981"
                />
                <circle cx="0" cy="-18" r="6" fill="white" />
              </g>

              {/* Modern Car Icon */}
              <g transform="translate(300, 200)">
                <rect x="-30" y="-15" width="60" height="30" rx="12" fill="#1e40af" />
                <rect x="-25" y="-12" width="50" height="20" rx="8" fill="#60a5fa" />
                <circle cx="-18" cy="15" r="10" fill="#1f2937" />
                <circle cx="18" cy="15" r="10" fill="#1f2937" />
                <rect x="-10" y="-25" width="20" height="15" rx="4" fill="#1e3a8a" />
              </g>
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Track Your Journeys with Ease
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload your trip GPS data in CSV format and get powerful insights: total distance, stops, idling time, overspeed alerts, and more.
            </p>
          </div>

          {/* Upload Button */}
          <div className="pt-4">
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Trip
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-sm sm:text-base text-gray-500">
            Supported format: CSV with latitude, longitude, timestamp, and ignition status
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;