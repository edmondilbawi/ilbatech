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
  experienceLabel: string;
  demoPath: string;
  contactService: "Website Development" | "E-Commerce" | "AI & Task Automation";
  relatedService: {
    href: string;
    label: string;
  };
  conceptNote: string;
  businessNeed: string;
  challengeTitle: string;
  approach: string;
  approachTitle: string;
  interfaceDecisions: readonly {
    title: string;
    description: string;
  }[];
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
    experienceLabel: "Explore the Clinic Experience",
    demoPath: "/work/private-clinic-website/demo",
    contactService: "Website Development",
    relatedService: {
      href: "/services/websites-and-commerce",
      label: "website development services",
    },
    conceptNote:
      "Built by ILBATECH with clear service information, accessible specialist browsing, and privacy-conscious appointment requests.",
    businessNeed:
      "A private clinic needs to establish professional trust quickly while helping prospective patients understand available care and take the next step without confusion. The experience must balance warmth, clarity, privacy awareness, and practical contact options across every screen size.",
    challengeTitle: "Make specialist care feel clear before an appointment begins.",
    approach:
      "Begin with the questions patients need answered, then structure the experience around services, specialist presentation, reassurance, and appointment intent. The interactive flow validates only the sample contact details needed to demonstrate a request, never asks for health information, and does not transmit or store data.",
    approachTitle: "Build trust through guided discovery and careful next steps.",
    interfaceDecisions: [
      { title: "Care before decoration", description: "Services and specialist context lead the hierarchy, keeping the experience calm and useful." },
      { title: "Progressive appointment flow", description: "A clear sequence turns appointment intent into manageable, privacy-conscious steps." },
      { title: "Reassurance in context", description: "Practical guidance appears where a prospective patient is most likely to need it." },
    ],
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
      "A responsive café and restaurant concept with searchable menus, practical visit details, and a local-only table request demonstration.",
    experienceLabel: "Explore the Hospitality Experience",
    demoPath: "/work/cafe-restaurant-website/demo",
    contactService: "Website Development",
    relatedService: {
      href: "/services/websites-and-commerce",
      label: "web development and e-commerce services",
    },
    conceptNote:
      "Built by ILBATECH with practical visit information, clear menu browsing, and a short table-request flow.",
    businessNeed:
      "A café or restaurant website needs to communicate atmosphere and offering in seconds, then make practical information effortless to find. Menu discovery, opening times, location, and contact actions matter most on mobile, often when a guest is already deciding where to go.",
    challengeTitle: "Turn atmosphere into a practical path to visit.",
    approach:
      "Use a warm editorial rhythm without letting decoration compete with useful information. Keyboard-friendly categories, active-menu search, dietary indicators, and expandable dish details make discovery practical, while a short table-request flow validates sample details locally and never sends or stores them.",
    approachTitle: "Let the menu tell the story, then make planning effortless.",
    interfaceDecisions: [
      { title: "Editorial menu rhythm", description: "Dish stories, categories, and practical details share a warm but controlled visual cadence." },
      { title: "Mobile visit essentials", description: "Hours, location, dietary details, and contact actions remain easy to find on small screens." },
      { title: "Simple reservation intent", description: "The table-request demonstration stays short, legible, and transparent about local-only data." },
    ],
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
    title: "E-Commerce Store",
    category: "E-Commerce",
    summary:
      "An online store with product discovery, configurable product details, a local cart, and simulated checkout.",
    description:
      "A responsive e-commerce store with product discovery, configurable details, a local cart, and simulated checkout with no charges.",
    experienceLabel: "Explore the Store",
    demoPath: "/work/premium-ecommerce-store/demo",
    contactService: "E-Commerce",
    relatedService: {
      href: "/services/websites-and-commerce",
      label: "e-commerce development services",
    },
    conceptNote:
      "Built by ILBATECH with focused product discovery, clear buying controls, and transparent checkout safety.",
    businessNeed:
      "Modern retailers need strong product presentation, easy discovery, clear product information, and a low-friction path from browsing to purchase intent. Those decisions must remain equally clear on mobile, where product comparison, variant selection, and cart management happen in limited space.",
    challengeTitle: "Make discovery and purchase intent feel equally considered.",
    approach:
      "Organize the catalog around clear categories, search, refinements, and sorting, then connect product variants and quantities to a local cart and simulated checkout that stores no payment details and makes no charge.",
    approachTitle: "Connect premium presentation to a low-friction shopping flow.",
    interfaceDecisions: [
      { title: "Product-led composition", description: "A quiet grid gives each object enough room while keeping comparison efficient." },
      { title: "Variants without ambiguity", description: "Finish and quantity controls stay close to price, availability, and the primary cart action." },
      { title: "Transparent local cart", description: "Cart and checkout states stay in the browser without requesting payment or placing a real order." },
    ],
    demonstrates: [
      "Responsive premium storefront and mobile shopping navigation",
      "Product search, category filtering, refinements, and sorting",
      "Product detail presentation with finish and quantity selection",
      "Local favorites, Add to Cart, quantity, removal, and subtotal interactions",
      "Cart review and safe simulated checkout",
      "Accessible commerce controls across desktop, tablet, and mobile",
    ],
    capabilities: ["E-commerce UX", "Product discovery", "Product configuration", "Local cart interactions", "Responsive front-end"],
    visualDescription:
      "a minimal editorial storefront, coherent design-object catalog, product-detail interface, local cart, and mobile shopping path",
  },
  {
    slug: "business-operations-dashboard",
    title: "Business Operations Dashboard",
    category: "Business Systems & Automation",
    summary:
      "An interactive operations workspace connecting sample clients, projects, tasks, analytics, demo automations, and deterministic AI-assisted insights.",
    description:
      "A responsive business-operations concept connecting sample records, local workflow updates, automation simulations, and deterministic AI-assisted insights.",
    experienceLabel: "Try the Dashboard",
    demoPath: "/work/business-operations-dashboard/demo",
    contactService: "AI & Task Automation",
    relatedService: {
      href: "/services/business-systems-and-consulting",
      label: "business systems and technology consulting services",
    },
    conceptNote:
      "Built by ILBATECH to connect daily operations, workflow automation, and grounded AI assistance.",
    businessNeed:
      "Some growing businesses manage important information across disconnected tools, messages, spreadsheets, and manual workflows. That fragmentation can reduce visibility, make ownership harder to understand, and leave repetitive coordination work without a dependable shared view.",
    challengeTitle: "Create one dependable view of work in motion.",
    approach:
      "Model one consistent sample operating dataset, then shape a tailored workspace around the decisions and handoffs it supports. Client, project, task, and analytics views derive from the same local state; automation rules are explainable simulations; and AI-assisted responses are deterministic summaries of visible data rather than calls to a real model.",
    approachTitle: "Design the workspace around decisions, ownership, and handoffs.",
    interfaceDecisions: [
      { title: "Layered operational context", description: "Projects, tasks, analytics, and activity remain connected instead of becoming isolated screens." },
      { title: "Visible automation logic", description: "Rules can be inspected and simulated so the system remains understandable to its users." },
      { title: "Grounded AI assistance", description: "Summaries reflect visible sample state and keep human review part of the workflow." },
    ],
    demonstrates: [
      "Responsive operations dashboard and local view navigation",
      "Fictional client records and inspectable project tracking",
      "Searchable task workflows with local status changes",
      "Accessible analytics derived from consistent task and project state",
      "Enable, disable, inspect, and simulate automation concepts",
      "Deterministic AI-assisted operational summaries and priorities",
    ],
    capabilities: ["Business systems", "Operations UX", "Workflow management", "Automation concepts", "AI-assisted operations"],
    visualDescription:
      "a professional operations workspace with consistent sample records, task controls, responsive analytics, automation simulations, and grounded AI insights",
  },
];

export function getWorkProject(slug: string) {
  return WORK_PROJECTS.find((project) => project.slug === slug);
}
