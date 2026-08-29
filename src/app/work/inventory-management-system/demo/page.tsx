import type { Metadata } from "next";
import { InventoryShowcase } from "@/components/inventory-showcase";

export const metadata: Metadata = {
  title: "Interactive Restaurant Inventory Management System Concept",
  description: "Explore an interactive restaurant operations concept with role-based inventory, factory production, purchasing, branch receiving, alerts, and traceable history.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Restaurant Inventory Management System Concept | ILBATECH", description: "A responsive restaurant operations demonstration using fictional sample data only.", url: "/work/inventory-management-system/demo/" },
};

export default function InventoryDemoPage() { return <InventoryShowcase />; }
