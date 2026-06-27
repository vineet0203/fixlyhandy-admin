import { createFileRoute } from "@tanstack/react-router";
import { VendorsPage } from "@/pages/Vendors";

export const Route = createFileRoute("/vendors/")({
  component: Page,
});

function Page() {
  return <VendorsPage />;
}
