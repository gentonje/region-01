
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link 
      to="/" 
      className="text-xs backdrop-blur-sm bg-white/10 px-1 py-1 rounded-lg transition-all hover:bg-white/20" 
      style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}
    >
      <span style={{ color: '#F97316' }}>السوق</span>
      <span style={{ color: '#0EA5E9' }}> الحر</span>
    </Link>
  );
};
