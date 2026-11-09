export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RestaurantStyle = 'classico' | 'moderno' | 'escuro';
export type RestaurantMemberRole = 'owner' | 'manager' | 'editor';
export type MenuLocale = 'pt' | 'en';
export type DishHighlight = 'featured' | 'recommended' | 'new';

export type EuAllergenCode =
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'peanuts'
  | 'soybeans'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

export interface TimeSlot {
  open: string;
  close: string;
}

export interface RestaurantModules {
  languages: boolean;
  allergens: boolean;
  highlights: boolean;
  hours: boolean;
}

export interface RestaurantSettings {
  modules: RestaurantModules;
}

export const DEFAULT_RESTAURANT_SETTINGS: RestaurantSettings = {
  modules: {
    languages: false,
    allergens: false,
    highlights: false,
    hours: false,
  },
};

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          location: string | null;
          style: RestaurantStyle;
          published: boolean;
          settings: Json;
          translations: Json;
          cover_photo_path: string | null;
          logo_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          location?: string | null;
          style?: RestaurantStyle;
          published?: boolean;
          settings?: Json;
          translations?: Json;
          cover_photo_path?: string | null;
          logo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          location?: string | null;
          style?: RestaurantStyle;
          published?: boolean;
          settings?: Json;
          translations?: Json;
          cover_photo_path?: string | null;
          logo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_members: {
        Row: {
          restaurant_id: string;
          user_id: string;
          role: RestaurantMemberRole;
          created_at: string;
        };
        Insert: {
          restaurant_id: string;
          user_id: string;
          role?: RestaurantMemberRole;
          created_at?: string;
        };
        Update: {
          restaurant_id?: string;
          user_id?: string;
          role?: RestaurantMemberRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_members_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          position: number;
          translations: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          position?: number;
          translations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          position?: number;
          translations?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      dishes: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string | null;
          price_cents: number;
          photo_url: string | null;
          available: boolean;
          position: number;
          translations: Json;
          allergens: EuAllergenCode[];
          highlight: DishHighlight | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          price_cents: number;
          photo_url?: string | null;
          available?: boolean;
          position?: number;
          translations?: Json;
          allergens?: EuAllergenCode[];
          highlight?: DishHighlight | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price_cents?: number;
          photo_url?: string | null;
          available?: boolean;
          position?: number;
          translations?: Json;
          allergens?: EuAllergenCode[];
          highlight?: DishHighlight | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dishes_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dishes_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurant_hours: {
        Row: {
          restaurant_id: string;
          day_of_week: number;
          closed: boolean;
          slots: Json;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          day_of_week: number;
          closed?: boolean;
          slots?: Json;
          updated_at?: string;
        };
        Update: {
          restaurant_id?: string;
          day_of_week?: number;
          closed?: boolean;
          slots?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_hours_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_owner_restaurant: {
        Args: {
          p_name: string;
          p_slug: string;
          p_style?: string;
          p_description?: string | null;
          p_location?: string | null;
        };
        Returns: Database['public']['Tables']['restaurants']['Row'];
      };
      reorder_categories: {
        Args: {
          p_restaurant_id: string;
          p_ordered_ids: string[];
        };
        Returns: undefined;
      };
      reorder_dishes: {
        Args: {
          p_restaurant_id: string;
          p_category_id: string;
          p_ordered_ids: string[];
        };
        Returns: undefined;
      };
      upsert_restaurant_hours: {
        Args: {
          p_restaurant_id: string;
          p_days: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type RestaurantRow = Database['public']['Tables']['restaurants']['Row'];
export type RestaurantMemberRow = Database['public']['Tables']['restaurant_members']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type DishRow = Database['public']['Tables']['dishes']['Row'];
export type RestaurantHoursRow = Database['public']['Tables']['restaurant_hours']['Row'];
