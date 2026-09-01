import type { Metadata } from "next";
import { TicketingShowcase } from "@/components/ticketing-showcase";

export const metadata: Metadata = {
  title: "Event Ticketing Platform",
  description:
    "Find events, choose tickets, complete a simulated payment, manage QR tickets and use organizer analytics and check-in.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Event Ticketing Platform | ILBATECH",
    description:
      "A responsive ILBATECH event platform connecting customer booking, tickets, organizer management and door check-in.",
    url: "/work/event-ticketing-platform/demo/",
  },
};

export default function EventTicketingDemoPage() {
  return <TicketingShowcase />;
}
