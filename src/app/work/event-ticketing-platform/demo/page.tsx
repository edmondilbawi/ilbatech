import type { Metadata } from "next";
import { TicketingShowcase } from "@/components/ticketing-showcase";

export const metadata: Metadata = {
  title: "Virello Interactive Event Ticketing Platform Demo",
  description:
    "Explore ILBATECH's complete fictional event platform with discovery, reserved seating, simulated payment, unique QR tickets, transfers, organizer analytics, and check-in.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Virello Interactive Event Ticketing Platform Demo | ILBATECH",
    description:
      "A complete responsive customer and organizer ticketing journey created as an original ILBATECH interactive concept demo.",
    url: "/work/event-ticketing-platform/demo/",
  },
};

export default function EventTicketingDemoPage() {
  return <TicketingShowcase />;
}
