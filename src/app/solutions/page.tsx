import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Eye,
  Globe2,
  RefreshCw,
  Settings2,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  Button,
  SectionEyebrow,
  SiteFooter,
  SiteHeader,
} from "@/components/site-shell";
import { SOLUTION_AREAS } from "@/config/offerings";
import { getSitePath } from "@/config/site";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Explore how ITG addresses customer experience, process automation, operational systems, and digital transformation challenges.",
  openGraph: {
    title: "Solutions | ITG",
    description: "Start with the problem. Find the right technology.",
  },
};

const problems = [
  [Workflow, "Inefficient operations", "Slow, disconnected processes can make everyday work harder than it needs to be.", "They can create delays, workarounds, and inconsistent ways of getting things done.", "We look at how work moves across the business before considering ways to simplify it.", "operational-systems"],
  [RefreshCw, "Manual repetitive work", "Routine tasks can take time away from work that benefits from human attention.", "Manual effort can make it harder to keep pace as day-to-day demands grow.", "We identify repeatable activity and assess whether automation would be useful.", "process-automation"],
  [UsersRound, "Poor customer management", "Customer details, conversations, and follow-ups may be hard to keep connected.", "Important context can be missed when information is scattered.", "We consider how customer information should be organized around the way teams work.", "operational-systems"],
  [Settings2, "Outdated systems", "Older or disconnected tools can make essential work feel unnecessarily difficult.", "Teams may rely on workarounds that limit visibility and consistency.", "We clarify what needs to change before recommending whether to improve, connect, or replace tools.", "digital-transformation"],
  [CalendarDays, "Difficult booking & reservations", "Manual booking processes can create friction for both customers and staff.", "Time is spent coordinating details that should be easier to manage.", "We examine the booking journey and the operational process behind it.", "customer-experience-and-growth"],
  [Globe2, "Weak online sales experience", "A website or store may not make it easy for customers to understand, enquire, or buy.", "The business can lose clarity and momentum at an important point of contact.", "We focus on the customer journey and the business purpose the experience needs to serve.", "customer-experience-and-growth"],
  [Eye, "Lack of operational visibility", "Key information may be spread across tools, spreadsheets, or individual teams.", "Decision-making becomes harder when the right context is not easy to see.", "We map the information that matters and how it needs to be managed.", "operational-systems"],
  [BarChart3, "Growth bottlenecks", "Ways of working that were manageable before can become limiting as the business changes.", "More activity can expose gaps in processes, systems, and coordination.", "We identify where technology is holding progress back—and where it is not.", "digital-transformation"],
  [Bot, "Digital modernization", "Manual or aging ways of working can make it difficult to adapt with confidence.", "The business may struggle to improve without adding more complexity.", "We create a practical path from the current reality to more effective digital systems.", "digital-transformation"],
] as const;

const flow = [
  ["Problem", "Understand what is actually happening."],
  ["Analysis", "Identify inefficiencies, limitations, and opportunities."],
  ["Recommendation", "Determine whether technology can genuinely create value."],
  ["Solution", "Recommend the appropriate technology."],
  ["Implementation", "Build and implement the solution."],
  ["Improvement", "Evaluate and improve over time."],
];

const consultingSteps = [
  ["01", "Understand", "Learn how the business works and what needs to improve."],
  ["02", "Analyze", "Examine the underlying problem, context, and constraints."],
  ["03", "Recommend", "Identify the most appropriate path—not simply the most technical one."],
  ["04", "Implement", "Put the agreed solution into practical use."],
  ["05", "Improve", "Keep attention on what can work better over time."],
];

