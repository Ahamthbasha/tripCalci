import React from 'react';

const WelcomeBar: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">👋</span>
        <h2 className="text-lg font-semibold text-gray-800">Welcome, User</h2>
      </div>
    </div>
  );
};

export default WelcomeBar;