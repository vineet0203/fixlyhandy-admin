import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/MainLayout";
import { ServiceCategoriesPage } from "@/pages/ServiceCategories";

export const Route = createFileRoute("/service-categories")({
  component: Page,
});

function Page() {
  return (
    <MainLayout>
      <ServiceCategoriesPage />
    </MainLayout>
  );
}
