import type { Metadata } from "next";
import { Check, Eye, Handshake, Lightbulb, Scale, ShieldCheck } from "lucide-react";
import { Button, SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how ILBATECH approaches technology: understanding the business first, then recommending practical solutions.",
  openGraph: { title: "About ILBATECH", description: "Technology starts with understanding." },
};

const principles = [
  [Handshake, "Build long-term relationships", "We aim for relationships that extend beyond a single project, grounded in useful conversations and ongoing care."],
  [Lightbulb, "Recommend what the business actually needs", "Technology should be selected for the problem at hand—not because a particular option happens to be popular."],
  [Scale, "Never overpromise", "We set realistic expectations and speak clearly about what technology can—and cannot—help achieve."],
  [ShieldCheck, "Professional, honest & transparent", "Clients should understand what is recommended, why it is recommended, and what implementation involves."],
  [Eye, "Solve business problems through technology", "Technology is the tool. The business problem is always the starting point."],
] as const;

const steps = [["01", "Understand", "Learn how the business works, what matters, and where challenges are being felt."], ["02", "Analyze", "Look beneath the surface to identify inefficiencies, limitations, and opportunities."], ["03", "Recommend", "Set out a technology path only where it has a clear reason to create value."], ["04", "Implement", "Put the agreed solution into practice with professional care and clear communication."], ["05", "Improve", "Keep the focus on what can work better as needs and circumstances evolve."]];
const expectations = ["Clear communication throughout the conversation", "Practical recommendations connected to business needs", "Transparent discussions about scope and technology", "Professional implementation with attention to the details", "Long-term thinking rather than unnecessary complexity"];
export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="about-hero">
          <div className="container about-hero-grid">
            <div>
              <SectionEyebrow>About ILBATECH</SectionEyebrow>
              <h1>
                Technology starts with <em>understanding.</em>
              </h1>
              <p className="hero-copy">
                ILBATECH helps businesses make better use of technology by first
                understanding how the business works, where challenges exist,
                and where technology can genuinely create value.
              </p>
              <div className="hero-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href="#about-approach" variant="secondary">
                  Explore Our Approach
                </Button>
              </div>
            </div>
            <div className="about-mark" aria-hidden="true">
              <span>ILBATECH</span>
              <p>
                Listen.
                <br />
                Think.
                <br />
                <i>Then build.</i>
              </p>
            </div>
          </div>
        </section>

        <section className="principles section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Our philosophy</SectionEyebrow>
                <h2>How we show up in every conversation.</h2>
              </div>
              <p>
                Trust is built through clarity, sound judgement, and attention
                to what the business actually needs.
              </p>
            </div>
            <div className="principle-grid">
              {principles.map(([Icon, title, copy], index) => (
                <article key={title}>
                  <div className="catalog-top">
                    <span className="number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="thinking section">
          <div className="container">
            <SectionEyebrow>How ILBATECH thinks</SectionEyebrow>
            <h2>
              Start with the business, <em>not the technology.</em>
            </h2>
            <div className="thinking-grid">
              <article className="thinking-card thinking-card--muted">
                <span>Technology-first</span>
                <blockquote>“Here is what we can build.”</blockquote>
                <p>
                  The conversation begins with a product, platform, or
                  capability.
                </p>
              </article>
              <div className="thinking-divider" aria-hidden="true">
                →
              </div>
              <article className="thinking-card thinking-card--primary">
                <span>Business-first</span>
                <blockquote>
                  “What is making your business harder to operate, and can
                  technology help?”
                </blockquote>
                <p>
                  This is where ILBATECH begins: with the business context and the
                  problem worth solving.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="about-approach" className="process section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Our approach</SectionEyebrow>
                <h2>Clear steps, considered decisions.</h2>
              </div>
            </div>
            <div className="process-grid process-grid--five">
              {steps.map(([number, title, copy]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="expectations section">
          <div className="container problems-grid">
            <div>
              <SectionEyebrow>What to expect</SectionEyebrow>
              <h2>A professional relationship built on clarity.</h2>
            </div>
            <div>
              <p className="lead">
                Good technology work should feel understandable and considered
                at every stage. That is the standard we aim to bring to each
                engagement.
              </p>
              <ul>
                {expectations.map((item) => (
                  <li key={item}>
                    <span>
                      <Check aria-hidden="true" size={15} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <SectionEyebrow>Start a conversation</SectionEyebrow>
            <h2>Let’s build what your business actually needs.</h2>
            <p>
              Have a business challenge you&apos;d like to solve? Let&apos;s
              start by understanding the problem.
            </p>
            <div className="hero-actions">
              <Button href="/contact#contact-form">Start a Conversation</Button>
              <Button href="/services" variant="secondary">
                Explore Services
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
