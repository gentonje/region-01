export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: Database["public"]["Enums"]["product_category"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: Database["public"]["Enums"]["product_category"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: Database["public"]["Enums"]["product_category"]
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          rate: number
          status:
            | Database["public"]["Enums"]["supported_currency_status"]
            | null
          symbol: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          rate: number
          status?:
            | Database["public"]["Enums"]["supported_currency_status"]
            | null
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          rate?: number
          status?:
            | Database["public"]["Enums"]["supported_currency_status"]
            | null
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          id: string
          step: Database["public"]["Enums"]["onboarding_step"]
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          step: Database["public"]["Enums"]["onboarding_step"]
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          step?: Database["public"]["Enums"]["onboarding_step"]
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          payment_method: string | null
          payment_status: string | null
          product_id: string
          quantity: number
          seller_id: string
          shipping_address: string
          status: string | null
          total_amount: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          product_id: string
          quantity: number
          seller_id: string
          shipping_address: string
          status?: string | null
          total_amount: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string
          quantity?: number
          seller_id?: string
          shipping_address?: string
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_main: boolean | null
          product_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_main?: boolean | null
          product_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_main?: boolean | null
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          id: string
          ip_address: string | null
          product_id: string
          view_date: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          product_id: string
          view_date?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          product_id?: string
          view_date?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_quantity: number | null
          average_rating: number | null
          category: Database["public"]["Enums"]["product_category"] | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          in_stock: boolean | null
          likes: number | null
          price: number | null
          product_status: string | null
          shipping_info: string | null
          shop_id: string | null
          shop_name: string | null
          storage_path: string
          title: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          available_quantity?: number | null
          average_rating?: number | null
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          in_stock?: boolean | null
          likes?: number | null
          price?: number | null
          product_status?: string | null
          shipping_info?: string | null
          shop_id?: string | null
          shop_name?: string | null
          storage_path: string
          title?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          available_quantity?: number | null
          average_rating?: number | null
          category?: Database["public"]["Enums"]["product_category"] | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          in_stock?: boolean | null
          likes?: number | null
          price?: number | null
          product_status?: string | null
          shipping_info?: string | null
          shop_id?: string | null
          shop_name?: string | null
          storage_path?: string
          title?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          contact_email: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean | null
          onboarding_completed: boolean | null
          phone_number: string | null
          shop_description: string | null
          shop_name: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          contact_email?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          shop_description?: string | null
          shop_name?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          contact_email?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          shop_description?: string | null
          shop_name?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
        }
        Relationships: []
      }
      review_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          category: Database["public"]["Enums"]["shop_category"] | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["shop_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["shop_category"] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          name: string
          share_token: string | null
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["wishlist_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          share_token?: string | null
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["wishlist_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          share_token?: string | null
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["wishlist_visibility"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_default_shop: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      insert_test_products: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      manage_admin_user: {
        Args: {
          target_user_id: string
          should_be_admin: boolean
        }
        Returns: undefined
      }
      update_product_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      onboarding_step: "profile_complete" | "shop_created" | "first_product"
      product_category:
        | "Electronics"
        | "Clothing"
        | "Home & Garden"
        | "Books"
        | "Sports & Outdoors"
        | "Toys & Games"
        | "Health & Beauty"
        | "Automotive"
        | "Food & Beverages"
        | "Other"
      shop_category:
        | "Electronics"
        | "Clothing"
        | "Home & Garden"
        | "Books"
        | "Sports & Outdoors"
        | "Toys & Games"
        | "Health & Beauty"
        | "Automotive"
        | "Food & Beverages"
        | "Other"
      supported_currency_status: "active" | "inactive"
      user_type: "buyer" | "seller" | "super_admin"
      wishlist_visibility: "private" | "public" | "shared"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
