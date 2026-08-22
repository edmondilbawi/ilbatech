import { ArrowRight, ChevronRight, Mail, MessageCircleMore } from "lucide-react";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { BUSINESS_SERVICES } from "@/config/v4-content";
import { getContactPath, getSitePath, SITE } from "@/config/site";

export function Wordmark() {
  return (
    <a
      href={getSitePath("/")}
      className="wordmark"
      aria-label={`${SITE.name} home`}
    >
      <svg className="brand-monogram" viewBox="0 0 52 56" aria-hidden="true">
        <path className="brand-monogram-i" d="M4 4h20v6h-6v36h6v6H4v-6h6V10H4z" />
        <path className="brand-monogram-l" d="M27 4h8v40h13v8H27z" />
        <path className="brand-monogram-link" d="M18 26h9v5h-9z" />
      </svg>
      <span className="brand-word">ILBATECH</span>
    </a>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <a href={getSitePath(href)} className={`button button--${variant}`}>
      {children}
      {variant === "primary" && (
        <ArrowRight aria-hidden="true" size={17} strokeWidth={1.8} />
      )}
    </a>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow"><span />{children}</p>;
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a href="#top" className="skip-link">
        Skip to main content
      </a>
      <div className="container nav">
        <Wordmark />
        <nav aria-label="Main navigation" className="desktop-nav">
          <a href={getSitePath("/")}>Home</a>
          <a href={getSitePath("/services")}>Services</a>
          <a href={getSitePath("/work")}>Work</a>
          <a href={getSitePath("/about")}>About Us</a>
          <a href={getSitePath("/contact")}>Contact</a>
        </nav>
        <a className="nav-cta" href={getContactPath()}>
          Let&apos;s Talk
          <ChevronRight aria-hidden="true" size={16} />
        </a>
        <MobileNavigation />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Wordmark />
          <strong>Technology built around your business.</strong>
        </div>
        <nav aria-label="Company">
          <h2>Company</h2>
          <a href={getSitePath("/about")}>About Us</a>
          <a href={getSitePath("/contact")}>Contact</a>
        </nav>
        <nav aria-label="Services">
          <h2>Services</h2>
          {BUSINESS_SERVICES.map((service) => (
            <a key={service.title} href={getSitePath(service.href)}>
              {service.title}
            </a>
          ))}
        </nav>
        <nav aria-label="Work">
          <h2>Work</h2>
          <a href={getSitePath("/work")}>Explore Our Work</a>
        </nav>
        <nav aria-label="Contact">
          <h2>Contact</h2>
          <a className="footer-email" href={`mailto:${SITE.email}`}>
            <Mail aria-hidden="true" size={15} />
            {SITE.email}
          </a>
          <a
            className="footer-whatsapp"
            href={SITE.whatsappUrl}
            aria-label={`Contact ${SITE.shortName} on WhatsApp at ${SITE.phoneDisplay}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircleMore aria-hidden="true" size={15} />
            WhatsApp
          </a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.shortName}. All rights reserved.</span>
        <a href="#top">
          Back to top <ArrowRight aria-hidden="true" size={15} />
        </a>
      </div>
    </footer>
  );
}
