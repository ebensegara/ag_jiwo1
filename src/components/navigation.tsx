'use client';

import { useState } from 'react';
import { Heart, MessageCircle, BookOpen, BarChart3, Menu, X, ClipboardList, TrendingUp, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'mood', label: 'Mood Check-in', icon: Heart },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'screening', label: 'Self Screening', icon: ClipboardList },
  { id: 'insights', label: 'Weekly Insights', icon: TrendingUp },
  { id: 'professionals', label: 'Professional Care', icon: Users },
];

export function MobileNavigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DesktopSidebar({ activeTab, onTabChange }: NavigationProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      router.replace('/welcome');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-border">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Jiwo.AI</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileHeader({ activeTab, onTabChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      router.replace('/welcome');
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="md:hidden bg-white border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold">Jiwo.AI</span>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">Jiwo.AI</span>
            </div>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-border pt-4"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}