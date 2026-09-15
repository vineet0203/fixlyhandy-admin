export interface BookingRequestItem {
  id: number;
  quote_id: number;
  item_name: string;
  description?: string | null;
  quantity: number;
  unit_price: string | number;
  item_total: string | number;
}

export interface BookingRequestCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status?: string;
}

export interface BookingRequestAssignment {
  id: number;
  quote_id: number;
  vendor_id: number | null;
  assigned_by: number | null;
  action: "assigned" | "vendor_created_and_assigned" | "rejected";
  vendor_was_created: boolean;
  note?: string | null;
  created_at: string;
  vendor?: {
    id: number;
    business_name: string;
    email: string;
  } | null;
}

export interface BookingRequest {
  id: number;
  quote_number: string;
  title: string;
  client_name: string;
  client_email: string;
  client_id: number | null;
  customer_id: number | null;
  vendor_id: number | null;
  status: string;
  booking_location?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  notes?: string | null;
  images?: string[] | null;
  total_amount?: string | number;
  created_at: string;
  updated_at?: string;
  items?: BookingRequestItem[];
  customer?: BookingRequestCustomer | null;
  assignment_history?: BookingRequestAssignment[];
}

export interface SuggestedVendor {
  id: number;
  business_name: string;
  email: string;
  mobile_number?: string | null;
  service_category?: string | null;
  service_sub_category?: string | null;
  service_description?: string | null;
  city?: string | null;
  state?: string | null;
  match_score: number;
  is_suggested: boolean;
}

export interface SuggestedVendorsResponse {
  vendors: SuggestedVendor[];
  total_active_vendors: number;
  derived_service: {
    service_category: string | null;
    service_sub_category: string | null;
  };
}

export interface CreateVendorAndAssignPayload {
  business_name: string;
  full_name: string;
  email: string;
  mobile_number: string;
  business_type: "commercial" | "residential";
  service_category?: string;
  service_sub_category?: string;
  website_name?: string;
  note?: string;
}
