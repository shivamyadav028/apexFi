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
      active_positions: {
        Row: {
          amount: number
          created_at: string
          current_apy: number | null
          entry_price: number | null
          id: string
          pool_id: string
          pool_name: string
          updated_at: string
          user_id: string
          vault_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          current_apy?: number | null
          entry_price?: number | null
          id?: string
          pool_id: string
          pool_name: string
          updated_at?: string
          user_id: string
          vault_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          current_apy?: number | null
          entry_price?: number | null
          id?: string
          pool_id?: string
          pool_name?: string
          updated_at?: string
          user_id?: string
          vault_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_positions_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "user_vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_predictions: {
        Row: {
          actual_result: boolean | null
          confidence_score: number | null
          created_at: string
          id: string
          pool_id: string
          predicted_volume_spike: boolean
          prediction_time: string
        }
        Insert: {
          actual_result?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          pool_id: string
          predicted_volume_spike?: boolean
          prediction_time: string
        }
        Update: {
          actual_result?: boolean | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          pool_id?: string
          predicted_volume_spike?: boolean
          prediction_time?: string
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          severity: string
          triggered_guardian: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          severity: string
          triggered_guardian?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          severity?: string
          triggered_guardian?: boolean
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          from_pool: string | null
          id: string
          signature: string | null
          status: string
          to_pool: string | null
          type: string
          user_id: string
          vault_id: string
          wallet_address: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          from_pool?: string | null
          id?: string
          signature?: string | null
          status?: string
          to_pool?: string | null
          type: string
          user_id: string
          vault_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          from_pool?: string | null
          id?: string
          signature?: string | null
          status?: string
          to_pool?: string | null
          type?: string
          user_id?: string
          vault_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "user_vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vaults: {
        Row: {
          balance: number
          created_at: string
          guardian_mode_active: boolean
          id: string
          strategy_profile: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          guardian_mode_active?: boolean
          id?: string
          strategy_profile?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          guardian_mode_active?: boolean
          id?: string
          strategy_profile?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
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
