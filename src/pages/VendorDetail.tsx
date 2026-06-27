import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs, CircularProgress, Box, Typography, Paper } from "@mui/material";
import { ChevronRight, Mail, Phone, MapPin, Briefcase, CheckCircle, Calendar, DollarSign, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { vendorService } from "@/services/vendorService";
import { VendorDetailTabs } from "@/components/vendors/VendorDetailTabs";
import type { Vendor } from "@/types/vendor";
import { toast } from "sonner";

interface VendorDetailPageProps {
  id: number;
}

export function VendorDetailPage({ id }: VendorDetailPageProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVendor = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendor(id);
      setVendor(data);
    } catch (err) {
      toast.error("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  const handleUpdate = (updatedVendor: Vendor) => {
    setVendor(updatedVendor);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20 min-h-[400px]">
        <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
      </Box>
    );
  }

  if (!vendor) {
    return (
      <Box className="text-center py-20 text-[#6B7280]">Vendor not found or has been deleted.</Box>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">
            {vendor.business_name}
          </h1>
          <Breadcrumbs
            separator={<ChevronRight size={14} className="text-[#9CA3AF]" />}
            sx={{ mt: 0.5, fontSize: 13 }}
          >
            <Link
              to="/services"
              style={{ color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}
            >
              Dashboard
            </Link>
            <Link
              to="/vendors"
              style={{ color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}
            >
              Vendors
            </Link>
            <span style={{ color: "#6B7280" }}>{vendor.business_name}</span>
          </Breadcrumbs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Vendor/Company Profile Card */}
        <Paper
          sx={{
            p: 3,
            border: "1px solid #E5E7EB",
            borderRadius: 4,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#C084FC] flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
              {vendor.logo_path ? (
                <img src={vendor.logo_path} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                vendor.business_name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-[#111827] truncate">
                  {vendor.business_name}
                </h2>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {vendor.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#6B7280] mt-1">
                Vendor ID: {vendor.vendor_id_code || `VEN-10${vendor.id.toString().padStart(3, '0')}`}
              </p>
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3 text-[#4B5563]">
              <Mail size={16} className="text-[#7C3AED] shrink-0" />
              <span className="truncate">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-3 text-[#4B5563]">
              <Phone size={16} className="text-[#7C3AED] shrink-0" />
              <span>{vendor.mobile_number || "No Phone"}</span>
            </div>
            <div className="flex items-start gap-3 text-[#4B5563]">
              <MapPin size={16} className="text-[#7C3AED] mt-0.5 shrink-0" />
              <span className="leading-tight">
                {vendor.address_line1 ? (
                  <>
                    {vendor.address_line1}
                    {vendor.address_line2 ? `, ${vendor.address_line2}` : ''}
                    <br />
                    {vendor.city}, {vendor.state} {vendor.zip_code}
                    {vendor.country ? `, ${vendor.country}` : ''}
                  </>
                ) : (
                  <span className="text-[#9CA3AF] italic">No address provided</span>
                )}
              </span>
            </div>
          </div>
        </Paper>

        {/* Right Side: 5 Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Jobs */}
          <Paper className="p-4 flex flex-col justify-between" sx={{ border: "1px solid #E5E7EB", borderRadius: 4, boxShadow: "none" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Jobs</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-[#111827]">{vendor.total_jobs ?? 0}</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">All Time</p>
            </div>
          </Paper>

          {/* Card 2: Completed Jobs */}
          <Paper className="p-4 flex flex-col justify-between" sx={{ border: "1px solid #E5E7EB", borderRadius: 4, boxShadow: "none" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-[#111827]">{vendor.completed_jobs ?? 0}</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">All Time</p>
            </div>
          </Paper>

          {/* Card 3: Upcoming Jobs */}
          <Paper className="p-4 flex flex-col justify-between" sx={{ border: "1px solid #E5E7EB", borderRadius: 4, boxShadow: "none" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Upcoming</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-[#111827]">{vendor.upcoming_jobs ?? 0}</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">This Week</p>
            </div>
          </Paper>

          {/* Card 4: Total Earnings */}
          <Paper className="p-4 flex flex-col justify-between" sx={{ border: "1px solid #E5E7EB", borderRadius: 4, boxShadow: "none" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Earnings</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-[#111827] truncate">
                ${(vendor.total_earnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">All Time</p>
            </div>
          </Paper>

          {/* Card 5: Pending Payments */}
          <Paper className="p-4 flex flex-col justify-between col-span-2 md:col-span-1" sx={{ border: "1px solid #E5E7EB", borderRadius: 4, boxShadow: "none" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Pending</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-black text-[#111827] truncate">
                ${(vendor.pending_payments ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">
                {vendor.pending_invoices_count ?? 0} Invoice{(vendor.pending_invoices_count ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </Paper>
        </div>
      </div>

      <VendorDetailTabs vendor={vendor} onUpdate={handleUpdate} />
    </div>
  );
}
export default VendorDetailPage;
