import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/booking-requests")({
  component: Page,
});

function Page() {
  return <Outlet />;
}
