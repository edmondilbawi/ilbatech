"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Filter,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Menu,
  Play,
  Search,
  Sparkles,
  Users,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { getContactPath, getSitePath } from "@/config/site";
import styles from "./operations-showcase.module.css";

type View = "Overview" | "Clients" | "Projects" | "Tasks" | "Analytics" | "Automations" | "AI Insights";
type ProjectStatus = "On track" | "At risk" | "Planning";
type TaskStatus = "To do" | "In progress" | "Complete";
type Priority = "High" | "Medium" | "Low";
type DueState = "overdue" | "today" | "soon" | "later" | "complete";
type AIChoice = "summary" | "attention" | "health" | "priorities";

type Client = {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Planning";
  summary: string;
  activity: string;
};

type Project = {
  id: string;
  name: string;
  clientId: string;
  status: ProjectStatus;
  priority: Priority;
  deadline: string;
  owner: string;
  summary: string;
};

type Task = {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  due: string;
  dueState: DueState;
  openDueState: Exclude<DueState, "complete">;
  detail: string;
};

type Automation = {
  id: string;
  title: string;
  trigger: string;
  action: string;
  enabled: boolean;
  explanation: string;
};

type ActivityItem = { id: string; title: string; context: string; time: string; tone: "info" | "warning" | "success" };
type DetailPanel = { type: "client" | "project" | "task"; id: string } | null;

const NAV_ITEMS: readonly { label: View; icon: LucideIcon }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Clients", icon: Users },
  { label: "Projects", icon: FolderKanban },
  { label: "Tasks", icon: ListTodo },
  { label: "Analytics", icon: BarChart3 },
  { label: "Automations", icon: Workflow },
  { label: "AI Insights", icon: Sparkles },
];

const CLIENTS: readonly Client[] = [
  { id: "client-a", name: "Sample Client A", type: "Professional services", status: "Active", summary: "A fictional service business using the workspace to coordinate a website refresh and approvals.", activity: "Content approval is awaiting review." },
  { id: "client-b", name: "Sample Client B", type: "Retail operations", status: "Active", summary: "A fictional retail operator exploring a client portal and structured information handoff.", activity: "Data import review is due today." },
  { id: "client-c", name: "Sample Client C", type: "Property services", status: "Active", summary: "A fictional operations team documenting processes and testing a tailored workflow setup.", activity: "Workflow prototype is in progress." },
  { id: "client-d", name: "Sample Client D", type: "Training provider", status: "Planning", summary: "A fictional training business defining reporting requirements and scheduled summaries.", activity: "Dashboard definitions are being prepared." },
];

const INITIAL_PROJECTS: readonly Project[] = [
  { id: "website-refresh", name: "Website Refresh", clientId: "client-a", status: "At risk", priority: "High", deadline: "22 Aug 2026", owner: "Delivery team", summary: "A sample website delivery project moving through approval, quality assurance, and launch preparation." },
  { id: "client-portal", name: "Client Portal", clientId: "client-b", status: "On track", priority: "High", deadline: "30 Aug 2026", owner: "Product team", summary: "A sample portal project focused on permissions, information import, and clear support content." },
  { id: "operations-setup", name: "Operations Setup", clientId: "client-c", status: "On track", priority: "Medium", deadline: "04 Sep 2026", owner: "Operations team", summary: "A sample internal-workflow project translating workshop findings into a usable operational system." },
  { id: "reporting-automation", name: "Reporting Automation", clientId: "client-d", status: "Planning", priority: "Medium", deadline: "12 Sep 2026", owner: "Automation team", summary: "A sample reporting project defining sources, dashboard measures, and scheduled summary logic." },
];

const INITIAL_TASKS: readonly Task[] = [
  { id: "content-approval", title: "Content approval", projectId: "website-refresh", status: "To do", priority: "High", assignee: "Delivery team", due: "15 Aug", dueState: "overdue", openDueState: "overdue", detail: "Review and approve the final sample content set before launch preparation can continue." },
  { id: "accessibility-qa", title: "Accessibility QA", projectId: "website-refresh", status: "In progress", priority: "High", assignee: "Quality team", due: "20 Aug", dueState: "soon", openDueState: "soon", detail: "Complete the sample keyboard, contrast, and responsive interface review." },
  { id: "responsive-build", title: "Responsive build", projectId: "website-refresh", status: "Complete", priority: "Medium", assignee: "Delivery team", due: "14 Aug", dueState: "complete", openDueState: "overdue", detail: "Responsive layouts for the sample project have been completed." },
  { id: "permission-map", title: "Portal permissions map", projectId: "client-portal", status: "Complete", priority: "High", assignee: "Product team", due: "12 Aug", dueState: "complete", openDueState: "overdue", detail: "The illustrative role and access map is documented for review." },
  { id: "data-import", title: "Data import review", projectId: "client-portal", status: "In progress", priority: "High", assignee: "Operations team", due: "Today", dueState: "today", openDueState: "today", detail: "Check the sample import fields and flag any formatting decisions before implementation." },
  { id: "help-content", title: "Help content outline", projectId: "client-portal", status: "Complete", priority: "Low", assignee: "Product team", due: "13 Aug", dueState: "complete", openDueState: "overdue", detail: "A concise support-content outline is ready for the portal concept." },
  { id: "workshop-notes", title: "Process workshop notes", projectId: "operations-setup", status: "Complete", priority: "Medium", assignee: "Operations team", due: "11 Aug", dueState: "complete", openDueState: "overdue", detail: "Sample workshop decisions and workflow constraints are consolidated." },
  { id: "workflow-prototype", title: "Workflow prototype", projectId: "operations-setup", status: "In progress", priority: "Medium", assignee: "Product team", due: "27 Aug", dueState: "later", openDueState: "later", detail: "Translate the agreed sample process into a reviewable front-end workflow." },
  { id: "manager-review", title: "Manager review", projectId: "operations-setup", status: "To do", priority: "High", assignee: "Operations lead", due: "24 Aug", dueState: "soon", openDueState: "soon", detail: "Review the proposed operational flow and record the next sample decision." },
  { id: "source-mapping", title: "Data source mapping", projectId: "reporting-automation", status: "Complete", priority: "High", assignee: "Automation team", due: "10 Aug", dueState: "complete", openDueState: "overdue", detail: "Illustrative source fields and ownership are mapped for the reporting concept." },
  { id: "dashboard-definitions", title: "Dashboard definitions", projectId: "reporting-automation", status: "To do", priority: "Medium", assignee: "Automation team", due: "26 Aug", dueState: "soon", openDueState: "soon", detail: "Define the sample measures, labels, and decision context for each dashboard area." },
  { id: "summary-spec", title: "Scheduled summary specification", projectId: "reporting-automation", status: "To do", priority: "Low", assignee: "Automation team", due: "02 Sep", dueState: "later", openDueState: "later", detail: "Describe when a deterministic sample summary would run and what it would contain." },
];

