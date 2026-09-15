import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumbs, CircularProgress, TextField, Box, TablePagination } from "@mui/material";
import { ChevronRight, Search, X } from "lucide-react";
import { bookingRequestService } from "@/services/bookingRequestService";
import { BookingRequestTable } from "@/components/bookingRequests/BookingRequestTable";
import type { BookingRequest } from "@/types/bookingRequest";
import { toast } from "sonner";

export function BookingRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingRequestService.getBookingRequests({
        search: debouncedSearch || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      });
      if (response && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
      if (response && response.meta) {
        setTotalCount(response.meta.total || 0);
      } else {
        setTotalCount(0);
      }
    } catch (err) {
      toast.error("Failed to retrieve booking requests.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#111827] leading-tight">
            Booking Requests
          </h1>
          <Breadcrumbs
            separator={<ChevronRight size={14} className="text-[#9CA3AF]" />}
            sx={{ mt: 0.5, fontSize: 13 }}
          >
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>Dashboard</span>
            <span style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}>
              Booking Requests
            </span>
            <span style={{ color: "#6B7280" }}>Unassigned</span>
          </Breadcrumbs>
          <p className="text-[13px] text-[#6B7280] mt-2 max-w-2xl">
            Customer bookings that arrived without a matching provider. Assign each one to a vendor,
            or onboard a new vendor for it.
          </p>
        </div>
      </div>

      {/* Search Bar */}
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
          placeholder="Search by customer, email, request number, service..."
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
      </Box>

      {loading && requests.length === 0 ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 min-h-[300px]">
          <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
        </div>
      ) : (
        <>
          <BookingRequestTable requests={requests} page={page} rowsPerPage={rowsPerPage} />
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              bgcolor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              mt: -2,
            }}
          />
        </>
      )}
    </div>
  );
}
export default BookingRequestsPage;
