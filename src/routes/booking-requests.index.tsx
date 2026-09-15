import { createFileRoute } from "@tanstack/react-router";
import { BookingRequestsPage } from "@/pages/BookingRequests";

export const Route = createFileRoute("/booking-requests/")({
  component: Page,
});

function Page() {
  return <BookingRequestsPage />;
}
