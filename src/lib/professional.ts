import { supabase } from './supabase';

export interface Professional {
  id: string;
  full_name: string;
  category: string;
  specialization: string;
  bio: string;
  rating: number;
  avatar_url: string;
  price_per_session: number;
  is_available: boolean;
  online_status: boolean;
  last_seen: string;
}

export async function getOnlineProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('online_status', true)
    .eq('is_available', true)
    .order('last_seen', { ascending: false });

  if (error) {
    console.error('Error fetching online professionals:', error);
    return [];
  }

  return data || [];
}

export function subscribeProfessionalStatus(callback: (payload: any) => void) {
  const subscription = supabase
    .channel('professionals-status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'professionals',
      },
      callback
    )
    .subscribe();

  return subscription;
}

export async function updateProfessionalOnlineStatus(professionalId: string, isOnline: boolean) {
  const { error } = await supabase
    .from('professionals')
    .update({
      online_status: isOnline,
      last_seen: new Date().toISOString(),
    })
    .eq('id', professionalId);

  if (error) {
    console.error('Error updating professional online status:', error);
  }
}

export async function checkChatPaywall(professionalId: string): Promise<{
  requiresPayment: boolean;
  price?: number;
}> {
  // For now, instant chat is free
  // This can be extended to check professional settings
  return {
    requiresPayment: false,
  };
}
