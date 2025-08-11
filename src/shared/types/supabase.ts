// src/shared/types/supabase.ts
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
      catalog: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          address: string | null;
          image_url: string | null;
          latitude: number;
          longitude: number;
          source: string;
          metadata: Json | null;
          inserted_at: string;
          updated_at: string;
          destination_id: string;
          coords: unknown;
          wikidata_qid: string | null;
          wikimedia_title: string | null;
          wikimedia_source: string | null;
          image_confidence: number | null;
          wikimedia_pageid: string | null;
          pageviews_30d: number | null;
          rank_score: number | null;
          wikimedia_fetched_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          category: string;
          description?: string | null;
          address?: string | null;
          image_url?: string | null;
          latitude: number;
          longitude: number;
          source: string;
          metadata?: Json | null;
          inserted_at?: string;
          updated_at?: string;
          destination_id: string;
          coords?: unknown;
          wikidata_qid?: string | null;
          wikimedia_title?: string | null;
          wikimedia_source?: string | null;
          image_confidence?: number | null;
          wikimedia_pageid?: string | null;
          pageviews_30d?: number | null;
          rank_score?: number | null;
          wikimedia_fetched_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          address?: string | null;
          image_url?: string | null;
          latitude?: number;
          longitude?: number;
          source?: string;
          metadata?: Json | null;
          inserted_at?: string;
          updated_at?: string;
          destination_id?: string;
          coords?: unknown;
          wikidata_qid?: string | null;
          wikimedia_title?: string | null;
          wikimedia_source?: string | null;
          image_confidence?: number | null;
          wikimedia_pageid?: string | null;
          pageviews_30d?: number | null;
          rank_score?: number | null;
          wikimedia_fetched_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'catalog_destination_id_fkey';
            columns: ['destination_id'];
            referencedRelation: 'destinations';
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
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}

export {};
