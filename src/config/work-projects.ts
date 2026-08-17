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
      "An interactive, trust-focused healthcare experience that makes services, specialist discovery, and appointment requests easy to understand.",
    description:
      "A responsive clinic website concept with service discovery, fictional specialist profiles, and a complete front-end appointment request demonstration.",
    businessNeed:
      "A private clinic needs to establish professional trust quickly while helping prospective patients understand available care and take the next step without confusion. The experience must balance warmth, clarity, privacy awareness, and practical contact options across every screen size.",
    approach:
      "Begin with the questions patients need answered, then structure the experience around services, specialist presentation, reassurance, and appointment intent. The interactive flow validates only the sample contact details needed to demonstrate a request, never asks for health information, and does not transmit or store data.",
    demonstrates: [
      "Responsive healthcare homepage and mobile navigation",
      "Interactive service discovery and selection",
      "Clearly fictional specialist browsing and profiles",
      "Six-step appointment request demonstration",
      "Front-end validation and confirmation state",
      "Accessible, privacy-conscious interaction design",
    ],
    capabilities: ["Web development", "Healthcare UX", "Interactive forms", "Responsive design", "Accessible front-end"],
    visualDescription:
      "a calm healthcare homepage, consultation cards, physician presentation, and mobile appointment path",
  },
  {
    slug: "cafe-restaurant-website",
    title: "Café & Restaurant Website",
    category: "Hospitality",
    summary:
      "A warm, editorial hospitality experience with interactive menu discovery, practical visit details, and a simple local-only table request demonstration.",
    description:
      "A responsive café and restaurant concept where guests can search and filter the menu, explore dish details, understand the atmosphere, and demonstrate a table request without transmitting data.",
    businessNeed:
      "A café or restaurant website needs to communicate atmosphere and offering in seconds, then make practical information effortless to find. Menu discovery, opening times, location, and contact actions matter most on mobile, often when a guest is already deciding where to go.",
    approach:
      "Use a warm editorial rhythm without letting decoration compete with useful information. Keyboard-friendly categories, active-menu search, dietary indicators, and expandable dish details make discovery practical, while a short table-request flow validates sample details locally and never sends or stores them.",
    demonstrates: [
      "Responsive hospitality homepage and mobile navigation",
      "Keyboard-friendly menu categories and active-menu search",
      "Dietary filtering, featured items, and expandable dish details",
      "Simple table-request validation, review, and confirmation states",
      "Clearly labeled demonstration hours, location, and contact information",
      "Warm editorial interface across desktop, tablet, and mobile",
    ],
    capabilities: ["Web development", "Hospitality UX", "Interactive menu", "Accessible filtering", "Responsive front-end"],
    visualDescription:
      "a warm editorial restaurant homepage, interactive menu cards, table request interface, and mobile guest journey",
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