const INITIAL_AUTOMATIONS: readonly Automation[] = [
  { id: "overdue-alert", title: "Overdue priority alert", trigger: "High-priority task becomes overdue", action: "Surface a manager alert", enabled: true, explanation: "The simulation checks the local task list and identifies the overdue high-priority item." },
  { id: "progress-update", title: "Project progress update", trigger: "Task is marked complete", action: "Recalculate project progress", enabled: true, explanation: "Project completion values already derive from task state, so the simulated result remains consistent." },
  { id: "lead-followup", title: "Lead follow-up task", trigger: "New lead is added", action: "Prepare a follow-up task", enabled: false, explanation: "This rule is illustrative only; the concept has no lead system or external CRM connection." },
  { id: "deadline-reminder", title: "Approaching deadline reminder", trigger: "Project deadline approaches", action: "Surface a workspace reminder", enabled: true, explanation: "The simulation references the nearest visible sample project deadline without sending a notification." },
];

const INITIAL_ACTIVITY: readonly ActivityItem[] = [
  { id: "activity-1", title: "Accessibility QA moved to In progress", context: "Website Refresh · sample task update", time: "09:40", tone: "info" },
  { id: "activity-2", title: "Data import review is due today", context: "Client Portal · operational alert", time: "08:55", tone: "warning" },
  { id: "activity-3", title: "Process workshop notes completed", context: "Operations Setup · sample task update", time: "Yesterday", tone: "success" },
  { id: "activity-4", title: "Reporting source map reviewed", context: "Reporting Automation · sample activity", time: "Yesterday", tone: "info" },
];

