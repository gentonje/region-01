
export type AccountType = 'basic' | 'starter' | 'premium' | 'enterprise';

export interface AccountLimits {
  basic: number;
  starter: number;
  premium: number;
  enterprise: number | null;
}

export const DEFAULT_ACCOUNT_LIMITS: AccountLimits = {
  basic: 5,
  starter: 15,
  premium: 30,
  enterprise: null
};

export enum ProductCategory {
  Electronics = 'Electronics',
  Clothing = 'Clothing',
  HomeAndGarden = 'Home & Garden',
  Books = 'Books',
  SportsAndOutdoors = 'Sports & Outdoors',
  ToysAndGames = 'Toys & Games',
  HealthAndBeauty = 'Health & Beauty',
  Automotive = 'Automotive',
  FoodAndBeverages = 'Food & Beverages',
  Other = 'Other'
}

export enum ValidityPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month'
}

export interface ProductImage {
  id: string;
  product_id?: string; // Make product_id optional since it might not be present in all contexts
  storage_path: string;
  is_main: boolean;
  display_order: number;
  created_at?: string;
  publicUrl?: string;
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  country_id: string;
}

export interface Product {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  category?: ProductCategory | null;
  currency?: string | null;
  user_id: string;
  created_at?: string;
  views?: number;
  likes?: number;
  in_stock?: boolean;
  available_quantity?: number | null;
  average_rating?: number;
  storage_path?: string;
  product_status?: string;
  expires_at?: string | null;
  validity_period?: ValidityPeriod | string | null;
  
  // Additional fields used throughout the app
  product_images?: ProductImage[];
  profiles?: Profile;
  shop_name?: string;
  county?: string;
  country_id?: number | null;
  country?: string | null;
  seller_id?: string;
  shipping_info?: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: string | number;
  category: ProductCategory | string;
  available_quantity: string | number;
  county: string;
  country: string;
  shipping_info?: string;
  validity_period?: ValidityPeriod | string;
}
