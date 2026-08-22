import type { Metadata } from "next";
import { InventoryShowcase } from "@/components/inventory-showcase";

export const metadata: Metadata = {
  title: "Interactive Inventory Management System Concept",
  description: "Explore an interactive product, stock movement, supplier, alert, pricing and inventory reporting concept by ILBATECH.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Inventory Management System Concept | ILBATECH", description: "A responsive inventory operations demonstration using sample data only.", url: "/work/inventory-management-system/demo/" },
};

export default function InventoryDemoPage() { return <InventoryShowcase />; }
