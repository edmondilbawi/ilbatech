import type { Metadata } from "next";
import { EcommerceShowcase } from "@/components/ecommerce-showcase";

export const metadata: Metadata = {
  title: "Interactive Premium E-Commerce Concept",
  description:
    "Explore ILBATECH's interactive premium commerce concept with local product discovery, variants, cart management, and a safe checkout demonstration.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Interactive Premium E-Commerce Concept | ILBATECH",
    description:
      "A responsive storefront, product discovery, cart, and checkout demonstration created as an ILBATECH concept project.",
    url: "/work/premium-ecommerce-store/demo/",
  },
};

export default function EcommerceDemoPage() {
  return <EcommerceShowcase />;
}
