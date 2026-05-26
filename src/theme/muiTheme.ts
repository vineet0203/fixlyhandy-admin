import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    primary: { main: "#7C3AED", light: "#EDE9FE", dark: "#5B21B6", contrastText: "#FFFFFF" },
    success: { main: "#16A34A" },
    warning: { main: "#EA580C" },
    error: { main: "#DC2626" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
    divider: "#E5E7EB",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 9999, paddingInline: 18, paddingBlock: 9 },
        outlined: { borderColor: "#E5E7EB", color: "#374151", backgroundColor: "#fff" },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 9999, fontWeight: 600 } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10, backgroundColor: "#fff" } } },
  },
});
