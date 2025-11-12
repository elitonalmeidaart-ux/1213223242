
import React from 'react';

export const ExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 14H4v3"></path>
    <path d="M10 20H7v-3"></path>
    <path d="M17 14h3v3"></path>
    <path d="M14 20h3v-3"></path>
    <path d="M10 4h3v3"></path>
    <path d="M7 7V4h3"></path>
    <path d="M14 7V4h3"></path>
    <path d="M17 7h3V4"></path>
  </svg>
);
