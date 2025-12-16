"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ProOnlineCardProps {
  professional: {
    id: string;
    full_name: string;
    avatar_url: string;
    specialization: string;
    online_status: boolean;
  };
}

export default function ProOnlineCard({ professional }: ProOnlineCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/chat/pro/${professional.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
    >
      <div className="relative">
        <Avatar className="h-16 w-16 border-2 border-white shadow-md">
          <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
          <AvatarFallback className="bg-gradient-to-br from-[#756657] to-[#8a7a6a] text-white">
            {professional.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {professional.online_status && (
          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold line-clamp-1">{professional.full_name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{professional.specialization}</p>
      </div>
    </button>
  );
}
