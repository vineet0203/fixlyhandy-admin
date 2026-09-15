import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { bookingRequestServiceLabel } from "@/lib/utils";
import type { BookingRequest } from "@/types/bookingRequest";

interface BookingRequestTableProps {
  requests: BookingRequest[];
  page: number;
  rowsPerPage: number;
}

export function BookingRequestTable({ requests, page, rowsPerPage }: BookingRequestTableProps) {
  return (
    <Paper
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#fff",
        boxShadow: "none",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 1000 }}>
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
                #
              </TableCell>
              <TableCell>Request</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Preferred Date</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!requests || requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#6B7280" }}>
                  No unassigned booking requests. Everything has been routed to a provider.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r, index) => {
                const createdAt = r.created_at ? new Date(r.created_at) : null;
                const bookingDate = r.booking_date ? new Date(r.booking_date) : null;
                return (
                  <TableRow
                    key={r.id}
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
                      {r.quote_number}
                    </TableCell>
                    <TableCell
                      sx={{ color: "#374151", fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {bookingRequestServiceLabel(r)}
                    </TableCell>
                    <TableCell sx={{ color: "#4B5563" }}>
                      <div className="font-semibold text-[#374151]">{r.client_name || "-"}</div>
                      <div className="text-[12px] text-[#6B7280]">{r.client_email || "-"}</div>
                    </TableCell>
                    <TableCell sx={{ color: "#4B5563" }}>{r.booking_location || "-"}</TableCell>
                    <TableCell sx={{ color: "#4B5563", fontSize: 13 }}>
                      {bookingDate ? format(bookingDate, "MMM dd, yyyy") : "-"}
                      {r.booking_time ? (
                        <span className="block text-[12px] text-[#6B7280]">{r.booking_time}</span>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ color: "#6B7280", fontSize: 13 }}>
                      {createdAt ? formatDistanceToNow(createdAt, { addSuffix: false }) : "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Review & assign">
                          <Link to="/booking-requests/$id" params={{ id: String(r.id) }}>
                            <IconButton size="small" sx={{ color: "#7C3AED" }}>
                              <Eye size={16} />
                            </IconButton>
                          </Link>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
export default BookingRequestTable;
