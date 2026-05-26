import { Chip } from "@mui/material";

const map: Record<string, { bg: string; color: string }> = {
  Published: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFF7ED", color: "#EA580C" },
  Draft: { bg: "#F9FAFB", color: "#6B7280" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = map[status] ?? map.Draft;
  return (
    <Chip
      size="small"
      label={status}
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: 12, height: 24, px: 0.5 }}
    />
  );
}