export default function SolutionsPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="solutions-hero">
          <div className="container solutions-hero-grid">
            <div>
              <SectionEyebrow>Business solutions</SectionEyebrow>
              <h1>Start with the problem. <em>Find the right technology.</em></h1>
              <p className="hero-copy">
                ITG helps businesses identify operational challenges, understand
                where technology can create genuine value, and implement practical
                solutions without unnecessary complexity.
              </p>
              <div className="hero-actions">
                <Button href="/contact#contact-form">Start a Conversation</Button>
                <Button href="#solution-paths" variant="secondary">Explore Solutions</Button>
              </div>
            </div>
            <div className="solution-signal" aria-hidden="true">
              <span>01</span><div /><span>Business<br />clarity</span><i />
            </div>
          </div>
        </section>

        <section className="solutions-intro section">
          <div className="container positioning-grid">
            <SectionEyebrow>What we solve</SectionEyebrow>
            <div>
              <h2>Technology is most valuable when it responds to a real business need.</h2>
              <p className="lead">
                We do not begin with a product or platform. We begin by
                understanding what is making the business harder to operate, then
                explore the outcome-focused path that best fits the situation.
              </p>
            </div>
          </div>
        </section>

        <section id="solution-paths" className="solution-paths section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Solution paths</SectionEyebrow>
                <h2>Explore the outcome your business needs.</h2>
              </div>
              <p>Each path connects a business problem to the capabilities and next steps that may help.</p>
            </div>
            <div className="solution-path-grid">
              {SOLUTION_AREAS.map((solution, index) => (
                <article key={solution.slug}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{solution.title}</h3>
                  <p>{solution.summary}</p>
                  <a href={getSitePath(`/solutions/${solution.slug}`)}>
                    Explore this solution <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section problems-catalog">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>Business problems</SectionEyebrow>
                <h2>Challenges that deserve a clearer response.</h2>
              </div>
              <p>Start with the situation that feels familiar, then explore the closest solution path.</p>
            </div>
            <div className="problem-grid">
              {problems.map(([Icon, title, description, impact, approach, slug], index) => (
                <article className="problem-card" key={title}>
                  <div className="catalog-top">
                    <span className="number">{String(index + 1).padStart(2, "0")}</span>
                    <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className="problem-detail"><span>Potential impact</span><strong>{impact}</strong></div>
                  <div className="problem-detail"><span>Our approach</span><strong>{approach}</strong></div>
                  <a className="catalog-link" href={getSitePath(`/solutions/${slug}`)}>
                    Explore the solution <ArrowRight aria-hidden="true" size={16} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="method section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>From problem to progress</SectionEyebrow>
                <h2>A method that keeps the business need in view.</h2>
              </div>
              <p>Technology is considered only when it can genuinely support a better way of operating.</p>
            </div>
            <div className="solution-flow">
              {flow.map(([title, copy], index) => (
                <div className="flow-step" key={title}>
                  <div><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></div>
                  {index < flow.length - 1 && <ArrowDown className="flow-arrow" aria-hidden="true" size={21} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="right-solution">
          <div className="container right-solution-grid">
            <p className="right-solution-mark">ITG</p>
            <div>
              <SectionEyebrow>Our philosophy</SectionEyebrow>
              <h2>The right solution, <em>not the most complicated one.</em></h2>
              <p>
                The best solution is not necessarily the biggest, newest, or most
                expensive technology. It is the one that fits the business,
                simplifies the operation, and has a clear reason to exist.
              </p>
            </div>
          </div>
        </section>

        <section className="process section">
          <div className="container">
            <div className="section-heading">
              <div>
                <SectionEyebrow>The ITG consulting approach</SectionEyebrow>
                <h2>Clear steps, considered decisions.</h2>
              </div>
            </div>
            <div className="process-grid process-grid--five">
              {consultingSteps.map(([number, title, copy]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <SectionEyebrow>Start a conversation</SectionEyebrow>
            <h2>Let’s solve the right problem.</h2>
            <p>Tell us what is making your business harder to operate, and let’s explore whether technology can help.</p>
            <div className="hero-actions">
              <Button href="/contact#contact-form">Start a Conversation</Button>
              <Button href="/services" variant="secondary">Explore Services</Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
