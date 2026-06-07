import { api } from "@/api/axiosInstance";
export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export const serviceCategoryService = {
  getAllCategories: async (): Promise<ServiceCategory[]> => {
    const response = await api.get("/api/v1/service-categories");
    const raw = response.data;
    // API returns indexed keys {0: {...}, 1: {...}, success, message, ...}
    return Object.values(raw).filter((v): v is ServiceCategory =>
      typeof v === "object" && v !== null && "id" in v
    );
  },
  createCategory: async (data: Omit<ServiceCategory, "id" | "is_active">): Promise<ServiceCategory> => {
    const response = await api.post("/api/v1/admin/service-categories", { ...data, is_active: true });
    return response.data.data;
  },
  updateCategory: async (id: number, data: Partial<ServiceCategory>): Promise<ServiceCategory> => {
    const response = await api.put(`/api/v1/admin/service-categories/${id}`, data);
    return response.data.data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/admin/service-categories/${id}`);
  },
  toggleCategory: async (id: number): Promise<ServiceCategory> => {
    const response = await api.patch(`/api/v1/admin/service-categories/${id}/toggle`);
    return response.data.data;
  },
};
