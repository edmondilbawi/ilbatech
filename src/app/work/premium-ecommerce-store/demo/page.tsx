import type { Metadata } from "next";
import { EcommerceShowcase } from "@/components/ecommerce-showcase";

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description:
    "Shop products with search, categories, variants, wishlist, cart, simulated checkout, tracking, orders and returns.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: {
    title: "E-Commerce Store | ILBATECH",
    description:
      "A responsive ILBATECH e-commerce store with product discovery, customer accounts and post-purchase order management.",
    url: "/work/premium-ecommerce-store/demo/",
  },
};

export default function EcommerceDemoPage() {
  return <EcommerceShowcase />;
}
