import { ArrowRight, Check } from "lucide-react";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { SERVICE_AREAS } from "@/config/offerings";
import { getSitePath } from "@/config/site";

const problems = [
  "Disconnected tools and manual workarounds",
  "Technology decisions that lack a clear business case",
  "Processes that have become harder to manage as the business evolves",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <SectionEyebrow>Business-led technology consulting</SectionEyebrow>
              <h1>
                Technology should solve business problems, <em>not create more complexity.</em>
              </h1>
              <p className="hero-copy">
                ILBATECH helps businesses improve the way they operate through
                technology. We first understand the problem, then recommend what
                will genuinely create value.
              </p>
              <div className="hero-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href="/work" variant="secondary">View Our Work</Button>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="art-card">
                <span>ILBATECH</span>
                <div className="art-line" />
                <div className="art-line short" />
                <p>Clarity before complexity</p>
              </div>
            </div>
          </div>
        </section>

        <section className="positioning section">
          <div className="container positioning-grid">
            <SectionEyebrow>Our point of view</SectionEyebrow>
            <div>
              <h2>Better technology starts with a better understanding of the business.</h2>
              <p className="lead">
                Technology is only useful when it makes the business work better.
                ILBATECH brings a practical, business-first perspective to every
                conversation—helping leaders make considered decisions with a
                clear purpose.
              </p>
              <a className="text-link" href={getSitePath("/about")}>
                How we work <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>What we help with</SectionEyebrow>
                <h2>Technology with a clear role in your business.</h2>
              </div>
              <p>Explore four connected service families, each grounded in a business outcome.</p>
            </div>
            <div className="service-grid service-grid--four">
              {SERVICE_AREAS.map((service, index) => (
                <article className="service-card" key={service.slug}>
                  <span className="number">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                  <a
                    href={getSitePath(`/services/${service.slug}`)}
                    aria-label={`Explore ${service.title}`}
                  >
                    Explore service <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </article>
              ))}
            </div>
            <a className="section-link" href={getSitePath("/services")}>
              View all services <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </section>

        <section className="problems section">
          <div className="container problems-grid">
            <div>
              <SectionEyebrow>Where we add value</SectionEyebrow>
              <h2>When technology is getting in the way of progress.</h2>
            </div>
            <div>
              <p className="lead">
                Business challenges rarely arrive neatly packaged as technology
                problems. We help bring structure to the questions that matter most.
              </p>
              <ul>
                {problems.map((problem) => (
                  <li key={problem}>
                    <span><Check aria-hidden="true" size={15} /></span>
                    {problem}
                  </li>
                ))}
              </ul>
              <a className="inverse-link" href={getSitePath("/solutions")}>
                Explore business solutions <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="philosophy">
          <div className="container">
            <p>Our philosophy</p>
            <blockquote>
              “Good technology feels less like another thing to manage, and more
              like a natural way to do better work.”
            </blockquote>
          </div>
        </section>

        <section id="consultation" className="final-cta">
          <div className="container">
            <SectionEyebrow>Start a conversation</SectionEyebrow>
            <h2>Let’s find the right way forward.</h2>
            <p>
              Bring us the business challenge. We’ll help you make sense of the
              technology around it.
            </p>
            <Button href="/contact#contact-form">Start a Conversation</Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
