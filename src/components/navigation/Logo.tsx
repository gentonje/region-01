
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/" 
      className="transition-all font-bold text-lg" 
      style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
    >
      <span className="text-glow-orange" style={{ 
        color: '#F97316', 
        textShadow: '0 0 10px rgba(249, 115, 22, 0.5)' 
      }}>Online</span>
      <span className="text-glow-blue" style={{ 
        color: '#0EA5E9', 
        textShadow: '0 0 10px rgba(14, 165, 233, 0.5)' 
      }}> Business</span>
    </Link>
  );
};
