import { TableRow, TableCell, Avatar, IconButton, Box } from "@mui/material";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Eye, Pencil, MapPin, Trash2 } from "lucide-react";
import type { Service } from "@/data/servicesData";
import { VendorAvatar } from "@/components/ui/VendorAvatar";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeaturedToggle } from "@/components/ui/FeaturedToggle";
import { useAppDispatch } from "@/store";
import { toggleServiceStatus } from "@/store/slices/servicesSlice";

export function ServiceTableRow({
  s,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  s: Service;
  index: number;
  onView: (s: Service) => void;
  onEdit: (s: Service) => void;
  onDelete: (id: string | number) => void;
}) {
  const dispatch = useAppDispatch();
  const d = new Date(s.created_at || s.dateAdded || new Date());

  // Set fallback values for vendor and finance if they are empty
  const vendor = s.vendor || {
    name: "Admin Vendor",
    initials: "ADM",
    avatarColor: "#7C3AED",
    verified: true,
  };
  const finance = s.finance || { amount: "USD 0", label: "Earnings" };

  return (
    <TableRow
      component={motion.tr}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      sx={{ "&:hover": { bgcolor: "#F9FAFB" }, "& td": { borderColor: "#F3F4F6", py: 1.5 } }}
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
          {index + 1}
        </Box>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar
            variant="rounded"
            src={s.image || undefined}
            sx={{ width: 40, height: 40, borderRadius: 1.5 }}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#111827] leading-tight">{s.title}</div>
            <div className="text-xs text-[#6B7280] leading-tight mt-0.5">{s.subtitle}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <VendorAvatar vendor={vendor} />
      </TableCell>
      <TableCell>
        <div className="text-sm font-bold text-[#111827]">{finance.amount}</div>
        <div className="text-xs text-[#6B7280]">{finance.label}</div>
      </TableCell>
      <TableCell>
        <CategoryBadge category={s.category} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-[#374151]">
          <MapPin size={14} className="text-[#9CA3AF]" />
          {s.location}
        </div>
      </TableCell>
      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.price}</TableCell>
      <TableCell onClick={() => dispatch(toggleServiceStatus(s.id))} sx={{ cursor: "pointer" }}>
        <StatusBadge status={s.status} />
      </TableCell>
      <TableCell>
        <FeaturedToggle id={s.id} on={s.featured} />
      </TableCell>
      <TableCell>
        <div className="text-sm font-bold text-[#111827]">{format(d, "MMM dd, yyyy")}</div>
        <div className="text-xs text-[#6B7280]">{format(d, "hh:mm a")}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-0.5">
          <IconButton size="small" onClick={() => onView(s)}>
            <Eye size={16} className="text-[#9CA3AF]" />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(s)}>
            <Pencil size={16} className="text-[#7C3AED]" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(s.id)}>
            <Trash2 size={16} className="text-red-500" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
