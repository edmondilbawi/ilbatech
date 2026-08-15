import type { Metadata } from "next";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested ITG page could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="not-found-page">
        <section className="not-found-panel">
          <div className="container not-found-grid">
            <div>
              <SectionEyebrow>404 — Page not found</SectionEyebrow>
              <h1>This page isn’t part of the path forward.</h1>
              <p className="hero-copy">
                The address may have changed or the page may no longer exist.
                Return home to explore ITG, or tell us about the business problem
                you are trying to solve.
              </p>
              <div className="hero-actions">
                <Button href="/">Return Home</Button>
                <Button href="/contact#contact-form" variant="secondary">
                  Contact ITG
                </Button>
              </div>
            </div>
            <div className="not-found-mark" aria-hidden="true">
              <span>ITG</span>
              <strong>404</strong>
              <p>Clarity starts with the right direction.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