const dueRank: Record<DueState, number> = { overdue: 0, today: 1, soon: 2, later: 3, complete: 4 };
const priorityRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function OperationsShowcase() {
  const dialogRef = useRef<HTMLElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<View>("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([...INITIAL_PROJECTS]);
  const [tasks, setTasks] = useState<Task[]>([...INITIAL_TASKS]);
  const [automations, setAutomations] = useState<Automation[]>([...INITIAL_AUTOMATIONS]);
  const [activity, setActivity] = useState<ActivityItem[]>([...INITIAL_ACTIVITY]);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientStatus, setClientStatus] = useState<"All" | Client["status"]>("All");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectStatus, setProjectStatusFilter] = useState<"All" | ProjectStatus>("All");
  const [taskQuery, setTaskQuery] = useState("");
  const [taskStatus, setTaskStatus] = useState<"All" | TaskStatus>("All");
  const [taskPriority, setTaskPriority] = useState<"All" | Priority>("All");
  const [automationDetail, setAutomationDetail] = useState<string | null>(null);
  const [automationResult, setAutomationResult] = useState<{ id: string; text: string } | null>(null);
  const [aiChoice, setAiChoice] = useState<AIChoice | null>(null);
  const [aiProjectId, setAiProjectId] = useState(projects[0].id);
  const [announcement, setAnnouncement] = useState("");

  const openTasks = tasks.filter((task) => task.status !== "Complete");
  const completeTasks = tasks.filter((task) => task.status === "Complete");
  const highPriorityOpen = openTasks.filter((task) => task.priority === "High");
  const attentionTasks = openTasks.filter((task) => task.dueState === "overdue" || task.dueState === "today");
  const completionPercent = Math.round((completeTasks.length / tasks.length) * 100);

  const normalizedClientQuery = clientQuery.trim().toLowerCase();
  const filteredClients = CLIENTS.filter((client) => clientStatus === "All" || client.status === clientStatus)
    .filter((client) => !normalizedClientQuery || `${client.name} ${client.type} ${client.summary}`.toLowerCase().includes(normalizedClientQuery));

  const normalizedProjectQuery = projectQuery.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => projectStatus === "All" || project.status === projectStatus)
    .filter((project) => !normalizedProjectQuery || `${project.name} ${clientName(project.clientId)} ${project.owner}`.toLowerCase().includes(normalizedProjectQuery));

  const normalizedTaskQuery = taskQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => taskStatus === "All" || task.status === taskStatus)
    .filter((task) => taskPriority === "All" || task.priority === taskPriority)
    .filter((task) => !normalizedTaskQuery || `${task.title} ${projectName(task.projectId)} ${task.assignee}`.toLowerCase().includes(normalizedTaskQuery));

  const selectedDetail = detailPanel?.type === "client"
    ? CLIENTS.find((client) => client.id === detailPanel.id)
    : detailPanel?.type === "project"
      ? projects.find((project) => project.id === detailPanel.id)
      : detailPanel?.type === "task"
        ? tasks.find((task) => task.id === detailPanel.id)
        : undefined;

  const aiInsight = aiChoice ? buildAiInsight(aiChoice, aiProjectId) : null;

  useEffect(() => {
    if (!detailPanel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("[data-panel-focus]")?.focus(), 0);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDetailPanel(null);
      window.setTimeout(() => lastFocusRef.current?.focus(), 0);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [detailPanel]);

  function clientName(clientId: string) {
    return CLIENTS.find((client) => client.id === clientId)?.name ?? "Sample client";
  }

  function projectName(projectId: string) {
    return projects.find((project) => project.id === projectId)?.name ?? "Sample project";
  }

  function projectProgress(projectId: string) {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    const done = projectTasks.filter((task) => task.status === "Complete").length;
    return { done, total: projectTasks.length, percent: projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0 };
  }

  function changeView(nextView: View) {
    setView(nextView);
    setMobileNavOpen(false);
    setNotificationsOpen(false);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("operations-workspace")?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function openDetail(type: "client" | "project" | "task", id: string) {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDetailPanel({ type, id });
  }

  function closeDetail() {
    setDetailPanel(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function addActivity(title: string, context: string, tone: ActivityItem["tone"] = "info") {
    setActivity((current) => [{ id: `local-${Date.now()}`, title, context, time: "Just now", tone }, ...current].slice(0, 8));
  }

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || task.status === status) return;
    setTasks((current) => current.map((candidate) => candidate.id === taskId
      ? { ...candidate, status, dueState: status === "Complete" ? "complete" : candidate.openDueState }
      : candidate));
    const title = `${task.title} moved to ${status}`;
    addActivity(title, `${projectName(task.projectId)} · local demo change`, status === "Complete" ? "success" : "info");
    setAnnouncement(`${title}. Project progress and analytics updated locally.`);
  }

  function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project || project.status === status) return;
    setProjects((current) => current.map((candidate) => candidate.id === projectId ? { ...candidate, status } : candidate));
    addActivity(`${project.name} marked ${status}`, "Project status · local demo change", status === "At risk" ? "warning" : "info");
    setAnnouncement(`${project.name} status updated to ${status} in local state.`);
  }

  function toggleAutomation(automationId: string) {
    const automation = automations.find((candidate) => candidate.id === automationId);
    if (!automation) return;
    const enabled = !automation.enabled;
    setAutomations((current) => current.map((candidate) => candidate.id === automationId ? { ...candidate, enabled } : candidate));
    setAutomationResult(null);
    setAnnouncement(`${automation.title} ${enabled ? "enabled" : "disabled"} for this browser-session demonstration.`);
  }

  function simulateAutomation(automation: Automation) {
    let text = "This rule would prepare a local demonstration result without contacting an external service.";
    if (automation.id === "overdue-alert") {
      const overdue = highPriorityOpen.find((task) => task.dueState === "overdue");
      text = overdue ? `Simulated result: manager alert prepared for “${overdue.title}”, the overdue high-priority task in ${projectName(overdue.projectId)}.` : "Simulated result: no overdue high-priority task is currently visible, so no alert would be prepared.";
    }
    if (automation.id === "progress-update") {
      const project = projects[0];
      const progress = projectProgress(project.id);
      text = `Simulated result: ${project.name} progress resolves to ${progress.percent}% from ${progress.done} of ${progress.total} completed visible tasks.`;
    }
    if (automation.id === "lead-followup") {
      text = "Simulated result: a sample follow-up task would be prepared for review. No CRM record, message, or external action is created.";
    }
    if (automation.id === "deadline-reminder") {
      text = `Simulated result: a workspace reminder would surface ${projects[0].name}, the nearest visible project deadline on ${projects[0].deadline}.`;
    }
    setAutomationResult({ id: automation.id, text });
    addActivity(`${automation.title} simulated`, "Automation demo · no external action", "info");
    setAnnouncement(`${automation.title} simulation complete. No external action occurred.`);
  }

  function buildAiInsight(choice: AIChoice, projectId: string) {
    const atRisk = projects.filter((project) => project.status === "At risk");
    const overdue = openTasks.filter((task) => task.dueState === "overdue");
    const today = openTasks.filter((task) => task.dueState === "today");
    if (choice === "summary") {
      return {
        title: "Today’s operational summary",
        summary: `${openTasks.length} open tasks are visible across ${projects.length} active sample projects. ${overdue.length} ${overdue.length === 1 ? "task is" : "tasks are"} overdue and ${today.length} ${today.length === 1 ? "is" : "are"} due today. ${atRisk.length ? `${atRisk.map((project) => project.name).join(", ")} ${atRisk.length === 1 ? "is" : "are"} marked At risk.` : "No project is marked At risk."}`,
        bullets: [`${completeTasks.length} of ${tasks.length} tasks are complete (${completionPercent}%).`, `${automations.filter((item) => item.enabled).length} of ${automations.length} demo automations are enabled.`, `Nearest visible project deadline: ${projects[0].name} · ${projects[0].deadline}.`],
      };
    }
    if (choice === "attention") {
      return {
        title: "What needs attention",
        summary: `${highPriorityOpen.length} high-priority tasks remain open. ${overdue.length ? `“${overdue[0].title}” is overdue in ${projectName(overdue[0].projectId)}.` : "No open task is overdue."} ${today.length ? `“${today[0].title}” is due today.` : "No task is due today."}`,
        bullets: highPriorityOpen.slice().sort((a, b) => dueRank[a.dueState] - dueRank[b.dueState]).slice(0, 3).map((task) => `${task.title} · ${task.status} · ${task.due}`),
      };
    }
    if (choice === "health") {
      const project = projects.find((candidate) => candidate.id === projectId) ?? projects[0];
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const progress = projectProgress(project.id);
      const projectHigh = projectTasks.filter((task) => task.status !== "Complete" && task.priority === "High");
      const projectOverdue = projectTasks.find((task) => task.status !== "Complete" && task.dueState === "overdue");
      return {
        title: `${project.name} health review`,
        summary: `${project.name} is ${progress.percent}% complete (${progress.done} of ${progress.total} visible tasks) and marked ${project.status}. It has ${projectHigh.length} open high-priority ${projectHigh.length === 1 ? "task" : "tasks"}${projectOverdue ? `, including “${projectOverdue.title}”, which is overdue` : ""}.`,
        bullets: [`Deadline: ${project.deadline}.`, `Responsible group: ${project.owner}.`, projectHigh.length ? `First high-priority action: ${projectHigh[0].title}.` : "No high-priority action remains open."],
      };
    }
    const ranked = openTasks.slice().sort((a, b) => dueRank[a.dueState] - dueRank[b.dueState] || priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 3);
    return {
      title: "Suggested priority order",
      summary: `The deterministic demo ranks visible work by overdue status, due timing, and priority. ${ranked.length ? `Start with “${ranked[0].title}”.` : "No open work remains."}`,
      bullets: ranked.map((task, index) => `${index + 1}. ${task.title} · ${projectName(task.projectId)} · ${task.priority} · ${task.due}`),
    };
  }

  function insightChoice(choice: AIChoice) {
    setAiChoice(choice);
    setAnnouncement("Deterministic AI-assisted demonstration response updated from the visible sample state.");
  }

  const enabledAutomations = automations.filter((automation) => automation.enabled).length;

  return (
    <main className={styles.demo}>
      <p className={styles.announcement} aria-live="polite" aria-atomic="true">{announcement}</p>
      <div className={styles.conceptBar}><div><span><b>ILBATECH Concept Preview</b> Front-end operations workspace · sample data only</span><a href={getSitePath("/work")}><ArrowLeft size={14} /> Return to Work</a></div></div>

      <div className={styles.appShell}>
        <aside className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`} aria-label="Operations workspace navigation">
          <div className={styles.workspaceBrand}><span><BriefcaseBusiness /></span><div><strong>Operations</strong><small>Demo workspace</small></div><button type="button" aria-label="Close workspace navigation" onClick={() => setMobileNavOpen(false)}><X /></button></div>
          <nav>
            <p>Workspace</p>
            {NAV_ITEMS.slice(0, 6).map(({ label, icon: Icon }) => <button type="button" aria-current={view === label ? "page" : undefined} onClick={() => changeView(label)} key={label}><Icon /><span>{label}</span>{label === "Tasks" && <small>{openTasks.length}</small>}</button>)}
            <p>Assistance</p>
            {NAV_ITEMS.slice(6).map(({ label, icon: Icon }) => <button className={styles.aiNav} type="button" aria-current={view === label ? "page" : undefined} onClick={() => changeView(label)} key={label}><Icon /><span>{label}</span><i>Demo</i></button>)}
          </nav>
          <div className={styles.sidebarFoot}><span><Circle /> Local session</span><p>No account, integration, or persistent data.</p></div>
        </aside>
        {mobileNavOpen && <button className={styles.navBackdrop} type="button" aria-label="Close workspace navigation" onClick={() => setMobileNavOpen(false)} />}

        <div id="operations-workspace" className={styles.workspace}>
          <header className={styles.topbar}>
            <div className={styles.topbarContext}><button className={styles.mobileMenu} type="button" aria-label="Open workspace navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)}><Menu /></button><div><small>Demo environment · 18 Aug 2026</small><strong>{view}</strong></div></div>
            <div className={styles.topbarActions}><span><Zap /> Local interactions</span><button type="button" aria-label={`Open activity notifications, ${activity.length} items`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell /><i>{Math.min(activity.length, 9)}</i></button></div>
            {notificationsOpen && <div className={styles.notificationPanel}><div><strong>Workspace activity</strong><button type="button" aria-label="Close activity notifications" onClick={() => setNotificationsOpen(false)}><X /></button></div>{activity.slice(0, 5).map((item) => <article key={item.id}><span data-tone={item.tone} /><div><b>{item.title}</b><p>{item.context}</p></div><small>{item.time}</small></article>)}</div>}
          </header>

          <div className={styles.viewArea}>
            {view === "Overview" && (
              <section aria-labelledby="overview-title">
                <div className={styles.pageHeading}><div><p>Operations overview</p><h1 id="overview-title">Good morning. Here’s the sample workspace.</h1></div><button type="button" onClick={() => changeView("AI Insights")}><Sparkles /> Ask Demo AI</button></div>
                <div className={styles.metricGrid}>
                  <article><div><FolderKanban /><span>Active projects</span></div><strong>{projects.length}</strong><p>{projects.filter((project) => project.status === "At risk").length} marked at risk</p></article>
                  <article><div><ListTodo /><span>Open tasks</span></div><strong>{openTasks.length}</strong><p>{highPriorityOpen.length} high priority</p></article>
                  <article><div><AlertTriangle /><span>Attention items</span></div><strong>{attentionTasks.length}</strong><p>{openTasks.filter((task) => task.dueState === "overdue").length} overdue · {openTasks.filter((task) => task.dueState === "today").length} due today</p></article>
                  <article><div><Workflow /><span>Demo automations</span></div><strong>{enabledAutomations}/{automations.length}</strong><p>Enabled in local state</p></article>
                </div>
                <div className={styles.overviewGrid}>
                  <section className={styles.panel} aria-labelledby="project-health-title"><div className={styles.panelTitle}><div><span>Project health</span><h2 id="project-health-title">Current delivery view</h2></div><button type="button" onClick={() => changeView("Projects")}>View all <ArrowRight /></button></div><div className={styles.healthList}>{projects.map((project) => { const progress = projectProgress(project.id); return <button type="button" onClick={() => openDetail("project", project.id)} key={project.id}><span className={styles.projectMark}>{project.name.slice(0, 2).toUpperCase()}</span><span><b>{project.name}</b><small>{clientName(project.clientId)} · {project.deadline}</small></span><span className={styles.progress}><i><b style={{ width: `${progress.percent}%` }} /></i><small>{progress.done}/{progress.total} tasks</small></span><em data-status={project.status}>{project.status}</em><ChevronRight /></button>; })}</div></section>
                  <section className={`${styles.panel} ${styles.attentionPanel}`} aria-labelledby="attention-title"><div className={styles.panelTitle}><div><span>Needs attention</span><h2 id="attention-title">Priority queue</h2></div><button type="button" onClick={() => changeView("Tasks")}>Tasks <ArrowRight /></button></div><div>{openTasks.slice().sort((a, b) => dueRank[a.dueState] - dueRank[b.dueState]).slice(0, 4).map((task) => <article key={task.id}><button type="button" aria-label={`Mark ${task.title} complete`} onClick={() => updateTaskStatus(task.id, "Complete")}><Circle /></button><div><b>{task.title}</b><p>{projectName(task.projectId)} · {task.assignee}</p></div><span data-due={task.dueState}>{task.due}</span></article>)}</div></section>
                  <section className={`${styles.panel} ${styles.overviewAnalytics}`} aria-labelledby="completion-title"><div className={styles.panelTitle}><div><span>Task completion</span><h2 id="completion-title">Across visible projects</h2></div><button type="button" onClick={() => changeView("Analytics")}>Analytics <ArrowRight /></button></div><div className={styles.completionVisual}><div className={styles.donut} style={{ "--progress": `${completionPercent * 3.6}deg` } as CSSProperties}><span><strong>{completionPercent}%</strong><small>{completeTasks.length}/{tasks.length} complete</small></span></div><div className={styles.projectBars}>{projects.map((project) => { const progress = projectProgress(project.id); return <div key={project.id}><span><b>{project.name}</b><small>{progress.percent}%</small></span><i><b style={{ width: `${progress.percent}%` }} /></i></div>; })}</div></div><p className={styles.chartText}>Text equivalent: {completeTasks.length} of {tasks.length} tasks are complete. Project completion ranges from {Math.min(...projects.map((project) => projectProgress(project.id).percent))}% to {Math.max(...projects.map((project) => projectProgress(project.id).percent))}%.</p></section>
                  <section className={`${styles.panel} ${styles.activityPanel}`} aria-labelledby="activity-title"><div className={styles.panelTitle}><div><span>Recent activity</span><h2 id="activity-title">Workspace changes</h2></div></div><div>{activity.slice(0, 5).map((item) => <article key={item.id}><span data-tone={item.tone} /><div><b>{item.title}</b><p>{item.context}</p></div><small>{item.time}</small></article>)}</div></section>
                </div>
              </section>
            )}

            {view === "Clients" && (
              <section aria-labelledby="clients-title"><div className={styles.pageHeading}><div><p>Client management · fictional records</p><h1 id="clients-title">Sample client workspace.</h1></div><span className={styles.contextBadge}>{CLIENTS.length} sample records</span></div><div className={styles.toolbar}><label><span>Search clients</span><div><Search /><input type="search" value={clientQuery} placeholder="Search sample clients" onChange={(event) => setClientQuery(event.target.value)} /></div></label><label><span>Status</span><select value={clientStatus} onChange={(event) => setClientStatus(event.target.value as typeof clientStatus)}><option>All</option><option>Active</option><option>Planning</option></select></label></div><div className={styles.clientGrid}>{filteredClients.map((client) => { const clientProjects = projects.filter((project) => project.clientId === client.id); return <article key={client.id}><div><span>{client.name.slice(-1)}</span><em data-status={client.status}>{client.status}</em></div><p>{client.type}</p><h2>{client.name}</h2><p>{client.summary}</p><dl><div><dt>Assigned projects</dt><dd>{clientProjects.length}</dd></div><div><dt>Open tasks</dt><dd>{tasks.filter((task) => clientProjects.some((project) => project.id === task.projectId) && task.status !== "Complete").length}</dd></div></dl><button type="button" onClick={() => openDetail("client", client.id)}>Inspect sample record <ArrowRight /></button></article>; })}</div>{filteredClients.length === 0 && <EmptyState label="No sample clients match these filters." clear={() => { setClientQuery(""); setClientStatus("All"); }} />}</section>
            )}

            {view === "Projects" && (
              <section aria-labelledby="projects-title"><div className={styles.pageHeading}><div><p>Project management</p><h1 id="projects-title">Projects and delivery health.</h1></div><span className={styles.contextBadge}>{projects.length} active sample projects</span></div><div className={styles.toolbar}><label><span>Search projects</span><div><Search /><input type="search" value={projectQuery} placeholder="Search projects or clients" onChange={(event) => setProjectQuery(event.target.value)} /></div></label><label><span>Status</span><select value={projectStatus} onChange={(event) => setProjectStatusFilter(event.target.value as typeof projectStatus)}><option>All</option><option>On track</option><option>At risk</option><option>Planning</option></select></label></div><div className={styles.projectGrid}>{filteredProjects.map((project) => { const progress = projectProgress(project.id); return <article key={project.id}><div className={styles.projectCardTop}><span>{project.priority} priority</span><em data-status={project.status}>{project.status}</em></div><p>{clientName(project.clientId)}</p><h2>{project.name}</h2><p>{project.summary}</p><div className={styles.cardProgress}><span><b>Progress</b><small>{progress.done} of {progress.total} tasks</small></span><i><b style={{ width: `${progress.percent}%` }} /></i><strong>{progress.percent}%</strong></div><dl><div><dt><CalendarDays /> Deadline</dt><dd>{project.deadline}</dd></div><div><dt><Users /> Responsible</dt><dd>{project.owner}</dd></div></dl><button type="button" onClick={() => openDetail("project", project.id)}>Open project details <ArrowRight /></button></article>; })}</div>{filteredProjects.length === 0 && <EmptyState label="No sample projects match these filters." clear={() => { setProjectQuery(""); setProjectStatusFilter("All"); }} />}</section>
            )}

            {view === "Tasks" && (
              <section aria-labelledby="tasks-title"><div className={styles.pageHeading}><div><p>Task and workflow management</p><h1 id="tasks-title">Visible work, clear next actions.</h1></div><span className={styles.contextBadge}>{openTasks.length} open · {completeTasks.length} complete</span></div><div className={`${styles.toolbar} ${styles.taskToolbar}`}><label><span>Search tasks</span><div><Search /><input type="search" value={taskQuery} placeholder="Search tasks or projects" onChange={(event) => setTaskQuery(event.target.value)} /></div></label><label><span>Status</span><select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value as typeof taskStatus)}><option>All</option><option>To do</option><option>In progress</option><option>Complete</option></select></label><label><span>Priority</span><select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as typeof taskPriority)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label></div><div className={styles.taskTableWrap}><table className={styles.taskTable}><caption>Sample tasks. Status changes remain local to this browser session.</caption><thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Assignee</th><th>Due</th><th>Status</th><th><span className={styles.visuallyHidden}>Actions</span></th></tr></thead><tbody>{filteredTasks.map((task) => <tr key={task.id}><td><button type="button" className={styles.taskName} onClick={() => openDetail("task", task.id)}>{task.status === "Complete" ? <CheckCircle2 /> : <Circle />}<span>{task.title}</span></button></td><td>{projectName(task.projectId)}</td><td><em data-priority={task.priority}>{task.priority}</em></td><td>{task.assignee}</td><td><span data-due={task.dueState}>{task.due}</span></td><td><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}><option>To do</option><option>In progress</option><option>Complete</option></select></td><td><button type="button" aria-label={`Inspect ${task.title}`} onClick={() => openDetail("task", task.id)}><ChevronRight /></button></td></tr>)}</tbody></table></div>{filteredTasks.length === 0 && <EmptyState label="No sample tasks match these filters." clear={() => { setTaskQuery(""); setTaskStatus("All"); setTaskPriority("All"); }} />}</section>
            )}

            {view === "Analytics" && (
              <section aria-labelledby="analytics-title"><div className={styles.pageHeading}><div><p>Operational analytics</p><h1 id="analytics-title">Understand the visible workload.</h1></div><span className={styles.contextBadge}>Derived from {tasks.length} sample tasks</span></div><div className={styles.analyticsGrid}><section className={`${styles.panel} ${styles.analyticsDonut}`}><div className={styles.panelTitle}><div><span>Task status</span><h2>Completion distribution</h2></div></div><div><div className={styles.donut} style={{ "--progress": `${completionPercent * 3.6}deg` } as CSSProperties}><span><strong>{completionPercent}%</strong><small>complete</small></span></div><ul><li><span data-chart="complete" /> Complete <b>{completeTasks.length}</b></li><li><span data-chart="progress" /> In progress <b>{tasks.filter((task) => task.status === "In progress").length}</b></li><li><span data-chart="todo" /> To do <b>{tasks.filter((task) => task.status === "To do").length}</b></li></ul></div><p className={styles.chartText}>Text equivalent: {completeTasks.length} complete, {tasks.filter((task) => task.status === "In progress").length} in progress, and {tasks.filter((task) => task.status === "To do").length} to do.</p></section><section className={`${styles.panel} ${styles.workloadChart}`}><div className={styles.panelTitle}><div><span>Open workload</span><h2>By responsible group</h2></div></div><div>{[...new Set(tasks.map((task) => task.assignee))].map((assignee) => { const count = openTasks.filter((task) => task.assignee === assignee).length; return <div key={assignee}><span><b>{assignee}</b><small>{count} open</small></span><i><b style={{ width: `${(count / Math.max(1, openTasks.length)) * 100}%` }} /></i></div>; })}</div><p className={styles.chartText}>Bars show each responsible group’s share of the {openTasks.length} currently open tasks.</p></section><section className={`${styles.panel} ${styles.deadlineChart}`}><div className={styles.panelTitle}><div><span>Due-state distribution</span><h2>Open task timing</h2></div></div><div>{(["overdue", "today", "soon", "later"] as DueState[]).map((state) => { const count = openTasks.filter((task) => task.dueState === state).length; return <div key={state}><span>{state === "soon" ? "Upcoming" : state[0].toUpperCase() + state.slice(1)}</span><i><b data-due={state} style={{ width: `${(count / Math.max(1, openTasks.length)) * 100}%` }} /></i><strong>{count}</strong></div>; })}</div><p className={styles.chartText}>Text equivalent: {openTasks.filter((task) => task.dueState === "overdue").length} overdue, {openTasks.filter((task) => task.dueState === "today").length} due today, {openTasks.filter((task) => task.dueState === "soon").length} upcoming, and {openTasks.filter((task) => task.dueState === "later").length} later.</p></section><section className={`${styles.panel} ${styles.projectCompletion}`}><div className={styles.panelTitle}><div><span>Project completion</span><h2>Progress from task state</h2></div></div><div>{projects.map((project) => { const progress = projectProgress(project.id); return <button type="button" onClick={() => openDetail("project", project.id)} key={project.id}><span><b>{project.name}</b><small>{progress.done}/{progress.total} complete</small></span><i><b style={{ width: `${progress.percent}%` }} /></i><strong>{progress.percent}%</strong></button>; })}</div><p className={styles.chartText}>Each percentage is calculated from the same task records used in Projects and Tasks.</p></section></div></section>
            )}

            {view === "Automations" && (
              <section aria-labelledby="automations-title"><div className={styles.pageHeading}><div><p>Automation concepts · local simulation</p><h1 id="automations-title">Make repetitive decisions visible.</h1></div><span className={styles.contextBadge}>{enabledAutomations} of {automations.length} enabled</span></div><div className={styles.automationNotice}><Zap /><div><strong>Demonstration automations</strong><p>Controls update local state only. Simulations do not call APIs, send messages, create records, or trigger external services.</p></div></div><div className={styles.automationGrid}>{automations.map((automation) => <article key={automation.id}><div className={styles.automationTop}><span><Workflow /></span><button type="button" role="switch" aria-checked={automation.enabled} aria-label={`${automation.enabled ? "Disable" : "Enable"} ${automation.title}`} onClick={() => toggleAutomation(automation.id)}><i /><b>{automation.enabled ? "Enabled" : "Disabled"}</b></button></div><small>Demo rule</small><h2>{automation.title}</h2><div className={styles.ruleFlow}><span><b>When</b>{automation.trigger}</span><ArrowRight /><span><b>Then</b>{automation.action}</span></div><div className={styles.automationActions}><button type="button" aria-expanded={automationDetail === automation.id} onClick={() => setAutomationDetail(automationDetail === automation.id ? null : automation.id)}>Inspect rule</button><button type="button" onClick={() => simulateAutomation(automation)}><Play /> Simulate</button></div>{automationDetail === automation.id && <p className={styles.ruleDetail}>{automation.explanation}</p>}{automationResult?.id === automation.id && <div className={styles.simulationResult} role="status"><Check /><p>{automationResult.text}</p></div>}</article>)}</div></section>
            )}

            {view === "AI Insights" && (
              <section aria-labelledby="ai-title"><div className={styles.pageHeading}><div><p>Deterministic AI-assisted concept</p><h1 id="ai-title">Operational reasoning, grounded in visible state.</h1></div><span className={styles.aiDemoBadge}><Bot /> Simulated locally</span></div><div className={styles.aiWorkspace}><aside><div className={styles.aiIdentity}><span><Sparkles /></span><div><strong>Demo AI Assistant</strong><small>No model or API connected</small></div></div><p>Choose an operational question. The response is generated deterministically from the sample projects, tasks, statuses, and automations visible in this interface.</p><div className={styles.aiChoices}><button type="button" aria-pressed={aiChoice === "summary"} onClick={() => insightChoice("summary")}>Summarize today <ChevronRight /></button><button type="button" aria-pressed={aiChoice === "attention"} onClick={() => insightChoice("attention")}>What needs attention? <ChevronRight /></button><button type="button" aria-pressed={aiChoice === "health"} onClick={() => insightChoice("health")}>Review project health <ChevronRight /></button><button type="button" aria-pressed={aiChoice === "priorities"} onClick={() => insightChoice("priorities")}>Suggest priorities <ChevronRight /></button></div>{aiChoice === "health" && <label className={styles.aiProjectSelect}><span>Project to review</span><select value={aiProjectId} onChange={(event) => setAiProjectId(event.target.value)}>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>}</aside><div className={styles.aiResponse} aria-live="polite">{aiInsight ? <><div className={styles.responseMeta}><span><Bot /> AI-assisted demo response</span><small>Derived locally · not model-generated</small></div><h2>{aiInsight.title}</h2><p>{aiInsight.summary}</p><div><strong>Evidence from the workspace</strong><ul>{aiInsight.bullets.map((bullet) => <li key={bullet}><Check /> {bullet}</li>)}</ul></div><p className={styles.aiDisclaimer}>This deterministic response demonstrates interface and workflow design only. A production system would require approved data sources, model behavior, review rules, security, and monitoring.</p></> : <div className={styles.aiEmpty}><Sparkles /><h2>Choose a question to begin.</h2><p>The response will reference the same sample data shown across Overview, Projects, Tasks, and Analytics.</p></div>}</div></div></section>
            )}

            <section className={styles.conversion}><div><p>ILBATECH · Concept Project</p><h2>Need a system built around your business?</h2></div><div><p>This concept was created by ILBATECH to demonstrate how tailored software, automation, and AI-assisted workflows can support business operations.</p><div><a href={getContactPath("AI & Task Automation")}>Discuss a Similar Project <ArrowRight /></a></div></div></section>
          </div>
        </div>
      </div>

      {detailPanel && selectedDetail && (
        <div className={styles.detailOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetail(); }}>
          <aside ref={dialogRef} className={styles.detailPanel} role="dialog" aria-modal="true" aria-labelledby="detail-panel-title" onKeyDown={trapFocus}>
            <header><div><p>{detailPanel.type} record · sample data</p><h2 id="detail-panel-title">{"name" in selectedDetail ? selectedDetail.name : selectedDetail.title}</h2></div><button data-panel-focus type="button" aria-label="Close detail panel" onClick={closeDetail}><X /></button></header>
            {detailPanel.type === "client" && "type" in selectedDetail && (() => { const client = selectedDetail as Client; const clientProjects = projects.filter((project) => project.clientId === client.id); const clientTasks = tasks.filter((task) => clientProjects.some((project) => project.id === task.projectId)); return <div className={styles.detailBody}><div className={styles.detailStatus}><span>{client.type}</span><em data-status={client.status}>{client.status}</em></div><p className={styles.detailLead}>{client.summary}</p><dl className={styles.detailMetrics}><div><dt>Assigned projects</dt><dd>{clientProjects.length}</dd></div><div><dt>Open tasks</dt><dd>{clientTasks.filter((task) => task.status !== "Complete").length}</dd></div><div><dt>Sample contact role</dt><dd>Operations lead · no personal details</dd></div><div><dt>Recent activity</dt><dd>{client.activity}</dd></div></dl><section><span>Associated sample projects</span>{clientProjects.map((project) => { const progress = projectProgress(project.id); return <button type="button" onClick={() => setDetailPanel({ type: "project", id: project.id })} key={project.id}><div><b>{project.name}</b><small>{project.status} · {progress.percent}% complete</small></div><ChevronRight /></button>; })}</section><p className={styles.recordNote}>Fictional business record. No real company, person, or contact information is represented.</p></div>; })()}
            {detailPanel.type === "project" && "clientId" in selectedDetail && (() => { const project = selectedDetail as Project; const progress = projectProgress(project.id); const projectTasks = tasks.filter((task) => task.projectId === project.id); return <div className={styles.detailBody}><div className={styles.detailStatus}><span>{clientName(project.clientId)} · {project.priority} priority</span><em data-status={project.status}>{project.status}</em></div><p className={styles.detailLead}>{project.summary}</p><div className={styles.detailProgress}><span><b>{progress.percent}% complete</b><small>{progress.done} of {progress.total} visible tasks</small></span><i><b style={{ width: `${progress.percent}%` }} /></i></div><label className={styles.statusEditor}><span>Change sample project status</span><select value={project.status} onChange={(event) => updateProjectStatus(project.id, event.target.value as ProjectStatus)}><option>On track</option><option>At risk</option><option>Planning</option></select></label><dl className={styles.detailMetrics}><div><dt>Deadline</dt><dd>{project.deadline}</dd></div><div><dt>Responsible</dt><dd>{project.owner}</dd></div></dl><section><span>Project tasks</span>{projectTasks.map((task) => <button type="button" onClick={() => setDetailPanel({ type: "task", id: task.id })} key={task.id}><div><b>{task.title}</b><small>{task.status} · {task.priority} · {task.due}</small></div><ChevronRight /></button>)}</section><p className={styles.recordNote}>Status edits and progress calculations remain local to this browser-session demonstration.</p></div>; })()}
            {detailPanel.type === "task" && "projectId" in selectedDetail && (() => { const task = selectedDetail as Task; return <div className={styles.detailBody}><div className={styles.detailStatus}><span>{projectName(task.projectId)} · {task.assignee}</span><em data-priority={task.priority}>{task.priority}</em></div><p className={styles.detailLead}>{task.detail}</p><dl className={styles.detailMetrics}><div><dt>Due</dt><dd><span data-due={task.dueState}>{task.due}</span></dd></div><div><dt>Current status</dt><dd>{task.status}</dd></div></dl><label className={styles.statusEditor}><span>Change sample task status</span><select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}><option>To do</option><option>In progress</option><option>Complete</option></select></label><p className={styles.recordNote}>This task contains fictional operational content. Changes update the linked project, overview, analytics, and AI demo locally.</p></div>; })()}
          </aside>
        </div>
      )}
    </main>
  );
}

function EmptyState({ label, clear }: { label: string; clear: () => void }) {
  return <div className={styles.emptyState} role="status"><Filter /><h2>{label}</h2><p>Clear the current search and filters to restore the demonstration records.</p><button type="button" onClick={clear}>Clear filters</button></div>;
}
