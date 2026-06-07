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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  TextField,
  IconButton,
} from "@mui/material";
import { ChevronRight, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { serviceCategoryService, type ServiceCategory } from "@/services/serviceCategoryService";

export function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Delete Confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await serviceCategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!selectedCategory) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove invalid characters
        .trim()
        .replace(/[\s-]+/g, "_"); // Replace spaces and hyphens with underscores
      setSlug(generatedSlug);
    }
  }, [name, selectedCategory]);

  const handleAddNew = () => {
    setSelectedCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setSortOrder(categories.length + 1);
    setFormOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setIcon(category.icon || "");
    setSortOrder(category.sort_order);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      try {
        await serviceCategoryService.deleteCategory(deleteId);
        setCategories((prev) => prev.filter((c) => c.id !== deleteId));
        setDeleteId(null);
        setDeleteOpen(false);
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        // Edit existing
        const updated = await serviceCategoryService.updateCategory(selectedCategory.id, {
          name,
          slug,
          description,
          icon,
          sort_order: sortOrder,
        });
        setCategories((prev) => prev.map((c) => (c.id === selectedCategory.id ? updated : c)));
      } else {
        // Create new
        const created = await serviceCategoryService.createCategory({
          name,
          slug,
          description,
          icon,
          sort_order: sortOrder,
        });
        setCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      }
      setFormOpen(false);
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const updated = await serviceCategoryService.toggleCategory(id);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Failed to toggle category status:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">Service Categories</h1>
          <Breadcrumbs separator={<ChevronRight size={14} className="text-[#9CA3AF]" />} sx={{ mt: 0.5, fontSize: 13 }}>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Dashboard</span>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Services</span>
            <span style={{ color: "#6B7280" }}>Service Categories</span>
          </Breadcrumbs>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={handleAddNew}
            sx={{ height: 44, boxShadow: "0 8px 20px -8px rgba(124,58,237,.55)" }}
          >
            Add Category
          </Button>
        </div>
      </div>

      <Paper sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#fff", borderColor: "#E5E7EB", color: "#6B7280", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", py: 1.5 } }}>
                <TableCell>Sort Order</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Icon</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#6B7280" }}>
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#6B7280" }}>
                    No categories found. Add your first category!
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} sx={{ "&:hover": { bgcolor: "#F9FAFB" }, "& td": { borderColor: "#F3F4F6", py: 1.5 } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#374151" }}>{category.sort_order}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#111827" }}>{category.name}</TableCell>
                    <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 13, color: "#4B5563" }}>{category.slug}</TableCell>
                    <TableCell sx={{ color: "#6B7280", fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {category.description || "-"}
                    </TableCell>
                    <TableCell sx={{ color: "#4B5563", fontSize: 13 }}>{category.icon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={category.is_active}
                          onChange={() => handleToggleActive(category.id)}
                          color="primary"
                          size="small"
                        />
                        <span className={`text-xs font-bold ${category.is_active ? "text-green-600" : "text-gray-400"}`}>
                          {category.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <IconButton size="small" onClick={() => handleEdit(category)}>
                          <Pencil size={16} className="text-[#7C3AED]" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(category.id)}>
                          <Trash2 size={16} className="text-red-500" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              width: "100%",
              maxWidth: 500,
            },
          },
        }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 800, color: "#111827", pb: 1 }}>
            {selectedCategory ? "Edit Category" : "Add Service Category"}
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                required
                fullWidth
                size="small"
                disabled={!!selectedCategory}
                helperText="URL-friendly identifier. Cannot be changed once created."
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
              <TextField
                label="Icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. Wrench, Hammer, Zap"
                fullWidth
                size="small"
                helperText="Lucide icon identifier name"
              />
              <TextField
                label="Sort Order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                required
                fullWidth
                size="small"
              />
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={() => setFormOpen(false)}
              variant="outlined"
              sx={{ borderColor: "#E5E7EB", color: "#4B5563", "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#7C3AED", "&:hover": { bgcolor: "#6D28D9" } }}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
          Delete Category
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600">
            Are you sure you want to delete this category? This action cannot be undone and any associated layout mappings might be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            variant="outlined"
            sx={{ borderColor: "#E5E7EB", color: "#4B5563", "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}
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
    </div>
  );
}
