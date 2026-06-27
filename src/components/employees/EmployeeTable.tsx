import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  CircularProgress,
  TablePagination,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { employeeService, EmployeeWithVendor } from "@/services/employeeService";
import { vendorService } from "@/services/vendorService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmployeeResetPassword } from "./EmployeeResetPassword";
import type { Vendor } from "@/types/vendor";
import { toast } from "sonner";

import { formatTitleCase } from "@/lib/utils";

interface EmployeeTableProps {
  employees: EmployeeWithVendor[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onRefresh: () => void;
}

export function EmployeeTable({
  employees,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onRefresh,
}: EmployeeTableProps) {
  // Dialog & Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeWithVendor | null>(null);
  const [vendorId, setVendorId] = useState<number | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);

  // Vendor list for dropdown
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Deletion states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const response = await vendorService.getVendors({ per_page: 100 });
      setVendors(response.data);
    } catch (err) {
      toast.error("Failed to load vendors for selector");
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleToggleStatus = async (employeeId: number, currentStatus: boolean) => {
    try {
      await employeeService.toggleEmployeeStatus(employeeId);
      toast.success("Employee status updated successfully");
      onRefresh();
    } catch (err) {
      toast.error("Failed to update employee status");
    }
  };

  const handleCreateOpen = () => {
    setEditEmployee(null);
    setVendorId("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setMobileNumber("");
    setDesignation("");
    setDepartment("");
    setIsActive(true);
    setOpenDialog(true);
  };

  const handleEditOpen = (emp: EmployeeWithVendor) => {
    setEditEmployee(emp);
    setVendorId(emp.vendor_id);
    setFirstName(emp.first_name || emp.name?.split(" ")[0] || "");
    setLastName(emp.last_name || emp.name?.split(" ").slice(1).join(" ") || "");
    setEmail(emp.email);
    setMobileNumber(emp.phone || "");
    setDesignation(emp.designation || "");
    setDepartment(emp.department || "");
    setIsActive(emp.is_active);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    setFormSaving(true);
    try {
      const payload = {
        vendor_id: Number(vendorId),
        first_name: firstName,
        last_name: lastName,
        email,
        mobile_number: mobileNumber,
        designation,
        department,
        is_active: isActive,
      };

      if (editEmployee) {
        await employeeService.updateEmployee(editEmployee.id, payload);
        toast.success("Employee updated successfully");
      } else {
        await employeeService.addEmployee(payload);
        toast.success("Employee created successfully. Setup email sent.");
      }
      setOpenDialog(false);
      onRefresh();
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to save employee");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await employeeService.deleteEmployee(deleteId);
        toast.success("Employee deleted successfully");
        onRefresh();
      } catch (err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to delete employee");
      }
    }
    setDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Paper
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleCreateOpen}
            sx={{
              bgcolor: "#7C3AED",
              "&:hover": { bgcolor: "#6D28D9" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Employee
          </Button>
        </Box>

        {loading && employees.length === 0 ? (
          <Box className="flex justify-center items-center py-12">
            <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
          </Box>
        ) : employees.length === 0 ? (
          <Box className="text-center py-12 text-[#6B7280]">No employees found.</Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        bgcolor: "#fff",
                        borderColor: "#E5E7EB",
                        color: "#6B7280",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: ".05em",
                        textTransform: "uppercase",
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell width={60} align="center">
                      No.
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((e, index) => (
                    <TableRow
                      key={e.id}
                      sx={{
                        "&:hover": { bgcolor: "#F9FAFB" },
                        "& td": { borderColor: "#F3F4F6", py: 1.5 },
                      }}
                    >
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
                            mx: "auto",
                          }}
                        >
                          {page * rowsPerPage + index + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                        {e.name || `${e.first_name} ${e.last_name}`}
                      </TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{e.email}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#7C3AED" }}>
                        {e.vendor?.business_name || `ID: ${e.vendor_id}`}
                      </TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>
                        {e.mobile_number || e.phone || "-"}
                      </TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{formatTitleCase(e.designation) || "-"}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{formatTitleCase(e.department) || "-"}</TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-1">
                          <Switch
                            checked={e.is_active}
                            onChange={() => handleToggleStatus(e.id, e.is_active)}
                            color="primary"
                            size="small"
                          />
                          <span
                            className={`text-xs font-bold ${e.is_active ? "text-green-600" : "text-gray-400"}`}
                          >
                            {e.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="View Details">
                            <Link to="/employees/$id" params={{ id: String(e.id) }}>
                              <IconButton size="small">
                                <Eye size={16} className="text-[#7C3AED]" />
                              </IconButton>
                            </Link>
                          </Tooltip>
                          <Tooltip title="Edit Employee">
                            <IconButton size="small" onClick={() => handleEditOpen(e)}>
                              <Pencil size={16} className="text-[#7C3AED]" />
                            </IconButton>
                          </Tooltip>
                          <EmployeeResetPassword id={e.id} email={e.email} onSuccess={onRefresh} />
                          <Tooltip title="Delete Employee">
                            <IconButton size="small" onClick={() => handleDeleteClick(e.id)}>
                              <Trash2 size={16} className="text-red-500" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => onPageChange(newPage)}
              onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
              sx={{ borderTop: "1px solid #E5E7EB" }}
            />
          </>
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => !formSaving && setOpenDialog(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              width: "100%",
              maxWidth: 600,
            },
          },
        }}
      >
        <DialogTitle className="font-extrabold text-[#111827]">
          {editEmployee ? "Edit Employee" : "Add Employee"}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Vendor Business"
                  value={vendorId}
                  onChange={(e) => setVendorId(Number(e.target.value))}
                  required
                  fullWidth
                  size="small"
                  disabled={loadingVendors}
                >
                  {vendors.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.business_name} ({v.full_name})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 1.5 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={formSaving}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formSaving}
              sx={{
                bgcolor: "#7C3AED",
                "&:hover": { bgcolor: "#6D28D9" },
                textTransform: "none",
              }}
            >
              {formSaving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteOpen(false)}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
export default EmployeeTable;
