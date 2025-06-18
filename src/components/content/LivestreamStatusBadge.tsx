import React from "react";
import { Badge } from "@/components/ui/badge";

interface LivestreamStatusBadgeProps {
  status: "live" | "scheduled" | "ended";
  className?: string;
}

const LivestreamStatusBadge: React.FC<LivestreamStatusBadgeProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'live':
        return {
          label: '🔴 زنده',
          className: 'bg-red-500 text-white animate-pulse'
        };
      case 'scheduled':
        return {
          label: '⏰ برنامه‌ریزی شده',
          className: 'bg-blue-500 text-white'
        };
      case 'ended':
        return {
          label: '✅ پایان یافته',
          className: 'bg-gray-500 text-white'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-500 text-white'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
};

export default LivestreamStatusBadge; 