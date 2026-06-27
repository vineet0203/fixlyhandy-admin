import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDetailPage } from "@/pages/EmployeeDetail";

export const Route = createFileRoute("/employees/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <EmployeeDetailPage id={Number(id)} />;
}
