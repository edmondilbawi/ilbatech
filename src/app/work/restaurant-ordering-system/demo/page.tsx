import type { Metadata } from "next";
import { RestaurantOrderingShowcase } from "@/components/restaurant-ordering-showcase";

export const metadata: Metadata = {
  title: "Interactive Restaurant Ordering System Concept",
  description: "Explore a complete interactive quick-service restaurant journey with menu customization, checkout, order tracking and digital receipts.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Restaurant Ordering System Concept | ILBATECH", description: "A responsive consumer ordering demonstration using fictional sample data and simulated payment only.", url: "/work/restaurant-ordering-system/demo/" },
};

export default function RestaurantOrderingDemoPage() { return <RestaurantOrderingShowcase />; }
