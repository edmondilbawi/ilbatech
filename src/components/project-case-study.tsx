import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { ProjectPreview } from "@/components/project-preview";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { SITE, getSitePath } from "@/config/site";
import type { WorkProject } from "@/config/work-projects";

export function ProjectCaseStudy({ project }: { project: WorkProject }) {
  return (
    <>
      <SiteHeader />
      <main id="top" className="case-study">
        <section className="case-hero">
          <div className="container">
            <a className="case-back-link" href={getSitePath("/work")}>
              <ArrowLeft aria-hidden="true" size={15} /> Selected Work
            </a>
            <div className="case-hero-copy">
              <div>
                <p className="case-label">Concept Project</p>
                <SectionEyebrow>{project.category}</SectionEyebrow>
                <h1>{project.title}</h1>
              </div>
              <p className="hero-copy">{project.description}</p>
            </div>
            <ProjectPreview project={project} size="detail" />
          </div>
        </section>

        <section className="case-story section">
          <div className="container case-story-grid">
            <article>
              <SectionEyebrow>The business need</SectionEyebrow>
              <h2>Start with what the experience needs to solve.</h2>
              <p>{project.businessNeed}</p>
            </article>
            <article>
              <SectionEyebrow>The approach</SectionEyebrow>
              <h2>Shape the technology around that need.</h2>
              <p>{project.approach}</p>
            </article>
          </div>
        </section>

        <section className="case-demonstrates section">
          <div className="container case-demonstrates-grid">
            <div>
              <SectionEyebrow>What the experience demonstrates</SectionEyebrow>
              <h2>Capability made visible in the interface.</h2>
              <ul className="case-capability-list">
                {project.demonstrates.map((item) => (
                  <li key={item}><Check aria-hidden="true" size={16} /> {item}</li>
                ))}
              </ul>
            </div>
            <aside className="case-technology" aria-labelledby="capability-area-title">
              <span>Technology / capability area</span>
              <h3 id="capability-area-title">A focused, connected delivery scope.</h3>
              <div>
                {project.capabilities.map((capability) => (
                  <span key={capability}>{capability}</span>
                ))}
              </div>
              <p>
                This is an interface concept, not a commissioned engagement or a
                claim of implemented business results.
              </p>
            </aside>
          </div>
        </section>

        <section className="case-visuals section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Visual experience</SectionEyebrow>
                <h2>Designed as one responsive system.</h2>
              </div>
              <p>
                Desktop and mobile views use the same hierarchy, visual language,
                and practical path through the experience.
              </p>
            </div>
            <div className="case-visual-grid">
              <ProjectPreview project={project} size="detail" />
              <ProjectPreview project={project} view="mobile" size="detail" />
            </div>
          </div>
        </section>

        <section className="case-cta">
          <div className="container case-cta-grid">
            <div>
              <SectionEyebrow>Have a similar project in mind?</SectionEyebrow>
              <h2>Start with the business need.</h2>
            </div>
            <div>
              <p>
                Tell ILBATECH what needs to work better. We&apos;ll help shape a
                practical technology direction around it.
              </p>
              <div className="case-cta-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href={SITE.whatsappUrl} variant="secondary">
                  <MessageCircle aria-hidden="true" size={17} /> Chat on WhatsApp
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
