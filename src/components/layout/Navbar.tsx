import { Badge, IconButton, InputBase, Paper } from "@mui/material";
import { AlignLeft, Bell, ChevronDown, Search } from "lucide-react";

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header
      className="sticky top-0 z-20 h-16 bg-white border-b flex items-center justify-between px-6"
      style={{ borderColor: "#E5E7EB" }}
    >
      <IconButton onClick={onToggleSidebar} size="small">
        <AlignLeft size={20} color="#374151" />
      </IconButton>

      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.75,
          width: 420,
          borderRadius: 9999,
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
        }}
      >
        <Search size={16} color="#9CA3AF" />
        <InputBase placeholder="Search anything..." sx={{ flex: 1, fontSize: 14 }} />
        <span className="text-[11px] text-[#9CA3AF] border rounded px-1.5 py-0.5" style={{ borderColor: "#E5E7EB" }}>
          Ctrl /
        </span>
      </Paper>

      <div className="flex items-center gap-4">
        <Badge badgeContent={8} color="primary">
          <Bell size={20} color="#374151" />
        </Badge>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold" style={{ background: "#7C3AED" }}>A</div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-[#111827]">Admin</div>
            <div className="text-[11px] text-[#6B7280]">Super Administrator</div>
          </div>
          <ChevronDown size={16} className="text-[#9CA3AF]" />
        </div>
      </div>
    </header>
  );
}
