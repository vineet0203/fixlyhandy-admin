import { useState, useEffect } from "react";
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from "@mui/material";
import { ChevronRight, Plus, Upload, AlertTriangle, LucideIcon } from "lucide-react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { StatsCards } from "@/components/services/StatsCards";
import { FilterBar } from "@/components/services/FilterBar";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServiceDialog } from "@/components/services/ServiceDialog";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchServices,
  createService,
  updateService,
  removeService,
} from "@/store/slices/servicesSlice";
import type { Service } from "@/data/servicesData";
import { CircularProgress } from "@mui/material";
import { Toaster, toast } from "sonner";

export function ServicesPage() {
  const dispatch = useAppDispatch();
  const search = useSearch({ from: "/services" });
  const navigate = useNavigate({ from: "/services" });

  const { searchQuery, categoryFilter, locationFilter, statusFilter, currentPage, loading } =
    useAppSelector((s) => s.services);

  // Service Add/Edit Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  // Delete Confirmation Dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch, searchQuery, categoryFilter, locationFilter, statusFilter, currentPage]);

  useEffect(() => {
    if (search.action === "new") {
      setSelectedService(null);
      setReadOnly(false);
      setFormOpen(true);
      // Clean the search parameter so closing/reopening works correctly
      navigate({
        search: (prev: Record<string, unknown>) => ({ ...prev, action: undefined }),
        replace: true,
      });
    }
  }, [search.action, navigate]);

  const handleAddNew = () => {
    setSelectedService(null);
    setReadOnly(false);
    setFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setReadOnly(false);
    setFormOpen(true);
  };

  const handleView = (service: Service) => {
    setSelectedService(service);
    setReadOnly(true);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string | number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(removeService(deleteId)).unwrap();
        toast.success("Service deleted successfully");
      } catch (err) {
        toast.error((err as string) || "Failed to delete service");
      }
      setDeleteId(null);
      setDeleteOpen(false);
    }
  };

  const handleSaveService = async (data: Partial<Service>) => {
    try {
      if (data.id) {
        await dispatch(updateService({ id: data.id, data })).unwrap();
        toast.success("Service updated successfully");
      } else {
        await dispatch(createService(data as Service)).unwrap();
        toast.success("Service created successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error((err as string) || "Failed to save service");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">Services</h1>
          <Breadcrumbs
            separator={<ChevronRight size={14} className="text-[#9CA3AF]" />}
            sx={{ mt: 0.5, fontSize: 13 }}
          >
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Dashboard</span>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Services</span>
            <span style={{ color: "#6B7280" }}>All Services</span>
          </Breadcrumbs>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outlined" startIcon={<Upload size={16} />} sx={{ height: 44 }}>
            Import Services
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={handleAddNew}
            sx={{ height: 44, boxShadow: "0 8px 20px -8px rgba(124,58,237,.55)" }}
          >
            Add New Service
          </Button>
        </div>
      </div>

      <StatsCards />
      <FilterBar />
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-3xl border border-gray-100 min-h-[300px]">
          <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
        </div>
      ) : (
        <ServicesTable onView={handleView} onEdit={handleEdit} onDelete={handleDeleteClick} />
      )}

      {/* Add / Edit Form Dialog */}
      <ServiceDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveService}
        service={selectedService}
        readOnly={readOnly}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              maxWidth: 400,
            },
          },
        }}
      >
        <DialogTitle className="flex items-center gap-2 text-red-600 font-bold">
          <AlertTriangle size={20} className="text-red-500" />
          Delete Service
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600">
            Are you sure you want to delete this service? This action cannot be undone and the
            service will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#E5E7EB",
              color: "#4B5563",
              "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ bgcolor: "#EF4444", "&:hover": { bgcolor: "#DC2626" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" richColors />
    </div>
  );
}
