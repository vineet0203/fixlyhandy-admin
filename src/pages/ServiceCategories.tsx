import React, { useState, useEffect } from "react";
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
  Collapse,
  Box,
  MenuItem,
} from "@mui/material";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  FolderOpen,
  X,
  Search,
} from "lucide-react";
import {
  serviceCategoryService,
  type ServiceCategory,
  type ServiceSubCategory,
} from "@/services/serviceCategoryService";
import { Toaster, toast } from "sonner";

export function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Unified Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<"main" | "sub">("main");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ServiceSubCategory | null>(null);
  
  // Input fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete Confirmation States
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"main" | "sub">("main");

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [cats, subs] = await Promise.all([
        serviceCategoryService.getAllCategories(),
        serviceCategoryService.getSubCategories(),
      ]);
      setCategories(cats);
      setSubCategories(subs);
    } catch (err) {
      console.error("Failed to load categories and subcategories:", err);
      toast.error("Failed to retrieve service categories data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddNewCategory = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setType("main");
    setName("");
    setDescription("");
    setPrice("");
    setParentCategoryId(categories[0]?.id || 0);
    setFormOpen(true);
  };

  const handleAddNewSubCategory = (parentCatId: number) => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setType("sub");
    setName("");
    setDescription("");
    setPrice("");
    setParentCategoryId(parentCatId);
    setFormOpen(true);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setType("main");
    setName(category.name);
    setDescription(category.description || "");
    setPrice(category.price !== undefined && category.price !== null ? String(category.price) : "");
    setFormOpen(true);
  };

  const handleEditSubCategory = (sub: ServiceSubCategory) => {
    setSelectedCategory(null);
    setSelectedSubCategory(sub);
    setType("sub");
    setName(sub.name);
    setDescription(sub.description || "");
    setPrice(sub.price !== undefined && sub.price !== null ? String(sub.price) : "");
    setParentCategoryId(sub.service_category_id);
    setFormOpen(true);
  };

  const handleDeleteCategoryClick = (id: number) => {
    setDeleteId(id);
    setDeleteType("main");
    setDeleteOpen(true);
  };

  const handleDeleteSubCategoryClick = (id: number) => {
    setDeleteId(id);
    setDeleteType("sub");
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      if (deleteType === "main") {
        await serviceCategoryService.deleteCategory(deleteId);
        setCategories((prev) => prev.filter((c) => c.id !== deleteId));
        setSubCategories((prev) => prev.filter((s) => s.service_category_id !== deleteId));
        toast.success("Category deleted successfully");
      } else {
        await serviceCategoryService.deleteSubCategory(deleteId);
        setSubCategories((prev) => prev.filter((s) => s.id !== deleteId));
        toast.success("Sub-service deleted successfully");
      }
      setDeleteId(null);
      setDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete resource:", err);
      toast.error(`Failed to delete ${deleteType === "main" ? "category" : "sub-service"}.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto generate slug
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "_");

    try {
      const parsedPrice = price ? parseFloat(price) : null;
      if (type === "main") {
        if (selectedCategory) {
          // Edit Category
          const updated = await serviceCategoryService.updateCategory(selectedCategory.id, {
            name,
            slug: selectedCategory.slug, // Keep original slug
            description,
            price: parsedPrice,
            icon: selectedCategory.icon,
            sort_order: selectedCategory.sort_order,
          });
          setCategories((prev) => prev.map((c) => (c.id === selectedCategory.id ? updated : c)));
          toast.success("Category updated successfully");
        } else {
          // Create Category
          const created = await serviceCategoryService.createCategory({
            name,
            slug: generatedSlug,
            description,
            price: parsedPrice,
            icon: "FolderOpen",
            sort_order: categories.length + 1,
          });
          setCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
          toast.success("Category created successfully");

          // Automatically transition to adding a sub-service for this new category
          setType("sub");
          setParentCategoryId(created.id);
          setName("");
          setDescription("");
          setPrice("");
          toast.info(`Now, please add a sub-service under "${created.name}"`);
          return;
        }
      } else {
        if (selectedSubCategory) {
          // Edit Sub-category
          const updated = await serviceCategoryService.updateSubCategory(selectedSubCategory.id, {
            service_category_id: parentCategoryId,
            name,
            slug: selectedSubCategory.slug, // Keep original slug
            description,
            price: parsedPrice,
            icon: selectedSubCategory.icon,
            sort_order: selectedSubCategory.sort_order,
          });
          setSubCategories((prev) => prev.map((s) => (s.id === selectedSubCategory.id ? updated : s)));
          toast.success("Sub-service updated successfully");
        } else {
          // Create Sub-category
          const parentSubs = subCategories.filter((s) => s.service_category_id === parentCategoryId);
          const created = await serviceCategoryService.createSubCategory({
            service_category_id: parentCategoryId,
            name,
            slug: generatedSlug,
            description,
            price: parsedPrice,
            icon: "FileText",
            sort_order: parentSubs.length + 1,
          });
          setSubCategories((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
          toast.success("Sub-service created successfully");
        }
      }
      setFormOpen(false);
    } catch (err) {
      console.error("Failed to save:", err);
      toast.error("Failed to save service. Please ensure name is unique.");
    }
  };

  const handleToggleCategoryActive = async (id: number) => {
    try {
      const updated = await serviceCategoryService.toggleCategory(id);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success("Category status updated");
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      toast.error("Failed to toggle status.");
    }
  };

  const handleToggleSubCategoryActive = async (id: number) => {
    try {
      const updated = await serviceCategoryService.toggleSubCategory(id);
      setSubCategories((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success("Sub-service status updated");
    } catch (err) {
      console.error("Failed to toggle sub-service status:", err);
      toast.error("Failed to toggle status.");
    }
  };

  // Search filtering logic
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const catMatch =
      category.name.toLowerCase().includes(query) ||
      (category.slug || "").toLowerCase().includes(query) ||
      (category.description || "").toLowerCase().includes(query) ||
      (category.price !== undefined && category.price !== null && String(category.price).includes(query));

    if (catMatch) return true;

    const categorySubs = subCategories.filter(
      (sub) => sub.service_category_id === category.id
    );
    const subMatch = categorySubs.some((sub) =>
      sub.name.toLowerCase().includes(query) ||
      (sub.slug || "").toLowerCase().includes(query) ||
      (sub.description || "").toLowerCase().includes(query) ||
      (sub.price !== undefined && sub.price !== null && String(sub.price).includes(query))
    );

    return subMatch;
  });

  const getFilteredSubCategories = (catId: number) => {
    const categorySubs = subCategories.filter(
      (sub) => sub.service_category_id === catId
    );
    const query = searchQuery.toLowerCase().trim();
    if (!query) return categorySubs;

    return categorySubs.filter((sub) =>
      sub.name.toLowerCase().includes(query) ||
      (sub.slug || "").toLowerCase().includes(query) ||
      (sub.description || "").toLowerCase().includes(query) ||
      (sub.price !== undefined && sub.price !== null && String(sub.price).includes(query))
    );
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
            onClick={handleAddNewCategory}
            sx={{ height: 44, bgcolor: "#7C3AED", "&:hover": { bgcolor: "#6D28D9" }, boxShadow: "0 8px 20px -8px rgba(124,58,237,.55)" }}
          >
            Add New Service
          </Button>
        </div>
      </div>

      {/* Real-time Search Input Field */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#fff", p: 2, borderRadius: 3, border: "1px solid #E5E7EB" }}>
        <TextField
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            width: "100%",
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            }
          }}
          slotProps={{
            input: {
              startAdornment: <Search size={18} className="text-[#9CA3AF] mr-2" />,
              endAdornment: searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </IconButton>
              )
            }
          }}
        />
      </Box>

      <Paper sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ "& th": { bgcolor: "#fff", borderColor: "#E5E7EB", color: "#6B7280", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", py: 2 } }}>
                <TableCell width={60} align="center">No.</TableCell>
                <TableCell width={50}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price (USD)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#6B7280" }}>
                    Loading categories and subcategories...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#6B7280" }}>
                    {searchQuery ? "No matching service categories found." : "No service categories found. Add your first category!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category, index) => {
                  const isExpanded = !!expandedRows[category.id];
                  const categorySubs = getFilteredSubCategories(category.id);

                  return (
                    <React.Fragment key={category.id}>
                      {/* Main Category Row */}
                      <TableRow sx={{ "&:hover": { bgcolor: "#F9FAFB" }, "& td": { borderColor: "#F3F4F6", py: 1.5 } }}>
                        {/* Styled Badge for Sequential Number */}
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: "#F3E8FF",
                              color: "#7C3AED",
                              fontSize: 12,
                              fontWeight: 700,
                              mx: "auto"
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleRow(category.id)}>
                            <ChevronDown
                              size={18}
                              className={`text-[#6B7280] transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                          <span className="flex items-center gap-2">
                            <FolderOpen size={16} className="text-[#7C3AED]" />
                            {category.name}
                          </span>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 13, color: "#4B5563" }}>
                          {category.slug}
                        </TableCell>
                        <TableCell sx={{ color: "#6B7280", fontSize: 13, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {category.description || "-"}
                        </TableCell>
                        <TableCell sx={{ color: "#111827", fontSize: 13, fontWeight: 600 }}>
                          {category.price !== undefined && category.price !== null ? `$${category.price}` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={category.is_active}
                              onChange={() => handleToggleCategoryActive(category.id)}
                              color="primary"
                              size="small"
                            />
                            <span className={`text-xs font-bold ${category.is_active ? "text-green-600" : "text-gray-400"}`}>
                              {category.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3 }}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<Plus size={14} />}
                              onClick={() => handleAddNewSubCategory(category.id)}
                              sx={{ textTransform: "none", color: "#7C3AED", fontWeight: 600, fontSize: 12 }}
                            >
                              Add Sub-service
                            </Button>
                            <IconButton size="small" onClick={() => handleEditCategory(category)}>
                              <Pencil size={16} className="text-[#7C3AED]" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteCategoryClick(category.id)}>
                              <Trash2 size={16} className="text-red-500" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Sub-Categories Sub-Table */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 2, bgcolor: "#FBFDFF", border: "1px solid #EBF3FC", borderRadius: 2, p: 2 }}>
                              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 700, color: "#4B5563", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                Sub-services / Sub-categories under "{category.name}"
                              </Typography>
                              {categorySubs.length === 0 ? (
                                <Typography variant="body2" sx={{ color: "#9CA3AF", py: 1, fontStyle: "italic" }}>
                                  {searchQuery ? "No matching sub-services under this category." : "No sub-services added yet. Click \"Add Sub-service\" to add one."}
                                </Typography>
                              ) : (
                                <Table size="small" aria-label="subcategories">
                                  <TableHead>
                                    <TableRow sx={{ "& th": { color: "#6B7280", fontWeight: 600, fontSize: 11, borderBottom: "1px solid #E5E7EB" } }}>
                                      <TableCell width={60} align="center">No.</TableCell>
                                      <TableCell>Name</TableCell>
                                      <TableCell>Slug</TableCell>
                                      <TableCell>Description</TableCell>
                                      <TableCell>Price (USD)</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {categorySubs.map((sub, subIndex) => (
                                      <TableRow key={sub.id} sx={{ "&:hover": { bgcolor: "#F3F8FC" }, "& td": { py: 1, borderBottom: "1px solid #F3F4F6" } }}>
                                        {/* Styled Sub-service Badge */}
                                        <TableCell align="center">
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: 20,
                                              height: 20,
                                              borderRadius: "50%",
                                              bgcolor: "#E0F2FE",
                                              color: "#0284C7",
                                              fontSize: 11,
                                              fontWeight: 700,
                                              mx: "auto"
                                            }}
                                          >
                                            {subIndex + 1}
                                          </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#1F2937" }}>{sub.name}</TableCell>
                                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{sub.slug}</TableCell>
                                        <TableCell sx={{ color: "#6B7280", fontSize: 12 }}>{sub.description || "-"}</TableCell>
                                        <TableCell sx={{ color: "#111827", fontSize: 12, fontWeight: 600 }}>
                                          {sub.price !== undefined && sub.price !== null ? `$${sub.price}` : "-"}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1">
                                            <Switch
                                              checked={sub.is_active}
                                              onChange={() => handleToggleSubCategoryActive(sub.id)}
                                              color="secondary"
                                              size="small"
                                            />
                                            <span className={`text-[11px] font-bold ${sub.is_active ? "text-green-600" : "text-gray-400"}`}>
                                              {sub.is_active ? "Active" : "Inactive"}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell align="right">
                                          <div className="flex items-center justify-end gap-0.5">
                                            <IconButton size="small" onClick={() => handleEditSubCategory(sub)}>
                                              <Pencil size={14} className="text-[#7C3AED]" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteSubCategoryClick(sub.id)}>
                                              <Trash2 size={14} className="text-red-500" />
                                            </IconButton>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Unified Add / Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1, width: "100%", maxWidth: 500 }
          }
        }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 800, color: "#111827", pb: 1 }}>
            {selectedCategory || selectedSubCategory
              ? `Edit ${type === "main" ? "Category" : "Sub-service"}`
              : "Add Service Category / Sub-service"}
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
              {/* Type selector: Only shown when creating new, hidden when editing */}
              {!(selectedCategory || selectedSubCategory) && (
                <TextField
                  label="Category Type"
                  select
                  value={type}
                  onChange={(e) => setType(e.target.value as "main" | "sub")}
                  fullWidth
                  size="small"
                  required
                >
                  <MenuItem value="main">Main Category (Main Service)</MenuItem>
                  <MenuItem value="sub">Sub-service (Sub-category)</MenuItem>
                </TextField>
              )}

              {/* Main Category Dropdown: shown only for Sub-services */}
              {type === "sub" && (
                <TextField
                  label="Select Main Category"
                  select
                  value={parentCategoryId || ""}
                  onChange={(e) => setParentCategoryId(Number(e.target.value))}
                  fullWidth
                  size="small"
                  required
                  disabled={!!selectedSubCategory}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />

              <TextField
                label="Price (USD)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                size="small"
                type="number"
                slotProps={{
                  htmlInput: {
                    step: "0.01",
                    min: "0"
                  }
                }}
                placeholder="0.00"
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                size="small"
                placeholder="Optional description..."
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
            sx: { borderRadius: 3, p: 1, maxWidth: 400 }
          }
        }}
      >
        <DialogTitle className="flex items-center gap-2 text-red-600 font-bold">
          <AlertTriangle size={20} className="text-red-500" />
          Delete {deleteType === "main" ? "Category" : "Sub-service"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-600">
            Are you sure you want to delete this {deleteType === "main" ? "category" : "sub-service"}? This action cannot be undone and any associated mappings might be affected.
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

      <Toaster position="top-right" richColors />
    </div>
  );
}
