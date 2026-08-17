import type { Metadata } from "next";
import { Mail, MessageCircleMore, SearchCheck, Send } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Button, SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell ILBATECH what is making your business harder to operate and explore whether technology can help.",
  openGraph: { title: "Contact ILBATECH", description: "Start with the problem. Find the right technology." },
};

const nextSteps = [[MessageCircleMore, "Tell us about the challenge", "Share what is making your business harder to operate—whether or not you know what technology might help."], [SearchCheck, "We understand & analyze", "ILBATECH reviews the situation and considers where technology may create genuine value."], [Send, "We recommend the right approach", "If technology can help, we recommend an appropriate direction based on the actual business need."]] as const;

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="contact-hero">
          <div className="container">
            <SectionEyebrow>Contact ILBATECH</SectionEyebrow>
            <h1>
              Let’s talk about <em>your business.</em>
            </h1>
            <p className="hero-copy">
              Have a business challenge you&apos;d like to solve? Tell us
              what&apos;s happening, and let&apos;s explore whether technology
              can help.
            </p>
            <Button href="#contact-form">Start a Conversation</Button>
          </div>
        </section>

        <section className="contact-main section">
          <div className="container contact-grid">
            <div className="contact-intro">
              <SectionEyebrow>Start with the challenge</SectionEyebrow>
              <h2>You don&apos;t need to know which technology you need.</h2>
              <p className="lead">
                Tell us what is making your business harder to operate, and
                we&apos;ll start there. The conversation is about understanding
                the problem—not choosing a service from a list.
              </p>
              <div className="contact-methods">
                <div className="contact-card">
                  <Mail aria-hidden="true" size={20} strokeWidth={1.5} />
                  <div>
                    <span>Prefer email?</span>
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </div>
                </div>
                <div className="contact-card">
                  <MessageCircleMore aria-hidden="true" size={20} strokeWidth={1.5} />
                  <div>
                    <span>Prefer WhatsApp?</span>
                    <a
                      href={SITE.whatsappUrl}
                      aria-label={`Contact ${SITE.shortName} on WhatsApp at ${SITE.phoneDisplay}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {SITE.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="contact-steps section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>What happens next?</SectionEyebrow>
                <h2>A conversation before a recommendation.</h2>
              </div>
              <p>
                Contacting ILBATECH does not mean you need to purchase a service. It
                is a chance to explore the situation with clarity.
              </p>
            </div>
            <div className="contact-steps-grid">
              {nextSteps.map(([Icon, title, copy], index) => (
                <article key={title}>
                  <div className="catalog-top">
                    <span className="number">0{index + 1}</span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
