import type { Metadata } from "next";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cloud,
  Code2,
  Headphones,
  Mail,
  MessageCircleMore,
  PanelsTopLeft,
  Phone,
  Smartphone,
  Store,
  Workflow,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Button, SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";
import { getSitePath, SITE } from "@/config/site";
import { BUSINESS_SERVICES, V4_WORK } from "@/config/v4-content";

export const metadata: Metadata = {
  title: "Digital Solutions That Help Businesses Grow",
  description:
    "ILBATECH builds websites, business systems, mobile apps and AI automation tailored to how your business works.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Digital Solutions That Help Businesses Grow | ILBATECH",
    description:
      "Websites, business systems, mobile apps and AI automation built around your business.",
    url: "/",
  },
};

const serviceIcons = [PanelsTopLeft, Workflow, Smartphone, Bot, Headphones] as const;
const explanationPoints = [
  "Understand your needs",
  "Build the right solution",
  "Launch with confidence",
  "Support your growth",
] as const;

const siteUrl = `${SITE.productionUrl}/`;
const homepageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${siteUrl}#website`, name: SITE.name, url: siteUrl },
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: SITE.name,
      url: siteUrl,
      logo: `${siteUrl}icon.svg`,
      email: SITE.email,
      telephone: SITE.phoneDisplay,
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <main id="top">
        <section className="v4-hero">
          <div className="container v4-hero-grid">
            <div className="v4-hero-copy">
              <SectionEyebrow>Technology made useful</SectionEyebrow>
              <h1>Digital solutions that help businesses grow.</h1>
              <p>We build websites, business systems, mobile apps and AI automation tailored to how your business works.</p>
              <div className="hero-actions">
                <Button href="/work">Explore Our Work</Button>
                <Button href="#contact" variant="secondary">Tell Us What You Need</Button>
              </div>
            </div>

            <div className="digital-ecosystem" aria-label="A connected website, business system and mobile app illustration" role="img">
              <div className="ecosystem-orbit" aria-hidden="true" />
              <div className="ecosystem-laptop">
                <div className="ecosystem-bar"><i /><i /><i /></div>
                <div className="ecosystem-screen">
                  <span><PanelsTopLeft size={17} /> Business website</span>
                  <div><b /><b /><b /></div>
                </div>
                <span className="ecosystem-base" />
              </div>
              <div className="ecosystem-phone"><Smartphone aria-hidden="true" size={26} /><span>Mobile</span></div>
              <span className="ecosystem-node ecosystem-node--cloud"><Cloud size={20} /><i>Connected</i></span>
              <span className="ecosystem-node ecosystem-node--store"><Store size={20} /><i>Commerce</i></span>
              <span className="ecosystem-node ecosystem-node--flow"><Workflow size={20} /><i>Systems</i></span>
              <span className="ecosystem-node ecosystem-node--code"><Code2 size={20} /><i>Web apps</i></span>
            </div>
          </div>
        </section>

        <section className="v4-explanation section">
          <div className="container">
            <div className="v4-explanation-copy">
              <SectionEyebrow>Business first</SectionEyebrow>
              <h2>Technology built around your business.</h2>
              <p>ILBATECH helps businesses turn everyday challenges into practical digital solutions. Whether you need a professional website, a system to manage your operations, a mobile application, or automation that saves your team time, we design the solution around the way your business actually works.</p>
            </div>
            <ul className="v4-explanation-points">
              {explanationPoints.map((point) => <li key={point}><CheckCircle2 aria-hidden="true" size={21} />{point}</li>)}
            </ul>
          </div>
        </section>

        <section id="services" className="v4-services section">
          <div className="container">
            <div className="v4-section-heading">
              <SectionEyebrow>Services</SectionEyebrow>
              <h2>Solutions for your business</h2>
              <p>Clear, useful technology for the customer experience and the work behind it.</p>
            </div>
            <div className="v4-service-grid">
              {BUSINESS_SERVICES.map((service, index) => {
                const Icon = serviceIcons[index];
                return <article className="v4-service-card" key={service.title}>
                  <Icon aria-hidden="true" size={25} strokeWidth={1.5} />
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a href={getSitePath(service.href)}>Learn more <ArrowRight aria-hidden="true" size={16} /></a>
                </article>;
              })}
            </div>
          </div>
        </section>

        <section id="work" className="v4-work section">
          <div className="container">
            <div className="v4-section-heading">
              <SectionEyebrow>Interactive concepts</SectionEyebrow>
              <h2>Explore Our Work</h2>
              <p>Step directly into five working demos designed around real business needs.</p>
            </div>
            <div className="v4-work-grid">
              {V4_WORK.map((project, index) => <article className={`v4-work-card v4-work-card--${project.type}`} key={project.title}>
                <a className="v4-work-visual" href={getSitePath(project.href)} aria-label={`Explore ${project.title}`}>
                  <span className="v4-work-number">0{index + 1}</span>
                  <div className="v4-work-window"><i /><i /><i /><b /><b /></div>
                </a>
                <div>
                  <span>Interactive concept</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <a href={getSitePath(project.href)}>Explore Project <ArrowRight aria-hidden="true" size={16} /></a>
                </div>
              </article>)}
            </div>
          </div>
        </section>

        <section id="contact" className="v4-contact section">
          <div className="container v4-contact-heading">
            <SectionEyebrow>Let&apos;s talk</SectionEyebrow>
            <h2>Tell us what you need</h2>
            <p>Have a project idea or need help improving your business? Fill out the form and we&apos;ll get back to you as soon as possible.</p>
          </div>
          <div className="container v4-contact-grid">
            <div className="v4-contact-copy">
              <h3>We&apos;re here to help your business grow.</h3>
              <p>Whether you need a website, a system to manage your operations, a mobile app, or automation that saves time, we&apos;re ready to build the right solution for you.</p>
              <div className="v4-contact-links">
                <a href={`mailto:${SITE.email}`}><Mail aria-hidden="true" size={19} /><span><small>Email</small>{SITE.email}</span></a>
                <a href={`tel:+${SITE.whatsappDigits}`}><Phone aria-hidden="true" size={19} /><span><small>Phone</small>{SITE.phoneDisplay}</span></a>
                <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircleMore aria-hidden="true" size={19} /><span><small>WhatsApp</small>{SITE.phoneDisplay}</span></a>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
