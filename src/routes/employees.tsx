import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";

export const Route = createFileRoute("/employees")({
  component: Page,
});

function Page() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
