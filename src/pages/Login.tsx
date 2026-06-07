import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { Briefcase } from "lucide-react";
import axios from "axios";
import { authStore } from "@/store/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost/trakjobs-api";
      const response = await axios.post<{
        success: boolean;
        message?: string;
        data?: {
          access_token?: string;
          user?: {
            is_platform_admin?: boolean;
          };
        };
      }>(`${apiBaseUrl}/api/v1/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.success && response.data.data) {
        const { access_token, user } = response.data.data;
        
        // Ensure user is platform admin
        if (user && user.is_platform_admin) {
          if (access_token) {
            authStore.setToken(access_token);
            // Redirect to home
            window.location.href = "/";
          } else {
            setError("No access token received from server.");
          }
        } else {
          setError("Access denied. You must have administrator privileges to log in.");
        }
      } else {
        setError(response.data.message || "Failed to log in. Please try again.");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage =
        err.response?.data?.message || "Invalid credentials. Please verify your email and password.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 50%, #E0E7FF 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4.5,
          borderRadius: 4,
          border: "1px solid rgba(229, 231, 235, 0.8)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
          <Box
            sx={{
              w: 12,
              h: 12,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#7C3AED",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              boxShadow: "0 8px 16px -4px rgba(124, 58, 237, 0.3)",
            }}
          >
            <Briefcase size={24} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontSize: "24px",
              color: "#7C3AED",
              letterSpacing: "-0.025em",
            }}
          >
            Trak<span style={{ color: "#111827" }}>Jobs</span>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            Sign in to platform admin console
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: 13, fontWeight: 500 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              size="medium"
              slotProps={{
                inputLabel: {
                  style: { fontSize: 14, fontWeight: 500 },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 14,
                  bgcolor: "#FCFCFD",
                  "&:hover fieldset": {
                    borderColor: "#7C3AED",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7C3AED",
                  },
                },
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              size="medium"
              slotProps={{
                inputLabel: {
                  style: { fontSize: 14, fontWeight: 500 },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 14,
                  bgcolor: "#FCFCFD",
                  "&:hover fieldset": {
                    borderColor: "#7C3AED",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#7C3AED",
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                height: 48,
                borderRadius: 2,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                bgcolor: "#7C3AED",
                boxShadow: "0 8px 20px -8px rgba(124, 58, 237, 0.6)",
                "&:hover": {
                  bgcolor: "#6D28D9",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
