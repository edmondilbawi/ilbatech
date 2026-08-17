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

const process = [
  ["01", "Understand", "We start by listening: your objectives, constraints, teams, and the work that needs to improve."],
  ["02", "Clarify", "Together, we identify the problem worth solving and define what a valuable outcome looks like."],
  ["03", "Recommend", "We shape a clear, considered technology path based on fit, not fashion."],
  ["04", "Move forward", "You leave with practical direction and the confidence to take the next step."],
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
                <Button href="/solutions" variant="secondary">Explore Solutions</Button>
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
              <a className="text-link" href="#approach">
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

        <section id="approach" className="process section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>The ILBATECH process</SectionEyebrow>
                <h2>A considered path from question to clarity.</h2>
              </div>
            </div>
            <div className="process-grid">
              {process.map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-itg" className="why section">
          <div className="container why-grid">
            <div className="why-visual">
              <span>ILBATECH</span>
              <p>Business<br />before<br /><i>technology.</i></p>
            </div>
            <div>
              <SectionEyebrow>Why ILBATECH</SectionEyebrow>
              <h2>Advice that stays anchored in what matters.</h2>
              <p className="lead">
                The right answer is not always the newest platform or the most
                elaborate solution. Our role is to help you see the opportunity
                clearly and choose technology that supports the way your business
                needs to move.
              </p>
              <div className="principle-summary">
                <div><strong>Business-led</strong><p>Every recommendation begins with the business case.</p></div>
                <div><strong>Clear-minded</strong><p>We make complex decisions easier to navigate.</p></div>
              </div>
              <a className="text-link" href={getSitePath("/about")}>
                Learn about ILBATECH <ArrowRight aria-hidden="true" size={16} />
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
