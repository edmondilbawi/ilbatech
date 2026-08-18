import type { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  Globe2,
} from "lucide-react";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { SERVICE_AREAS } from "@/config/offerings";
import { getContactPath, getSitePath } from "@/config/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore ILBATECH services for websites, commerce, software, applications, automation, AI, business systems, and technology consulting.",
  openGraph: {
    title: "Services | ILBATECH",
    description: "Technology services built around the way your business needs to work.",
  },
};

const serviceIcons = [Globe2, Code2, Bot, BriefcaseBusiness] as const;

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
            <div className="services-catalog services-catalog--primary">
              {SERVICE_AREAS.map((service, index) => {
                const Icon = serviceIcons[index] ?? BriefcaseBusiness;

                return (
                  <article
                    className="catalog-card service-group-card"
                    key={service.slug}
                  >
                    <div className="catalog-top">
                      <span className="number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                    </div>
                    <span className="service-group-eyebrow">
                      {service.eyebrow}
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.summary}</p>
                    <ul aria-label={`${service.title} capabilities`}>
                      {service.capabilities.slice(0, 3).map((capability) => (
                        <li key={capability}>{capability}</li>
                      ))}
                    </ul>
                    <a
                      className="catalog-link"
                      href={getSitePath(`/services/${service.slug}`)}
                    >
                      Explore {service.title}{" "}
                      <ArrowRight aria-hidden="true" size={16} />
                    </a>
                  </article>
                );
              })}
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
            <SectionEyebrow>Not sure which direction fits?</SectionEyebrow>
            <h2>Tell us what you&apos;re trying to improve.</h2>
            <p>Start with the business need. We&apos;ll help identify the most useful next step—including when the answer is less technology, not more.</p>
            <Button href={getContactPath("Not sure, I need advice")}>Describe the Challenge</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
