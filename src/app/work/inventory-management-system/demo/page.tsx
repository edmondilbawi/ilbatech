import type { Metadata } from "next";
import { InventoryShowcase } from "@/components/inventory-showcase";

export const metadata: Metadata = {
  title: "Interactive Restaurant Inventory Management System Concept",
  description: "Explore a simple interactive restaurant inventory concept with products, deliveries, usage, costs, alerts and reliable movement history.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Restaurant Inventory Management System Concept | ILBATECH", description: "A responsive restaurant stock demonstration using fictional sample data only.", url: "/work/inventory-management-system/demo/" },
};

export default function InventoryDemoPage() { return <InventoryShowcase />; }
