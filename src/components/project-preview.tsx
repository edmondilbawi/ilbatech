import {
  Bot,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  FolderKanban,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Utensils,
  Workflow,
} from "lucide-react";
import type { WorkProject } from "@/config/work-projects";

type ProjectPreviewProps = {
  project: WorkProject;
  view?: "overview" | "mobile";
  size?: "card" | "detail";
};

function ClinicInterface({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`mock-ui mock-clinic${mobile ? " mock-ui--mobile" : ""}`}>
      <div className="mock-nav">
        <span className="mock-brand"><HeartPulse size={14} /> Private clinic</span>
        {mobile ? <Menu size={15} /> : <span>Services&nbsp;&nbsp; Physician&nbsp;&nbsp; Contact</span>}
      </div>
      <div className="mock-clinic-hero">
        <div>
          <span className="mock-kicker">Professional care, clearly presented</span>
          <strong>Confidence at every step.</strong>
          <p>Understand your care options and find the right next step.</p>
          <span className="mock-action"><CalendarDays size={12} /> Book an appointment</span>
        </div>
        <div className="mock-clinic-mark"><Stethoscope size={mobile ? 28 : 43} strokeWidth={1.3} /></div>
      </div>
      <div className="mock-clinic-services">
        <span>Consultation</span><span>Preventive care</span><span>Follow-up</span>
      </div>
      {!mobile && (
        <div className="mock-clinic-physician">
          <span><Stethoscope size={15} /> Specialist physician</span>
          <small>Experienced, patient-centred care with clear guidance.</small>
        </div>
      )}
    </div>
  );
}

function CafeInterface({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`mock-ui mock-cafe${mobile ? " mock-ui--mobile" : ""}`}>
      <div className="mock-nav mock-nav--dark">
        <span className="mock-brand"><Coffee size={14} /> Café & restaurant</span>
        {mobile ? <Menu size={15} /> : <span>Menu&nbsp;&nbsp; Visit&nbsp;&nbsp; Contact</span>}
      </div>
      <div className="mock-cafe-hero">
        <span className="mock-kicker">Seasonal kitchen · Open daily</span>
        <strong>Made for the table.</strong>
        <p>A considered menu, warm setting, and simple plan for your visit.</p>
        <span className="mock-action mock-action--warm"><Utensils size={12} /> Explore the menu</span>
      </div>
      <div className="mock-menu-tabs"><span>Breakfast</span><span>Lunch</span><span>Drinks</span></div>
      <div className="mock-menu-items">
        <div><i /><span>House pastry<small>Baked daily</small></span></div>
        <div><i /><span>Seasonal plate<small>From the kitchen</small></span></div>
        {!mobile && <div><i /><span>Iced coffee<small>House blend</small></span></div>}
      </div>
      <div className="mock-visit"><span><Clock3 size={11} /> 08:00–22:00</span><span><MapPin size={11} /> Visit information</span></div>
    </div>
  );
}

function StoreInterface({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`mock-ui mock-store${mobile ? " mock-ui--mobile" : ""}`}>
      <div className="mock-nav">
        <span className="mock-brand">Premium store</span>
        <span className="mock-store-tools"><Search size={13} /> <ShoppingBag size={13} /> Cart · 1</span>
      </div>
      <div className="mock-store-heading">
        <span className="mock-kicker">Objects for considered living</span>
        <strong>Designed to last.</strong>
        <div><span>New arrivals</span><span>Home</span><span>Daily</span></div>
      </div>
      <div className="mock-products">
        <div><i className="mock-product-shape mock-product-shape--one" /><span>Structured carryall<small>USD 185</small></span></div>
        <div><i className="mock-product-shape mock-product-shape--two" /><span>Everyday vessel<small>USD 72</small></span></div>
        {!mobile && <div><i className="mock-product-shape mock-product-shape--three" /><span>Woven throw<small>USD 140</small></span></div>}
      </div>
      {mobile && <span className="mock-action mock-action--store"><ShoppingBag size={12} /> Add to cart</span>}
    </div>
  );
}

function DashboardInterface({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`mock-ui mock-dashboard${mobile ? " mock-ui--mobile" : ""}`}>
      {!mobile && (
        <div className="mock-dashboard-side">
          <span className="mock-brand"><LayoutDashboard size={14} /> Operations</span>
          <nav><b>Overview</b><span>Projects</span><span>Clients</span><span>Tasks</span><span>Automations</span></nav>
        </div>
      )}
      <div className="mock-dashboard-main">
        <div className="mock-dashboard-head">
          <div><span className="mock-kicker">Workspace overview</span><strong>Active work</strong></div>
          <span className="mock-avatar">IL</span>
        </div>
        <div className="mock-status-grid">
          <div><FolderKanban size={14} /><small>Website delivery</small><b>In progress</b></div>
          <div><Workflow size={14} /><small>Enquiry routing</small><b>Review</b></div>
          {!mobile && <div><Check size={14} /><small>Content approval</small><b>Ready</b></div>}
        </div>
        <div className="mock-workflow-panel">
          <div><span>Workflow activity</span><small>Current status view</small></div>
          <div className="mock-workflow-line"><i /><i /><i /><i /></div>
        </div>
        <div className="mock-ai-cue"><Bot size={14} /><span><b>AI-assisted summary</b><small>Draft prepared for human review</small></span><Sparkles size={12} /></div>
        {!mobile && (
          <div className="mock-task-table">
            <div><b>Current tasks</b><span>Owner</span><span>Status</span></div>
            <div><b>Prepare service review</b><span>Operations</span><span>In review</span></div>
            <div><b>Confirm workflow rules</b><span>Project lead</span><span>Ready</span></div>
            <div><b>Route new enquiry</b><span>Automation</span><span>Active</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function MockInterface({ project, mobile = false }: { project: WorkProject; mobile?: boolean }) {
  switch (project.slug) {
    case "private-clinic-website":
      return <ClinicInterface mobile={mobile} />;
    case "cafe-restaurant-website":
      return <CafeInterface mobile={mobile} />;
    case "premium-ecommerce-store":
      return <StoreInterface mobile={mobile} />;
    case "business-operations-dashboard":
      return <DashboardInterface mobile={mobile} />;
  }
}

export function ProjectPreview({
  project,
  view = "overview",
  size = "card",
}: ProjectPreviewProps) {
  const label = `${project.title} concept interface preview showing ${project.visualDescription}.`;

  if (view === "mobile") {
    return (
      <div
        className={`project-preview project-preview--${project.slug} project-preview--mobile project-preview--${size}`}
        role="img"
        aria-label={label}
      >
        <div className="preview-phone preview-phone--solo" aria-hidden="true">
          <div className="preview-phone-top"><i /><span>9:41</span><i /></div>
          <MockInterface project={project} mobile />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`project-preview project-preview--${project.slug} project-preview--overview project-preview--${size}`}
      role="img"
      aria-label={label}
    >
      <div className="preview-browser" aria-hidden="true">
        <div className="preview-browser-bar">
          <span><i /><i /><i /></span>
          <small>concept / {project.slug}</small>
        </div>
        <MockInterface project={project} />
      </div>
      <div className="preview-phone" aria-hidden="true">
        <div className="preview-phone-top"><i /><span>9:41</span><i /></div>
        <MockInterface project={project} mobile />
      </div>
    </div>
  );
}
