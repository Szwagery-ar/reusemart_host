'use client';

import React from 'react';

const ReuseButton = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`group relative inline-block cursor-pointer ${className}`}
    >
      {/* Border gradient */}
      <div className="p-[2px] rounded-[40px] bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
        {/* Isi tombol */}
        <div className="rounded-[36px] bg-white group-hover:bg-transparent flex items-center justify-center transition-colors duration-300">
          <span className="text-indigo-900 group-hover:text-white transition-colors duration-400">
            {children}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReuseButton;
