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
      character_conditions: {
        Row: {
          applied_at: string
          character_id: number
          condition_id: number
          duration: string
          id: number
        }
        Insert: {
          applied_at?: string
          character_id: number
          condition_id: number
          duration?: string
          id?: never
        }
        Update: {
          applied_at?: string
          character_id?: number
          condition_id?: number
          duration?: string
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "character_conditions_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_conditions_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "conditions"
            referencedColumns: ["id"]
          },
        ]
      }
      character_effects: {
        Row: {
          applied_at: string
          character_id: number
          duration: string
          effect_id: number
          id: number
        }
        Insert: {
          applied_at?: string
          character_id: number
          duration?: string
          effect_id: number
          id?: never
        }
        Update: {
          applied_at?: string
          character_id?: number
          duration?: string
          effect_id?: number
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "character_effects_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_effects_effect_id_fkey"
            columns: ["effect_id"]
            isOneToOne: false
            referencedRelation: "effects"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          age: number
          agility: number
          backstory: string
          class: string
          created_at: string
          created_by: string
          hp: number
          hp_max: number
          id: number
          intelligence: number
          mana: number
          mana_max: number
          name: string
          notes: string
          presence: number
          race: string
          resistance: number
          stamina: number
          stamina_max: number
          strength: number
          unspent_points: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age: number
          agility?: number
          backstory?: string
          class: string
          created_at?: string
          created_by: string
          hp?: number
          hp_max?: number
          id?: never
          intelligence?: number
          mana?: number
          mana_max?: number
          name: string
          notes?: string
          presence?: number
          race: string
          resistance?: number
          stamina?: number
          stamina_max?: number
          strength?: number
          unspent_points?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number
          agility?: number
          backstory?: string
          class?: string
          created_at?: string
          created_by?: string
          hp?: number
          hp_max?: number
          id?: never
          intelligence?: number
          mana?: number
          mana_max?: number
          name?: string
          notes?: string
          presence?: number
          race?: string
          resistance?: number
          stamina?: number
          stamina_max?: number
          strength?: number
          unspent_points?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conditions: {
        Row: {
          color: string
          created_at: string
          description: string
          effect: string
          icon: string
          id: number
          modifiers: Json
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          effect?: string
          icon?: string
          id?: never
          modifiers?: Json
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          effect?: string
          icon?: string
          id?: never
          modifiers?: Json
          name?: string
        }
        Relationships: []
      }
      custom_icons: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: number
          key: string
          label: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string
          id?: never
          key: string
          label: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: never
          key?: string
          label?: string
          url?: string
        }
        Relationships: []
      }
      dice_rolls: {
        Row: {
          character_id: number | null
          created_at: string
          id: number
          roller_name: string
          user_id: string
          value: number
        }
        Insert: {
          character_id?: number | null
          created_at?: string
          id?: never
          roller_name: string
          user_id: string
          value: number
        }
        Update: {
          character_id?: number | null
          created_at?: string
          id?: never
          roller_name?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "dice_rolls_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      effects: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: number
          kind: string
          modifiers: Json
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: never
          kind: string
          modifiers?: Json
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: never
          kind?: string
          modifiers?: Json
          name?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string
          created_at: string
          description: string
          effects: string
          icon: string
          id: number
          modifiers: Json
          name: string
          rarity: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          effects?: string
          icon?: string
          id?: never
          modifiers?: Json
          name: string
          rarity?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          effects?: string
          icon?: string
          id?: never
          modifiers?: Json
          name?: string
          rarity?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          character_id: number
          created_at: string
          description: string
          equipment_id: number | null
          equipped_slot: string | null
          id: number
          kind: string
          name: string
          quantity: number
        }
        Insert: {
          character_id: number
          created_at?: string
          description?: string
          equipment_id?: number | null
          equipped_slot?: string | null
          id?: never
          kind: string
          name: string
          quantity?: number
        }
        Update: {
          character_id?: number
          created_at?: string
          description?: string
          equipment_id?: number | null
          equipped_slot?: string | null
          id?: never
          kind?: string
          name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      can_view_character: { Args: { _cid: number }; Returns: boolean }
      choose_role: {
        Args: {
          _character?: Json
          _display_name: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      equip_item: {
        Args: { _item_id: number; _slot: string }
        Returns: undefined
      }
      gm_give_equipment: {
        Args: { _character_id: number; _equipment_id: number }
        Returns: undefined
      }
      gm_grant_points: {
        Args: { _amount: number; _character_id: number }
        Returns: undefined
      }
      gm_set_stats: {
        Args: {
          _agility: number
          _character_id: number
          _intelligence: number
          _presence: number
          _resistance: number
          _strength: number
          _unspent: number
        }
        Returns: undefined
      }
      gm_update_identity: {
        Args: {
          _age: number
          _backstory: string
          _character_id: number
          _class: string
          _name: string
          _race: string
        }
        Returns: undefined
      }
      gm_update_vitals: {
        Args: {
          _character_id: number
          _hp: number
          _hp_max: number
          _mana: number
          _mana_max: number
          _stamina: number
          _stamina_max: number
        }
        Returns: undefined
      }
      is_gm: { Args: { _uid: string }; Returns: boolean }
      owns_character: { Args: { _cid: number }; Returns: boolean }
      roll_d20: { Args: never; Returns: Json }
      spend_points: {
        Args: { _alloc: Json; _character_id: number }
        Returns: undefined
      }
      unequip_item: { Args: { _item_id: number }; Returns: undefined }
    }
    Enums: {
      app_role: "gm" | "player"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["gm", "player"],
    },
  },
} as const
