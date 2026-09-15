import { createFileRoute } from "@tanstack/react-router";
import { BookingRequestDetailPage } from "@/pages/BookingRequestDetail";

export const Route = createFileRoute("/booking-requests/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <BookingRequestDetailPage id={Number(id)} />;
}
