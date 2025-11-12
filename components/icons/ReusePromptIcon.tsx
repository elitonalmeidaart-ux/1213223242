import React from 'react';

export const ReusePromptIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 17a5 5 0 0 0 0-10h-2"></path>
    <polyline points="7 11 12 6 7 1"></polyline>
    <path d="M20 17h-2a5 5 0 0 0-5-5"></path>
  </svg>
);
