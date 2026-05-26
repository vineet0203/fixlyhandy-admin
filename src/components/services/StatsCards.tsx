import { Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { LayoutList, CheckCircle2, Clock, EyeOff, TrendingUp, TrendingDown } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  Icon: any;
  change: string;
  changeUp: boolean;
  changeColor: string;
};

const stats: Stat[] = [
  { label: "Total Services", value: "256", iconBg: "#EDE9FE", iconColor: "#7C3AED", Icon: LayoutList, change: "+12% from last month", changeUp: true, changeColor: "#16A34A" },
  { label: "Published Services", value: "210", iconBg: "#F0FDF4", iconColor: "#16A34A", Icon: CheckCircle2, change: "+8% from last month", changeUp: true, changeColor: "#16A34A" },
  { label: "Pending Services", value: "18", iconBg: "#FFF7ED", iconColor: "#EA580C", Icon: Clock, change: "-3% from last month", changeUp: false, changeColor: "#DC2626" },
  { label: "Draft Services", value: "28", iconBg: "#FEF2F2", iconColor: "#DC2626", Icon: EyeOff, change: "+5% from last month", changeUp: true, changeColor: "#16A34A" },
];

export function StatsCards() {
  return (
    <Grid container spacing={3}>
      {stats.map((s, i) => {
        const Trend = s.changeUp ? TrendingUp : TrendingDown;
        return (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
            >
              <Paper
                sx={{
                  p: 2.5, border: "1px solid #E5E7EB", borderRadius: 3, bgcolor: "#fff",
                  display: "flex", alignItems: "center", gap: 2,
                  transition: "box-shadow .2s", "&:hover": { boxShadow: "0 8px 24px -12px rgba(124,58,237,.18)" },
                }}
              >
                <div className="flex items-center justify-center rounded-full shrink-0" style={{ background: s.iconBg, width: 56, height: 56 }}>
                  <s.Icon size={26} color={s.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#6B7280] font-medium">{s.label}</div>
                  <div className="text-3xl font-extrabold text-[#111827] leading-tight mt-0.5">{s.value}</div>
                  <div className="flex items-center gap-1 text-xs mt-1" style={{ color: s.changeColor }}>
                    <Trend size={14} />
                    <span className="font-semibold">{s.change}</span>
                  </div>
                </div>
              </Paper>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
}
