import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from "@mui/material";
import { User, Calendar, History, MapPin, Clock } from "lucide-react";
import { employeeService, EmployeeWithVendor, ScheduleItem } from "@/services/employeeService";
import { toast } from "sonner";

import { formatTitleCase } from "@/lib/utils";

interface EmployeeDetailTabsProps {
  employee: EmployeeWithVendor;
  onUpdate: (updatedEmployee: EmployeeWithVendor) => void;
}

export function EmployeeDetailTabs({ employee, onUpdate }: EmployeeDetailTabsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [upcomingJobs, setUpcomingJobs] = useState<ScheduleItem[]>([]);
  const [pastJobs, setPastJobs] = useState<ScheduleItem[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const data = await employeeService.getEmployeeSchedules(employee.id);
      setUpcomingJobs(data.upcoming || []);
      setPastJobs(data.past || []);
    } catch (err) {
      toast.error("Failed to load employee schedules");
    } finally {
      setLoadingSchedules(false);
    }
  }, [employee.id]);

  useEffect(() => {
    if (tabValue === 1 || tabValue === 2) {
      fetchSchedules();
    }
  }, [tabValue, fetchSchedules]);

  const getStatusColor = (
    status: string,
  ): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "assigned":
      case "scheduled":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const renderSchedulesTable = (jobs: ScheduleItem[]) => {
    if (loadingSchedules) {
      return (
        <Box className="flex justify-center items-center py-12">
          <CircularProgress size={40} sx={{ color: "#7C3AED" }} />
        </Box>
      );
    }

    if (jobs.length === 0) {
      return <Box className="text-center py-12 text-[#6B7280]">No jobs scheduled.</Box>;
    }

    return (
      <TableContainer>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "#fff",
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  py: 1.5,
                },
              }}
            >
              <TableCell>Job Title</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                sx={{
                  "&:hover": { bgcolor: "#F9FAFB" },
                  "& td": { borderColor: "#F3F4F6", py: 1.5 },
                }}
              >
                <TableCell sx={{ fontWeight: 700, color: "#111827" }}>
                  {job.title || job.job?.title || "Scheduled Job"}
                </TableCell>
                <TableCell sx={{ color: "#4B5563" }}>{job.vendor?.business_name || "-"}</TableCell>
                <TableCell sx={{ color: "#4B5563" }}>
                  {job.schedule_date ? new Date(job.schedule_date).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell sx={{ color: "#4B5563" }}>
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      {job.start_time?.substring(0, 5) || "-"} -{" "}
                      {job.end_time?.substring(0, 5) || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  sx={{
                    color: "#4B5563",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    <span title={job.address || ""}>{job.address || "-"}</span>
                  </div>
                </TableCell>
                <TableCell sx={{ textTransform: "capitalize", color: "#4B5563" }}>
                  {job.priority || "Normal"}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={job.status || "Scheduled"}
                    color={getStatusColor(job.status)}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "#fff",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="employee details tabs"
          sx={{
            px: 2,
            "& .MuiTabs-indicator": {
              backgroundColor: "#7C3AED",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: "#6B7280",
              "&.Mui-selected": {
                color: "#7C3AED",
              },
            },
          }}
        >
          <Tab icon={<User size={16} />} iconPosition="start" label="General Info" />
          <Tab icon={<Calendar size={16} />} iconPosition="start" label="Upcoming Jobs" />
          <Tab icon={<History size={16} />} iconPosition="start" label="Past Jobs" />
        </Tabs>
      </Box>

      <Paper
        sx={{
          p: 3,
          border: "1px solid #E5E7EB",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          boxShadow: "none",
          bgcolor: "#fff",
        }}
      >
        {/* General Info Tab */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Employee Details
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    FIRST NAME
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {employee.first_name || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    LAST NAME
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {employee.last_name || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    EMAIL ADDRESS
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {employee.email || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    MOBILE NUMBER
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {employee.mobile_number || employee.phone || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    DESIGNATION
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {formatTitleCase(employee.designation) || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    DEPARTMENT
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {formatTitleCase(employee.department) || "-"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    STATUS
                  </Typography>
                  <Chip
                    label={employee.is_active ? "Active" : "Inactive"}
                    color={employee.is_active ? "success" : "default"}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold block">
                    ASSOCIATED VENDOR
                  </Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {employee.vendor?.business_name || `ID: ${employee.vendor_id}`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Upcoming Jobs Tab */}
        {tabValue === 1 && renderSchedulesTable(upcomingJobs)}

        {/* Past Jobs Tab */}
        {tabValue === 2 && renderSchedulesTable(pastJobs)}
      </Paper>
    </Box>
  );
}
export default EmployeeDetailTabs;
