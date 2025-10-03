import React from 'react';

// Apple SF Symbols inspired icons
export const SendIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

export const WifiIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
  </svg>
);

export const WifiOffIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 5.25L6.25 2.66C8.18 2.24 10.16 2 12.01 2c4.74 0 9.19 1.85 12.52 5.19L22.99 9zM18.99 13c-.47-.47-.99-.9-1.55-1.28L15.8 10.08c1.98.67 3.81 1.91 5.19 3.29L18.99 13zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l2 2c1.23-1.23 2.65-2.16 4.17-2.78l2.24 2.25C7.81 10.89 6.27 11.73 5 13v.01L7 15c1.13-1.13 2.56-1.88 4.13-2.26l3.5 3.51c-1.1.33-2.17.86-3.13 1.75L15 21l3-3c.56-.56 1.15-1.02 1.76-1.39L21.95 18l1.41-1.41L3.41 1.64 2 3.05z"/>
  </svg>
);

export const UsersIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.01 3.01 0 0 0 17.1 7H16.9c-.8 0-1.54.37-2.01 1.01l-.84 2.59.69 2.1L16.5 16H20v6h4zm-12.5 0v-6h1.5v-2.5c0-1.1-.9-2-2-2s-2 .9-2 2V16H7v6h.5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-3C9.57 12.5 8.5 13.57 8.5 15v7h8v-7c0-1.43-1.07-2.5-2.5-2.5z"/>
  </svg>
);

export const MoonIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const SunIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
