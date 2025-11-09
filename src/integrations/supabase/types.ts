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
      alerts: {
        Row: {
          data: Json | null
          id: string
          message: string
          read: boolean | null
          severity: string
          timestamp: string
          title: string
          type: string
        }
        Insert: {
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          severity: string
          timestamp?: string
          title: string
          type: string
        }
        Update: {
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          severity?: string
          timestamp?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      betting_preferences: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          priority: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          priority?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          priority?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string
          data: Json | null
          event_type: string
          id: string
          payment_id: string | null
          processed: boolean | null
          source: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_type: string
          id?: string
          payment_id?: string | null
          processed?: boolean | null
          source: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_type?: string
          id?: string
          payment_id?: string | null
          processed?: boolean | null
          source?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          confidence: number
          created_at: string
          id: string
          is_active: boolean | null
          last_triggered: string | null
          outcomes: Json
          probability: number
          sequence: Json
          success_count: number
          total_occurrences: number
          type: string
          updated_at: string
        }
        Insert: {
          confidence: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          outcomes: Json
          probability: number
          sequence: Json
          success_count: number
          total_occurrences: number
          type: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          outcomes?: Json
          probability?: number
          sequence?: Json
          success_count?: number
          total_occurrences?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          mercado_pago_card_id: string | null
          stripe_payment_method_id: string | null
          type: Database["public"]["Enums"]["payment_method"]
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mercado_pago_card_id?: string | null
          stripe_payment_method_id?: string | null
          type: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mercado_pago_card_id?: string | null
          stripe_payment_method_id?: string | null
          type?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
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
          asaas_payment_id: string | null
          created_at: string
          currency: string
          description: string | null
          failed_at: string | null
          id: string
          mercado_pago_payment_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failed_at?: string | null
          id?: string
          mercado_pago_payment_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failed_at?: string | null
          id?: string
          mercado_pago_payment_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roulette_results: {
        Row: {
          color: string
          column: number | null
          dozen: number | null
          half: string | null
          id: string
          number: number
          parity: string | null
          session_id: string
          source: string
          timestamp: string
        }
        Insert: {
          color: string
          column?: number | null
          dozen?: number | null
          half?: string | null
          id?: string
          number: number
          parity?: string | null
          session_id: string
          source?: string
          timestamp?: string
        }
        Update: {
          color?: string
          column?: number | null
          dozen?: number | null
          half?: string | null
          id?: string
          number?: number
          parity?: string | null
          session_id?: string
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          end_time: string | null
          id: string
          is_active: boolean | null
          name: string | null
          patterns_detected: number | null
          start_time: string
          success_rate: number | null
          total_spins: number | null
        }
        Insert: {
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          patterns_detected?: number | null
          start_time?: string
          success_rate?: number | null
          total_spins?: number | null
        }
        Update: {
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          patterns_detected?: number | null
          start_time?: string
          success_rate?: number | null
          total_spins?: number | null
        }
        Relationships: []
      }
      strategies: {
        Row: {
          created_at: string
          current_attempts: number | null
          id: string
          is_active: boolean | null
          last_used: string | null
          max_attempts: number | null
          name: string
          numbers: Json
          success_rate: number | null
          type: string
        }
        Insert: {
          created_at?: string
          current_attempts?: number | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          max_attempts?: number | null
          name: string
          numbers: Json
          success_rate?: number | null
          type: string
        }
        Update: {
          created_at?: string
          current_attempts?: number | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          max_attempts?: number | null
          name?: string
          numbers?: Json
          success_rate?: number | null
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          asaas_subscription_id: string | null
          canceled_at: string | null
          created_at: string
          currency: string
          end_date: string | null
          id: string
          is_trial_used: boolean | null
          mercado_pago_subscription_id: string | null
          next_billing_date: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          price_monthly: number
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          trial_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asaas_subscription_id?: string | null
          canceled_at?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_trial_used?: boolean | null
          mercado_pago_subscription_id?: string | null
          next_billing_date?: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          price_monthly: number
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          trial_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asaas_subscription_id?: string | null
          canceled_at?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_trial_used?: boolean | null
          mercado_pago_subscription_id?: string | null
          next_billing_date?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          price_monthly?: number
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          trial_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          session_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          session_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          session_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          phone: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          phone: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          phone?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_method:
        | "stripe_card"
        | "stripe_pix"
        | "mercado_pago"
        | "pagseguro"
        | "asaas"
        | "boleto"
      payment_status: "pending" | "paid" | "failed" | "refunded" | "canceled"
      plan_type: "basico" | "intermediario" | "completo"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "unpaid"
        | "incomplete"
        | "trialing"
      user_role: "user" | "admin" | "super_admin"
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
    Enums: {
      payment_method: [
        "stripe_card",
        "stripe_pix",
        "mercado_pago",
        "pagseguro",
        "asaas",
        "boleto",
      ],
      payment_status: ["pending", "paid", "failed", "refunded", "canceled"],
      plan_type: ["basico", "intermediario", "completo"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "unpaid",
        "incomplete",
        "trialing",
      ],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
