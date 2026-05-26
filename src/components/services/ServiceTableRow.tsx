import { TableRow, TableCell, Avatar, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Eye, Pencil, MapPin, MoreVertical } from "lucide-react";
import type { Service } from "@/data/servicesData";
import { VendorAvatar } from "@/components/ui/VendorAvatar";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FeaturedToggle } from "@/components/ui/FeaturedToggle";

export function ServiceTableRow({ s, index }: { s: Service; index: number }) {
  const d = new Date(s.dateAdded);
  return (
    <TableRow
      component={motion.tr}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      sx={{ "&:hover": { bgcolor: "#F9FAFB" }, "& td": { borderColor: "#F3F4F6", py: 1.5 } }}
    >
      <TableCell sx={{ color: "#6B7280", fontSize: 13, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>{s.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar variant="rounded" src={s.image} sx={{ width: 40, height: 40, borderRadius: 1.5 }} />
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#111827] leading-tight">{s.title}</div>
            <div className="text-xs text-[#6B7280] leading-tight mt-0.5">{s.subtitle}</div>
          </div>
        </div>
      </TableCell>
      <TableCell><VendorAvatar vendor={s.vendor} /></TableCell>
      <TableCell>
        <div className="text-sm font-bold text-[#111827]">{s.finance.amount}</div>
        <div className="text-xs text-[#6B7280]">{s.finance.label}</div>
      </TableCell>
      <TableCell><CategoryBadge category={s.category} /></TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-[#374151]">
          <MapPin size={14} className="text-[#9CA3AF]" />
          {s.location}
        </div>
      </TableCell>
      <TableCell sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.price}</TableCell>
      <TableCell><StatusBadge status={s.status} /></TableCell>
      <TableCell><FeaturedToggle id={s.id} on={s.featured} /></TableCell>
      <TableCell>
        <div className="text-sm font-bold text-[#111827]">{format(d, "MMM dd, yyyy")}</div>
        <div className="text-xs text-[#6B7280]">{format(d, "hh:mm a")}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-0.5">
          <IconButton size="small"><Eye size={16} className="text-[#9CA3AF]" /></IconButton>
          <IconButton size="small"><Pencil size={16} className="text-[#9CA3AF]" /></IconButton>
          <IconButton size="small"><MoreVertical size={16} className="text-[#9CA3AF]" /></IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
