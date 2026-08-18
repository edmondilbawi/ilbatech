import { ArrowRight, ChevronRight, Mail, MessageCircleMore } from "lucide-react";
import type { ReactNode } from "react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SERVICE_AREAS } from "@/config/offerings";
import { getContactPath, getSitePath, SITE } from "@/config/site";

export function Wordmark() {
  return (
    <a
      href={getSitePath("/")}
      className="wordmark"
      aria-label={`${SITE.name} home`}
    >
      {SITE.wordmark.lead}<span>{SITE.wordmark.accent}</span>
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
          <a href={getSitePath("/about")}>About</a>
          <a href={getSitePath("/contact")}>Contact</a>
        </nav>
        <a className="nav-cta" href={getContactPath()}>
          Start a Conversation
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
          <p>{SITE.name}</p>
          <strong>Business-led technology consulting.</strong>
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
            {SITE.phoneDisplay}
          </a>
        </div>
        <nav aria-label="Footer navigation">
          <h2>Explore</h2>
          <a href={getSitePath("/")}>Home</a>
          <a href={getSitePath("/services")}>Services</a>
          <a href={getSitePath("/work")}>Work</a>
          <a href={getSitePath("/about")}>About</a>
          <a href={getSitePath("/contact")}>Contact</a>
        </nav>
        <nav aria-label="Service areas">
          <h2>Service areas</h2>
          {SERVICE_AREAS.map((service) => (
            <a
              key={service.slug}
              href={getSitePath(`/services/${service.slug}`)}
            >
              {service.title}
            </a>
          ))}
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.shortName}. All rights reserved.</span>
        <span>Technology with purpose.</span>
        <a href="#top">
          Back to top <ArrowRight aria-hidden="true" size={15} />
        </a>
      </div>
    </footer>
  );
}
