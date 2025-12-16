export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payment_ref: string | null
          price: number
          professional_id: string
          session_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          price: number
          professional_id: string
          session_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          price?: number
          professional_id?: string
          session_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      care_chat_messages: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          professional_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          professional_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          professional_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channels_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_channels_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_usage: {
        Row: {
          chat_count: number | null
          chat_limit: number | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_count?: number | null
          chat_limit?: number | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_count?: number | null
          chat_limit?: number | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          admin_email: string
          created_at: string | null
          employee_count: number | null
          id: string
          industry: string | null
          name: string
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email: string
          created_at?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          name: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string
          created_at?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          name?: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_admins: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_admins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_alerts: {
        Row: {
          alert_type: string
          company_id: string
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          company_id: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          company_id?: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_employees: {
        Row: {
          company_id: string
          created_at: string | null
          department: string | null
          employee_id: string | null
          id: string
          joined_at: string | null
          position: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          joined_at?: string | null
          position?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          joined_at?: string | null
          position?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_insights: {
        Row: {
          active_users: number | null
          ai_insights: Json | null
          avg_mood_score: number | null
          company_id: string
          created_at: string | null
          department_insights: Json | null
          engagement_rate: number | null
          id: string
          journal_count: number | null
          mood_trend: string | null
          session_count: number | null
          stress_level: string | null
          total_employees: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          active_users?: number | null
          ai_insights?: Json | null
          avg_mood_score?: number | null
          company_id: string
          created_at?: string | null
          department_insights?: Json | null
          engagement_rate?: number | null
          id?: string
          journal_count?: number | null
          mood_trend?: string | null
          session_count?: number | null
          stress_level?: string | null
          total_employees?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          active_users?: number | null
          ai_insights?: Json | null
          avg_mood_score?: number | null
          company_id?: string
          created_at?: string | null
          department_insights?: Json | null
          engagement_rate?: number | null
          id?: string
          journal_count?: number | null
          mood_trend?: string | null
          session_count?: number | null
          stress_level?: string | null
          total_employees?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          activity_average: number | null
          activity_trend: number | null
          created_at: string | null
          id: string
          journal_insights: string | null
          key_observations: string | null
          mood_average: number | null
          mood_trend: number | null
          screening_results: string | null
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          activity_average?: number | null
          activity_trend?: number | null
          created_at?: string | null
          id?: string
          journal_insights?: string | null
          key_observations?: string | null
          mood_average?: number | null
          mood_trend?: number | null
          screening_results?: string | null
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          activity_average?: number | null
          activity_trend?: number | null
          created_at?: string | null
          id?: string
          journal_insights?: string | null
          key_observations?: string | null
          mood_average?: number | null
          mood_trend?: number | null
          screening_results?: string | null
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mood_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mood_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mood_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      moods: {
        Row: {
          created_at: string | null
          id: string
          mood_label: string
          mood_value: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood_label: string
          mood_value: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mood_label?: string
          mood_value?: number
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          midtrans_response: Json | null
          payment_type: string
          qris_link: string | null
          qris_string: string | null
          ref_code: string | null
          snap_token: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          midtrans_response?: Json | null
          payment_type: string
          qris_link?: string | null
          qris_string?: string | null
          ref_code?: string | null
          snap_token?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          midtrans_response?: Json | null
          payment_type?: string
          qris_link?: string | null
          qris_string?: string | null
          ref_code?: string | null
          snap_token?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number
          features: string[] | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      professionals: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string
          created_at: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean | null
          last_seen: string | null
          online_status: boolean | null
          price_per_session: number
          rating: number | null
          specialization: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category: string
          created_at?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          last_seen?: string | null
          online_status?: boolean | null
          price_per_session: number
          rating?: number | null
          specialization: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string
          created_at?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          last_seen?: string | null
          online_status?: boolean | null
          price_per_session?: number
          rating?: number | null
          specialization?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points: number | null
          reward_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          reward_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number | null
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      screenings: {
        Row: {
          created_at: string | null
          id: string
          responses: Json | null
          result_data: Json | null
          score: number | null
          screening_type: string
          severity_level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          responses?: Json | null
          result_data?: Json | null
          score?: number | null
          screening_type: string
          severity_level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          responses?: Json | null
          result_data?: Json | null
          score?: number | null
          screening_type?: string
          severity_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screenings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payment_ref: string | null
          price: number
          professional_id: string
          schedule_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          price: number
          professional_id: string
          schedule_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          price?: number
          professional_id?: string
          schedule_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          payment_ref: string | null
          plan_id: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_ref?: string | null
          plan_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_ref?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          position: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          position?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          position?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_chat_count: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
