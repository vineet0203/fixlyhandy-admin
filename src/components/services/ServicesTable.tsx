import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppSelector } from "@/store";
import { ServiceTableRow } from "./ServiceTableRow";
import { TablePagination } from "@/components/ui/TablePagination";

const headers = ["ID", "Service", "Vendor", "Finance", "Category", "Location", "Price", "Status", "Featured", "Date Added", "Actions"];

export function ServicesTable() {
  const { services, searchQuery, categoryFilter, locationFilter, statusFilter } = useAppSelector((s) => s.services);

  const filtered = services.filter((s) => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (locationFilter !== "all" && !s.location.startsWith(locationFilter)) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <Paper sx={{ border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden", bgcolor: "#fff" }}>
      <TableContainer>
        <Table sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow sx={{ "& th": { bgcolor: "#fff", borderColor: "#E5E7EB", color: "#6B7280", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", py: 1.5 } }}>
              {headers.map((h) => <TableCell key={h}>{h}</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((s, i) => <ServiceTableRow key={s.id} s={s} index={i} />)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination />
    </Paper>
  );
}
