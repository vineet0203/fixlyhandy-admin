import { Chip } from "@mui/material";

const map: Record<string, { bg: string; color: string }> = {
  "Home Services": { bg: "#EDE9FE", color: "#7C3AED" },
  "Repair Services": { bg: "#EFF6FF", color: "#2563EB" },
  Automotive: { bg: "#FEF2F2", color: "#DC2626" },
  "Other Services": { bg: "#FFFBEB", color: "#D97706" },
};

export function CategoryBadge({ category }: { category: string }) {
  const s = map[category] ?? { bg: "#F3F4F6", color: "#374151" };
  return (
    <Chip
      size="small"
      label={category}
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: 12, height: 24, borderRadius: 1, px: 0.5 }}
    />
  );
}
