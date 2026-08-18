import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ProjectPreview } from "@/components/project-preview";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { getSitePath } from "@/config/site";
import { WORK_PROJECTS } from "@/config/work-projects";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Explore four ILBATECH concept projects demonstrating practical approaches to healthcare, hospitality, e-commerce, business systems, and automation.",
  alternates: { canonical: "/work/" },
  openGraph: {
    title: "Selected Work | ILBATECH",
    description:
      "Interface-led concept work demonstrating practical, business-focused design and technology thinking.",
    url: "/work/",
  },
};

export default function WorkPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="work-hero work-hero--portfolio">
          <div className="container work-hero-grid">
            <div>
              <SectionEyebrow>Selected Work</SectionEyebrow>
              <h1>
                Business needs, explored through <em>design and technology.</em>
              </h1>
              <p className="hero-copy">
                Four concept projects showing how ILBATECH approaches realistic
                customer experiences, digital products, systems, and automation.
              </p>
              <p className="work-hero-disclosure">
                Independent concept work—not commissioned client work or evidence
                of commercial results.
              </p>
              <div className="hero-actions">
                <Button href="#projects">Explore the Work</Button>
                <Button href="/contact#contact-form" variant="secondary">
                  Start a Conversation
                </Button>
              </div>
            </div>
            <aside className="work-signal" aria-label="Portfolio approach">
              <span>Concept projects</span>
              <p>Business need</p>
              <i aria-hidden="true" />
              <p>Interface direction</p>
              <i aria-hidden="true" />
              <p>Practical system</p>
            </aside>
          </div>
        </section>

        <section id="projects" className="work-projects section">
          <div className="container work-project-list">
            {WORK_PROJECTS.map((project, index) => (
              <article
                className={`work-project work-project--${project.slug}`}
                key={project.slug}
              >
                <div className="work-project-copy">
                  <div className="work-project-meta">
                    <span>Concept Project</span>
                    <span>{project.category}</span>
                  </div>
                  <span className="work-project-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2>{project.title}</h2>
                  <p>{project.summary}</p>
                  <a
                    className="work-project-link"
                    href={getSitePath(`/work/${project.slug}`)}
                  >
                    {project.experienceLabel} <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </div>
                <a
                  className="work-project-preview-link"
                  href={getSitePath(`/work/${project.slug}`)}
                  aria-label={`View ${project.title}`}
                >
                  <ProjectPreview project={project} />
                </a>
              </article>
            ))}
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
