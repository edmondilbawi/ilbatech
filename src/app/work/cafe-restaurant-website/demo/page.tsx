import type { Metadata } from "next";
import { HospitalityShowcase } from "@/components/hospitality-showcase";

export const metadata: Metadata = {
  title: "Interactive Café & Restaurant Website Concept",
  description:
    "Explore ILBATECH's interactive hospitality website concept with menu discovery, dietary filters, item details, and a local-only reservation request demonstration.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Interactive Café & Restaurant Website Concept | ILBATECH",
    description:
      "A responsive hospitality website and reservation-request experience created as an ILBATECH concept project.",
    url: "/work/cafe-restaurant-website/demo/",
  },
};

export default function HospitalityDemoPage() {
  return <HospitalityShowcase />;
}
