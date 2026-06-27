import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Upload, X, MapPin, Compass } from "lucide-react";
import { api } from "@/api/axiosInstance";
import type { Service } from "@/data/servicesData";

interface ServiceCategory {
  id: number;
  name: string;
  is_active: boolean;
}

interface ServiceSubCategory {
  id: number;
  name: string;
  is_active: boolean;
}

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<Service>) => void;
  service?: Service | null;
  readOnly?: boolean;
}

export function ServiceDialog({ open, onClose, onSave, service, readOnly = false }: ServiceDialogProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState("Home Services");
  const [subCategoryId, setSubCategoryId] = useState<number | "">("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [status, setStatus] = useState<"Published" | "Pending" | "Draft">("Published");

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<ServiceSubCategory[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Fetch active categories on mount / open
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get("/api/v1/public/service-categories");
        const fetched = response.data.data || [];
        setCategories(fetched.filter((c: ServiceCategory) => c.is_active));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    if (open) {
      loadCategories();
    }
  }, [open]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (!category || categories.length === 0) return;
      const selectedCat = categories.find((c) => c.name === category);
      if (!selectedCat) return;

      setSubCategoriesLoading(true);
      try {
        const response = await api.get(`/api/v1/admin/service-sub-categories`, {
          params: { service_category_id: selectedCat.id },
        });
        const fetched = response.data.data || [];
        setSubCategories(fetched.filter((s: ServiceSubCategory) => s.is_active));
      } catch (err) {
        console.error("Failed to fetch sub-categories", err);
      } finally {
        setSubCategoriesLoading(false);
      }
    };
    loadSubCategories();
  }, [category, categories]);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setSubtitle(service.subtitle || "");
      setImage(service.image || "");
      setPrice(service.price ? service.price.replace("USD ", "").replace("+", "") : "");
      setLocation(service.location || "");
      setDetailedAddress(service.detailedAddress || service.detailed_address || "");
      setCategory(service.category);
      setSubCategoryId(service.sub_category_id || "");
      setSubCategoryName(service.sub_category || "");
      setStatus(service.status || "Published");
      setLatitude(service.latitude ? String(service.latitude) : "31.5204");
      setLongitude(service.longitude ? String(service.longitude) : "74.3587");
    } else {
      setTitle("");
      setSubtitle("");
      setImage("");
      setPrice("");
      setLocation("Lahore, Pakistan");
      setDetailedAddress("");
      setCategory("Home Services");
      setSubCategoryId("");
      setSubCategoryName("");
      setStatus("Published");
      setLatitude("");
      setLongitude("");
    }
  }, [service, open]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubCategoryId("");
    setSubCategoryName("");
    setSubCategories([]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      setFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  "Accept-Language": "en",
                  "User-Agent": "FixlyHandyAdmin/1.0",
                },
              },
            );
            if (response.ok) {
              const data = await response.json();
              const address = data.address || {};
              const city =
                address.city || address.town || address.village || address.suburb || "Unknown City";
              const country = address.country || "Pakistan";
              const road = address.road || address.suburb || address.neighbourhood || "";
              const houseNumber = address.house_number || "";

              setLocation(`${city}, ${country}`);

              const detailedParts = [
                houseNumber,
                road,
                address.suburb,
                city,
                address.state,
                country,
              ].filter(Boolean);
              setDetailedAddress(detailedParts.join(", ") || data.display_name);
            } else {
              setLocation("Lahore, Pakistan");
              setDetailedAddress(`Fetched Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
          } catch (e) {
            console.error("Reverse geocoding error:", e);
            setLocation("Lahore, Pakistan");
            setDetailedAddress(`Fetched Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          } finally {
            setFetchingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLatitude("31.482635");
          setLongitude("74.370354");
          setLocation("Lahore, Pakistan");
          setDetailedAddress("CCA, Phase 5 D.H.A, Lahore, Punjab, Pakistan");
          setFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: service?.id,
      title,
      subtitle: subtitle || `${category} by Admin`,
      image:
        image || "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=80&h=80&fit=crop",
      price: price.startsWith("USD") ? price : `USD ${price}`,
      location,
      detailedAddress,
      detailed_address: detailedAddress,
      category,
      sub_category_id: subCategoryId || null,
      sub_category: subCategoryName || null,
      status,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem", pb: 1, color: "#111827" }}>
          {readOnly ? "View Service" : service ? "Edit Service" : "Add New Service"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Service Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            disabled={readOnly}
            sx={{ mt: 1 }}
          />

          <TextField
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            placeholder="e.g. Expert solutions"
            disabled={readOnly}
          />

          <TextField
            label="Category"
            select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            disabled={categoriesLoading || readOnly}
          >
            {categoriesLoading ? (
              <MenuItem disabled value="">
                Loading categories...
              </MenuItem>
            ) : (
              categories.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Sub-Category"
            select
            value={subCategoryId}
            onChange={(e) => {
              const subId = Number(e.target.value);
              setSubCategoryId(subId);
              const sub = subCategories.find((s) => s.id === subId);
              if (sub) {
                setSubCategoryName(sub.name);
              }
            }}
            fullWidth
            required
            variant="outlined"
            size="small"
            disabled={subCategoriesLoading || !category || readOnly}
          >
            {subCategoriesLoading ? (
              <MenuItem disabled value="">
                Loading sub-categories...
              </MenuItem>
            ) : subCategories.length === 0 ? (
              <MenuItem disabled value="">
                No sub-categories available
              </MenuItem>
            ) : (
              subCategories.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as "Published" | "Pending" | "Draft")}
            fullWidth
            required
            variant="outlined"
            size="small"
            disabled={readOnly}
          >
            <MenuItem value="Published">Published</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </TextField>

          {/* Custom image upload/dropzone */}
          <Box className="flex flex-col gap-1.5">
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#4B5563" }}>
              Service Image Upload *
            </Typography>
            {image ? (
              <Box className="relative w-full h-36 rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center">
                <img src={image} alt="Service preview" className="object-cover w-full h-full" />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-red-500 shadow transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </Box>
            ) : (
              <Box
                onDragEnter={readOnly ? undefined : handleDrag}
                onDragOver={readOnly ? undefined : handleDrag}
                onDragLeave={readOnly ? undefined : handleDrag}
                onDrop={readOnly ? undefined : handleDrop}
                className={`w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-all ${
                  readOnly ? "border-gray-200 bg-[#F9FAFB] cursor-default opacity-85" :
                  dragActive
                    ? "border-[#7C3AED] bg-[#7C3AED]/5 cursor-pointer"
                    : "border-[#D1D5DB] hover:border-[#7C3AED] bg-[#F9FAFB] hover:bg-purple-50/20 cursor-pointer"
                }`}
                onClick={readOnly ? undefined : () => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={readOnly}
                />
                <Upload size={24} className="text-[#9CA3AF] mb-2" />
                <Typography variant="body2" className="text-gray-600 font-semibold text-center">
                  {readOnly ? "No image uploaded" : <>Drag & drop an image, or <span className="text-[#7C3AED]">browse</span></>}
                </Typography>
                {!readOnly && (
                  <Typography variant="caption" className="text-gray-400 mt-1 text-center">
                    PNG, JPG or GIF up to 5MB
                  </Typography>
                )}
              </Box>
            )}

            {/* Optional URL input for convenience */}
            <TextField
              label="Or enter Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="https://example.com/image.jpg"
              disabled={readOnly}
              sx={{ mt: 0.5 }}
            />
          </Box>

          <TextField
            label="Price (USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            placeholder="e.g. 1,500+"
            disabled={readOnly}
          />

          <Box className="flex items-center justify-between mt-1 flex-wrap gap-2">
            <Box className="flex items-center gap-1 text-sm font-semibold text-[#4B5563]">
              <MapPin size={16} className="text-[#9CA3AF]" />
              <span>Location & Coordinates</span>
            </Box>
            {!readOnly && (
              <Button
                type="button"
                variant="text"
                size="small"
                startIcon={
                  fetchingLocation ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Compass size={14} />
                  )
                }
                onClick={handleFetchLocation}
                disabled={fetchingLocation}
                sx={{
                  color: "#7C3AED",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#7C3AED/10" },
                }}
              >
                {fetchingLocation ? "Fetching..." : "Fetch Current Location"}
              </Button>
            )}
          </Box>

          <TextField
            label="Location Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            placeholder="e.g. Lahore, Pakistan"
            disabled={readOnly}
          />

          <TextField
            label="Detailed Address"
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            fullWidth
            required
            multiline
            rows={2}
            variant="outlined"
            size="small"
            placeholder="e.g. House 45-B, Sector Z, Phase 3, Lahore"
            disabled={readOnly}
          />

          <Box className="grid grid-cols-2 gap-3">
            <TextField
              label="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              variant="outlined"
              size="small"
              placeholder="e.g. 31.5204"
              disabled={readOnly}
            />
            <TextField
              label="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              variant="outlined"
              size="small"
              placeholder="e.g. 74.3587"
              disabled={readOnly}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1.5, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: "#E5E7EB",
              color: "#4B5563",
              "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
            }}
          >
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#7C3AED",
                "&:hover": { bgcolor: "#6D28D9" },
                boxShadow: "0 4px 12px -2px rgba(124,58,237,.3)",
              }}
            >
              {service ? "Save Changes" : "Create Service"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
