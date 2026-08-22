import type { Metadata } from "next";
import { Mail, MessageCircleMore, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell ILBATECH about the website, business system, mobile app or automation your business needs.",
  alternates: { canonical: "/contact/" },
  openGraph: { title: "Contact ILBATECH", description: "Tell us what your business needs and start a useful conversation.", url: "/contact/" },
};

export default function ContactPage() {
  return <>
    <SiteHeader />
    <main id="top">
      <section className="v4-page-hero">
        <div className="container"><SectionEyebrow>Contact ILBATECH</SectionEyebrow><h1>Tell us what you need</h1><p>Have a project idea or need help improving your business? Fill out the form and we&apos;ll get back to you as soon as possible.</p></div>
      </section>
      <section className="v4-contact section">
        <div className="container v4-contact-grid">
          <div className="v4-contact-copy">
            <h2>We&apos;re here to help your business grow.</h2>
            <p>Whether you need a website, a system to manage your operations, a mobile app, or automation that saves time, we&apos;re ready to build the right solution for you.</p>
            <div className="v4-contact-links">
              <a href={`mailto:${SITE.email}`}><Mail aria-hidden="true" size={19} /><span><small>Email</small>{SITE.email}</span></a>
              <a href={`tel:+${SITE.whatsappDigits}`}><Phone aria-hidden="true" size={19} /><span><small>Phone</small>{SITE.phoneDisplay}</span></a>
              <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircleMore aria-hidden="true" size={19} /><span><small>WhatsApp</small>{SITE.phoneDisplay}</span></a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
