import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNav = () => {
  const deviceInfo = useDeviceInfo();
  const { session } = useAuth();
  const DeviceIcon = deviceInfo.Icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-t border-border md:hidden">
      <div className="grid grid-cols-2 h-16">
        <div className="flex items-center justify-center">
          <DeviceIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">{deviceInfo.text}</span>
        </div>
        <div className="flex items-center justify-center">
          {session ? (
            <span className="text-sm">Member</span>
          ) : (
            <span className="text-sm text-muted-foreground">Visitor</span>
          )}
        </div>
      </div>
    </div>
  );
};