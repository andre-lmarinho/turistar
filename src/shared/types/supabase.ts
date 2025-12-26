// Generated via `supabase gen types`

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string;
          day_id: string;
          title: string | null;
          color: string | null;
          address: string | null;
          category: string | null;
          description: string | null;
          start_time: string | null;
          duration: number | null;
          latitude: number | null;
          longitude: number | null;
          budget: number | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          day_id: string;
          title?: string | null;
          color?: string | null;
          address?: string | null;
          category?: string | null;
          description?: string | null;
          start_time?: string | null;
          duration?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          budget?: number | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          day_id?: string;
          title?: string | null;
          color?: string | null;
          address?: string | null;
          category?: string | null;
          description?: string | null;
          start_time?: string | null;
          duration?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          budget?: number | null;
          image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'plan_days';
            referencedColumns: ['id'];
          },
        ];
      };
      budget_entries: {
        Row: {
          id: string;
          plan_id: string;
          description: string | null;
          category: string | null;
          amount: number | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          description?: string | null;
          category?: string | null;
          amount?: number | null;
        };
        Update: {
          id?: string;
          plan_id?: string;
          description?: string | null;
          category?: string | null;
          amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_entries_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Relationships: [];
      };
      plan_destinations: {
        Row: {
          plan_id: string;
          destination_id: string;
          position: number;
        };
        Insert: {
          plan_id: string;
          destination_id: string;
          position?: number;
        };
        Update: {
          plan_id?: string;
          destination_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_destinations_destination_id_fkey';
            columns: ['destination_id'];
            referencedRelation: 'destinations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_destinations_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_members: {
        Row: {
          plan_id: string;
          user_id: string;
          tier: Database['public']['Enums']['plan_member_tier'];
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          plan_id: string;
          user_id: string;
          tier?: Database['public']['Enums']['plan_member_tier'];
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          plan_id?: string;
          user_id?: string;
          tier?: Database['public']['Enums']['plan_member_tier'];
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_members_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_members_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_members_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_share_links: {
        Row: {
          plan_id: string;
          token: string;
          created_at: string;
          created_by: string;
          revoked_at: string | null;
        };
        Insert: {
          plan_id: string;
          token?: string;
          created_at?: string;
          created_by: string;
          revoked_at?: string | null;
        };
        Update: {
          plan_id?: string;
          token?: string;
          created_at?: string;
          created_by?: string;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_share_links_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_share_links_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          id: string;
          user_id: string | null;
          title: string | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'plans_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          slug: string;
          display_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          slug: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          slug?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_events: {
        Row: {
          event_id: string;
          plan_id: string;
          version: number;
          event_type: string;
          payload: Json;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          event_id?: string;
          plan_id: string;
          version: number;
          event_type: string;
          payload?: Json;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          plan_id?: string;
          version?: number;
          event_type?: string;
          payload?: Json;
          actor_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_events_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plan_snapshots: {
        Row: {
          plan_id: string;
          version: number;
          state: Json;
          updated_at: string;
        };
        Insert: {
          plan_id: string;
          version?: number;
          state?: Json;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          version?: number;
          state?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_snapshots_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown> & {
      append_plan_events: {
        Args: {
          plan_id: string;
          base_version: number;
          events: unknown;
        };
        Returns: {
          version: number;
          inserted_events: unknown;
        };
      };
      add_plan_member_by_email: {
        Args: {
          _plan_id: string;
          _email: string;
          _tier?: Database['public']['Enums']['plan_member_tier'] | null;
        };
        Returns: {
          user_id: string;
          tier: Database['public']['Enums']['plan_member_tier'];
        }[];
      };
      update_plan_member_tier: {
        Args: {
          _plan_id: string;
          _user_id: string;
          _tier: Database['public']['Enums']['plan_member_tier'];
        };
        Returns: undefined;
      };
      remove_plan_member: {
        Args: {
          _plan_id: string;
          _user_id: string;
        };
        Returns: undefined;
      };
      leave_plan: {
        Args: {
          _plan_id: string;
        };
        Returns: undefined;
      };
      create_plan_share_link: {
        Args: {
          _plan_id: string;
        };
        Returns: string;
      };
      revoke_plan_share_link: {
        Args: {
          _plan_id: string;
        };
        Returns: boolean;
      };
      accept_plan_share_link: {
        Args: {
          _token: string;
        };
        Returns: string;
      };
      is_plan_member: {
        Args: {
          _plan_id: string;
        };
        Returns: boolean;
      };
      is_plan_admin: {
        Args: {
          _plan_id: string;
        };
        Returns: boolean;
      };
      plan_admin_count: {
        Args: {
          _plan_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      plan_member_tier: 'admin' | 'member';
    };
    CompositeTypes: Record<string, unknown>;
  };
}

export {};
