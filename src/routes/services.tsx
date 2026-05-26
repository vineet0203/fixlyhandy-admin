import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServicesPage } from "@/pages/Services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — TrakJobs Admin" },
      { name: "description", content: "Manage all marketplace services on TrakJobs admin." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MainLayout>
      <ServicesPage />
    </MainLayout>
  );
}
