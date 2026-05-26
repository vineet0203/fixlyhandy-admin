import { Avatar } from "@mui/material";
import { BadgeCheck } from "lucide-react";
import type { Service } from "@/data/servicesData";

export function VendorAvatar({ vendor }: { vendor: Service["vendor"] }) {
  return (
    <div className="flex items-center gap-2">
      {vendor.avatar ? (
        <Avatar src={vendor.avatar} sx={{ width: 32, height: 32 }} />
      ) : (
        <Avatar sx={{ width: 32, height: 32, bgcolor: vendor.avatarColor ?? "#7C3AED", fontSize: 11, fontWeight: 700, color: "#fff" }}>
          {vendor.initials}
        </Avatar>
      )}
      <span className="text-sm font-medium text-[#111827]">{vendor.name}</span>
      {vendor.verified && <BadgeCheck size={16} className="fill-[#3B82F6] text-white" />}
    </div>
  );
}
