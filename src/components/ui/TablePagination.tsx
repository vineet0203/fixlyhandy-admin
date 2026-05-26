import { IconButton, Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPage } from "@/store/slices/servicesSlice";

export function TablePagination() {
  const dispatch = useAppDispatch();
  const { currentPage, totalPages, totalCount } = useAppSelector((s) => s.services);
  const pages: (number | "...")[] = [1, 2, 3, 4, "...", totalPages];

  return (
    <div className="border-t flex items-center justify-between px-5 py-3" style={{ borderColor: "#E5E7EB" }}>
      <div className="text-sm text-[#6B7280]">Showing 1 to 7 of {totalCount} services</div>
      <div className="flex items-center gap-1">
        <IconButton size="small" onClick={() => dispatch(setPage(Math.max(1, currentPage - 1)))}>
          <ChevronLeft size={16} />
        </IconButton>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-[#9CA3AF]">…</span>
          ) : (
            <Button
              key={p}
              onClick={() => dispatch(setPage(p))}
              variant={currentPage === p ? "contained" : "text"}
              size="small"
              sx={{
                minWidth: 36, height: 36, borderRadius: "10px", p: 0, fontWeight: 600,
                color: currentPage === p ? "#fff" : "#374151",
                bgcolor: currentPage === p ? "#7C3AED" : "transparent",
                "&:hover": { bgcolor: currentPage === p ? "#5B21B6" : "#F3F4F6" },
              }}
            >
              {p}
            </Button>
          ),
        )}
        <IconButton size="small" onClick={() => dispatch(setPage(Math.min(totalPages, currentPage + 1)))}>
          <ChevronRight size={16} />
        </IconButton>
      </div>
    </div>
  );
}
