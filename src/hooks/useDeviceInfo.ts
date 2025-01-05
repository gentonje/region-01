import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from "lucide-react";

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

export const useDeviceInfo = () => {
  const getDeviceIcon = () => {
    if (window.innerWidth < 640) return Smartphone;
    if (window.innerWidth < 768) return Tablet;
    return Monitor;
  };

  const getDeviceText = () => {
    if (window.innerWidth < 640) return "Mobile";
    if (window.innerWidth < 768) return "Tablet";
    return "Desktop";
  };

  const [deviceInfo, setDeviceInfo] = useState({
    Icon: getDeviceIcon(),
    text: getDeviceText()
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo({
        Icon: getDeviceIcon(),
        text: getDeviceText()
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};