import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const AppLogo = () => {
  const [isArabic, setIsArabic] = useState(true);

  const toggleLanguage = () => {
    setIsArabic(!isArabic);
  };

  return (
    <Link 
      to="/" 
      onClick={toggleLanguage}
      className="text-lg font-bold backdrop-blur-sm bg-white/10 px-3 py-1 rounded-lg transition-all hover:bg-white/20" 
      style={{ fontFamily: isArabic ? 'Noto Sans Arabic, sans-serif' : 'system-ui, sans-serif' }}
    >
      {isArabic ? (
        <>
          <span style={{ color: '#F97316' }}>السوق</span>
          <span style={{ color: '#0EA5E9' }}> الحر</span>
        </>
      ) : (
        <>
          <span style={{ color: '#F97316' }}>Open</span>
          <span style={{ color: '#0EA5E9' }}> Market</span>
        </>
      )}
    </Link>
  );
};