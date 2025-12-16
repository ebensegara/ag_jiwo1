'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function FloatingActionButton({ onClick, isVisible }: FloatingActionButtonProps) {
  if (!isVisible) return null;

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}