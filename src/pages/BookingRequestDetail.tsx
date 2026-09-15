import { useState, useEffect, useCallback } from "react";
import {
  Breadcrumbs,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  History,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { bookingRequestService } from "@/services/bookingRequestService";
import { bookingRequestServiceLabel } from "@/lib/utils";
import { AssignVendorPanel } from "@/components/bookingRequests/AssignVendorPanel";
import type { BookingRequest } from "@/types/bookingRequest";
import { toast } from "sonner";

interface BookingRequestDetailPageProps {
  id: number;
}

const actionLabels: Record<string, string> = {
  assigned: "Assigned to vendor",
  vendor_created_and_assigned: "Vendor created & assigned",
  rejected: "Rejected",
};

export function BookingRequestDetailPage({ id }: BookingRequestDetailPageProps) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingRequestService.getBookingRequest(id);
      setRequest(data);
    } catch (err) {
      toast.error("Failed to load booking request details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleHandled = () => {
    navigate({ to: "/booking-requests" });
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-20 min-h-[400px]">
        <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box className="text-center py-20 text-[#6B7280]">
        Booking request not found or has been deleted.
      </Box>
    );
  }

  const createdAt = request.created_at ? new Date(request.created_at) : null;
  const bookingDate = request.booking_date ? new Date(request.booking_date) : null;
  const isStillUnassigned = request.status === "unassigned" && request.vendor_id === null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight capitalize">
            {bookingRequestServiceLabel(request)}
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
              to="/booking-requests"
              style={{ color: "#7C3AED", fontWeight: 600, textDecoration: "none" }}
            >
              Booking Requests
            </Link>
            <span style={{ color: "#6B7280" }}>{request.quote_number}</span>
          </Breadcrumbs>
        </div>
        <div className="flex items-center gap-2">
          <Chip
            size="small"
            label={request.status}
            sx={{
              bgcolor: isStillUnassigned ? "#FEF3C7" : "#E6F4EA",
              color: isStillUnassigned ? "#92400E" : "#137333",
              fontWeight: 700,
              fontSize: 11,
              textTransform: "uppercase",
            }}
          />
          {createdAt ? (
            <span className="text-[13px] text-[#6B7280]">
              Waiting {formatDistanceToNow(createdAt)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: request + customer details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Paper
            sx={{
              p: 3,
              border: "1px solid #E5E7EB",
              borderRadius: 4,
              boxShadow: "none",
              bgcolor: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <h2 className="text-lg font-extrabold text-[#111827]">Request details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3 text-[#4B5563]">
                <FileText size={16} className="text-[#7C3AED] shrink-0" />
                <span className="font-semibold">{request.quote_number}</span>
              </div>
              <div className="flex items-center gap-3 text-[#4B5563]">
                <MapPin size={16} className="text-[#7C3AED] shrink-0" />
                <span>{request.booking_location || "No location provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-[#4B5563]">
                <Calendar size={16} className="text-[#7C3AED] shrink-0" />
                <span>
                  {bookingDate ? format(bookingDate, "MMMM d, yyyy") : "No preferred date"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#4B5563]">
                <Clock size={16} className="text-[#7C3AED] shrink-0" />
                <span>{request.booking_time || "No preferred time"}</span>
              </div>
            </div>

            <hr className="border-[#E5E7EB]" />

            <h3 className="text-[15px] font-extrabold text-[#111827]">Customer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3 text-[#4B5563]">
                <span className="font-semibold text-[#111827]">
                  {request.client_name || request.customer?.name || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#4B5563]">
                <Mail size={16} className="text-[#7C3AED] shrink-0" />
                <span className="truncate">
                  {request.client_email || request.customer?.email || "-"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#4B5563]">
                <Phone size={16} className="text-[#7C3AED] shrink-0" />
                <span>{request.customer?.phone || "No phone"}</span>
              </div>
            </div>

            {request.notes ? (
              <>
                <hr className="border-[#E5E7EB]" />
                <h3 className="text-[15px] font-extrabold text-[#111827]">Customer notes</h3>
                <p className="text-sm text-[#4B5563] whitespace-pre-line">{request.notes}</p>
              </>
            ) : null}
          </Paper>

          {/* Quote items */}
          <Paper
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 4,
              boxShadow: "none",
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-lg font-extrabold text-[#111827]">Requested items</h2>
            </div>
            <TableContainer>
              <Table>
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
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!request.items || request.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5, color: "#6B7280" }}>
                        No line items were submitted with this request.
                      </TableCell>
                    </TableRow>
                  ) : (
                    request.items.map((item) => (
                      <TableRow key={item.id} sx={{ "& td": { borderColor: "#F3F4F6", py: 1.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                          {item.item_name}
                        </TableCell>
                        <TableCell sx={{ color: "#4B5563" }}>{item.description || "-"}</TableCell>
                        <TableCell align="center" sx={{ color: "#374151", fontWeight: 600 }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, color: "#374151", fontWeight: 600 }}>
                          {item.item_total}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Images */}
          {request.images && request.images.length > 0 ? (
            <Paper
              sx={{
                p: 3,
                border: "1px solid #E5E7EB",
                borderRadius: 4,
                boxShadow: "none",
                bgcolor: "#fff",
              }}
            >
              <h2 className="text-lg font-extrabold text-[#111827] mb-3">Attached photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {request.images.map((image) => (
                  <img
                    key={image}
                    src={`${import.meta.env.VITE_API_BASE_URL || ""}/storage/${image}`}
                    alt="Customer attachment"
                    className="w-full h-32 object-cover rounded-xl border border-[#E5E7EB]"
                  />
                ))}
              </div>
            </Paper>
          ) : null}

          {/* Audit trail */}
          {request.assignment_history && request.assignment_history.length > 0 ? (
            <Paper
              sx={{
                p: 3,
                border: "1px solid #E5E7EB",
                borderRadius: 4,
                boxShadow: "none",
                bgcolor: "#fff",
              }}
            >
              <h2 className="text-lg font-extrabold text-[#111827] mb-3 flex items-center gap-2">
                <History size={18} className="text-[#7C3AED]" />
                History
              </h2>
              <div className="flex flex-col gap-3">
                {request.assignment_history.map((entry) => (
                  <div key={entry.id} className="text-sm border-l-2 border-[#EDE9FE] pl-3">
                    <div className="font-semibold text-[#111827]">
                      {actionLabels[entry.action] || entry.action}
                      {entry.vendor ? (
                        <span className="font-normal text-[#4B5563]">
                          {" "}
                          &mdash; {entry.vendor.business_name}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {format(new Date(entry.created_at), "MMM dd, yyyy HH:mm")}
                    </div>
                    {entry.note ? (
                      <p className="text-[13px] text-[#4B5563] mt-1">{entry.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Paper>
          ) : null}
        </div>

        {/* Right: assignment actions */}
        <div className="flex flex-col gap-6">
          {isStillUnassigned ? (
            <AssignVendorPanel leadId={request.id} onAssigned={handleHandled} />
          ) : (
            <Paper
              sx={{
                p: 3,
                border: "1px solid #E5E7EB",
                borderRadius: 4,
                boxShadow: "none",
                bgcolor: "#fff",
              }}
            >
              <h2 className="text-lg font-extrabold text-[#111827]">Already handled</h2>
              <p className="text-[13px] text-[#6B7280] mt-1">
                This request is now <strong>{request.status}</strong> and is no longer waiting on
                the admin team.
              </p>
            </Paper>
          )}
        </div>
      </div>
    </div>
  );
}
export default BookingRequestDetailPage;
