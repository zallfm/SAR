import React from 'react';

export const RevokedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="48" rx="8" fill="#FEF2F2"/>
        <path d="M15 23C15 19.6863 17.6863 17 21 17H27C30.3137 17 33 19.6863 33 23V31H15V23Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 23V21C20 19.8954 20.8954 19 22 19H26C27.1046 19 28 19.8954 28 21V23" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 25V27" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M29.6875 14L18.3125 14L24 24.5L29.6875 14Z" fill="#FEF9C3"/>
        <path d="M24 24.5L18.3125 14H29.6875L24 24.5Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 18V21" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 22.5V22.6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
