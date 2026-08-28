export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'sales' | 'ke_toan' | 'super_admin';
export type CustomerType = 'dai_ly_cap1' | 'dai_ly_cap2' | 'sieu_thi' | 'nha_hang' | 'khach_le' | 'xuat_khau';
export type CustomerStatus = 'active' | 'inactive';
export type ProductLine = 'truyen_thong' | 'cong_nghiep';
export type ProductStatus = 'active' | 'inactive';
export type OrderStatus = 'draft' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type DebtStatus = 'open' | 'overdue' | 'paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'other';
export type ComplaintType = 'quality' | 'delivery' | 'pricing' | 'other';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string | null;
          role: UserRole;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      price_lists: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: CustomerType;
          phone: string | null;
          email: string | null;
          address: string | null;
          region: string | null;
          assigned_sales_id: string | null;
          debt_limit: number;
          price_list_id: string | null;
          status: CustomerStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          type?: CustomerType;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          region?: string | null;
          assigned_sales_id?: string | null;
          debt_limit?: number;
          price_list_id?: string | null;
          status?: CustomerStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          type?: CustomerType;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          region?: string | null;
          assigned_sales_id?: string | null;
          debt_limit?: number;
          price_list_id?: string | null;
          status?: CustomerStatus;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          sku: string;
          name: string;
          product_line: ProductLine;
          protein_level: string | null;
          volume_ml: number | null;
          unit: string;
          base_price: number;
          image_url: string | null;
          status: ProductStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          sku: string;
          name: string;
          product_line?: ProductLine;
          protein_level?: string | null;
          volume_ml?: number | null;
          unit?: string;
          base_price?: number;
          image_url?: string | null;
          status?: ProductStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sku?: string;
          name?: string;
          product_line?: ProductLine;
          protein_level?: string | null;
          volume_ml?: number | null;
          unit?: string;
          base_price?: number;
          image_url?: string | null;
          status?: ProductStatus;
          created_at?: string;
        };
      };
      price_list_items: {
        Row: {
          id: string;
          price_list_id: string;
          product_id: string;
          price: number;
        };
        Insert: {
          id?: string;
          price_list_id: string;
          product_id: string;
          price: number;
        };
        Update: {
          id?: string;
          price_list_id?: string;
          product_id?: string;
          price?: number;
        };
      };
      production_batches: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          batch_code: string;
          production_date: string | null;
          fermentation_start_date: string | null;
          fermentation_days: number | null;
          facility: string | null;
          quantity: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          batch_code: string;
          production_date?: string | null;
          fermentation_start_date?: string | null;
          fermentation_days?: number | null;
          facility?: string | null;
          quantity?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          batch_code?: string;
          production_date?: string | null;
          fermentation_start_date?: string | null;
          fermentation_days?: number | null;
          facility?: string | null;
          quantity?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          order_code: string;
          customer_id: string;
          sales_id: string | null;
          status: OrderStatus;
          order_date: string;
          delivery_date: string | null;
          total_amount: number;
          discount_amount: number;
          payment_status: PaymentStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_code: string;
          customer_id: string;
          sales_id?: string | null;
          status?: OrderStatus;
          order_date?: string;
          delivery_date?: string | null;
          total_amount?: number;
          discount_amount?: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_code?: string;
          customer_id?: string;
          sales_id?: string | null;
          status?: OrderStatus;
          order_date?: string;
          delivery_date?: string | null;
          total_amount?: number;
          discount_amount?: number;
          payment_status?: PaymentStatus;
          notes?: string | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          batch_id: string | null;
          quantity: number;
          unit_price: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          batch_id?: string | null;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          batch_id?: string | null;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
        };
      };
      debts: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          order_id: string | null;
          amount: number;
          due_date: string | null;
          status: DebtStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_id: string;
          order_id?: string | null;
          amount?: number;
          due_date?: string | null;
          status?: DebtStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          order_id?: string | null;
          amount?: number;
          due_date?: string | null;
          status?: DebtStatus;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          tenant_id: string;
          debt_id: string;
          customer_id: string;
          amount: number;
          payment_date: string;
          method: PaymentMethod;
          notes: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          debt_id: string;
          customer_id: string;
          amount?: number;
          payment_date?: string;
          method?: PaymentMethod;
          notes?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          debt_id?: string;
          customer_id?: string;
          amount?: number;
          payment_date?: string;
          method?: PaymentMethod;
          notes?: string | null;
        };
      };
      visits: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          sales_id: string | null;
          visit_date: string;
          latitude: number | null;
          longitude: number | null;
          photo_urls: string[] | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_id: string;
          sales_id?: string | null;
          visit_date?: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_urls?: string[] | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          sales_id?: string | null;
          visit_date?: string;
          latitude?: number | null;
          longitude?: number | null;
          photo_urls?: string[] | null;
          notes?: string | null;
        };
      };
      complaints: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string;
          type: ComplaintType;
          description: string | null;
          status: ComplaintStatus;
          handled_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_id: string;
          type?: ComplaintType;
          description?: string | null;
          status?: ComplaintStatus;
          handled_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          type?: ComplaintType;
          description?: string | null;
          status?: ComplaintStatus;
          handled_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auth_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
    };
    Enums: {
      user_role: UserRole;
      customer_type: CustomerType;
      customer_status: CustomerStatus;
      product_line: ProductLine;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      debt_status: DebtStatus;
      payment_method: PaymentMethod;
      complaint_type: ComplaintType;
      complaint_status: ComplaintStatus;
    };
  };
}
