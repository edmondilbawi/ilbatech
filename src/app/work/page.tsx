import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button, SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";
import { getSitePath } from "@/config/site";
import { V4_WORK } from "@/config/v4-content";

export const metadata: Metadata = {
  title: "Interactive Work",
  description: "Explore five interactive ILBATECH concept projects for dashboards, restaurant ordering, inventory, travel and e-commerce.",
  alternates: { canonical: "/work/" },
  openGraph: {
    title: "Interactive Work | ILBATECH",
    description: "Step into practical digital products built around real business needs.",
    url: "/work/",
  },
};

export default function WorkPage() {
  return <>
    <SiteHeader />
    <main id="top">
      <section className="v4-page-hero">
        <div className="container">
          <SectionEyebrow>Interactive work</SectionEyebrow>
          <h1>See what the right technology can do.</h1>
          <p>Explore five working concepts. Each project opens directly into an interactive demo so you can experience it for yourself.</p>
          <Button href="#projects">Explore Our Work</Button>
        </div>
      </section>
      <section id="projects" className="v4-work-page section">
        <div className="container v4-work-grid">
          {V4_WORK.map((project, index) => <article className={`v4-work-card v4-work-card--${project.type}`} key={project.title}>
            <a className="v4-work-visual" href={getSitePath(project.href)} aria-label={`Explore ${project.title}`}>
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                unoptimized
                sizes="(min-width: 920px) 31vw, (min-width: 680px) 47vw, 100vw"
              />
              <span className="v4-work-number">0{index + 1}</span>
            </a>
            <div>
              <span>Interactive concept</span>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <a href={getSitePath(project.href)}>Explore Project <ArrowRight aria-hidden="true" size={16} /></a>
            </div>
          </article>)}
        </div>
      </section>
      <section className="final-cta"><div className="container"><SectionEyebrow>Your idea</SectionEyebrow><h2>What could we build for your business?</h2><p>Tell us what needs to work better and we&apos;ll help shape the right solution.</p><Button href="/contact#contact-form">Let&apos;s Talk</Button></div></section>
    </main>
    <SiteFooter />
  </>;
}
