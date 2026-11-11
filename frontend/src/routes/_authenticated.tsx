import AuthenticatedLayout from "@/components/authenticated-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});
