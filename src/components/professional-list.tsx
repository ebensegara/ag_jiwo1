'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ChatLauncher from './care-chat/ChatLauncher';
import BookingModal from './booking-modal';
import { useRouter } from 'next/navigation';
import ProOnlineList from './pro-online-list';

interface Professional {
  id: string;
  full_name: string;
  category: string;
  specialization: string;
  bio: string;
  rating: number;
  avatar_url: string;
  price_per_session: number;
  is_available: boolean;
}

interface ProfessionalListProps {
  category?: string;
  onBack?: () => void;
  embedded?: boolean;
}

export default function ProfessionalList({ category = "all", onBack, embedded = false }: ProfessionalListProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchProfessionals() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('professionals')
          .select('*');
        
        if (category !== "all") {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query;

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
    }

    fetchProfessionals();
  }, [category]);

  const handleBookSession = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedProfessional(null);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const containerClass = embedded 
    ? "" 
    : "min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-6";

  return (
    <div className={containerClass}>
      <div className={embedded ? "" : "max-w-6xl mx-auto"}>
        {/* Header */}
        {!embedded && (
          <div className="mb-8">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-4 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Care Options
              </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {category === "all" ? "All" : category} Professionals
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with verified professionals who can support your mental wellness journey
            </p>
          </div>
        )}

        {/* Online Professionals Section */}
        <ProOnlineList />

        {/* Professionals Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading professionals...</p>
          </div>
        ) : professionals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No professionals found for this category. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                      <AvatarImage 
                        src={professional.avatar_url} 
                        alt={professional.full_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#756657] to-[#8a7a6a] text-white text-2xl font-bold">
                        {getInitials(professional.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{professional.full_name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {professional.specialization}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                          <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-700">
                            {professional.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {professional.bio}
                  </p>

                  <div className="flex items-center gap-2 text-[#756657] dark:text-[#e6e2df] font-semibold">
                    <DollarSign className="h-5 w-5" />
                    <span>Rp {professional.price_per_session.toLocaleString()} / session</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/professionals/${professional.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      View Profile
                    </Button>
                    <Button
                      onClick={() => handleBookSession(professional)}
                      className="flex-1 bg-[#756657] hover:bg-[#756657]/90 text-white"
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedProfessional && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          professional={{
            id: selectedProfessional.id,
            full_name: selectedProfessional.full_name,
            price_per_session: selectedProfessional.price_per_session,
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}