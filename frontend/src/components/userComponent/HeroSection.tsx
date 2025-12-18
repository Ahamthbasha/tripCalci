import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { HeroSectionProps } from "./interface/IUser";
import type { RootState } from "../../redux/store"; 
import {toast} from "react-toastify";

const HeroSection: React.FC<HeroSectionProps> = ({ onUploadClick }) => {
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.userId);

  const handleUploadClick = () => {
    if (userId) {
      onUploadClick();
    } else {
      toast("Please login to upload your trip");
      navigate("/login");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Inline illustration */}
          <div className="w-full max-w-xs sm:max-w-sm mx-auto">
            <svg
              viewBox="0 0 400 220"
              className="w-full h-auto"
              aria-hidden="true"
            >
              {/* Card background */}
              <rect
                x="10"
                y="10"
                width="380"
                height="200"
                rx="16"
                fill="#F9FAFB"
                stroke="#E5E7EB"
              />

              {/* Map */}
              <rect
                x="70"
                y="40"
                width="260"
                height="140"
                rx="14"
                fill="#FFFFFF"
                stroke="#E5E7EB"
              />
              <path
                d="M90 70 Q160 40 230 80 T310 70"
                fill="none"
                stroke="#93C5FD"
                strokeWidth="4"
              />
              <path
                d="M90 130 Q170 170 250 120 T310 140"
                fill="none"
                stroke="#A5B4FC"
                strokeWidth="4"
              />

              {/* Pins */}
              <g transform="translate(130,75)">
                <circle cx="0" cy="0" r="8" fill="#F97316" />
                <path
                  d="M0 8 L-4 16 L4 16 Z"
                  fill="#F97316"
                  opacity="0.9"
                />
              </g>
              <g transform="translate(210,115)">
                <circle cx="0" cy="0" r="8" fill="#3B82F6" />
                <path
                  d="M0 8 L-4 16 L4 16 Z"
                  fill="#3B82F6"
                  opacity="0.9"
                />
              </g>
              <g transform="translate(290,95)">
                <circle cx="0" cy="0" r="8" fill="#10B981" />
                <path
                  d="M0 8 L-4 16 L4 16 Z"
                  fill="#10B981"
                  opacity="0.9"
                />
              </g>

              {/* Two people with map */}
              <g transform="translate(70,155)">
                <rect
                  x="0"
                  y="-40"
                  width="26"
                  height="40"
                  rx="6"
                  fill="#1F2937"
                />
                <circle cx="13" cy="-50" r="9" fill="#FCD34D" />
                <rect
                  x="26"
                  y="-38"
                  width="40"
                  height="26"
                  rx="4"
                  fill="#E5E7EB"
                />
              </g>

              <g transform="translate(290,155)">
                <rect
                  x="-26"
                  y="-40"
                  width="26"
                  height="40"
                  rx="6"
                  fill="#111827"
                />
                <circle cx="-13" cy="-50" r="9" fill="#FBBF24" />
                <rect
                  x="-58"
                  y="-38"
                  width="40"
                  height="26"
                  rx="4"
                  fill="#E5E7EB"
                />
              </g>
            </svg>
          </div>

          {/* Title + subtitle */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Upload Trip
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Upload the Excel sheet of your trip
            </p>
          </div>

          {/* Upload button */}
          <div>
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-slate-900 text-white text-base font-medium hover:bg-slate-800 transition-colors"
            >
              Upload Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
