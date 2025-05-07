
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export const FloatingHomeButton = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll events to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show button when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide button when scrolling down
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleClick = () => {
    navigate("/");
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed left-4 top-20 z-40 flex items-center justify-center w-12 h-12 rounded-full 
                bg-[#0000001a] backdrop-blur-md border border-[#ffffff20] shadow-lg
                transition-all duration-300 hover:bg-[#ffffff30] hover:shadow-xl
                ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      aria-label="Go to home page"
    >
      <Home className="h-5 w-5 text-white dark:text-white icon-glow" />
    </button>
  );
};
