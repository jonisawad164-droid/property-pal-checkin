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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      flow_measurements: {
        Row: {
          apartment_number: string | null
          created_at: string
          floor: string | null
          id: string
          inspection_id: string
          notes: string | null
          rooms: Json
          sort_order: number
          system_number: string | null
          tenant_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apartment_number?: string | null
          created_at?: string
          floor?: string | null
          id?: string
          inspection_id: string
          notes?: string | null
          rooms?: Json
          sort_order?: number
          system_number?: string | null
          tenant_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apartment_number?: string | null
          created_at?: string
          floor?: string | null
          id?: string
          inspection_id?: string
          notes?: string | null
          rooms?: Json
          sort_order?: number
          system_number?: string | null
          tenant_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_measurements_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          activity: string | null
          all_systems_included: boolean | null
          billing_address: string | null
          billing_city: string | null
          billing_name: string | null
          billing_postal_code: string | null
          build_year: string | null
          building_address: string
          building_city: string | null
          building_postal_code: string | null
          cooperates_with: string | null
          created_at: string
          drawing_date: string | null
          drawing_number: string | null
          email_sent_at: string | null
          flow_protocol_date: string | null
          flow_protocol_number: string | null
          flow_setpoint: string | null
          full_speed_runtime: string | null
          general_comments: string | null
          id: string
          inspection_date: string | null
          inspection_interval: string | null
          inspection_result: string | null
          inspection_type: string | null
          inspector_address: string | null
          inspector_certificate_number: string | null
          inspector_certificate_org: string | null
          inspector_certificate_valid_until: string | null
          inspector_certification: string | null
          inspector_city: string | null
          inspector_company: string | null
          inspector_email: string | null
          inspector_funkis_number: string | null
          inspector_name: string | null
          inspector_phone: string | null
          inspector_postal_code: string | null
          internal_building_name: string | null
          internal_number: string | null
          location: string | null
          measurement_protocol_number: string | null
          municipality_address: string | null
          municipality_city: string | null
          municipality_name: string | null
          municipality_postal_code: string | null
          next_inspection_date: string | null
          not_checked_part: string | null
          not_checked_reason: string | null
          number_of_apartments: string | null
          number_of_premises: string | null
          operations_email: string | null
          operations_name: string | null
          operations_phone: string | null
          other_documents: string | null
          ovk_number: string | null
          owner_address: string | null
          owner_city: string | null
          owner_name: string | null
          owner_postal_code: string | null
          partial_speed_runtime: string | null
          previous_inspection_date: string | null
          property_designation: string
          property_manager_email: string | null
          property_manager_name: string | null
          property_manager_phone: string | null
          rebuild_year: string | null
          recipient_email: string | null
          recipient_name: string | null
          reference_number: string | null
          reinspection_deadline: string | null
          serves: string | null
          signature_date: string | null
          status: string
          system_number: string | null
          system_type: string | null
          updated_at: string
          usable_area: string | null
          user_id: string
          ventilation_norm: string | null
        }
        Insert: {
          activity?: string | null
          all_systems_included?: boolean | null
          billing_address?: string | null
          billing_city?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          build_year?: string | null
          building_address: string
          building_city?: string | null
          building_postal_code?: string | null
          cooperates_with?: string | null
          created_at?: string
          drawing_date?: string | null
          drawing_number?: string | null
          email_sent_at?: string | null
          flow_protocol_date?: string | null
          flow_protocol_number?: string | null
          flow_setpoint?: string | null
          full_speed_runtime?: string | null
          general_comments?: string | null
          id?: string
          inspection_date?: string | null
          inspection_interval?: string | null
          inspection_result?: string | null
          inspection_type?: string | null
          inspector_address?: string | null
          inspector_certificate_number?: string | null
          inspector_certificate_org?: string | null
          inspector_certificate_valid_until?: string | null
          inspector_certification?: string | null
          inspector_city?: string | null
          inspector_company?: string | null
          inspector_email?: string | null
          inspector_funkis_number?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          inspector_postal_code?: string | null
          internal_building_name?: string | null
          internal_number?: string | null
          location?: string | null
          measurement_protocol_number?: string | null
          municipality_address?: string | null
          municipality_city?: string | null
          municipality_name?: string | null
          municipality_postal_code?: string | null
          next_inspection_date?: string | null
          not_checked_part?: string | null
          not_checked_reason?: string | null
          number_of_apartments?: string | null
          number_of_premises?: string | null
          operations_email?: string | null
          operations_name?: string | null
          operations_phone?: string | null
          other_documents?: string | null
          ovk_number?: string | null
          owner_address?: string | null
          owner_city?: string | null
          owner_name?: string | null
          owner_postal_code?: string | null
          partial_speed_runtime?: string | null
          previous_inspection_date?: string | null
          property_designation: string
          property_manager_email?: string | null
          property_manager_name?: string | null
          property_manager_phone?: string | null
          rebuild_year?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reference_number?: string | null
          reinspection_deadline?: string | null
          serves?: string | null
          signature_date?: string | null
          status?: string
          system_number?: string | null
          system_type?: string | null
          updated_at?: string
          usable_area?: string | null
          user_id: string
          ventilation_norm?: string | null
        }
        Update: {
          activity?: string | null
          all_systems_included?: boolean | null
          billing_address?: string | null
          billing_city?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          build_year?: string | null
          building_address?: string
          building_city?: string | null
          building_postal_code?: string | null
          cooperates_with?: string | null
          created_at?: string
          drawing_date?: string | null
          drawing_number?: string | null
          email_sent_at?: string | null
          flow_protocol_date?: string | null
          flow_protocol_number?: string | null
          flow_setpoint?: string | null
          full_speed_runtime?: string | null
          general_comments?: string | null
          id?: string
          inspection_date?: string | null
          inspection_interval?: string | null
          inspection_result?: string | null
          inspection_type?: string | null
          inspector_address?: string | null
          inspector_certificate_number?: string | null
          inspector_certificate_org?: string | null
          inspector_certificate_valid_until?: string | null
          inspector_certification?: string | null
          inspector_city?: string | null
          inspector_company?: string | null
          inspector_email?: string | null
          inspector_funkis_number?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          inspector_postal_code?: string | null
          internal_building_name?: string | null
          internal_number?: string | null
          location?: string | null
          measurement_protocol_number?: string | null
          municipality_address?: string | null
          municipality_city?: string | null
          municipality_name?: string | null
          municipality_postal_code?: string | null
          next_inspection_date?: string | null
          not_checked_part?: string | null
          not_checked_reason?: string | null
          number_of_apartments?: string | null
          number_of_premises?: string | null
          operations_email?: string | null
          operations_name?: string | null
          operations_phone?: string | null
          other_documents?: string | null
          ovk_number?: string | null
          owner_address?: string | null
          owner_city?: string | null
          owner_name?: string | null
          owner_postal_code?: string | null
          partial_speed_runtime?: string | null
          previous_inspection_date?: string | null
          property_designation?: string
          property_manager_email?: string | null
          property_manager_name?: string | null
          property_manager_phone?: string | null
          rebuild_year?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reference_number?: string | null
          reinspection_deadline?: string | null
          serves?: string | null
          signature_date?: string | null
          status?: string
          system_number?: string | null
          system_type?: string | null
          updated_at?: string
          usable_area?: string | null
          user_id?: string
          ventilation_norm?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certificate_number: string | null
          certificate_org: string | null
          certificate_valid_until: string | null
          certification: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          funkis_number: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_org?: string | null
          certificate_valid_until?: string | null
          certification?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          funkis_number?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_org?: string | null
          certificate_valid_until?: string | null
          certification?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          funkis_number?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
