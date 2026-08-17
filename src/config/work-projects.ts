export type WorkProject = {
  slug:
    | "private-clinic-website"
    | "cafe-restaurant-website"
    | "premium-ecommerce-store"
    | "business-operations-dashboard";
  title: string;
  category: string;
  summary: string;
  description: string;
  businessNeed: string;
  approach: string;
  demonstrates: readonly string[];
  capabilities: readonly string[];
  visualDescription: string;
};

export const WORK_PROJECTS: readonly WorkProject[] = [
  {
    slug: "private-clinic-website",
    title: "Private Clinic Website",
    category: "Healthcare",
    summary:
      "A calm, trust-focused healthcare experience that makes services, physician expertise, and appointment paths easy to understand.",
    description:
      "A responsive clinic website concept shaped around patient confidence, clear treatment information, and a direct route to enquiry or appointment.",
    businessNeed:
      "A private clinic needs to establish professional trust quickly while helping prospective patients understand available care and take the next step without confusion. The experience must balance warmth, clarity, privacy awareness, and practical contact options across every screen size.",
    approach:
      "Begin with the questions patients need answered, then structure the experience around services, physician presentation, reassurance, and appointment intent. The interface keeps navigation simple, makes key information easy to scan, and gives the primary action consistent prominence without feeling overly promotional.",
    demonstrates: [
      "Premium healthcare homepage and service hierarchy",
      "Treatment and consultation discovery",
      "Professional physician presentation",
      "Clear appointment and contact pathways",
      "Trust-focused responsive experience",
      "Accessible content and interaction structure",
    ],
    capabilities: ["Web development", "UX and content structure", "Responsive design", "Appointment journey"],
    visualDescription:
      "a calm healthcare homepage, consultation cards, physician presentation, and mobile appointment path",
  },
  {
    slug: "cafe-restaurant-website",
    title: "Café & Restaurant Website",
    category: "Hospitality",
    summary:
      "A warm, editorial hospitality website that brings the menu, atmosphere, opening details, and visit planning into one mobile-first journey.",
    description:
      "A visually rich hospitality concept designed to help guests discover the menu, understand the experience, and find the practical details needed to visit.",
    businessNeed:
      "A café or restaurant website needs to communicate atmosphere and offering in seconds, then make practical information effortless to find. Menu discovery, opening times, location, and contact actions matter most on mobile, often when a guest is already deciding where to go.",
    approach:
      "Use a strong visual rhythm without letting decoration compete with useful information. Menu categories and featured items lead naturally into hours, location, and contact, while a compact mobile navigation keeps the most common guest actions close at hand.",
    demonstrates: [
      "Editorial hospitality homepage",
      "Menu categories and featured item presentation",
      "Opening, location, and contact information",
      "Mobile-first guest navigation",
      "Responsive content hierarchy",
      "Distinctive interface art direction",
    ],
    capabilities: ["Web development", "Art direction", "Menu experience", "Mobile-first UX"],
    visualDescription:
      "an editorial restaurant homepage, menu categories, featured dishes, and mobile visit information",
  },
  {
    slug: "premium-ecommerce-store",
    title: "Premium E-Commerce Store",
    category: "E-Commerce",
    summary:
      "A refined storefront concept that supports collection browsing, product discovery, product detail, and a clear cart path.",
    description:
      "A responsive commerce experience that uses restrained presentation and purposeful interaction to make products easier to discover and evaluate.",
    businessNeed:
      "A premium online store must express product quality while keeping shopping decisions straightforward. Customers need to move easily from collection discovery to product detail and cart, with useful information and clear interaction patterns on desktop and mobile.",
    approach:
      "Build the visual system around product discovery rather than decoration alone. Collections create orientation, product cards support comparison, and the detail experience gives imagery, options, information, and cart action an intentional hierarchy.",
    demonstrates: [
      "Premium storefront and collection structure",
      "Product search and discovery patterns",
      "Product detail presentation",
      "Cart interaction concept",
      "Responsive shopping navigation",
      "Commerce-focused component system",
    ],
    capabilities: ["E-commerce UX", "Product discovery", "Interface systems", "Responsive front-end"],
    visualDescription:
      "a premium storefront, product collection, product detail area, and mobile shopping path",
  },
  {
    slug: "business-operations-dashboard",
    title: "Business Operations Dashboard",
    category: "Business Systems & Automation",
    summary:
      "A software-oriented workspace concept for coordinating projects, client records, tasks, workflows, reporting, and assisted actions.",
    description:
      "A concept operations system that brings active work, responsibilities, status, and automation cues into one coherent interface.",
    businessNeed:
      "Growing operations can become difficult to coordinate when project information, client records, tasks, and process status are spread across tools. Teams need a dependable shared view without turning routine work into another complicated system to manage.",
    approach:
      "Start with the decisions and handoffs the team needs to manage, then shape dashboards and workflows around those moments. Status is visible without relying on invented performance claims, automation cues remain explainable, and AI assistance is framed as a reviewed workflow aid rather than an autonomous promise.",
    demonstrates: [
      "Operational dashboard and project views",
      "Client records and task coordination",
      "Workflow and status indicators",
      "Operational reporting interface",
      "Automation cues and approval paths",
      "Human-reviewed AI assistance concept",
    ],
    capabilities: ["Business systems", "Product design", "Workflow automation", "AI-assisted operations"],
    visualDescription:
      "an operations dashboard with project status, task workflows, reporting views, and a reviewed AI-assistance cue",
  },
];

export function getWorkProject(slug: string) {
  return WORK_PROJECTS.find((project) => project.slug === slug);
}
