import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { servicesData, type Service } from "@/data/servicesData";

interface ServicesState {
  services: Service[];
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

const initialState: ServicesState = {
  services: servicesData,
  searchQuery: "",
  categoryFilter: "all",
  locationFilter: "all",
  statusFilter: "all",
  currentPage: 1,
  totalPages: 37,
  totalCount: 256,
};

const slice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setSearch: (s, a: PayloadAction<string>) => { s.searchQuery = a.payload; },
    setCategory: (s, a: PayloadAction<string>) => { s.categoryFilter = a.payload; },
    setLocation: (s, a: PayloadAction<string>) => { s.locationFilter = a.payload; },
    setStatus: (s, a: PayloadAction<string>) => { s.statusFilter = a.payload; },
    setPage: (s, a: PayloadAction<number>) => { s.currentPage = a.payload; },
    toggleFeatured: (s, a: PayloadAction<string>) => {
      const svc = s.services.find((x) => x.id === a.payload);
      if (svc) svc.featured = !svc.featured;
    },
  },
});

export const { setSearch, setCategory, setLocation, setStatus, setPage, toggleFeatured } = slice.actions;
export default slice.reducer;
