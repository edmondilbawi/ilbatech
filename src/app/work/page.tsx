import type { Metadata } from "next";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Explore the concept work ILBATECH uses to demonstrate its approach to websites, digital products, business systems, AI, and automation.",
  openGraph: {
    title: "Selected Work | ILBATECH",
    description:
      "Concept work that demonstrates practical, business-focused technology thinking.",
  },
};

const focusAreas = [
  ["01", "Web experiences", "Clear, credible websites and commerce journeys shaped around audience and business goals."],
  ["02", "Digital products", "Focused applications that make a useful task, interaction, or service easier to complete."],
  ["03", "Business systems", "Operational tools that bring important information, workflows, and decisions into better order."],
  ["04", "AI & automation", "Purposeful automation concepts that reduce repeatable work while keeping people in control."],
] as const;

export default function WorkPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="work-hero">
          <div className="container work-hero-grid">
            <div>
              <SectionEyebrow>Selected Work</SectionEyebrow>
              <h1>
                Selected <em>Work</em>
              </h1>
              <p className="hero-copy">
                A curated space for independent concept projects that demonstrate
                how ILBATECH approaches websites, digital products, business
                systems, AI, and automation.
              </p>
              <div className="hero-actions">
                <Button href="/services">Explore Services</Button>
                <Button href="/contact#contact-form" variant="secondary">
                  Start a Conversation
                </Button>
              </div>
            </div>
            <aside className="work-signal" aria-label="From business need to useful technology">
              <span>Concept work</span>
              <p>Business need</p>
              <i aria-hidden="true" />
              <p>Considered direction</p>
              <i aria-hidden="true" />
              <p>Useful technology</p>
            </aside>
          </div>
        </section>

        <section className="work-overview section">
          <div className="container positioning-grid">
            <SectionEyebrow>Capability in context</SectionEyebrow>
            <div>
              <h2>Practical thinking, made visible.</h2>
              <p className="lead">
                Each concept begins with a realistic business need, then explores
                the experience, system, or automation that could address it without
                unnecessary complexity.
              </p>
              <p className="work-disclosure">
                Concept work is clearly identified and is not presented as
                commissioned client work, a live engagement, or evidence of
                commercial results.
              </p>
            </div>
          </div>
        </section>

        <section className="work-focus section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Areas of focus</SectionEyebrow>
                <h2>What the work is designed to demonstrate.</h2>
              </div>
              <p>
                The emphasis stays on the fit between a business problem, the
                people involved, and the technology response.
              </p>
            </div>
            <div className="work-focus-grid">
              {focusAreas.map(([number, title, copy]) => (
                <article key={title}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <SectionEyebrow>Build with purpose</SectionEyebrow>
            <h2>Have a real business challenge in mind?</h2>
            <p>
              Start with what needs to work better. We&apos;ll help shape the right
              technology response around it.
            </p>
            <Button href="/contact#contact-form">Start a Conversation</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
