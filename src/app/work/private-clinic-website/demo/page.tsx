import type { Metadata } from "next";
import { PrivateClinicShowcase } from "@/components/private-clinic-showcase";

export const metadata: Metadata = {
  title: "Interactive Private Clinic Website Concept",
  description:
    "Explore ILBATECH's interactive private clinic website concept, including services, fictional specialist profiles, and a front-end appointment request demonstration.",
  openGraph: {
    title: "Interactive Private Clinic Website Concept | ILBATECH",
    description:
      "A responsive healthcare website and appointment-request experience created as an ILBATECH concept project.",
  },
};

export default function PrivateClinicDemoPage() {
  return <PrivateClinicShowcase />;
}
