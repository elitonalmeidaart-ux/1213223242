import React from 'react';

const Logo: React.FC = () => {
    return (
        <div className="flex items-center space-x-3">
            <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>
                <path 
                    d="M 20 20 L 80 20 L 80 80 L 20 80 Z" 
                    stroke="url(#logoGrad)" 
                    strokeWidth="12" 
                    fill="none"
                    rx="10"
                />
                 <path 
                    d="M 40 40 L 60 40 L 60 60 L 40 60 Z" 
                    fill="url(#logoGrad)"
                />
            </svg>
            <h1 className="text-xl font-bold tracking-tighter text-zinc-100">
                SMART REFERENCE <span className="text-zinc-500">FX</span>
            </h1>
        </div>
    );
};

export default Logo;
