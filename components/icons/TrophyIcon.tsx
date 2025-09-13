
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m-1.06-8.94a1.5 1.5 0 010 2.12L12 15l1.06-1.06a1.5 1.5 0 012.12 0L17 15V5H7v10l1.94-1.94a1.5 1.5 0 012.12 0L12 14.12l.94-.94z" />
    </svg>
);
