'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatLauncherProps {
  professionalId: string;
  professionalName: string;
}

export default function ChatLauncher({ professionalId, professionalName }: ChatLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-[#8B6CFD] hover:bg-[#7a5ce6] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with this Professional
      </Button>

      {isOpen && (
        <ChatWindow
          professionalId={professionalId}
          professionalName={professionalName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
