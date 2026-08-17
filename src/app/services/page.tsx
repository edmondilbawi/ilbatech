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
  [Globe2, "Professional Business Websites", "A clear, credible online presence for businesses that need to communicate their value.", "A weak or unclear online presence.", "A website that supports confidence and conversation.", "websites-and-commerce"],
  [ShoppingBag, "E-commerce Websites", "Practical online stores designed around the path from browsing to buying.", "Selling online feels fragmented or difficult to manage.", "A more considered digital sales experience.", "websites-and-commerce"],
  [RefreshCw, "Website Redesigns", "A focused reset for websites that no longer reflect the business or serve its audiences.", "An outdated site that no longer supports the business.", "A clearer, more useful digital front door.", "websites-and-commerce"],
  [Code2, "Web Applications", "Browser-based applications that support specific customer, staff, or operational needs.", "Generic tools do not fit an important workflow.", "A focused experience shaped around the work.", "software-and-applications"],
  [Smartphone, "Mobile Applications", "Mobile experiences considered around a useful audience need and a sustainable business case.", "Customers or teams need access in a mobile-first context.", "A practical route to the right information or action.", "software-and-applications"],
  [Bot, "AI Automation", "Purposeful AI assistance that reduces repeatable work where it genuinely makes sense.", "Teams spend time on repeatable information tasks.", "More capacity for work that needs people.", "automation-and-ai"],
  [Workflow, "Workflow Automation", "Connected workflows that reduce unnecessary handoffs, repetition, and delays.", "Processes depend on manual follow-up.", "Smoother work across the business.", "automation-and-ai"],
  [LayoutPanelTop, "Business Management Systems", "Central systems shaped around the information and activity an operation needs to manage.", "Key business activity is difficult to coordinate.", "Better visibility and day-to-day control.", "business-systems-and-consulting"],
  [UsersRound, "CRM Systems", "Customer relationship systems that make important interactions easier to track and manage.", "Customer information is scattered or inconsistent.", "A more connected view of customer relationships.", "business-systems-and-consulting"],
  [CalendarCheck, "Booking & Reservation Systems", "Straightforward booking journeys tailored to the way appointments or reservations are handled.", "Booking is cumbersome for customers or teams.", "A simpler route from interest to confirmation.", "business-systems-and-consulting"],
  [SlidersHorizontal, "Digital Transformation", "A practical approach to improving the way the business operates through technology.", "Important work is held back by outdated ways of operating.", "A measured path to more capable operations.", "business-systems-and-consulting"],
  [BriefcaseBusiness, "Technology Consulting", "Clear guidance for business leaders making important technology decisions.", "Technology choices lack a clear business case.", "Confident decisions with a defined purpose.", "business-systems-and-consulting"],
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

const approach = [
  ["01", "Understand", "Learn how the business works and what needs to improve."],
  ["02", "Analyze", "Examine the underlying problem, context, and constraints."],
  ["03", "Recommend", "Identify the most appropriate path—not simply the most technical one."],
  ["04", "Implement", "Put the agreed solution into practical use."],
  ["05", "Improve", "Keep attention on what can work better over time."],
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

        <section className="service-intro section">
          <div className="container positioning-grid">
            <SectionEyebrow>Our services</SectionEyebrow>
            <div>
              <h2>Technology should fit the problem—not force the problem to fit.</h2>
              <p className="lead">
                From a stronger web presence to better-connected operations, each
                service is a means to a business outcome. Explore the relevant
                family for more detail, then start a conversation when the fit is clear.
              </p>
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
              {services.map(([Icon, title, summary, problem, outcome, slug], index) => (
                <article className="catalog-card" key={title}>
                  <div className="catalog-top">
                    <span className="number">{String(index + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{summary}</p>
                  <div className="catalog-detail"><span>Addresses</span><strong>{problem}</strong></div>
                  <div className="catalog-detail"><span>Creates</span><strong>{outcome}</strong></div>
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

        <section className="process section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>The ILBATECH approach</SectionEyebrow>
                <h2>A disciplined route from business need to better operation.</h2>
              </div>
            </div>
            <div className="process-grid process-grid--five">
              {approach.map(([number, title, copy]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
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
