import { Paper, TextField, InputAdornment, MenuItem, Button } from "@mui/material";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCategory, setLocation, setSearch, setStatus } from "@/store/slices/servicesSlice";

const categories = ["all", "Home Services", "Repair Services", "Automotive", "Other Services"];
const locations = ["all", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Multan"];
const statuses = ["all", "Published", "Pending", "Draft"];

const labelFor = (v: string, allLabel: string) => (v === "all" ? allLabel : v);

export function FilterBar() {
  const dispatch = useAppDispatch();
  const { searchQuery, categoryFilter, locationFilter, statusFilter } = useAppSelector((s) => s.services);

  return (
    <Paper sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 3, bgcolor: "#fff", display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      <TextField
        value={searchQuery}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder="Search services..."
        size="small"
        sx={{ width: 320 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#9CA3AF" />
              </InputAdornment>
            ),
          },
        }}
      />
      <div className="flex-1" />
      <TextField select size="small" value={categoryFilter} onChange={(e) => dispatch(setCategory(e.target.value))} sx={{ minWidth: 170 }}>
        {categories.map((c) => <MenuItem key={c} value={c}>{labelFor(c, "All Categories")}</MenuItem>)}
      </TextField>
      <TextField select size="small" value={locationFilter} onChange={(e) => dispatch(setLocation(e.target.value))} sx={{ minWidth: 170 }}>
        {locations.map((c) => <MenuItem key={c} value={c}>{labelFor(c, "All Locations")}</MenuItem>)}
      </TextField>
      <TextField select size="small" value={statusFilter} onChange={(e) => dispatch(setStatus(e.target.value))} sx={{ minWidth: 150 }}>
        {statuses.map((c) => <MenuItem key={c} value={c}>{labelFor(c, "All Status")}</MenuItem>)}
      </TextField>
      <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />} sx={{ borderRadius: "10px", height: 40 }}>
        Filters
      </Button>
    </Paper>
  );
}
