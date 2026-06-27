import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Save, User, Users, Briefcase, Calendar, DollarSign, MapPin, CheckCircle, Clock } from "lucide-react";
import { EmployeeTable } from "./EmployeeTable";
import { CustomerTable } from "./CustomerTable";
import { vendorService } from "@/services/vendorService";
import type { Vendor } from "@/types/vendor";
import { toast } from "sonner";
import { api } from "@/api/axiosInstance";

interface VendorDetailTabsProps {
  vendor: Vendor;
  onUpdate: (updatedVendor: Vendor) => void;
  activeTab?: number;
  onTabChange?: (newValue: number) => void;
}

export function VendorDetailTabs({ vendor, onUpdate, activeTab, onTabChange }: VendorDetailTabsProps) {
  const [internalTabValue, setInternalTabValue] = useState(0);
  const tabValue = activeTab !== undefined ? activeTab : internalTabValue;

  // Form State
  const [businessName, setBusinessName] = useState(vendor.business_name);
  const [websiteName, setWebsiteName] = useState(vendor.website_name || "");
  const [businessType, setBusinessType] = useState(vendor.business_type || "");
  const [fullName, setFullName] = useState(vendor.full_name);
  const [email, setEmail] = useState(vendor.email);
  const [mobileNumber, setMobileNumber] = useState(vendor.mobile_number || "");
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(vendor.is_accepting_bookings);

  // Categories & Sub-categories dropdowns state
  interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
  }
  interface ServiceSubCategory {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
  }

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState<ServiceSubCategory[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  // Initialize service category and sub category state
  const [serviceCategory, setServiceCategory] = useState<string>("");
  const [serviceSubCategory, setServiceSubCategory] = useState<string>("");

  // Fetch active categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get("/api/v1/public/service-categories");
      const fetched = response.data?.data || [];
      const active = fetched.filter((c: ServiceCategory) => c.is_active);
      setCategories(active);
      // Set initial service category slug based on vendor's stored name (if not already set)
      if (!serviceCategory && vendor.service_category) {
        const match = active.find((c) => c.name === vendor.service_category || c.slug === vendor.service_category);
        if (match) setServiceCategory(match.slug);
      }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (!serviceCategory || categories.length === 0) return;
      const selectedCat = categories.find((c) => c.slug === serviceCategory || c.name === serviceCategory);
      if (!selectedCat) return;

      setSubCategoriesLoading(true);
      try {
        const response = await api.get(`/api/v1/admin/service-sub-categories`, {
          params: { service_category_id: selectedCat.id },
        });
        const fetched = response.data?.data || [];
        setSubCategories(fetched.filter((s: ServiceSubCategory) => s.is_active));
        // Set initial sub category slug based on vendor's stored sub category name (if not already set)
        if (!serviceSubCategory && vendor.service_sub_category) {
          const matchSub = fetched.find((s) => s.name === vendor.service_sub_category || s.slug === vendor.service_sub_category);
          if (matchSub) setServiceSubCategory(matchSub.slug);
        }
      } catch (err) {
        console.error("Failed to fetch sub-categories", err);
      } finally {
        setSubCategoriesLoading(false);
      }
    };
    loadSubCategories();
  }, [serviceCategory, categories]);

  const handleCategoryChange = (val: string) => {
    setServiceCategory(val);
    setServiceSubCategory("");
    setSubCategories([]);
  };

  // New Fields State
  const [vendorIdCode, setVendorIdCode] = useState(vendor.vendor_id_code || "");
  const [logoPath, setLogoPath] = useState(vendor.logo_path || "");
  const [addressLine1, setAddressLine1] = useState(vendor.address_line1 || "");
  const [addressLine2, setAddressLine2] = useState(vendor.address_line2 || "");
  const [city, setCity] = useState(vendor.city || "");
  const [state, setState] = useState(vendor.state || "");
  const [zipCode, setZipCode] = useState(vendor.zip_code || "");
  const [country, setCountry] = useState(vendor.country || "");

  // Earnings Tab State
  const [earningsPeriod, setEarningsPeriod] = useState("all_time");

  const [saving, setSaving] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onTabChange) {
      onTabChange(newValue);
    } else {
      setInternalTabValue(newValue);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await vendorService.updateVendor(vendor.id, {
        business_name: businessName,
        website_name: websiteName,
        business_type: businessType,
        full_name: fullName,
        email,
        mobile_number: mobileNumber,
        service_category: serviceCategory,
        service_sub_category: serviceSubCategory,
        is_accepting_bookings: isAcceptingBookings,
        vendor_id_code: vendorIdCode,
        logo_path: logoPath,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
      });
      onUpdate(updated);
      toast.success("Profile updated successfully");
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: "#6B7280",
              "&.Mui-selected": {
                color: "#7C3AED",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#7C3AED",
            },
          }}
        >
          <Tab icon={<User size={16} />} iconPosition="start" label="Profile" />
          <Tab icon={<Briefcase size={16} />} iconPosition="start" label="Employees" />
          <Tab icon={<Calendar size={16} />} iconPosition="start" label="Jobs & Schedule" />
          <Tab icon={<DollarSign size={16} />} iconPosition="start" label="Earnings & Payments" />
          <Tab icon={<Users size={16} />} iconPosition="start" label="Customers" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Paper
          component="form"
          onSubmit={handleSaveProfile}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Vendor ID Code"
                value={vendorIdCode}
                onChange={(e) => setVendorIdCode(e.target.value)}
                placeholder="e.g. VEN-10024"
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Website URL"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Business Type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                label="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Service Category"
                select
                value={serviceCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                fullWidth
                size="small"
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <MenuItem disabled value="">
                    Loading categories...
                  </MenuItem>
                ) : (
                  categories.map((c) => (
                    <MenuItem key={c.id} value={c.slug}>
                      {c.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Service Sub Category"
                select
                value={serviceSubCategory}
                onChange={(e) => setServiceSubCategory(e.target.value)}
                fullWidth
                size="small"
                disabled={subCategoriesLoading || !serviceCategory}
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
                    <MenuItem key={s.id} value={s.slug}>
                      {s.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAcceptingBookings}
                    onChange={(e) => setIsAcceptingBookings(e.target.checked)}
                    color="primary"
                  />
                }
                label="Accepting Bookings"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={<Save size={16} />}
                sx={{
                  bgcolor: "#7C3AED",
                  "&:hover": { bgcolor: "#6D28D9" },
                  height: 40,
                  px: 3,
                  boxShadow: "0 4px 12px -2px rgba(124,58,237,.3)",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Employees Tab */}
      {tabValue === 1 && <EmployeeTable vendorId={vendor.id} />}

      {/* Jobs & Schedule Tab */}
      {tabValue === 2 && (
        <Box className="flex flex-col gap-6">
          {/* Job Schedule (This Week) */}
          <Paper
            sx={{
              p: 3,
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              boxShadow: "none",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="h6" className="font-extrabold text-[#111827] mb-4">
              Job Schedule (This Week)
            </Typography>
            {!vendor.job_schedule || vendor.job_schedule.length === 0 ? (
              <Box className="text-center py-8 text-[#6B7280]">No jobs scheduled.</Box>
            ) : (
              <div className="flex flex-col gap-4">
                {vendor.job_schedule.map((job: any) => {
                  const date = new Date(job.start_date || job.created_at);
                  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
                  const day = date.getDate();
                  const weekday = date.toLocaleString("en-US", { weekday: "short" });
                  return (
                    <div key={job.id} className="flex flex-wrap items-center justify-between p-4 border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-[#F3E8FF] text-[#7C3AED] rounded-lg p-2 w-16 h-16 shadow-sm">
                          <span className="text-[10px] font-bold uppercase">{month}</span>
                          <span className="text-xl font-black leading-none">{day}</span>
                          <span className="text-[10px] font-semibold">{weekday}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{job.title}</h4>
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-50 text-blue-700">
                              {job.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            {job.address_line_1 || "No address"}, {job.city || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-semibold uppercase">Employee</p>
                          <p className="text-sm font-bold text-gray-800">
                            {job.assignments?.[0]?.employee 
                              ? `${job.assignments[0].employee.first_name} ${job.assignments[0].employee.last_name || ""}` 
                              : "Unassigned"}
                          </p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-black text-gray-900">
                            ${parseFloat(job.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Paper>

          {/* Past Jobs (Completed) */}
          <Paper
            sx={{
              p: 3,
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              boxShadow: "none",
              bgcolor: "#fff",
            }}
          >
            <Typography variant="h6" className="font-extrabold text-[#111827] mb-4">
              Past Jobs (Completed)
            </Typography>
            {!vendor.past_jobs || vendor.past_jobs.length === 0 ? (
              <Box className="text-center py-8 text-[#6B7280]">No completed jobs found.</Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow sx={{ "& th": { color: "#6B7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase" } }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Job Title</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendor.past_jobs.map((job: any) => (
                      <TableRow key={job.id} sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(job.start_date || job.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-bold text-gray-800">{job.title}</TableCell>
                        <TableCell className="text-sm text-gray-600">{job.address_line_1 || "N/A"}</TableCell>
                        <TableCell className="text-sm font-semibold text-gray-800">
                          {job.assignments?.[0]?.employee 
                            ? `${job.assignments[0].employee.first_name} ${job.assignments[0].employee.last_name || ""}` 
                            : "Unassigned"}
                        </TableCell>
                        <TableCell align="right" className="font-bold text-gray-900">
                          ${parseFloat(job.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-700">
                            {job.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}

      {/* Earnings & Payments Tab */}
      {tabValue === 3 && (
        <Paper
          sx={{
            p: 3,
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            boxShadow: "none",
            bgcolor: "#fff",
          }}
        >
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h6" className="font-extrabold text-[#111827]">
              Earnings Summary
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={earningsPeriod}
                onChange={(e) => setEarningsPeriod(e.target.value)}
              >
                <MenuItem value="all_time">All Time</MenuItem>
                <MenuItem value="this_month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {(() => {
            const data = earningsPeriod === "this_month" 
              ? vendor.earnings_summary?.this_month 
              : vendor.earnings_summary;
            return (
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper className="p-5 border border-[#E5E7EB] bg-[#FAF5FF] rounded-2xl flex items-center justify-between" sx={{ boxShadow: "none" }}>
                    <div>
                      <Typography className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                        Total Earnings
                      </Typography>
                      <Typography className="text-2xl font-black text-[#7C3AED] mt-2">
                        ${(data?.total_earnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
                      <DollarSign size={24} />
                    </div>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper className="p-5 border border-[#E5E7EB] bg-[#F0FDF4] rounded-2xl flex items-center justify-between" sx={{ boxShadow: "none" }}>
                    <div>
                      <Typography className="text-xs font-bold text-green-700 uppercase tracking-wider">
                        Paid Amount
                      </Typography>
                      <Typography className="text-2xl font-black text-green-700 mt-2">
                        ${(data?.paid_amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper className="p-5 border border-[#E5E7EB] bg-[#FEF2F2] rounded-2xl flex items-center justify-between" sx={{ boxShadow: "none" }}>
                    <div>
                      <Typography className="text-xs font-bold text-red-700 uppercase tracking-wider">
                        Pending Amount
                      </Typography>
                      <Typography className="text-2xl font-black text-red-700 mt-2">
                        ${(data?.pending_amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Typography>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            );
          })()}
        </Paper>
      )}

      {/* Customers Tab */}
      {tabValue === 4 && <CustomerTable vendorId={vendor.id} />}
    </Box>
  );
}
export default VendorDetailTabs;
