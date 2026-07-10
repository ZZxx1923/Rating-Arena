/**
 * Supabase Client Configuration
 * Initializes the Supabase client for authentication and database operations
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "admin" | "user";
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: "admin" | "user";
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          name: string;
          position: string;
          department_id: string;
          email?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: string;
          department_id: string;
          email?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          position?: string;
          department_id?: string;
          email?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          employee_id: string;
          user_id: string;
          is_anonymous: boolean;
          ratings: Record<string, number>;
          comment?: string;
          status: "pending" | "approved" | "rejected";
          rejection_reason?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          user_id: string;
          is_anonymous?: boolean;
          ratings: Record<string, number>;
          comment?: string;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string;
          updated_at?: string;
        };
      };
    };
  };
}
