import { Breadcrumbs, Button } from "@mui/material";
import { ChevronRight, Plus, Upload } from "lucide-react";
import { StatsCards } from "@/components/services/StatsCards";
import { FilterBar } from "@/components/services/FilterBar";
import { ServicesTable } from "@/components/services/ServicesTable";

export function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">Services</h1>
          <Breadcrumbs separator={<ChevronRight size={14} className="text-[#9CA3AF]" />} sx={{ mt: 0.5, fontSize: 13 }}>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Dashboard</span>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Services</span>
            <span style={{ color: "#6B7280" }}>All Services</span>
          </Breadcrumbs>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outlined" startIcon={<Upload size={16} />} sx={{ height: 44 }}>Import Services</Button>
          <Button variant="contained" color="primary" startIcon={<Plus size={16} />} sx={{ height: 44, boxShadow: "0 8px 20px -8px rgba(124,58,237,.55)" }}>
            Add New Service
          </Button>
        </div>
      </div>

      <StatsCards />
      <FilterBar />
      <ServicesTable />
    </div>
  );
}
