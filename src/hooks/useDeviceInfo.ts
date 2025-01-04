import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from "lucide-react";

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