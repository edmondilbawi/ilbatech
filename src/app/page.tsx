import {
  AppWindow,
  ArrowRight,
  Bot,
  Globe2,
  MessageCircle,
  Network,
} from "lucide-react";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { getSitePath, SITE } from "@/config/site";

const capabilities = [
  {
    title: "Web Development",
    description:
      "Clear, credible websites and commerce experiences built around audience needs and business goals.",
    href: "/services/websites-and-commerce",
    Icon: Globe2,
  },
  {
    title: "Business Systems",
    description:
      "Practical systems that bring workflows, information, and everyday decisions into better order.",
    href: "/services/business-systems-and-consulting",
    Icon: Network,
  },
  {
    title: "AI & Automation",
    description:
      "Purposeful automation that reduces repeatable work while keeping people in control.",
    href: "/services/automation-and-ai",
    Icon: Bot,
  },
  {
    title: "Digital Products",
    description:
      "Focused web and software products shaped around a useful task, service, or operational need.",
    href: "/services/software-and-applications",
    Icon: AppWindow,
  },
] as const;

const process = [
  {
    number: "01",
    title: "Understand",
    description: "Learn the business problem, the people involved, and what the solution needs to achieve.",
  },
  {
    number: "02",
    title: "Build",
    description: "Design and implement the technology that fits the need without avoidable complexity.",
  },
  {
    number: "03",
    title: "Improve",
    description: "Test, refine, and prepare the solution to work reliably in practical use.",
  },
] as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="home-hero">
          <div className="container home-hero-grid">
            <div className="home-hero-content">
              <SectionEyebrow>Practical technology for business</SectionEyebrow>
              <h1>
                Technology should solve business problems, <em>not create more complexity.</em>
              </h1>
              <p className="hero-copy home-hero-copy">
                ILBATECH builds practical digital products and technology solutions
                that help businesses operate, serve customers, and move forward
                with clarity.
              </p>
              <div className="hero-actions home-hero-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href="/work" variant="secondary">View Our Work</Button>
              </div>
            </div>

            <div className="home-hero-visual" aria-hidden="true">
              <div className="home-grid-plane" />
              <div className="home-signal home-signal--need">
                <span>01</span>
                <strong>Business need</strong>
              </div>
              <div className="home-signal home-signal--outcome">
                <span>03</span>
                <strong>Useful outcome</strong>
              </div>
              <div className="home-technology-core">
                <span>02</span>
                <Network size={32} strokeWidth={1.3} />
                <strong>Practical technology</strong>
              </div>
              <i className="home-connection home-connection--one" />
              <i className="home-connection home-connection--two" />
            </div>
          </div>
        </section>

        <section className="home-capabilities section">
          <div className="container">
            <div className="section-heading home-section-heading">
              <div>
                <SectionEyebrow>What we build</SectionEyebrow>
                <h2>Connected capabilities for practical business needs.</h2>
              </div>
              <p>
                From the customer-facing experience to the systems and automation
                behind it, every capability has a clear role.
              </p>
            </div>

            <div className="home-capability-grid">
              {capabilities.map(({ title, description, href, Icon }, index) => (
                <a
                  className="home-capability-card"
                  href={getSitePath(href)}
                  key={title}
                  aria-label={`Explore ${title}`}
                >
                  <div className="home-capability-top">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden="true" size={23} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="home-card-link">
                    Explore capability <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </a>
              ))}
            </div>

            <a className="section-link" href={getSitePath("/services")}>
              View All Services <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </section>

        <section className="home-work section">
          <div className="container home-work-grid">
            <div className="home-work-copy">
              <SectionEyebrow>Selected Work</SectionEyebrow>
              <h2>See the thinking behind the technology.</h2>
              <p className="lead">
                Explore how ILBATECH approaches realistic business needs across
                web experiences, digital products, systems, and automation.
              </p>
              <p className="home-work-disclosure">
                The collection is independent concept work—not commissioned client
                work or evidence of commercial results.
              </p>
              <a className="section-link" href={getSitePath("/work")}>
                Explore Selected Work <ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>

            <aside className="home-work-preview" aria-label="Selected Work direction">
              <div className="home-work-preview-top">
                <span>Concept project space</span>
                <span>ILBATECH / Work</span>
              </div>
              <div className="home-work-preview-center">
                <span>Business need</span>
                <strong>Considered digital direction</strong>
              </div>
              <div className="home-work-preview-focus">
                <span>Web</span>
                <span>Products</span>
                <span>Systems</span>
                <span>Automation</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="home-process section">
          <div className="container">
            <div className="section-heading home-process-heading">
              <div>
                <SectionEyebrow>How we work</SectionEyebrow>
                <h2>Clarity first. Technology second.</h2>
              </div>
              <p>
                A focused path from understanding the real need to delivering
                something useful in practice.
              </p>
            </div>

            <ol className="home-process-grid">
              {process.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="consultation" className="home-conversion">
          <div className="container home-conversion-grid">
            <div>
              <SectionEyebrow>Start a conversation</SectionEyebrow>
              <h2>Bring us the business challenge.</h2>
            </div>
            <div>
              <p>
                We&apos;ll help make sense of the technology around it and identify a
                practical way forward.
              </p>
              <div className="home-conversion-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href={SITE.whatsappUrl} variant="secondary">
                  <MessageCircle aria-hidden="true" size={17} />
                  WhatsApp {SITE.phoneDisplay}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
