import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs, CircularProgress, Box, Typography, Paper } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { employeeService, EmployeeWithVendor } from "@/services/employeeService";
import { EmployeeDetailTabs } from "../components/employees/EmployeeDetailTabs";
import { toast } from "sonner";

import { formatTitleCase } from "@/lib/utils";

interface EmployeeDetailPageProps {
  id: number;
}

export function EmployeeDetailPage({ id }: EmployeeDetailPageProps) {
  const [employee, setEmployee] = useState<EmployeeWithVendor | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployee(id);
      setEmployee(data);
    } catch (err) {
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleUpdate = (updatedEmployee: EmployeeWithVendor) => {
    setEmployee(updatedEmployee);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20 min-h-[400px]">
        <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box className="text-center py-20 text-[#6B7280]">
        Employee not found or has been deleted.
      </Box>
    );
  }

  const fullName = employee.name || `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">{fullName}</h1>
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
            <span style={{ color: "#6B7280" }}>{fullName}</span>
          </Breadcrumbs>
        </div>
      </div>

      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          boxShadow: "none",
          bgcolor: "#fff",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827" }}>
              {fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              Vendor:{" "}
              <span className="font-bold text-[#7C3AED]">
                {employee.vendor?.business_name || `ID: ${employee.vendor_id}`}
              </span>{" "}
              &bull; Email: <span className="font-bold text-gray-800">{employee.email}</span> &bull;
              Phone:{" "}
              <span className="font-bold text-gray-800">
                {employee.mobile_number || employee.phone || "-"}
              </span>
            </Typography>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Typography
                variant="caption"
                sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}
              >
                Role
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#7C3AED" }}>
                {formatTitleCase(employee.designation) || "Employee"}
              </Typography>
            </div>
            <div className="text-center">
              <Typography
                variant="caption"
                sx={{ color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}
              >
                Department
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#7C3AED" }}>
                {formatTitleCase(employee.department) || "-"}
              </Typography>
            </div>
          </div>
        </div>
      </Paper>

      <EmployeeDetailTabs employee={employee} onUpdate={handleUpdate} />
    </div>
  );
}
export default EmployeeDetailPage;
