import React, { useState } from "react";
import {
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Typography,
   TextField,
   InputAdornment,
   IconButton,
} from "@mui/material";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { toast } from "sonner";

interface CustomerResetPasswordProps {
  id: number;
  email: string;
  onSuccess?: () => void;
}

export function CustomerResetPassword({ id, email, onSuccess }: CustomerResetPasswordProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setPassword("");
    setShowPassword(false);
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await vendorService.resetCustomerPassword(id, password);
      toast.success("Customer password reset successfully.");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} disabled={loading} title="Reset Password">
        <KeyRound size={16} className="text-amber-600" />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              width: "100%",
              maxWidth: 400,
            },
          },
        }}
      >
        <DialogTitle className="font-extrabold text-[#111827]">Reset Customer Password</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography className="text-gray-600 text-sm mb-4">
              Enter a new custom password for the customer account (<strong>{email}</strong>). They
              will be able to log in using this password.
            </Typography>
            <TextField
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              error={password.length > 0 && password.length < 8}
              helperText={
                password.length > 0 && password.length < 8
                  ? "Password must be at least 8 characters long"
                  : ""
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword} edge="end" size="small">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 1.5 }}>
            <Button onClick={handleClose} disabled={loading} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || password.length < 8}
              sx={{
                bgcolor: "#7C3AED",
                "&:hover": { bgcolor: "#6D28D9" },
                textTransform: "none",
              }}
            >
              {loading ? "Saving..." : "Save Password"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
export default CustomerResetPassword;
