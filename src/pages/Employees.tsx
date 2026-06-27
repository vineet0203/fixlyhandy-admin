import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs, CircularProgress, TextField, MenuItem, Box } from "@mui/material";
import { ChevronRight, Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { employeeService, EmployeeWithVendor } from "@/services/employeeService";
import { vendorService } from "@/services/vendorService";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import type { Vendor } from "@/types/vendor";
import { toast } from "sonner";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithVendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Vendor Options
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce Search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadVendors = useCallback(async () => {
    try {
      const response = await vendorService.getVendors({ per_page: 100 });
      setVendors(response.data);
    } catch (err) {
      toast.error("Failed to load vendors list.");
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeeService.getEmployees({
        search: debouncedSearch || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        vendor_id: vendorFilter === "all" ? undefined : vendorFilter,
        page: page + 1,
        per_page: rowsPerPage,
      });
      if (response && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
      if (response && response.meta) {
        setTotalCount(response.meta.total || 0);
      } else {
        setTotalCount(0);
      }
    } catch (err) {
      toast.error("Failed to retrieve employees data.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, vendorFilter, page, rowsPerPage]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">Employees</h1>
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
              to="/employees"
              style={{ color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}
            >
              Employees
            </Link>
            <span style={{ color: "#6B7280" }}>All Employees</span>
          </Breadcrumbs>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "#fff",
          p: 2,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search by name, email, designation, department, vendor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            minWidth: 260,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          slotProps={{
            input: {
              startAdornment: <Search size={18} className="text-[#9CA3AF] mr-2" />,
              endAdornment: searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#9CA3AF] hover:text-[#111827]"
                >
                  <X size={16} />
                </button>
              ),
            },
          }}
        />

        <TextField
          select
          label="Vendor Filter"
          value={vendorFilter}
          onChange={(e) => {
            setVendorFilter(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{
            width: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <MenuItem value="all">All Vendors</MenuItem>
          {vendors.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.business_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{
            width: 150,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {loading && employees.length === 0 ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 min-h-[300px]">
          <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRefresh={loadEmployees}
        />
      )}
    </div>
  );
}
export default EmployeesPage;
