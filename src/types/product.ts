
import { Database } from "@/integrations/supabase/types";

export type ProductCategory = Database["public"]["Enums"]["product_category"];

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  available_quantity: number;
  shipping_info?: string;
  county: string;
  country: string; // Add country field
}

export interface ProductImage {
  id: string;
  storage_path: string;
  is_main: boolean | null;
  display_order: number;
  created_at?: string;
  publicUrl?: string;
  product_id?: string;
}

export interface Profile {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface Product {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  category: ProductCategory | null;
  user_id?: string | null;
  seller_id?: string | null;
  shop_id?: string | null;
  available_quantity: number | null;
  storage_path: string;
  created_at: string;
  in_stock?: boolean | null;
  views?: number | null;
  likes?: number | null;
  average_rating?: number | null;
  product_status?: string | null;
  shipping_info?: string | null;
  currency: string | null;
  product_images: ProductImage[];
  profiles?: Profile;
  county: string | null;
  country: string | null; // Add country field
  country_id: number | null; // Add country_id field
}

export interface Country {
  id: number;
  name: string;
  code: string;
  created_at?: string;
}
