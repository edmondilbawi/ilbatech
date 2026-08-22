import type { Metadata } from "next";
import { TravelShowcase } from "@/components/travel-showcase";

export const metadata: Metadata = {
  title: "Interactive Travel Agency Website Concept",
  description: "Explore an image-led interactive destination, package search, package detail and travel enquiry concept by ILBATECH.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: { title: "Interactive Travel Agency Website Concept | ILBATECH", description: "A responsive travel discovery and enquiry demonstration using sample content only.", url: "/work/travel-agency-website/demo/" },
};

export default function TravelAgencyDemoPage() { return <TravelShowcase />; }
