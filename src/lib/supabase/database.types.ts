export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      team: {
        Row: {
          id: string;
          display_name: string;
          role: string;
          description: string | null;
          linkedin_url: string | null;
          photo_url: string | null;
          display_order: number;
          is_admin: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role: string;
          description?: string | null;
          linkedin_url?: string | null;
          photo_url?: string | null;
          display_order?: number;
          is_admin?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: string;
          description?: string | null;
          linkedin_url?: string | null;
          photo_url?: string | null;
          display_order?: number;
          is_admin?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          end_date: string | null;
          location: string | null;
          image_url: string | null;
          tag: string;
          is_featured: boolean;
          status: "upcoming" | "past";
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          end_date?: string | null;
          location?: string | null;
          image_url?: string | null;
          tag?: string;
          is_featured?: boolean;
          status?: "upcoming" | "past";
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          end_date?: string | null;
          location?: string | null;
          image_url?: string | null;
          tag?: string;
          is_featured?: boolean;
          status?: "upcoming" | "past";
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_active_exec: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
