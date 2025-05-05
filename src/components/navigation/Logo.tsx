
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/" 
      className="transition-all font-bold text-lg" 
      style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
    >
      <span className="text-glow-orange" style={{ color: '#F97316' }}>Online</span>
      <span className="text-glow-blue" style={{ color: '#0EA5E9' }}> Business</span>
    </Link>
  );
};
