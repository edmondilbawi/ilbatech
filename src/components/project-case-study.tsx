import { ArrowLeft, Check } from "lucide-react";
import { ProjectPreview } from "@/components/project-preview";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { getContactPath, getSitePath } from "@/config/site";
import type { WorkProject } from "@/config/work-projects";

export function ProjectCaseStudy({
  project,
  interactiveHref,
  conceptNote,
}: {
  project: WorkProject;
  interactiveHref?: string;
  conceptNote?: string;
}) {
  return (
    <>
      <SiteHeader />
      <main id="top" className={`case-study case-study--${project.slug}`}>
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
              <div className="case-hero-intro">
                <p className="hero-copy">{project.description}</p>
                {interactiveHref && (
                  <div className="case-demo-entry">
                    <Button href={interactiveHref}>{project.experienceLabel}</Button>
                    <p>Opens the front-end concept in a dedicated demo view.</p>
                  </div>
                )}
              </div>
            </div>
            <ProjectPreview project={project} size="detail" />
            {conceptNote && <p className="case-concept-note">{conceptNote}</p>}
          </div>
        </section>

        <section className="case-story section">
          <div className="container case-story-grid">
            <article>
              <SectionEyebrow>The business challenge</SectionEyebrow>
              <h2>{project.challengeTitle}</h2>
              <p>{project.businessNeed}</p>
            </article>
            <article>
              <SectionEyebrow>Thinking &amp; approach</SectionEyebrow>
              <h2>{project.approachTitle}</h2>
              <p>{project.approach}</p>
            </article>
          </div>
        </section>

        <section className={`case-decisions case-decisions--${project.slug} section`}>
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Key interface decisions</SectionEyebrow>
                <h2>A direction specific to this business context.</h2>
              </div>
              <p>
                The interface is shaped around the moments that matter most in
                this experience, not a reusable visual template.
              </p>
            </div>
            <div className="case-decision-grid">
              {project.interfaceDecisions.map((decision, index) => (
                <article key={decision.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{decision.title}</h3>
                  <p>{decision.description}</p>
                </article>
              ))}
            </div>
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
                Independent concept work created to demonstrate ILBATECH’s
                approach to real business needs.
              </p>
            </aside>
          </div>
        </section>

        <section className="case-visuals section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Interactive experience</SectionEyebrow>
                <h2>One connected system across screen sizes.</h2>
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
                <Button href={getContactPath(project.contactService)}>
                  Discuss a Similar Project
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
