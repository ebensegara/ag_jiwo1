"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, DollarSign, Calendar, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Professional {
  id: string;
  full_name: string;
  category: string;
  specialization: string;
  bio: string;
  rating: number;
  avatar_url: string;
  price_per_session: number;
  experience_years: number;
  is_available: boolean;
}

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfessional();
  }, [params.id]);

  const fetchProfessional = async () => {
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setProfessional(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load professional",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    router.push(`/professionals/${params.id}/booking`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Professional not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-[#756657] to-[#8a7a6a] text-white text-4xl">
                  {professional.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{professional.full_name}</CardTitle>
                <Badge variant="secondary" className="mb-3">
                  {professional.specialization}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                    <span className="font-semibold">{professional.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{professional.experience_years} years experience</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="text-muted-foreground">{professional.bio}</p>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#756657] dark:text-[#e6e2df]">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-2xl font-bold">
                    Rp {professional.price_per_session.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">/ session</span>
                </div>
              </div>

              <Button
                onClick={handleBookSession}
                className="w-full bg-[#756657] hover:bg-[#756657]/90 text-white"
                size="lg"
                disabled={!professional.is_available}
              >
                <Calendar className="h-5 w-5 mr-2" />
                {professional.is_available ? "Book Session" : "Currently Unavailable"}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Reviews</h3>
              <p className="text-sm text-muted-foreground text-center py-8">
                Reviews coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
