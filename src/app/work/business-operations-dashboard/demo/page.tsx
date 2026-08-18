import type { Metadata } from "next";
import { OperationsShowcase } from "@/components/operations-showcase";

export const metadata: Metadata = {
  title: "Interactive Business Operations Dashboard Concept",
  description:
    "Explore ILBATECH's interactive operations concept with consistent sample clients, projects, tasks, analytics, automation simulations, and deterministic AI-assisted insights.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Interactive Business Operations Dashboard Concept | ILBATECH",
    description:
      "A responsive internal-tool, workflow, automation, and AI-assisted operations demonstration created as an ILBATECH concept project.",
    url: "/work/business-operations-dashboard/demo/",
  },
};

export default function OperationsDemoPage() {
  return <OperationsShowcase />;
}
