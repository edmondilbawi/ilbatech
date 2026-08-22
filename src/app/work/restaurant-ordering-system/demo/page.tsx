import type { Metadata } from "next";
import { RestaurantOrderingShowcase } from "@/components/restaurant-ordering-showcase";

export const metadata: Metadata = {
  title: "Interactive Restaurant Ordering System Concept",
  description: "Explore a local interactive restaurant ordering, loyalty, customer, order history and analytics concept by ILBATECH.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Restaurant Ordering System Concept | ILBATECH", description: "A responsive hospitality ordering demonstration using sample data only.", url: "/work/restaurant-ordering-system/demo/" },
};

export default function RestaurantOrderingDemoPage() { return <RestaurantOrderingShowcase />; }
