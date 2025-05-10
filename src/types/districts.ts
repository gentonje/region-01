
export interface District {
  id: number;
  name: string;
  country_id: number;
  created_at?: string;
  country_name?: string;
  countries?: {
    name: string;
  };
}

export interface Country {
  id: number;
  name: string;
  code: string;
}
