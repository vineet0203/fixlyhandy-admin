import { api } from "@/api/axiosInstance";
import type { Vendor, Employee, Customer } from "@/types/vendor";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const vendorService = {
  getVendors: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Vendor>> => {
    const response = await api.get("/api/v1/admin/vendors", { params });
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

  getVendor: async (id: number): Promise<Vendor> => {
    const response = await api.get(`/api/v1/admin/vendors/${id}`);
    return response.data.data;
  },

  updateVendor: async (id: number, data: Partial<Vendor>): Promise<Vendor> => {
    const response = await api.put(`/api/v1/admin/vendors/${id}`, data);
    return response.data.data;
  },

  deleteVendor: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/vendors/${id}`);
  },

  toggleVendorStatus: async (id: number): Promise<Vendor> => {
    const response = await api.patch(`/api/v1/admin/vendors/${id}/toggle-status`);
    return response.data.data;
  },

  resetVendorPassword: async (id: number, password: string): Promise<void> => {
    await api.patch(`/api/v1/admin/vendors/${id}/reset-password`, { password });
  },
  resetCustomerPassword: async (id: number, password: string): Promise<void> => {
    await api.patch(`/api/v1/admin/customers/${id}/reset-password`, { password });
  },

  getVendorEmployees: async (
    id: number,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Employee>> => {
    const response = await api.get(`/api/v1/admin/vendors/${id}/employees`, { params });
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

  addVendorEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.post(`/api/v1/admin/vendors/${id}/employees`, data);
    return response.data.data;
  },

  updateVendorEmployee: async (
    vendorId: number,
    employeeId: number,
    data: Partial<Employee>,
  ): Promise<Employee> => {
    const response = await api.put(
      `/api/v1/admin/vendors/${vendorId}/employees/${employeeId}`,
      data,
    );
    return response.data.data;
  },

  deleteVendorEmployee: async (vendorId: number, employeeId: number): Promise<void> => {
    await api.delete(`/api/v1/admin/vendors/${vendorId}/employees/${employeeId}`);
  },

  getVendorCustomers: async (
    id: number,
    params?: { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get(`/api/v1/admin/vendors/${id}/customers`, { params });
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

  addVendorCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post(`/api/v1/admin/vendors/${id}/customers`, data);
    return response.data.data;
  },

  updateVendorCustomer: async (
    vendorId: number,
    customerId: number,
    data: Partial<Customer>,
  ): Promise<Customer> => {
    const response = await api.put(
      `/api/v1/admin/vendors/${vendorId}/customers/${customerId}`,
      data,
    );
    return response.data.data;
  },

  deleteVendorCustomer: async (vendorId: number, customerId: number): Promise<void> => {
    await api.delete(`/api/v1/admin/vendors/${vendorId}/customers/${customerId}`);
  },

  toggleEmployeeStatus: async (vendorId: number, employeeId: number): Promise<Employee> => {
    const response = await api.patch(
      `/api/v1/admin/vendors/${vendorId}/employees/${employeeId}/toggle-status`,
    );
    return response.data.data;
  },

  toggleCustomerStatus: async (vendorId: number, customerId: number): Promise<Customer> => {
    const response = await api.patch(
      `/api/v1/admin/vendors/${vendorId}/customers/${customerId}/toggle-status`,
    );
    return response.data.data;
  },
};
