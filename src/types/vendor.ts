export interface Vendor {
  id: number;
  user_id: number;
  business_name: string;
  website_name?: string;
  business_type?: string;
  full_name: string;
  email: string;
  mobile_number: string;
  service_category: string;
  service_sub_category?: string;
  status: "active" | "inactive";
  is_accepting_bookings: boolean;
  employee_count: number;
  customer_count: number;
  created_at: string;
  vendor_id_code?: string;
  logo_path?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  total_jobs?: number;
  completed_jobs?: number;
  upcoming_jobs?: number;
  total_earnings?: number;
  pending_payments?: number;
  pending_invoices_count?: number;
  job_schedule?: any[];
  past_jobs?: any[];
  earnings_summary?: {
    total_earnings: number;
    paid_amount: number;
    pending_amount: number;
    this_month: {
      total_earnings: number;
      paid_amount: number;
      pending_amount: number;
    };
  };
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login_at: string | null;
    force_password_change: boolean;
  };
  owner?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login_at: string | null;
    force_password_change: boolean;
  };
}

export interface Employee {
  id: number;
  vendor_id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  designation?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive";
  created_at: string;
}
