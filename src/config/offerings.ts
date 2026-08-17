import { GOOGLE_FORM } from "@/config/google-form";

type GoogleService = (typeof GOOGLE_FORM.serviceOptions)[number];

export type OfferingLink = {
  title: string;
  description: string;
  href: string;
};

export type Offering = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  introduction: string;
  problemStatement: string;
  whoFor: string[];
  commonProblems: string[];
  capabilities: string[];
  outcomes: string[];
  approach: string[];
  googleService: GoogleService;
  relatedLinks: OfferingLink[];
};

export const SERVICE_AREAS: Offering[] = [
  {
    slug: "websites-and-commerce",
    title: "Websites & Commerce",
    eyebrow: "Digital customer experience",
    summary:
      "Professional websites and online commerce experiences that help customers understand, trust, and act.",
    introduction:
      "A website should do more than look polished. It should explain the business clearly, support the customer journey, and make the next action easy—whether that is an enquiry, a booking, or a purchase.",
    problemStatement:
      "An unclear, outdated, or difficult-to-use digital presence can weaken confidence and create friction at the moment a prospective customer is deciding what to do next.",
    whoFor: [
      "Businesses launching or strengthening their public presence",
      "Teams whose current website no longer reflects the business",
      "Businesses preparing to sell products or services online",
      "Organizations that need clearer enquiry, booking, or purchase journeys",
    ],
    commonProblems: [
      "Customers struggle to understand the offer or next step",
      "The current website feels dated, difficult to manage, or inconsistent",
      "Online sales and enquiries rely on fragmented manual steps",
      "Mobile visitors encounter unnecessary friction",
    ],
    capabilities: [
      "Professional business websites",
      "Website redesign and content structure",
      "E-commerce and online sales experiences",
      "Enquiry, booking, and conversion journeys",
      "Responsive, accessible front-end implementation",
      "Practical integrations with suitable business tools",
    ],
    outcomes: [
      "A clearer and more credible digital front door",
      "A simpler path from interest to enquiry or purchase",
      "A website aligned with the way the business communicates and operates",
      "A maintainable foundation that can evolve with genuine business needs",
    ],
    approach: [
      "Clarify the audience, offer, and commercial purpose",
      "Map the most important customer journeys",
      "Shape content and functionality around those journeys",
      "Build, test, launch, and improve with practical priorities",
    ],
    googleService: "Website Development",
    relatedLinks: [
      {
        title: "Customer Experience & Growth",
        description: "Explore the business outcomes behind clearer digital journeys.",
        href: "/solutions/customer-experience-and-growth",
      },
      {
        title: "Business Systems & Consulting",
        description: "Connect the customer-facing experience to the operation behind it.",
        href: "/services/business-systems-and-consulting",
      },
    ],
  },
  {
    slug: "software-and-applications",
    title: "Software & Applications",
    eyebrow: "Purpose-built technology",
    summary:
      "Web, mobile, and custom software shaped around business needs that standard tools do not address well.",
    introduction:
      "Custom software earns its place when it supports a process, experience, or operating model that off-the-shelf tools cannot fit without costly workarounds.",
    problemStatement:
      "When important work is forced into disconnected spreadsheets, generic platforms, or manual coordination, the business can lose time, consistency, and useful visibility.",
    whoFor: [
      "Businesses with a well-defined operational problem",
      "Teams outgrowing spreadsheets or generic software",
      "Organizations connecting customers, staff, and information in one experience",
      "Leaders who need to validate a software opportunity before investing",
    ],
    commonProblems: [
      "Existing products do not fit a critical workflow",
      "Information is repeatedly copied between tools",
      "Customers or staff lack a coherent digital experience",
      "A software idea needs a clearer business case and scope",
    ],
    capabilities: [
      "Business web applications",
      "Mobile application planning and implementation",
      "Custom operational software",
      "Customer and staff portals",
      "System integration and data flow design",
      "Discovery, requirements, and staged delivery planning",
    ],
    outcomes: [
      "Software that fits the work instead of reshaping it unnecessarily",
      "More consistent processes and information",
      "A clearer experience for customers or internal teams",
      "A staged investment path grounded in business value",
    ],
    approach: [
      "Understand the users, process, constraints, and desired outcome",
      "Test whether custom software is genuinely justified",
      "Define the smallest useful scope and integration needs",
      "Implement in deliberate stages with clear feedback points",
    ],
    googleService: "Other",
    relatedLinks: [
      {
        title: "Operational Systems",
        description: "See how connected systems can improve day-to-day control.",
        href: "/solutions/operational-systems",
      },
      {
        title: "Automation & AI",
        description: "Consider where repeatable work can be simplified alongside software.",
        href: "/services/automation-and-ai",
      },
    ],
  },
  {
    slug: "automation-and-ai",
    title: "Automation & AI",
    eyebrow: "More useful ways of working",
    summary:
      "Purposeful automation and AI-assisted workflows that reduce repetitive effort without adding avoidable complexity.",
    introduction:
      "Automation is valuable when it removes dependable, repeatable work and keeps people focused on decisions, relationships, and exceptions that require judgement.",
    problemStatement:
      "Manual handoffs, repeated data entry, and routine follow-up can quietly consume capacity, introduce errors, and make growth harder to manage.",
    whoFor: [
      "Teams spending significant time on repeatable administrative work",
      "Businesses relying on manual follow-up between tools or people",
      "Operations that need consistency without losing human oversight",
      "Leaders exploring AI with a specific business problem in mind",
    ],
    commonProblems: [
      "The same information is entered or checked repeatedly",
      "Routine follow-up depends on individual memory",
      "Manual handoffs slow work and reduce visibility",
      "AI ideas exist without a clear, safe, or valuable use case",
    ],
    capabilities: [
      "Workflow and task automation",
      "AI-assisted information handling",
      "Notifications, approvals, and follow-up flows",
      "Connections between suitable existing tools",
      "Human review and exception-handling design",
      "Automation opportunity and feasibility assessment",
    ],
    outcomes: [
      "Less time spent on low-value repetitive work",
      "More consistent handoffs and follow-up",
      "Better visibility into the state of important work",
      "AI use grounded in a practical purpose and appropriate oversight",
    ],
    approach: [
      "Map the current work and identify the real bottleneck",
      "Separate repeatable steps from judgement-heavy decisions",
      "Select a proportionate automation approach",
      "Test carefully, preserve oversight, and improve over time",
    ],
    googleService: "AI & Task Automation",
    relatedLinks: [
      {
        title: "Process Automation",
        description: "Explore the operational problems automation can address.",
        href: "/solutions/process-automation",
      },
      {
        title: "Software & Applications",
        description: "See when a purpose-built application may support the workflow.",
        href: "/services/software-and-applications",
      },
    ],
  },
  {
    slug: "business-systems-and-consulting",
    title: "Business Systems & Consulting",
    eyebrow: "Clarity, coordination, and direction",
    summary:
      "Practical business systems and technology guidance that improve visibility, coordination, and confident decision-making.",
    introduction:
      "The right system should give important business information a useful home and support the way people actually work. The right advice should make the decision clearer before any implementation begins.",
    problemStatement:
      "Scattered customer information, difficult booking processes, disconnected operational data, and technology choices without a clear business case can all create unnecessary uncertainty.",
    whoFor: [
      "Businesses reviewing CRM, booking, or management systems",
      "Teams whose important information is scattered across tools",
      "Leaders planning modernization or digital transformation",
      "Organizations that need independent clarity before committing to technology",
    ],
    commonProblems: [
      "Customer, booking, or operational information is hard to coordinate",
      "Teams lack a shared view of important activity",
      "Current systems are outdated, fragmented, or difficult to use",
      "Technology options are being compared without clear decision criteria",
    ],
    capabilities: [
      "CRM and customer-management systems",
      "Booking and reservation systems",
      "Business management and operational systems",
      "Technology discovery and option assessment",
      "Digital transformation planning",
      "Implementation roadmaps and integration guidance",
    ],
    outcomes: [
      "More useful visibility into customers and operations",
      "Clearer, more consistent ways of working",
      "Technology decisions connected to defined business needs",
      "A practical modernization path without unnecessary disruption",
    ],
    approach: [
      "Understand the decision, operation, and people affected",
      "Clarify requirements and distinguish needs from preferences",
      "Assess whether to improve, connect, configure, or build",
      "Set out a practical path and support careful implementation",
    ],
    googleService: "Not sure, I need advice",
    relatedLinks: [
      {
        title: "Digital Transformation",
        description: "Explore a measured path from current operations to better systems.",
        href: "/solutions/digital-transformation",
      },
      {
        title: "Operational Systems",
        description: "See how connected information can improve control and coordination.",
        href: "/solutions/operational-systems",
      },
    ],
  },
];

