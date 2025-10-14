import React from 'react';

export const SoApprovedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="40" height="40" rx="8" fill="#FCE7F3"/>
    <path d="M14 12H26V28H14V12Z" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="17" y="17" width="6" height="6" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
