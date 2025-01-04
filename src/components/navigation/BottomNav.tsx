import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

export const BottomNav = () => {
  const deviceInfo = useDeviceInfo();
  const DeviceIcon = deviceInfo.Icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-t border-border md:hidden">
      <div className="grid grid-cols-2 h-16">
        <div className="flex items-center justify-center">
          <DeviceIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">{deviceInfo.text}</span>
        </div>
        <Link 
          to="/admin/users" 
          className="flex items-center justify-center hover:bg-accent/50 transition-colors"
        >
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">Users</span>
        </Link>
      </div>
    </div>
  );
};