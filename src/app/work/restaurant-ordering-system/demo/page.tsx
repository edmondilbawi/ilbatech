import type { Metadata } from "next";
import { RestaurantOrderingShowcase } from "@/components/restaurant-ordering-showcase";

export const metadata: Metadata = {
  title: "Restaurant Ordering System",
  description: "Browse a restaurant menu, customize an order, complete a simulated checkout, track its status and open a digital receipt.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Restaurant Ordering System | ILBATECH", description: "A responsive restaurant ordering system with menu customization, simulated payment, tracking and digital receipts.", url: "/work/restaurant-ordering-system/demo/" },
};

export default function RestaurantOrderingDemoPage() { return <RestaurantOrderingShowcase />; }
