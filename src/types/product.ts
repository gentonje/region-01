
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
  country: string; // Country ID as string
  country_id?: number; // Numeric country ID
  validity_period?: 'day' | 'week' | 'month';
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
  account_type?: string;
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
  county: string | null; // This is now district name
  country?: string | null; // Country name
  country_id?: number | null; // Country ID
  expires_at?: string | null; // New field for expiration date
  validity_period?: 'day' | 'week' | 'month';
}

export interface Country {
  id: number;
  name: string;
  code: string;
  created_at?: string;
}

export interface Region {
  id: number;
  name: string;
  country_id: number;
  created_at?: string;
}

export interface District {
  id: number;
  name: string;
  country_id: number;
  created_at: string;
}

export interface AccountLimits {
  basic: number;
  starter: number;
  premium: number;
  enterprise: number | null; // Configurable for enterprise
}

// Default account limits
export const DEFAULT_ACCOUNT_LIMITS: AccountLimits = {
  basic: 5,
  starter: 15,
  premium: 30,
  enterprise: null // Configurable
}

// Default validity periods in days
export const VALIDITY_PERIODS = {
  day: 1,
  week: 7,
  month: 30
}
