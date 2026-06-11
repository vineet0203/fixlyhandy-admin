import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useAppSelector } from "@/store";
import { ServiceTableRow } from "./ServiceTableRow";
import { TablePagination } from "@/components/ui/TablePagination";
import type { Service } from "@/data/servicesData";

const headers = ["No.", "Service", "Vendor", "Finance", "Category", "Location", "Price", "Status", "Featured", "Date Added", "Actions"];

export function ServicesTable({ onEdit, onDelete }: { onEdit: (s: Service) => void; onDelete: (id: string | number) => void }) {
  const { services } = useAppSelector((s) => s.services);

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
            {services.map((s, i) => <ServiceTableRow key={s.id} s={s} index={i} onEdit={onEdit} onDelete={onDelete} />)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination />
    </Paper>
  );
}