export const SOLUTION_AREAS: Offering[] = [
  {
    slug: "customer-experience-and-growth",
    title: "Customer Experience & Growth",
    eyebrow: "Make the next step easier",
    summary:
      "Create clearer digital journeys that help customers understand, enquire, book, and buy with less friction.",
    introduction:
      "Customer-facing technology should help people move forward confidently. That begins with understanding what customers need at each stage and what the business must manage behind the experience.",
    problemStatement:
      "Weak digital journeys can lose trust, enquiries, or sales when information is unclear, actions are difficult, or front-end promises are disconnected from business operations.",
    whoFor: [
      "Businesses whose website does not explain their value clearly",
      "Organizations improving online enquiry, booking, or sales",
      "Teams modernizing an inconsistent customer journey",
      "Leaders seeking growth without creating an unmanageable operation",
    ],
    commonProblems: [
      "Prospects cannot quickly understand the offer",
      "Enquiry, booking, or purchase steps create friction",
      "Customer information is lost between channels",
      "The public experience and internal follow-up do not connect well",
    ],
    capabilities: [
      "Customer-journey and conversion review",
      "Business websites and e-commerce",
      "Enquiry and booking experiences",
      "CRM and follow-up flow alignment",
      "Content and interaction structure",
      "Practical customer-facing integrations",
    ],
    outcomes: [
      "Clearer customer understanding and confidence",
      "A simpler route to enquiry, booking, or purchase",
      "Better continuity between customer action and team follow-up",
      "A digital experience the operation can support",
    ],
    approach: [
      "Map the customer decision and the business response",
      "Identify the moments causing confusion or delay",
      "Prioritize the changes with the clearest business value",
      "Implement and test the complete journey, not only the interface",
    ],
    googleService: "Website Development",
    relatedLinks: [
      {
        title: "Websites & Commerce",
        description: "Explore the service capabilities behind stronger customer journeys.",
        href: "/services/websites-and-commerce",
      },
      {
        title: "Business Systems & Consulting",
        description: "Improve the customer information and follow-up behind the experience.",
        href: "/services/business-systems-and-consulting",
      },
    ],
  },
  {
    slug: "process-automation",
    title: "Process Automation",
    eyebrow: "Reduce avoidable manual work",
    summary:
      "Simplify repetitive tasks, handoffs, and follow-up while keeping people in control of important decisions.",
    introduction:
      "A useful automation solution begins with the process, not the tool. ILBATECH examines how work currently moves, where effort is repeated, and where automation can create reliable value.",
    problemStatement:
      "Repetitive activity and manual coordination can create delays, inconsistent results, and limited visibility—especially as volume grows.",
    whoFor: [
      "Teams managing repeatable work across several tools",
      "Businesses where approvals or follow-up cause delays",
      "Operations growing beyond informal manual processes",
      "Leaders evaluating AI or automation for a defined use case",
    ],
    commonProblems: [
      "Data is copied repeatedly between systems",
      "Progress depends on manual reminders and follow-up",
      "Routine requests are handled differently each time",
      "Teams cannot easily see where work is waiting",
    ],
    capabilities: [
      "Current-process mapping",
      "Workflow and integration design",
      "Task, notification, and approval automation",
      "AI-assisted steps where appropriate",
      "Human review and exception paths",
      "Monitoring and iterative improvement",
    ],
    outcomes: [
      "Less repetitive administrative effort",
      "More consistent and visible processes",
      "Faster handoffs without removing appropriate judgement",
      "Capacity redirected toward higher-value work",
    ],
    approach: [
      "Observe the process as it actually operates",
      "Identify repeatable rules, exceptions, and risks",
      "Automate the smallest valuable path first",
      "Measure reliability and improve with operational feedback",
    ],
    googleService: "AI & Task Automation",
    relatedLinks: [
      {
        title: "Automation & AI",
        description: "Explore the implementation capabilities available for automation.",
        href: "/services/automation-and-ai",
      },
      {
        title: "Operational Systems",
        description: "See how automation can connect to a stronger operational foundation.",
        href: "/solutions/operational-systems",
      },
    ],
  },
  {
    slug: "operational-systems",
    title: "Operational Systems",
    eyebrow: "Connect work and information",
    summary:
      "Bring critical processes and information into better order so teams can coordinate work and make decisions with confidence.",
    introduction:
      "Operational systems should make the state of the business easier to understand and the work easier to coordinate. The solution may involve improving existing tools, connecting them, or building only where necessary.",
    problemStatement:
      "Scattered spreadsheets, disconnected tools, and inconsistent processes can make essential information difficult to trust and everyday work harder to manage.",
    whoFor: [
      "Businesses that lack a shared view of customers or operations",
      "Teams coordinating important work through spreadsheets and messages",
      "Organizations outgrowing generic or disconnected tools",
      "Leaders who need better visibility before scaling operations",
    ],
    commonProblems: [
      "Important information exists in several places",
      "Teams use different versions of the same process",
      "Booking, customer, or operational activity is hard to track",
      "Existing systems require workarounds for essential work",
    ],
    capabilities: [
      "CRM and customer-management systems",
      "Booking and reservation operations",
      "Business management systems",
      "Custom operational applications",
      "System connection and data-flow planning",
      "Requirements and implementation roadmaps",
    ],
    outcomes: [
      "A more dependable view of important business activity",
      "Clearer ownership and coordination across teams",
      "Less reliance on fragmented manual workarounds",
      "Systems that support the operation as it evolves",
    ],
    approach: [
      "Identify the information and decisions that matter",
      "Map how work and data move today",
      "Determine what to retain, improve, connect, or replace",
      "Implement in manageable stages with clear adoption needs",
    ],
    googleService: "Other",
    relatedLinks: [
      {
        title: "Business Systems & Consulting",
        description: "Explore CRM, booking, management, and advisory capabilities.",
        href: "/services/business-systems-and-consulting",
      },
      {
        title: "Software & Applications",
        description: "See when purpose-built software is the appropriate fit.",
        href: "/services/software-and-applications",
      },
    ],
  },
  {
    slug: "digital-transformation",
    title: "Digital Transformation",
    eyebrow: "Modernize with purpose",
    summary:
      "Move from limiting systems and processes toward a practical, staged digital operating model.",
    introduction:
      "Digital transformation is not a single product or a rush to replace everything. It is a deliberate improvement of the way the business operates, guided by priorities, constraints, and the ability to absorb change.",
    problemStatement:
      "Aging systems and accumulated workarounds can limit progress, but replacing too much at once can create even more disruption and complexity.",
    whoFor: [
      "Businesses constrained by outdated or disconnected systems",
      "Leaders planning several related technology improvements",
      "Organizations that need a clear modernization sequence",
      "Teams balancing operational continuity with meaningful change",
    ],
    commonProblems: [
      "Technology decisions are reactive and disconnected",
      "Legacy processes limit visibility, service, or growth",
      "Teams face change fatigue or competing priorities",
      "The desired future state is not translated into practical stages",
    ],
    capabilities: [
      "Current-state and business-needs assessment",
      "Digital operating model and opportunity mapping",
      "Technology option and dependency review",
      "Prioritized transformation roadmap",
      "Staged systems, automation, and experience improvements",
      "Implementation and adoption planning",
    ],
    outcomes: [
      "A shared view of what should change and why",
      "A realistic sequence based on value, dependency, and risk",
      "Modernization without unnecessary replacement",
      "A stronger operational foundation for future improvement",
    ],
    approach: [
      "Understand the business direction and current constraints",
      "Identify the operational capabilities that need to improve",
      "Prioritize initiatives and dependencies transparently",
      "Deliver in stages and learn before expanding the change",
    ],
    googleService: "Not sure, I need advice",
    relatedLinks: [
      {
        title: "Business Systems & Consulting",
        description: "Explore advisory and systems capabilities for a practical roadmap.",
        href: "/services/business-systems-and-consulting",
      },
      {
        title: "Process Automation",
        description: "See where focused automation can support a wider transformation.",
        href: "/solutions/process-automation",
      },
    ],
  },
];

export const PUBLIC_PATHS = [
  "/",
  "/services",
  ...SERVICE_AREAS.map((offering) => `/services/${offering.slug}`),
  "/solutions",
  ...SOLUTION_AREAS.map((offering) => `/solutions/${offering.slug}`),
  "/about",
  "/contact",
] as const;

export function getServiceArea(slug: string) {
  return SERVICE_AREAS.find((offering) => offering.slug === slug);
}

export function getSolutionArea(slug: string) {
  return SOLUTION_AREAS.find((offering) => offering.slug === slug);
}
