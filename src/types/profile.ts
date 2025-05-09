
export type AccountType = 'basic' | 'starter' | 'premium' | 'enterprise';

export interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  account_type: AccountType;
  custom_product_limit?: number | null;
  is_active?: boolean;
  user_type?: string;
}
