import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogOut, LogIn, User } from 'lucide-react';
import { clearUserDetails } from '../../redux/slices/userSlice'; 
import { logout } from '../../api/auth/userAuth';
import type { RootState } from '../../redux/store';
import type { HeaderProps } from './interface/commonComponent';

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { email } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      const response = await logout();
      
      if (response.success) {
        dispatch(clearUserDetails());
        toast.success(response.message || 'Logged out successfully');
        navigate('/login');
      } else {
        toast.error(response.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(clearUserDetails());
      toast.error('Logout failed. Please try again');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className={`bg-white border-b-4 border-blue-500 shadow-sm ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Speedometer Icon */}
            <div className="relative w-10 h-10 sm:w-14 sm:h-14">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#000"
                  strokeWidth="4"
                  fill="white"
                />
                <line x1="50" y1="10" x2="50" y2="20" stroke="#000" strokeWidth="3" />
                <line x1="78" y1="22" x2="72" y2="28" stroke="#000" strokeWidth="3" />
                <line x1="90" y1="50" x2="80" y2="50" stroke="#000" strokeWidth="3" />
                <line x1="78" y1="78" x2="72" y2="72" stroke="#000" strokeWidth="3" />
                <line x1="22" y1="22" x2="28" y2="28" stroke="#000" strokeWidth="3" />
                <line x1="10" y1="50" x2="20" y2="50" stroke="#000" strokeWidth="3" />
                <line x1="22" y1="78" x2="28" y2="72" stroke="#000" strokeWidth="3" />
                <circle cx="50" cy="50" r="6" fill="#000" />
                <line
                  x1="50"
                  y1="50"
                  x2="75"
                  y2="30"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Speedo Text */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Speedo
            </h1>
          </div>

          {/* Auth Section */}
          {email ? (
            /* Logged In User */
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Email - Hidden on mobile, visible on tablet and up */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Not Logged In */
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
            >
              <LogIn size={18} className="sm:w-5 sm:h-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;