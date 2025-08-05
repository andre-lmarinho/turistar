// src/types/supabase.ts
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
          catalog_id: string | null;
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
          catalog_id?: string | null;
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
          catalog_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'activities_day_id_fkey';
            columns: ['day_id'];
            referencedRelation: 'plan_days';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activities_catalog_id_fkey';
            columns: ['catalog_id'];
            referencedRelation: 'catalog';
            referencedColumns: ['id'];
          },
        ];
      };
      budget: {
        Row: {
          plan_id: string;
          budget: number | null;
          entries: Json | null;
        };
        Insert: {
          plan_id: string;
          budget?: number | null;
          entries?: Json | null;
        };
        Update: {
          plan_id?: string;
          budget?: number | null;
          entries?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'budget_plan_id_fkey';
            columns: ['plan_id'];
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      [key: string]: unknown;
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}

export {};
