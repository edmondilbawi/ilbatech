import {
  AppWindow,
  ArrowRight,
  Bot,
  Check,
  Globe2,
  MessageCircle,
  Network,
} from "lucide-react";
import { ProjectPreview } from "@/components/project-preview";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { getSitePath, SITE } from "@/config/site";
import { WORK_PROJECTS } from "@/config/work-projects";

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
              <div className="home-system-header">
                <span>Connected service flow</span>
                <i><b /><b /><b /></i>
              </div>
              <div className="home-system-context">
                <div className="home-system-stage home-system-stage--need">
                  <span>01 · Business need</span>
                  <strong>New customer enquiry</strong>
                  <small>Needs a clear next step</small>
                </div>
                <i className="home-system-connector" />
                <div className="home-system-stage home-system-stage--technology">
                  <Network size={18} strokeWidth={1.4} />
                  <span>02 · Practical technology</span>
                </div>
              </div>
              <div className="home-system-interface">
                <div className="home-system-toolbar">
                  <span><AppWindow size={13} /> Service workspace</span>
                  <small>Active flow</small>
                </div>
                <div className="home-system-enquiry">
                  <Globe2 size={17} />
                  <span><small>Website enquiry</small><strong>Consultation request</strong></span>
                  <b>Captured</b>
                </div>
                <div className="home-system-pipeline">
                  <span><i>1</i>Capture</span>
                  <b />
                  <span><i>2</i>Qualify</span>
                  <b />
                  <span><i>3</i>Assign</span>
                </div>
                <div className="home-system-modules">
                  <div>
                    <Bot size={15} />
                    <span><strong>Workflow update</strong><small>Assigned to the right owner</small></span>
                  </div>
                  <div>
                    <Check size={15} />
                    <span><strong>Next action</strong><small>Follow-up ready</small></span>
                  </div>
                </div>
              </div>
              <div className="home-system-stage home-system-stage--outcome">
                <span>03 · Useful outcome</span>
                <strong>Clear ownership. Faster response.</strong>
              </div>
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

            <div className="home-interface-evidence">
              <div className="home-work-projects-top">
                <span>Concept Project</span>
                <span>Interface evidence</span>
              </div>
              <nav aria-label="Selected concept project interfaces">
                {WORK_PROJECTS.map((project, index) => (
                  <a
                    href={getSitePath(`/work/${project.slug}`)}
                    key={project.slug}
                    aria-label={`Explore ${project.title}`}
                  >
                    <ProjectPreview project={project} size="fragment" />
                    <span className="home-evidence-label">
                      <i>{String(index + 1).padStart(2, "0")}</i>
                      <strong>{project.title}</strong>
                      <small>{project.category}</small>
                    </span>
                  </a>
                ))}
              </nav>
            </div>
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
