import type { Metadata } from "next";
import { InventoryShowcase } from "@/components/inventory-showcase";

export const metadata: Metadata = {
  title: "Restaurant Inventory Management System",
  description: "Manage restaurant inventory, factory production, purchasing, branch receiving, alerts and traceable activity.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Restaurant Inventory Management System | ILBATECH", description: "Manage inventory, production, purchasing and branch receiving in one connected restaurant operations system.", url: "/work/inventory-management-system/demo/" },
};

export default function InventoryDemoPage() { return <InventoryShowcase />; }
