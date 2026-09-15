import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { UserPlus, Send, Ban, Store } from "lucide-react";
import { bookingRequestService } from "@/services/bookingRequestService";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { SuggestedVendorsResponse } from "@/types/bookingRequest";
import { toast } from "sonner";

interface AssignVendorPanelProps {
  leadId: number;
  onAssigned: () => void;
}

const emptyNewVendor = {
  business_name: "",
  full_name: "",
  email: "",
  mobile_number: "",
  business_type: "residential" as "residential" | "commercial",
};

function apiMessage(err: unknown, fallback: string): string {
  const apiErr = err as { response?: { data?: { message?: string } } };
  return apiErr?.response?.data?.message || fallback;
}

export function AssignVendorPanel({ leadId, onAssigned }: AssignVendorPanelProps) {
  const [suggestions, setSuggestions] = useState<SuggestedVendorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [note, setNote] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVendor, setNewVendor] = useState(emptyNewVendor);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingRequestService.getSuggestedVendors(leadId);
      setSuggestions(data);
      // With no vendors to pick from, the create-vendor path is the only way forward.
      if (data.total_active_vendors === 0) {
        setShowCreateForm(true);
      }
    } catch (err) {
      toast.error(apiMessage(err, "Failed to load suggested vendors"));
      setSuggestions({
        vendors: [],
        total_active_vendors: 0,
        derived_service: { service_category: null, service_sub_category: null },
      });
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.error("Select a vendor to assign this request to");
      return;
    }

    setSubmitting(true);
    try {
      await bookingRequestService.assign(leadId, Number(selectedVendorId), note);
      toast.success("Booking request assigned successfully");
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to assign booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await bookingRequestService.createVendorAndAssign(leadId, {
        ...newVendor,
        service_category: suggestions?.derived_service.service_category || undefined,
        service_sub_category: suggestions?.derived_service.service_sub_category || undefined,
        note: note || undefined,
      });
      toast.success(`${result.vendor.business_name} created and request assigned`);
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to create vendor and assign request"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setRejectOpen(false);
    setSubmitting(true);
    try {
      await bookingRequestService.reject(leadId, rejectReason);
      toast.success("Booking request rejected");
      onAssigned();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to reject booking request"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderRadius: 4,
          boxShadow: "none",
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} sx={{ color: "#7C3AED" }} />
      </Paper>
    );
  }

  const hasVendors = (suggestions?.total_active_vendors ?? 0) > 0;
  const derived = suggestions?.derived_service;

  return (
    <>
      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderRadius: 4,
          boxShadow: "none",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <div>
          <h2 className="text-lg font-extrabold text-[#111827]">Assign this request</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Once assigned the request becomes a pending quote in the vendor's own dashboard.
          </p>
        </div>

        {derived?.service_sub_category ? (
          <div className="text-[12px] text-[#6B7280]">
            Detected service:{" "}
            <span className="font-bold text-[#7C3AED] capitalize">
              {derived.service_sub_category.replace(/-/g, " ")}
            </span>
            {derived.service_category ? (
              <span className="capitalize"> ({derived.service_category.replace(/-/g, " ")})</span>
            ) : null}
          </div>
        ) : null}

        {!hasVendors ? (
          <Alert severity="warning" sx={{ borderRadius: 2, fontSize: 13 }}>
            There are no active vendors on the platform yet, so there is nothing to assign this
            request to. Create a new vendor below to take it on.
          </Alert>
        ) : (
          <form onSubmit={handleAssign} className="flex flex-col gap-3">
            <TextField
              select
              label="Assign to an existing vendor"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              size="small"
              fullWidth
              helperText="Best category matches are listed first."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {suggestions?.vendors.map((v) => (
                <MenuItem key={v.id} value={String(v.id)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Store size={14} className="text-[#7C3AED] shrink-0" />
                    <span className="font-semibold truncate">{v.business_name}</span>
                    <span className="text-[12px] text-[#6B7280] capitalize truncate">
                      {(v.service_sub_category || v.service_category || "No category").replace(
                        /-/g,
                        " ",
                      )}
                    </span>
                    {v.is_suggested ? (
                      <span className="text-[10px] font-bold text-[#137333] bg-[#E6F4EA] rounded px-1.5 py-0.5 shrink-0">
                        MATCH
                      </span>
                    ) : null}
                  </div>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Why this vendor, anything the record should remember..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !selectedVendorId}
              startIcon={<Send size={16} />}
              sx={{
                bgcolor: "#7C3AED",
                "&:hover": { bgcolor: "#6D28D9" },
                textTransform: "none",
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              {submitting ? "Assigning..." : "Assign to vendor"}
            </Button>
          </form>
        )}

        <Divider />

        {!showCreateForm ? (
          <Button
            variant="outlined"
            onClick={() => setShowCreateForm(true)}
            startIcon={<UserPlus size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#EDE9FE",
              color: "#7C3AED",
              alignSelf: "flex-start",
              "&:hover": { borderColor: "#DDD6FE", bgcolor: "#F5F3FF" },
            }}
          >
            Create new vendor &amp; assign
          </Button>
        ) : (
          <form onSubmit={handleCreateAndAssign} className="flex flex-col gap-3">
            <h3 className="text-[15px] font-extrabold text-[#111827]">
              Create new vendor &amp; assign
            </h3>
            <p className="text-[12px] text-[#6B7280] -mt-2">
              The vendor is onboarded with the service detected from this request and emailed a link
              to set their own password.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Business name"
                value={newVendor.business_name}
                onChange={(e) => setNewVendor({ ...newVendor, business_name: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Owner full name"
                value={newVendor.full_name}
                onChange={(e) => setNewVendor({ ...newVendor, full_name: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Email"
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Mobile number"
                value={newVendor.mobile_number}
                onChange={(e) => setNewVendor({ ...newVendor, mobile_number: e.target.value })}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                select
                label="Business type"
                value={newVendor.business_type}
                onChange={(e) =>
                  setNewVendor({
                    ...newVendor,
                    business_type: e.target.value as "residential" | "commercial",
                  })
                }
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
              </TextField>
            </div>

            {!derived?.service_sub_category ? (
              <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
                No service category could be detected from this request. Creating a vendor here will
                fail until the request names a known service &mdash; assign it to an existing vendor
                instead.
              </Alert>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                startIcon={<UserPlus size={16} />}
                sx={{
                  bgcolor: "#7C3AED",
                  "&:hover": { bgcolor: "#6D28D9" },
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {submitting ? "Creating..." : "Create vendor & assign"}
              </Button>
              {hasVendors ? (
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewVendor(emptyNewVendor);
                  }}
                  disabled={submitting}
                  sx={{ textTransform: "none", color: "#4B5563" }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        )}

        <Divider />

        <div className="flex flex-col gap-2">
          <TextField
            label="Rejection reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            size="small"
            fullWidth
            placeholder="No coverage in this area and none can be arranged..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Button
            variant="outlined"
            color="error"
            disabled={submitting}
            onClick={() => setRejectOpen(true)}
            startIcon={<Ban size={16} />}
            sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start" }}
          >
            Reject request
          </Button>
        </div>
      </Paper>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject booking request"
        message="The customer will not be matched with a provider for this request. Use this only when there is no coverage and none can be arranged."
        confirmText="Reject request"
        isDanger
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
    </>
  );
}
export default AssignVendorPanel;
