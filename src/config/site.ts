const WHATSAPP_DIGITS = "96181958984";

export const SITE = {
  name: "ILBATECH",
  shortName: "ILBATECH",
  wordmark: {
    lead: "ILBA",
    accent: "TECH",
  },
  description:
    "ILBATECH helps businesses improve the way they operate through practical, business-led technology solutions.",
  email: "edmondilbawi@gmail.com",
  phoneDisplay: "+961 81 958 984",
  whatsappDigits: WHATSAPP_DIGITS,
  whatsappUrl: `https://wa.me/${WHATSAPP_DIGITS}`,
  productionUrl: "https://edmondilbawi.github.io/ilbatech",
  repositoryUrl: "https://github.com/edmondilbawi/ilbatech",
} as const;

export const SITE_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/ilbatech";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE.productionUrl;

  if (!configuredUrl) return undefined;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function getSitePath(href: string) {
  if (!href.startsWith("/")) return href;

  const [pathAndQuery, hash] = href.split("#", 2);
  const queryIndex = pathAndQuery.indexOf("?");
  const pathname =
    queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : pathAndQuery.slice(queryIndex);
  const routePath =
    pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
  const normalizedHref = `${routePath}${query}${hash ? `#${hash}` : ""}`;

  if (!SITE_BASE_PATH) return normalizedHref;
  if (
    normalizedHref === SITE_BASE_PATH ||
    normalizedHref.startsWith(`${SITE_BASE_PATH}/`)
  ) {
    return normalizedHref;
  }

  return `${SITE_BASE_PATH}${normalizedHref}`;
}

export function getContactPath(service?: string) {
  const query = service ? `?service=${encodeURIComponent(service)}` : "";
  return getSitePath(`/contact${query}#contact-form`);
}
