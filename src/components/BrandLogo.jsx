import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo/algoarmy-logo.png';
import iconImg from '../assets/logo/algoarmy-icon.png';

const BrandLogo = ({ 
  size = "md", 
  showText = true, 
  clickable = true, 
  theme = "auto" 
}) => {
  const navigate = useNavigate();

  // Size mapping for heights
  const sizeClasses = {
    sm: "h-10",
    md: "h-12",
    lg: "h-20",
    xl: "h-36 md:h-44"
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const handleClick = (e) => {
    if (!clickable) return;
    navigate('/');
  };

  const imageSrc = showText ? logoImg : iconImg;

  return (
    <div 
      onClick={handleClick}
      className={`inline-flex items-center justify-center ${clickable ? 'cursor-pointer hover:scale-105 opacity-90 hover:opacity-100 transition-all duration-300' : ''}`}
    >
      <img 
        src={imageSrc} 
        alt="AlgoArmy Logo" 
        className={`${currentSizeClass} object-contain max-w-full`}
      />
    </div>
  );
};

export default BrandLogo;
