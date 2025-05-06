'use client';

import React from 'react';

const ReduseButton = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`group relative inline-block cursor-pointer ${className}`}
    >
      <div className="p-[2px] rounded-[40px] bg-[radial-gradient(ellipse_130.87%_392.78%_at_101.67%_0.00%,_#FF2323_0%,_#1C0404_100%)]">
        <div className="rounded-[36px] bg-white group-hover:bg-transparent flex items-center justify-center transition-colors duration-400">
          <div className="text-red-900 group-hover:text-white transition-colors duration-400">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReduseButton;
