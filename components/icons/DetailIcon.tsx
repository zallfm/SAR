import React from 'react';

export const DetailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 20 20" 
    fill="none"
    {...props}
  >
    <circle cx="10" cy="10" r="9.5" fill="white" stroke="#3B82F6"/>
    <path d="M8 10H13" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 7.5L13.5 10L11 12.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);