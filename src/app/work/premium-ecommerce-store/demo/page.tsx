import type { Metadata } from "next";
import { EcommerceShowcase } from "@/components/ecommerce-showcase";

export const metadata: Metadata = {
  title: "Nestra Market Interactive E-Commerce Demo",
  description:
    "Explore ILBATECH's complete fictional commerce experience with search, categories, product variants, wishlist, cart, simulated checkout, tracking, orders, and returns.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Nestra Market Interactive E-Commerce Demo | ILBATECH",
    description:
      "A complete responsive commerce customer journey created as an original ILBATECH interactive concept demo.",
    url: "/work/premium-ecommerce-store/demo/",
  },
};

export default function EcommerceDemoPage() {
  return <EcommerceShowcase />;
}
