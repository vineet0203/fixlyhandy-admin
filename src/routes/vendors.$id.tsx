import { createFileRoute } from "@tanstack/react-router";
import { VendorDetailPage } from "@/pages/VendorDetail";

export const Route = createFileRoute("/vendors/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <VendorDetailPage id={Number(id)} />;
}
