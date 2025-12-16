'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase, getSafeUser } from "@/lib/supabase";
import { useToast } from '@/components/ui/use-toast';
import ChatLauncher from './ChatLauncher';
import { User, Loader2, ArrowLeft } from 'lucide-react';

interface Professional {
  id: string;
  user_id: string;
  specialization: string;
  bio: string;
  photo_url: string;
  rating?: number;
  users?: {
    full_name: string;
  };
}

export default function ProfessionalList() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchProfessionals();
  }, []);

  const checkUserRole = async () => {
    const user = await getSafeUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    setCurrentUserRole(data?.role || null);
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          id,
          user_id,
          specialization,
          bio,
          photo_url,
          rating,
          users!professionals_user_id_fkey(full_name)
        `);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch professionals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUserRole === 'professional') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              This page is only available for users. As a professional, please check your inbox for messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Connect with Professionals
          </h1>
          <p className="text-muted-foreground">
            Find the right mental health professional for your needs
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#8B6CFD]" />
          </div>
        ) : professionals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No professionals available at the moment. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 bg-[#8B6CFD] flex items-center justify-center">
                      {professional.photo_url ? (
                        <img src={professional.photo_url} alt={professional.users?.full_name} className="rounded-full" />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {professional.users?.full_name || 'Professional'}
                      </CardTitle>
                      {professional.specialization && (
                        <Badge variant="secondary" className="text-xs">
                          {professional.specialization}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professional.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {professional.bio}
                    </p>
                  )}
                  <ChatLauncher
                    professionalId={professional.user_id}
                    professionalName={professional.users?.full_name || 'Professional'}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}