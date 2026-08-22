import type { Metadata } from "next";
import { ArrowRight, Bot, Headphones, PanelsTopLeft, Smartphone, Workflow } from "lucide-react";
import { Button, SectionEyebrow, SiteFooter, SiteHeader } from "@/components/site-shell";
import { getSitePath } from "@/config/site";
import { BUSINESS_SERVICES } from "@/config/v4-content";

export const metadata: Metadata = {
  title: "Business Technology Services",
  description: "Websites, business systems, mobile apps, AI automation, support and maintenance built around your business.",
  alternates: { canonical: "/services/" },
  openGraph: {
    title: "Business Technology Services | ILBATECH",
    description: "Practical digital solutions built around the way your business works.",
    url: "/services/",
  },
};

const icons = [PanelsTopLeft, Workflow, Smartphone, Bot, Headphones] as const;
const capabilityLists = [
  ["Professional websites", "Responsive web apps", "E-commerce experiences", "Customer-facing digital experiences"],
  ["Customer and order management", "Inventory systems", "Project and operations systems", "Business dashboards"],
  ["iOS and Android experiences", "Customer apps", "Internal employee apps", "Mobile ordering and services"],
  ["Repetitive task automation", "Workflow automation", "Reporting and notifications", "AI-assisted processes"],
  ["Post-launch support", "Technical maintenance", "Bug fixes and updates", "Ongoing improvement"],
] as const;

export default function ServicesPage() {
  return <>
    <SiteHeader />
    <main id="top">
      <section className="v4-page-hero">
        <div className="container">
          <SectionEyebrow>Services</SectionEyebrow>
          <h1>Solutions for your business</h1>
          <p>From the experience your customers see to the systems your team uses every day, ILBATECH builds practical technology that has a clear job to do.</p>
          <Button href="/contact#contact-form">Tell Us What You Need</Button>
        </div>
      </section>
      <section className="v4-services-page section">
        <div className="container v4-services-list">
          {BUSINESS_SERVICES.map((service, index) => {
            const Icon = icons[index];
            return <article key={service.title}>
              <div className="v4-service-index"><span>0{index + 1}</span><Icon aria-hidden="true" size={27} strokeWidth={1.4} /></div>
              <div>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <ul>{capabilityLists[index].map((item) => <li key={item}>{item}</li>)}</ul>
                <a href={getSitePath(service.href)}>Learn more <ArrowRight aria-hidden="true" size={16} /></a>
              </div>
            </article>;
          })}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
