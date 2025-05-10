
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

export type ProductCategory = 
  | 'Electronics'
  | 'Clothing'
  | 'Home & Garden'
  | 'Books'
  | 'Sports & Outdoors'
  | 'Toys & Games'
  | 'Health & Beauty'
  | 'Automotive'
  | 'Food & Beverages'
  | 'Other';

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
  validity_period?: string | null;
}
