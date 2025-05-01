
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/" 
      className="transition-all" 
      style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
    >
      <span style={{ color: '#F97316' }}>Online</span>
      <span style={{ color: '#0EA5E9' }}> Business</span>
    </Link>
  );
};
