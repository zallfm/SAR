import React from 'react';

export const TooltipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" fill="#A78BFA"/>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12px" fontWeight="bold" fontFamily="sans-serif">T</text>
  </svg>
);
