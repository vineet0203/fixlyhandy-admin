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
  Grid,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Customer } from "@/types/vendor";
import { toast } from "sonner";
import { CustomerResetPassword } from "./CustomerResetPassword";

interface CustomerTableProps {
  vendorId: number;
}

export function CustomerTable({ vendorId }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog & Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [formSaving, setFormSaving] = useState(false);

  // Deletion states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vendorService.getVendorCustomers(vendorId, {
        page: page + 1,
        per_page: rowsPerPage,
      });
      setCustomers(response.data);
      setTotalCount(response.meta.total);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [vendorId, page, rowsPerPage]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleStatus = async (
    customerId: number,
    currentStatus: "active" | "inactive" | string,
  ) => {
    const nextStatus = (currentStatus === "active" ? "inactive" : "active") as
      | "active"
      | "inactive";

    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: nextStatus } : c)),
    );

    try {
      await vendorService.toggleCustomerStatus(vendorId, customerId);
      toast.success("Customer status updated successfully");
    } catch (err) {
      // Revert on failure
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, status: currentStatus as "active" | "inactive" } : c,
        ),
      );
      toast.error("Failed to update customer status");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateOpen = () => {
    setEditCustomer(null);
    setName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setOpenDialog(true);
  };

  const handleEditOpen = (cust: Customer) => {
    setEditCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone || "");
    setStatus(cust.status);
    setOpenDialog(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        status,
      };

      if (editCustomer) {
        await vendorService.updateVendorCustomer(vendorId, editCustomer.id, payload);
        toast.success("Customer updated successfully");
      } else {
        await vendorService.addVendorCustomer(vendorId, payload);
        toast.success("Customer created successfully and linked to vendor.");
      }
      setOpenDialog(false);
      fetchCustomers();
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to save customer");
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
        await vendorService.deleteVendorCustomer(vendorId, deleteId);
        toast.success("Customer disassociated successfully");
        fetchCustomers();
      } catch (err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to delete customer");
      }
    }
    setDeleteOpen(false);
  };

  const handleClose = () => {
    if (!formSaving) {
      setOpenDialog(false);
    }
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
            Add Customer
          </Button>
        </Box>

        {loading && customers.length === 0 ? (
          <Box className="flex justify-center items-center py-12">
            <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
          </Box>
        ) : customers.length === 0 ? (
          <Box className="text-center py-12 text-[#6B7280]">
            No customers found for this vendor.
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 600 }}>
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
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((c, index) => (
                    <TableRow
                      key={c.id}
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
                      <TableCell sx={{ fontWeight: 700, color: "#111827" }}>{c.name}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{c.email}</TableCell>
                      <TableCell sx={{ color: "#4B5563" }}>{c.phone || "-"}</TableCell>
                      <TableCell sx={{ color: "#4B5563", textTransform: "capitalize" }}>
                        {c.role || "Customer"}
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex items-center justify-center gap-1">
                          <Switch
                            checked={c.status === "active"}
                            onChange={() => handleToggleStatus(c.id, c.status)}
                            color="primary"
                            size="small"
                          />
                          <span
                            className={`text-xs font-bold ${c.status === "active" ? "text-green-600" : "text-gray-400"}`}
                          >
                            {c.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip title="Edit Customer">
                            <IconButton size="small" onClick={() => handleEditOpen(c)}>
                              <Pencil size={16} className="text-[#7C3AED]" />
                            </IconButton>
                          </Tooltip>
                          <CustomerResetPassword id={c.id} email={c.email} onSuccess={fetchCustomers} />
                          <Tooltip title="Delete Customer">
                            <IconButton size="small" onClick={() => handleDeleteClick(c.id)}>
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: "1px solid #E5E7EB" }}
            />
          </>
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              width: "100%",
              maxWidth: 500,
            },
          },
        }}
      >
        <DialogTitle className="font-extrabold text-[#111827]">
          {editCustomer ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 1.5 }}>
            <Button onClick={handleClose} disabled={formSaving} sx={{ textTransform: "none" }}>
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
        title="Delete Customer"
        message="Are you sure you want to disassociate this customer? This will remove their client connection to this vendor."
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteOpen(false)}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
export default CustomerTable;
