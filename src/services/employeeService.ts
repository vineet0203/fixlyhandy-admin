import { api } from "@/api/axiosInstance";
import type { Employee, Vendor } from "@/types/vendor";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EmployeeWithVendor extends Employee {
  vendor?: Vendor;
}

export interface ScheduleItem {
  id: number;
  title: string | null;
  schedule_date: string;
  start_time: string;
  end_time: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  address: string | null;
  priority: string;
  notes: string | null;
  job?: {
    id: number;
    title: string;
    work_type: string;
    status: string;
  };
  vendor?: {
    id: number;
    business_name: string;
  };
}

export interface EmployeeSchedules {
  upcoming: ScheduleItem[];
  past: ScheduleItem[];
}

export const employeeService = {
  getEmployees: async (params?: {
    search?: string;
    status?: string;
    vendor_id?: number | string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<EmployeeWithVendor>> => {
    const response = await api.get("/api/v1/admin/employees", { params });
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

  getEmployee: async (id: number): Promise<EmployeeWithVendor> => {
    const response = await api.get(`/api/v1/admin/employees/${id}`);
    return response.data.data;
  },

  addEmployee: async (data: Partial<Employee>): Promise<EmployeeWithVendor> => {
    const response = await api.post("/api/v1/admin/employees", data);
    return response.data.data;
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<EmployeeWithVendor> => {
    const response = await api.put(`/api/v1/admin/employees/${id}`, data);
    return response.data.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/employees/${id}`);
  },

  toggleEmployeeStatus: async (id: number): Promise<EmployeeWithVendor> => {
    const response = await api.patch(`/api/v1/admin/employees/${id}/toggle-status`);
    return response.data.data;
  },

  resetEmployeePassword: async (id: number, password: string): Promise<void> => {
    await api.patch(`/api/v1/admin/employees/${id}/reset-password`, { password });
  },

  getEmployeeSchedules: async (id: number): Promise<EmployeeSchedules> => {
    const response = await api.get(`/api/v1/admin/employees/${id}/schedules`);
    return response.data.data;
  },
};
