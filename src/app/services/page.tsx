import type { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  Code2,
  Globe2,
  LayoutPanelTop,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { getSitePath } from "@/config/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore ILBATECH services for websites, commerce, software, applications, automation, AI, business systems, and technology consulting.",
  openGraph: {
    title: "Services | ILBATECH",
    description: "Technology services built around the way your business needs to work.",
  },
};

const services = [
  [Globe2, "Professional Business Websites", "A clear, credible online presence for businesses that need to communicate their value.", "websites-and-commerce"],
  [ShoppingBag, "E-commerce Websites", "Practical online stores designed around the path from browsing to buying.", "websites-and-commerce"],
  [RefreshCw, "Website Redesigns", "A focused reset for websites that no longer reflect the business or serve its audiences.", "websites-and-commerce"],
  [Code2, "Web Applications", "Browser-based applications that support specific customer, staff, or operational needs.", "software-and-applications"],
  [Smartphone, "Mobile Applications", "Mobile experiences considered around a useful audience need and a sustainable business case.", "software-and-applications"],
  [Bot, "AI Automation", "Purposeful AI assistance that reduces repeatable work where it genuinely makes sense.", "automation-and-ai"],
  [Workflow, "Workflow Automation", "Connected workflows that reduce unnecessary handoffs, repetition, and delays.", "automation-and-ai"],
  [LayoutPanelTop, "Business Management Systems", "Central systems shaped around the information and activity an operation needs to manage.", "business-systems-and-consulting"],
  [UsersRound, "CRM Systems", "Customer relationship systems that make important interactions easier to track and manage.", "business-systems-and-consulting"],
  [CalendarCheck, "Booking & Reservation Systems", "Straightforward booking journeys tailored to the way appointments or reservations are handled.", "business-systems-and-consulting"],
  [SlidersHorizontal, "Digital Transformation", "A practical approach to improving the way the business operates through technology.", "business-systems-and-consulting"],
  [BriefcaseBusiness, "Technology Consulting", "Clear guidance for business leaders making important technology decisions.", "business-systems-and-consulting"],
] as const;

const problems = [
  "Manual, repetitive work",
  "Inefficient processes",
  "Poor customer management",
  "Outdated systems",
  "Difficult booking processes",
  "Weak online presence",
  "Operational bottlenecks",
  "A lack of useful digital tools",
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="services-hero">
          <div className="container">
            <SectionEyebrow>Services</SectionEyebrow>
            <h1>Technology solutions <em>built around your business.</em></h1>
            <p className="hero-copy">
              ILBATECH starts with the way your business works today, the challenge in
              front of you, and the outcome you need. Then we recommend technology
              that earns its place.
            </p>
            <div className="hero-actions">
              <Button href="/contact#contact-form">Start a Conversation</Button>
              <Button href="#service-catalog" variant="secondary">Explore Services</Button>
            </div>
          </div>
        </section>

        <section id="service-catalog" className="section services-list">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>What we can help with</SectionEyebrow>
                <h2>Practical technology for meaningful business needs.</h2>
              </div>
              <p>Every engagement begins by understanding the problem, not selecting a solution from a list.</p>
            </div>
            <div className="services-catalog">
              {services.map(([Icon, title, summary, slug], index) => (
                <article className="catalog-card" key={title}>
                  <div className="catalog-top">
                    <span className="number">{String(index + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{summary}</p>
                  <a className="catalog-link" href={getSitePath(`/services/${slug}`)}>
                    Explore this service <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="business-needs" className="business-needs section">
          <div className="container problems-grid">
            <div>
              <SectionEyebrow>Start with the problem</SectionEyebrow>
              <h2>Not every business challenge needs more technology.</h2>
            </div>
            <div>
              <p className="lead">
                Businesses often know something is getting in the way, but not
                necessarily what will solve it. ILBATECH evaluates the problem first,
                then determines whether technology is the right answer—and, if so,
                what kind.
              </p>
              <ul>
                {problems.map((problem) => <li key={problem}><span>→</span>{problem}</li>)}
              </ul>
              <a className="inverse-link" href={getSitePath("/solutions")}>
                Explore solutions by business problem <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <SectionEyebrow>Start with clarity</SectionEyebrow>
            <h2>Let’s solve the right problem.</h2>
            <p>Bring the business need. We’ll recommend only the technology that genuinely helps move it forward.</p>
            <Button href="/contact#contact-form">Start a Conversation</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
