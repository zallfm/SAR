import React from 'react';

export const WriteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    <path d="m15 5 4 4"></path>
    <path d="M14 19.5V22h2.5"></path>
    <path d="M12 11.5 6.5 17H4v-2.5L9.5 6Z"></path>
  </svg>
);