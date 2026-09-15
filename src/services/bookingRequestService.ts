import { api } from "@/api/axiosInstance";
import type { PaginatedResponse } from "@/services/vendorService";
import type {
  BookingRequest,
  CreateVendorAndAssignPayload,
  SuggestedVendorsResponse,
} from "@/types/bookingRequest";

export const bookingRequestService = {
  getBookingRequests: async (params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<BookingRequest>> => {
    const response = await api.get("/api/v1/admin/booking-requests", { params });
    return {
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      meta: {
        current_page: response.data?.meta?.current_page || 1,
        last_page: response.data?.meta?.last_page || 1,
        per_page: response.data?.meta?.per_page || 10,
        total: response.data?.meta?.total || 0,
      },
    };
  },

  getUnassignedCount: async (): Promise<number> => {
    const response = await api.get("/api/v1/admin/booking-requests/count");
    return response.data?.data?.count ?? 0;
  },

  getBookingRequest: async (id: number): Promise<BookingRequest> => {
    const response = await api.get(`/api/v1/admin/booking-requests/${id}`);
    return response.data.data;
  },

  getSuggestedVendors: async (id: number): Promise<SuggestedVendorsResponse> => {
    const response = await api.get(`/api/v1/admin/booking-requests/${id}/suggested-vendors`);
    return {
      vendors: Array.isArray(response.data?.data?.vendors) ? response.data.data.vendors : [],
      total_active_vendors: response.data?.data?.total_active_vendors ?? 0,
      derived_service: response.data?.data?.derived_service ?? {
        service_category: null,
        service_sub_category: null,
      },
    };
  },

  assign: async (id: number, vendorId: number, note?: string): Promise<BookingRequest> => {
    const response = await api.post(`/api/v1/admin/booking-requests/${id}/assign`, {
      vendor_id: vendorId,
      note: note || undefined,
    });
    return response.data.data;
  },

  createVendorAndAssign: async (
    id: number,
    payload: CreateVendorAndAssignPayload,
  ): Promise<{ lead: BookingRequest; vendor: { id: number; business_name: string } }> => {
    const response = await api.post(
      `/api/v1/admin/booking-requests/${id}/create-vendor-and-assign`,
      payload,
    );
    return response.data.data;
  },

  reject: async (id: number, reason?: string): Promise<BookingRequest> => {
    const response = await api.post(`/api/v1/admin/booking-requests/${id}/reject`, {
      reason: reason || undefined,
    });
    return response.data.data;
  },
};
