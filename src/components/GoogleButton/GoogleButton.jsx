'use client';

import React, { useRef } from 'react';
import './google.css';

const GoogleButton = ({ children, className = '', ...props }) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const button = buttonRef.current;
    const ripple = document.createElement('span');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.className = 'google';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      {...props}
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </button>
  );
};

export default GoogleButton;
