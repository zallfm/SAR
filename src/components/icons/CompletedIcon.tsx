import React from 'react';

export const CompletedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="40" height="40" rx="8" fill="#DBEAFE"/>
    <path d="M14 12H26V28H14V12Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 17H23" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 22H23" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
