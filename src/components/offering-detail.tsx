import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheckBig,
} from "lucide-react";
import type { Offering } from "@/config/offerings";
import { getContactPath, getSitePath } from "@/config/site";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";

type OfferingDetailProps = {
  offering: Offering;
  kind: "service" | "solution";
};

export function OfferingDetail({ offering, kind }: OfferingDetailProps) {
  const collectionPath = kind === "service" ? "/services" : "/solutions";
  const collectionLabel = kind === "service" ? "All services" : "All solutions";
  const contactPath = getContactPath(offering.googleService);

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="detail-hero">
          <div className="container detail-hero-grid">
            <div>
              <a className="back-link" href={getSitePath(collectionPath)}>
                <ArrowLeft aria-hidden="true" size={15} /> {collectionLabel}
              </a>
              <SectionEyebrow>{offering.eyebrow}</SectionEyebrow>
              <h1>{offering.title}</h1>
              <p className="hero-copy">{offering.summary}</p>
              <div className="hero-actions">
                <Button href={contactPath}>Discuss Your Project</Button>
                <Button href="#how-itg-helps" variant="secondary">
                  See How ILBATECH Can Help
                </Button>
              </div>
            </div>
            <aside className="detail-signal" aria-label="ILBATECH approach">
              <span>{kind === "service" ? "Service" : "Solution"}</span>
              <p>Business need</p>
              <ArrowRight aria-hidden="true" size={19} />
              <p>Practical technology</p>
              <ArrowRight aria-hidden="true" size={19} />
              <p>Useful outcome</p>
            </aside>
          </div>
        </section>

        <section className="detail-intro section">
          <div className="container positioning-grid">
            <SectionEyebrow>What it is</SectionEyebrow>
            <div>
              <h2>Technology with a clear reason to exist.</h2>
              <p className="lead">{offering.introduction}</p>
            </div>
          </div>
        </section>

        <section className="detail-problems section">
          <div className="container detail-two-column">
            <div>
              <SectionEyebrow>The business problem</SectionEyebrow>
              <h2>Start with what needs to work better.</h2>
              <p className="lead">{offering.problemStatement}</p>
            </div>
            <div className="detail-list-card">
              <h3>Common starting points</h3>
              <ul>
                {offering.commonProblems.map((problem) => (
                  <li key={problem}>
                    <Check aria-hidden="true" size={16} />
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="how-itg-helps" className="detail-capabilities section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>How ILBATECH can help</SectionEyebrow>
                <h2>Shape the right response around the business.</h2>
              </div>
              <p>
                Scope is determined through discovery. These capabilities can be
                combined only where they support the required outcome.
              </p>
            </div>
            <div className="capability-grid">
              {offering.capabilities.map((capability, index) => (
                <article key={capability}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{capability}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-fit section">
          <div className="container detail-two-column">
            <div>
              <SectionEyebrow>Who it is for</SectionEyebrow>
              <h2>A fit when the need is clear enough to examine.</h2>
              <p>
                You do not need to arrive with a technical specification. A
                useful conversation can begin with the business situation.
              </p>
            </div>
            <ul className="fit-list">
              {offering.whoFor.map((item) => (
                <li key={item}>
                  <CircleCheckBig aria-hidden="true" size={19} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="detail-outcomes section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Business outcomes</SectionEyebrow>
                <h2>What a well-fitted solution can create.</h2>
              </div>
            </div>
            <div className="outcome-grid">
              {offering.outcomes.map((outcome, index) => (
                <article key={outcome}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{outcome}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-approach section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>The ILBATECH approach</SectionEyebrow>
                <h2>Understand, decide, and implement with purpose.</h2>
              </div>
              <p>
                The path stays proportionate to the problem and transparent at
                each decision point.
              </p>
            </div>
            <div className="process-grid">
              {offering.approach.map((step, index) => (
                <article key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{["Understand", "Assess", "Shape", "Implement"][index]}</h3>
                  <p>{step}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="related-offerings section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Continue exploring</SectionEyebrow>
                <h2>Related ways ILBATECH can help.</h2>
              </div>
            </div>
            <div className="related-grid">
              {offering.relatedLinks.map((link) => (
                <article key={link.href}>
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                  <a href={getSitePath(link.href)}>
                    Explore this area <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <SectionEyebrow>Start a conversation</SectionEyebrow>
            <h2>Bring the business need. We’ll start there.</h2>
            <p>
              Tell ILBATECH what needs to work better. The contact form will
              preselect the closest service category for this conversation.
            </p>
            <div className="hero-actions">
              <Button href={contactPath}>Discuss Your Project</Button>
              <Button href={collectionPath} variant="secondary">
                {collectionLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
