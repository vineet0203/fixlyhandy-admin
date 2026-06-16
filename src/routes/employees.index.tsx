import { createFileRoute } from "@tanstack/react-router";
import { EmployeesPage } from "@/pages/Employees";

export const Route = createFileRoute("/employees/")({
  component: Page,
});

function Page() {
  return <EmployeesPage />;
}
