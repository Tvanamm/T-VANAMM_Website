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
      analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          contact_form_fills: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string | null
          form_submissions: number | null
          franchise_inquiries: number | null
          id: string
          newsletter_signups: number | null
          website_visits: number | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          contact_form_fills?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string | null
          form_submissions?: number | null
          franchise_inquiries?: number | null
          id?: string
          newsletter_signups?: number | null
          website_visits?: number | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          contact_form_fills?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string | null
          form_submissions?: number | null
          franchise_inquiries?: number | null
          id?: string
          newsletter_signups?: number | null
          website_visits?: number | null
        }
        Relationships: []
      }
      bill_items_generated_billing: {
        Row: {
          bill_id: number | null
          id: number
          item_name: string | null
          menu_item_id: number
          price: number
          qty: number
        }
        Insert: {
          bill_id?: number | null
          id?: number
          item_name?: string | null
          menu_item_id: number
          price: number
          qty: number
        }
        Update: {
          bill_id?: number | null
          id?: number
          item_name?: string | null
          menu_item_id?: number
          price?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_bill_item_bill"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills_generated_billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bill_item_menu"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_editor_billing"
            referencedColumns: ["id"]
          },
        ]
      }
      bills_generated_billing: {
        Row: {
          created_at: string
          id: number
          total: number
        }
        Insert: {
          created_at?: string
          id?: number
          total: number
        }
        Update: {
          created_at?: string
          id?: number
          total?: number
        }
        Relationships: []
      }
      cleanup_logs: {
        Row: {
          cleanup_date: string | null
          cleanup_type: string
          details: Json | null
          id: string
          records_deleted: number | null
        }
        Insert: {
          cleanup_date?: string | null
          cleanup_type: string
          details?: Json | null
          id?: string
          records_deleted?: number | null
        }
        Update: {
          cleanup_date?: string | null
          cleanup_type?: string
          details?: Json | null
          id?: string
          records_deleted?: number | null
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          active: boolean
          base_delivery_fee: number
          created_at: string
          express_delivery_fee: number | null
          free_delivery_threshold: number | null
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_delivery_fee?: number
          created_at?: string
          express_delivery_fee?: number | null
          free_delivery_threshold?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_delivery_fee?: number
          created_at?: string
          express_delivery_fee?: number | null
          free_delivery_threshold?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          export_type: string
          file_size: number | null
          filters: Json | null
          format: string
          id: string
          record_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          export_type: string
          file_size?: number | null
          filters?: Json | null
          format: string
          id?: string
          record_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          export_type?: string
          file_size?: number | null
          filters?: Json | null
          format?: string
          id?: string
          record_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_follow_ups: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          follow_up_type: string
          form_submission_id: string
          id: string
          notes: string | null
          scheduled_date: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_type: string
          form_submission_id: string
          id?: string
          notes?: string | null
          scheduled_date?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_type?: string
          form_submission_id?: string
          id?: string
          notes?: string | null
          scheduled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_follow_ups_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          additional_data: Json | null
          catalog_requested: boolean | null
          contact_notes: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          email: string
          experience_years: number | null
          form_type: string | null
          franchise_inquiry_details: Json | null
          franchise_location: string | null
          id: string
          investment_amount: number | null
          message: string | null
          name: string | null
          phone: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          additional_data?: Json | null
          catalog_requested?: boolean | null
          contact_notes?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          form_type?: string | null
          franchise_inquiry_details?: Json | null
          franchise_location?: string | null
          id?: string
          investment_amount?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          additional_data?: Json | null
          catalog_requested?: boolean | null
          contact_notes?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          form_type?: string | null
          franchise_inquiry_details?: Json | null
          franchise_location?: string | null
          id?: string
          investment_amount?: number | null
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      franchise_delivery_settings: {
        Row: {
          active: boolean
          created_at: string
          delivery_fee: number
          express_delivery_fee: number | null
          franchise_location: string
          free_delivery_threshold: number | null
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          delivery_fee?: number
          express_delivery_fee?: number | null
          franchise_location: string
          free_delivery_threshold?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          delivery_fee?: number
          express_delivery_fee?: number | null
          franchise_location?: string
          free_delivery_threshold?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      franchise_members: {
        Row: {
          aadhar_card: string | null
          aadhar_verified: boolean
          area: string | null
          assigned_at: string
          assigned_by: string | null
          city: string | null
          created_at: string
          dashboard_access_enabled: boolean | null
          email: string
          franchise_location: string
          id: string
          location_details: string | null
          name: string
          phone: string | null
          pincode: string | null
          position: string
          profile_completion_percentage: number | null
          revenue_generated: number | null
          state: string | null
          status: string
          tvanamm_id: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aadhar_card?: string | null
          aadhar_verified?: boolean
          area?: string | null
          assigned_at?: string
          assigned_by?: string | null
          city?: string | null
          created_at?: string
          dashboard_access_enabled?: boolean | null
          email: string
          franchise_location: string
          id?: string
          location_details?: string | null
          name: string
          phone?: string | null
          pincode?: string | null
          position: string
          profile_completion_percentage?: number | null
          revenue_generated?: number | null
          state?: string | null
          status?: string
          tvanamm_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aadhar_card?: string | null
          aadhar_verified?: boolean
          area?: string | null
          assigned_at?: string
          assigned_by?: string | null
          city?: string | null
          created_at?: string
          dashboard_access_enabled?: boolean | null
          email?: string
          franchise_location?: string
          id?: string
          location_details?: string | null
          name?: string
          phone?: string | null
          pincode?: string | null
          position?: string
          profile_completion_percentage?: number | null
          revenue_generated?: number | null
          state?: string | null
          status?: string
          tvanamm_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_members_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_orders: {
        Row: {
          created_at: string | null
          delivery_fee_override: number | null
          detailed_address: Json | null
          estimated_delivery: string | null
          franchise_id: string | null
          franchise_member_id: string | null
          franchise_name: string
          id: string
          loyalty_gift_claimed: string | null
          loyalty_points_used: number | null
          packed_at: string | null
          packed_by: string | null
          packing_status: string | null
          shipped_at: string | null
          shipped_by: string | null
          shipping_address: string
          shipping_details: Json | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number: string | null
          tvanamm_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_fee_override?: number | null
          detailed_address?: Json | null
          estimated_delivery?: string | null
          franchise_id?: string | null
          franchise_member_id?: string | null
          franchise_name: string
          id?: string
          loyalty_gift_claimed?: string | null
          loyalty_points_used?: number | null
          packed_at?: string | null
          packed_by?: string | null
          packing_status?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address: string
          shipping_details?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          tvanamm_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_fee_override?: number | null
          detailed_address?: Json | null
          estimated_delivery?: string | null
          franchise_id?: string | null
          franchise_member_id?: string | null
          franchise_name?: string
          id?: string
          loyalty_gift_claimed?: string | null
          loyalty_points_used?: number | null
          packed_at?: string | null
          packed_by?: string | null
          packing_status?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_address?: string
          shipping_details?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          tvanamm_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchise_orders_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_orders_franchise_member_id_fkey"
            columns: ["franchise_member_id"]
            isOneToOne: false
            referencedRelation: "franchise_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_orders_packed_by_fkey"
            columns: ["packed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_orders_shipped_by_fkey"
            columns: ["shipped_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_supply_summary: {
        Row: {
          created_at: string | null
          franchise_id: string | null
          id: string
          last_order_date: string | null
          total_orders: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          last_order_date?: string | null
          total_orders?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          franchise_id?: string | null
          id?: string
          last_order_date?: string | null
          total_orders?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          gst_rate: number | null
          id: number
          min_order: number
          name: string
          price: number
          status: Database["public"]["Enums"]["inventory_status"]
          stock: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          gst_rate?: number | null
          id?: number
          min_order?: number
          name: string
          price: number
          status?: Database["public"]["Enums"]["inventory_status"]
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          gst_rate?: number | null
          id?: number
          min_order?: number
          name?: string
          price?: number
          status?: Database["public"]["Enums"]["inventory_status"]
          stock?: number
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_gifts: {
        Row: {
          claimed_at: string
          franchise_member_id: string
          gift_type: string
          id: string
          order_id: string | null
          points_used: number
          status: string
        }
        Insert: {
          claimed_at?: string
          franchise_member_id: string
          gift_type: string
          id?: string
          order_id?: string | null
          points_used?: number
          status?: string
        }
        Update: {
          claimed_at?: string
          franchise_member_id?: string
          gift_type?: string
          id?: string
          order_id?: string | null
          points_used?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_gifts_franchise_member_id_fkey"
            columns: ["franchise_member_id"]
            isOneToOne: false
            referencedRelation: "franchise_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_gifts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "franchise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          current_balance: number
          franchise_member_id: string
          id: string
          total_earned: number
          total_redeemed: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          franchise_member_id: string
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          franchise_member_id?: string
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_franchise_member_id_fkey"
            columns: ["franchise_member_id"]
            isOneToOne: true
            referencedRelation: "franchise_members"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string
          franchise_member_id: string
          id: string
          metadata: Json | null
          order_id: string | null
          points: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          description: string
          franchise_member_id: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          points: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          description?: string
          franchise_member_id?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          points?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_franchise_member_id_fkey"
            columns: ["franchise_member_id"]
            isOneToOne: false
            referencedRelation: "franchise_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "franchise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_editor_billing: {
        Row: {
          category: string | null
          id: number
          name: string | null
          price: number | null
        }
        Insert: {
          category?: string | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Update: {
          category?: string | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_delivery: {
        Row: {
          delivered_at: string | null
          id: string
          notification_id: string | null
          read_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_reply: boolean | null
          message: string
          parent_id: string | null
          read: boolean | null
          read_at: string | null
          reply_to: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_reply?: boolean | null
          message: string
          parent_id?: string | null
          read?: boolean | null
          read_at?: string | null
          reply_to?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_reply?: boolean | null
          message?: string
          parent_id?: string | null
          read?: boolean | null
          read_at?: string | null
          reply_to?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: number | null
          item_name: string
          order_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: number | null
          item_name: string
          order_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: number | null
          item_name?: string
          order_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "franchise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_packing_checklist: {
        Row: {
          created_at: string | null
          id: string
          item_id: number | null
          item_name: string
          order_id: string | null
          packed: boolean | null
          packed_at: string | null
          packed_by: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: number | null
          item_name: string
          order_id?: string | null
          packed?: boolean | null
          packed_at?: string | null
          packed_by?: string | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: number | null
          item_name?: string
          order_id?: string | null
          packed?: boolean | null
          packed_at?: string | null
          packed_by?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_packing_checklist_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_packing_checklist_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "franchise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_packing_items: {
        Row: {
          created_at: string | null
          id: string
          is_packed: boolean | null
          item_name: string
          order_id: string | null
          packed_at: string | null
          packed_by: string | null
          packed_quantity: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_packed?: boolean | null
          item_name: string
          order_id?: string | null
          packed_at?: string | null
          packed_by?: string | null
          packed_quantity?: number | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_packed?: boolean | null
          item_name?: string
          order_id?: string | null
          packed_at?: string | null
          packed_by?: string | null
          packed_quantity?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_packing_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "franchise_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          name: string
          phone: string | null
          provider: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          name: string
          phone?: string | null
          provider?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          provider?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      real_time_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          timestamp: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          timestamp?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      revenue_trends: {
        Row: {
          created_at: string
          date: string
          franchise_id: string | null
          id: string
          orders_count: number
          revenue_amount: number
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          franchise_id?: string | null
          id?: string
          orders_count?: number
          revenue_amount?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          franchise_id?: string | null
          id?: string
          orders_count?: number
          revenue_amount?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          role?: string
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          active: boolean | null
          assigned_at: string | null
          assigned_by: string | null
          franchise_id: string
          id: string
          position: string
          staff_id: string | null
        }
        Insert: {
          active?: boolean | null
          assigned_at?: string | null
          assigned_by?: string | null
          franchise_id: string
          id?: string
          position: string
          staff_id?: string | null
        }
        Update: {
          active?: boolean | null
          assigned_at?: string | null
          assigned_by?: string | null
          franchise_id?: string
          id?: string
          position?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          created_at: string
          id: string
          interactions: number | null
          page_url: string
          scroll_depth: number | null
          session_id: string
          time_spent: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interactions?: number | null
          page_url: string
          scroll_depth?: number | null
          session_id: string
          time_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interactions?: number | null
          page_url?: string
          scroll_depth?: number | null
          session_id?: string
          time_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_status: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          last_seen: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      website_visits: {
        Row: {
          created_at: string
          id: string
          page_url: string
          referrer: string | null
          session_id: string | null
          updated_at: string
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_url: string
          referrer?: string | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_url?: string
          referrer?: string | null
          session_id?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_loyalty_points_manual: {
        Args: {
          target_franchise_member_id: string
          points_to_add: number
          description_text?: string
        }
        Returns: boolean
      }
      assign_role_and_create_member: {
        Args: {
          target_user_id: string
          new_role: string
          franchise_location?: string
          member_name?: string
          member_email?: string
        }
        Returns: boolean
      }
      calculate_delivery_fee: {
        Args: { order_amount: number }
        Returns: number
      }
      calculate_profile_completion: {
        Args: { member_id: string }
        Returns: number
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_franchise_onboarding: {
        Args: {
          target_user_id: string
          tvanamm_id_param: string
          franchise_location_param: string
        }
        Returns: boolean
      }
      create_franchise_order: {
        Args: {
          p_franchise_member_id: string
          p_franchise_name: string
          p_tvanamm_id: string
          p_shipping_address: string
          p_total_amount: number
          p_order_items: Json
          p_delivery_fee?: number
          p_loyalty_points_used?: number
          p_loyalty_gift_claimed?: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          notification_type: string
          notification_title: string
          notification_message: string
          target_user_id?: string
          notification_data?: Json
        }
        Returns: string
      }
      export_forms_data: {
        Args: {
          start_date?: string
          end_date?: string
          form_type_filter?: string
        }
        Returns: {
          submission_id: string
          submission_type: string
          submitter_name: string
          submitter_email: string
          submitter_phone: string
          submission_message: string
          submission_status: string
          submission_franchise_location: string
          submission_investment_amount: number
          submission_catalog_requested: boolean
          submission_created_at: string
          contact_notes: string
          contacted_at: string
        }[]
      }
      export_orders_data: {
        Args: {
          start_date?: string
          end_date?: string
          status_filter?: string
          franchise_filter?: string
        }
        Returns: {
          order_id: string
          franchise_name: string
          tvanamm_id: string
          total_amount: number
          delivery_fee: number
          status: string
          created_at: string
          shipped_at: string
          tracking_number: string
          shipping_address: string
          shipping_details: Json
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_franchise_member_by_order: {
        Args: { order_uuid: string }
        Returns: {
          member_id: string
          user_id: string
          name: string
          email: string
          phone: string
        }[]
      }
      track_website_visit: {
        Args: {
          page_url: string
          visitor_ip?: string
          user_agent?: string
          referrer?: string
        }
        Returns: string
      }
      update_franchise_dashboard_access: {
        Args: { target_member_id: string; access_enabled: boolean }
        Returns: boolean
      }
    }
    Enums: {
      inventory_status: "In Stock" | "Low Stock" | "Critical" | "Out of Stock"
      order_status:
        | "pending"
        | "confirmed"
        | "packed"
        | "shipped"
        | "out-for-delivery"
        | "delivered"
        | "cancelled"
        | "completed"
        | "paid"
        | "packing"
      user_role: "customer" | "franchise" | "admin" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      inventory_status: ["In Stock", "Low Stock", "Critical", "Out of Stock"],
      order_status: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "completed",
        "paid",
        "packing",
      ],
      user_role: ["customer", "franchise", "admin", "owner"],
    },
  },
} as const
