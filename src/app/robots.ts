import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return { rules: { userAgent: "*", allow: "/" }, sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined };
}
