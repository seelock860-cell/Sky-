import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Gold House Roof Symbol */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Elegant gold pitched roof with chimney & modern architectural peak */}
          <path
            d="M3 17L16 4L29 17"
            stroke="#E8AA35"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 13.5V26C7 26.5523 7.44772 27 8 27H24C24.5523 27 25 26.5523 25 26V13.5"
            stroke="#E8AA35"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M22 10V6.5H25V13"
            stroke="#E8AA35"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M13 27V18H19V27"
            stroke="#E8AA35"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`${textSize} font-bold tracking-tight text-white font-sans flex items-center`}>
          Sky<span className="text-[#E8AA35]">Home</span>
        </span>
      </div>
    </div>
  );
};
