// src/types/supabase.ts
// Generated via `supabase gen types`
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
      [key: string]: unknown;
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}
