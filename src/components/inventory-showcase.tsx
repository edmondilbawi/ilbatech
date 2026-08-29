"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  ClipboardCheck,
  ClipboardList,
  Factory,
  History,
  Inbox,
  LayoutDashboard,
  MailQuestion,
  Menu,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { getSitePath } from "@/config/site";
import {
  ACTIVITY_TYPES,
  Activity,
  activeUserForRole,
  Batch,
  confirmShipmentReceipt,
  createPurchaseRequest,
  createSeedState,
  createShipment,
  daysUntil,
  DEMO_STORAGE_KEY,
  DemoResult,
  DemoState,
  Destination,
  getLocalDate,
  INVENTORY_AREAS,
  InventoryArea,
  issueInventoryOneStock,
  loadDemoState,
  markAllNotificationsRead,
  markNotificationRead,
  NamedEntity,
  Notification,
  Product,
  productBatches,
  productQuantity,
  productStatus,
  receiveStock,
  Role,
  ROLES,
  saveEntity,
  saveProduct,
  saveUser,
  Shipment,
  toggleEntityActive,
  toggleProductActive,
  toggleUserActive,
  transformStock,
  Unit,
  UNITS,
  updatePurchaseStatus,
  User,
  visibleNotifications,
} from "./inventory-demo-model";
import styles from "./inventory-showcase.module.css";

type View =
  | "Dashboard" | "Users" | "Products" | "Suppliers" | "Destinations / Branches" | "Inventory 1" | "Inventory 2 / Factory" | "Purchase Requests" | "Notifications" | "Activity / History"
  | "Overview" | "Inventory 2" | "Messages / Requests" | "History"
  | "Current Stock" | "Stock In" | "Stock Out"
  | "Raw Materials" | "Production / Transformation" | "Finished Products"
  | "Incoming Deliveries" | "Receiving History";

type NavItem = { label: View; icon: typeof LayoutDashboard };
type Commit = <T>(result: DemoResult<T>, success: string) => boolean;

const STATIC_DATE = "2026-08-30";
const INITIAL_STATE = createSeedState(STATIC_DATE);

const NAVIGATION: Record<Role, NavItem[]> = {
  Admin: [
    { label: "Dashboard", icon: LayoutDashboard }, { label: "Users", icon: Users }, { label: "Products", icon: Boxes }, { label: "Suppliers", icon: Truck }, { label: "Destinations / Branches", icon: Building2 }, { label: "Inventory 1", icon: Warehouse }, { label: "Inventory 2 / Factory", icon: Factory }, { label: "Purchase Requests", icon: ClipboardList }, { label: "Notifications", icon: Inbox }, { label: "Activity / History", icon: History },
  ],
  Supervisor: [
    { label: "Overview", icon: LayoutDashboard }, { label: "Inventory 1", icon: Warehouse }, { label: "Inventory 2", icon: Factory }, { label: "Purchase Requests", icon: ClipboardCheck }, { label: "Messages / Requests", icon: MailQuestion }, { label: "Notifications", icon: Inbox }, { label: "History", icon: History },
  ],
  "Inventory 1": [
    { label: "Current Stock", icon: Warehouse }, { label: "Stock In", icon: ArrowDownToLine }, { label: "Stock Out", icon: ArrowUpFromLine }, { label: "Purchase Requests", icon: ClipboardList }, { label: "History", icon: History }, { label: "Notifications", icon: Inbox },
  ],
  Factory: [
    { label: "Raw Materials", icon: PackageOpen }, { label: "Stock In", icon: ArrowDownToLine }, { label: "Production / Transformation", icon: Factory }, { label: "Finished Products", icon: PackageCheck }, { label: "Stock Out", icon: ArrowUpFromLine }, { label: "History", icon: History }, { label: "Notifications", icon: Inbox },
  ],
  Branch: [
    { label: "Incoming Deliveries", icon: Truck }, { label: "Receiving History", icon: ClipboardCheck }, { label: "Notifications", icon: Inbox },
  ],
};

const DEFAULT_VIEW: Record<Role, View> = { Admin: "Dashboard", Supervisor: "Overview", "Inventory 1": "Current Stock", Factory: "Raw Materials", Branch: "Incoming Deliveries" };

const VIEW_DESCRIPTIONS: Partial<Record<View, string>> = {
  Dashboard: "See inventory, factory, purchasing, and delivery activity in one place.",
  Overview: "Monitor both inventories and review what needs attention.",
  Users: "Manage demo employees, roles, access, and status.",
  Products: "Manage products and their inventory rules.",
  Suppliers: "Manage approved inbound suppliers.",
  "Destinations / Branches": "Manage outbound branches and kitchen destinations.",
  "Inventory 1": "Review long-term and general restaurant stock.",
  "Inventory 2": "Review factory raw materials and finished products.",
  "Inventory 2 / Factory": "Review factory raw materials and finished products.",
  "Purchase Requests": "Create, review, and track product purchase requests.",
  Notifications: "See operational alerts and status updates for this role.",
  "Activity / History": "Trace every important stock and operational change.",
  History: "Trace every important stock and operational change.",
  "Messages / Requests": "Review pending requests and delivery exceptions.",
  "Current Stock": "Search Inventory 1 quantities, batches, and alerts.",
  "Stock In": "Record received stock and its supplier batch.",
  "Stock Out": "Record stock leaving for a branch or destination.",
  "Raw Materials": "Review factory raw-material quantities and batches.",
  "Production / Transformation": "Balance raw material, finished outputs, and waste.",
  "Finished Products": "Review completed products ready for dispatch.",
  "Incoming Deliveries": "Confirm the actual quantity received by this branch.",
  "Receiving History": "Review this branch's confirmed deliveries and differences.",
};

const notificationIcons = {
  "Low Stock": AlertTriangle,
  "Approaching Expiry": CalendarDays,
  "Delivery Discrepancy": SlidersHorizontal,
  "Purchase Update": ShoppingCart,
  Operational: CheckCircle2,
} as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a date";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date);
}

function offsetDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function areaRoleLabel(role: Role) {
  return role === "Branch" ? "Branch / Destination" : role;
}

export function InventoryShowcase() {
  const [demoState, setDemoState] = useState<DemoState>(INITIAL_STATE);
  const [role, setRole] = useState<Role>("Admin");
  const [view, setView] = useState<View>("Dashboard");
  const [today, setToday] = useState(STATIC_DATE);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const localToday = getLocalDate();
      setToday(localToday);
      setDemoState(loadDemoState(window.localStorage.getItem(DEMO_STORAGE_KEY), localToday));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoState));
  }, [demoState, ready]);

  const actor = activeUserForRole(demoState, role);
  const roleNotifications = visibleNotifications(demoState, role, actor);
  const unreadCount = roleNotifications.filter((notification) => !notification.read).length;

  const commit: Commit = (result, success) => {
    if (result.error) {
      setFeedback({ tone: "error", text: result.error });
      return false;
    }
    setDemoState(result.state);
    setFeedback({ tone: "success", text: success });
    return true;
  };

  function updateState(state: DemoState, message?: string) {
    setDemoState(state);
    if (message) setFeedback({ tone: "success", text: message });
  }

  function switchRole(nextRole: Role) {
    setRole(nextRole);
    setView(DEFAULT_VIEW[nextRole]);
    setFeedback(null);
    setMobileNavOpen(false);
    document.getElementById("operations-main")?.scrollIntoView({ block: "start" });
  }

  function navigate(nextView: View) {
    setView(nextView);
    setFeedback(null);
    setMobileNavOpen(false);
    document.getElementById("operations-main")?.scrollIntoView({ block: "start" });
  }

  function resetDemo() {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    setDemoState(createSeedState(today));
    setRole("Admin");
    setView("Dashboard");
    setResetOpen(false);
    setFeedback({ tone: "success", text: "Demo data restored to its original operational state." });
  }

  return <main className={styles.demo}>
    <div className={styles.conceptBar}>
      <div><span><b>Interactive Concept Demo</b><small>This preview demonstrates possible functionality. Final systems are customized according to each business&apos;s operational requirements.</small></span><a href={getSitePath("/work")}><ArrowLeft /> Return to Work</a></div>
    </div>
    <header className={styles.header}>
      <a className={styles.brand} href="#operations-main"><span><Factory /></span><span><strong>Restaurant Operations</strong><small>Inventory &amp; factory demo</small></span></a>
      <div className={styles.headerTools}>
        <label className={styles.roleSwitcher}><span>Viewing as</span><select aria-label="Viewing as role" value={role} onChange={(event) => switchRole(event.target.value as Role)}>{ROLES.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <div className={styles.activeUser}><span>{actor.name.slice(0, 1)}</span><div><strong>{actor.name}</strong><small>{role === "Branch" ? demoState.destinations.find((destination) => destination.id === actor.branchId)?.name : areaRoleLabel(role)}</small></div></div>
        <button className={styles.resetButton} type="button" onClick={() => setResetOpen(true)}><RefreshCcw /> Reset Demo</button>
      </div>
    </header>
    <button className={styles.mobileMenuButton} type="button" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu /> {view}</button>
    <nav className={`${styles.navigation} ${mobileNavOpen ? styles.navigationOpen : ""}`} aria-label={`${role} sections`}>
      {NAVIGATION[role].map(({ label, icon: Icon }) => <button type="button" aria-current={view === label ? "page" : undefined} onClick={() => navigate(label)} key={label}><Icon /><span>{label}</span>{label === "Notifications" && unreadCount > 0 && <b>{unreadCount}</b>}</button>)}
    </nav>
    <div id="operations-main" className={styles.workspace}>
      <header className={styles.pageHeader}><div><p>{areaRoleLabel(role)} workspace</p><h1>{view}</h1><span>{VIEW_DESCRIPTIONS[view]}</span></div>{role !== "Admin" && <span className={styles.permissionBadge}><ShieldCheck /> Role permissions active</span>}</header>
      {feedback && <div className={feedback.tone === "success" ? styles.notice : styles.error} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.tone === "success" ? <CheckCircle2 /> : <AlertTriangle />}<span>{feedback.text}</span><button type="button" aria-label="Dismiss message" onClick={() => setFeedback(null)}><X /></button></div>}

      {(view === "Dashboard" || view === "Overview") && <OverviewView state={demoState} today={today} role={role} navigate={navigate} />}
      {view === "Users" && <UsersView state={demoState} actor={actor} commit={commit} />}
      {view === "Products" && <ProductsView state={demoState} actor={actor} today={today} commit={commit} />}
      {view === "Suppliers" && <EntitiesView state={demoState} actor={actor} kind="suppliers" commit={commit} />}
      {view === "Destinations / Branches" && <EntitiesView state={demoState} actor={actor} kind="destinations" commit={commit} />}
      {view === "Inventory 1" && <StockView state={demoState} today={today} area="Inventory 1" title="Inventory 1 Current Stock" />}
      {(view === "Inventory 2" || view === "Inventory 2 / Factory") && <FactoryOverview state={demoState} today={today} />}
      {view === "Current Stock" && <StockView state={demoState} today={today} area="Inventory 1" title="Current Stock" />}
      {view === "Raw Materials" && <StockView state={demoState} today={today} area="Raw Materials" title="Raw Materials" />}
      {view === "Finished Products" && <StockView state={demoState} today={today} area="Finished Products" title="Finished Products" />}
      {view === "Stock In" && <StockInView state={demoState} actor={actor} today={today} area={role === "Factory" ? "Raw Materials" : "Inventory 1"} commit={commit} />}
      {view === "Stock Out" && <StockOutView state={demoState} actor={actor} today={today} factory={role === "Factory"} commit={commit} />}
      {view === "Production / Transformation" && <ProductionView state={demoState} actor={actor} today={today} commit={commit} />}
      {view === "Purchase Requests" && <PurchaseRequestsView state={demoState} actor={actor} today={today} role={role} commit={commit} />}
      {view === "Messages / Requests" && <MessagesView state={demoState} commit={commit} actor={actor} />}
      {view === "Notifications" && <NotificationsView notifications={roleNotifications} markRead={(id) => updateState(markNotificationRead(demoState, id))} markAll={() => updateState(markAllNotificationsRead(demoState, role, actor), "Visible notifications marked as read.")} />}
      {(view === "History" || view === "Activity / History") && <HistoryView state={demoState} role={role} actor={actor} />}
      {view === "Incoming Deliveries" && <IncomingDeliveries state={demoState} actor={actor} commit={commit} />}
      {view === "Receiving History" && <ReceivingHistory state={demoState} actor={actor} />}
    </div>
    {resetOpen && <ConfirmDialog title="Reset demo data to its original state?" confirmLabel="Reset" close={() => setResetOpen(false)} confirm={resetDemo}><p>This restores users, stock, batches, requests, notifications, shipments, and production history.</p></ConfirmDialog>}
  </main>;
}

function OverviewView({ state, today, role, navigate }: { state: DemoState; today: string; role: Role; navigate: (view: View) => void }) {
  const activeProducts = state.products.filter((product) => product.active);
  const lowStock = activeProducts.filter((product) => ["Low Stock", "Out of Stock"].includes(productStatus(state, product, today)));
  const expiring = state.batches.filter((batch) => batch.quantity > 0 && batch.expiryDate && daysUntil(batch.expiryDate, today) <= (state.products.find((product) => product.id === batch.productId)?.expiryWarningDays ?? 0));
  const pendingRequests = state.purchaseRequests.filter((request) => request.status === "Pending");
  const pendingReceipts = state.shipments.filter((shipment) => shipment.status === "Awaiting Confirmation");
  const discrepancies = state.shipments.filter((shipment) => shipment.status === "Discrepancy");
  const metrics = [
    ["Inventory 1 products", activeProducts.filter((product) => product.area === "Inventory 1").length, Warehouse, "Inventory 1" as View],
    ["Raw materials", activeProducts.filter((product) => product.area === "Raw Materials").length, PackageOpen, (role === "Admin" ? "Inventory 2 / Factory" : "Inventory 2") as View],
    ["Finished products", activeProducts.filter((product) => product.area === "Finished Products").length, PackageCheck, (role === "Admin" ? "Inventory 2 / Factory" : "Inventory 2") as View],
    ["Low-stock alerts", lowStock.length, AlertTriangle, "Notifications" as View],
    ["Expiring batches", expiring.length, CalendarDays, "Notifications" as View],
    ["Pending purchase requests", pendingRequests.length, ClipboardList, "Purchase Requests" as View],
    ["Pending branch receipts", pendingReceipts.length, Truck, (role === "Admin" ? "Activity / History" : "Messages / Requests") as View],
    ["Discrepancies", discrepancies.length, SlidersHorizontal, "Notifications" as View],
  ] as const;
  const healthy = activeProducts.filter((product) => productStatus(state, product, today) === "Healthy").length;
  return <>
    <section className={styles.metricGrid}>{metrics.map(([label, value, Icon, target]) => <button type="button" onClick={() => navigate(target)} key={label}><span data-alert={label.includes("Low") || label.includes("Expiring") || label.includes("Discrepancies")}><Icon /></span><small>{label}</small><strong>{value}</strong><i>Open <ChevronRight /></i></button>)}</section>
    <div className={styles.dashboardGrid}>
      <section className={styles.panel}><PanelHeader eyebrow="Inventory health" title="Stock status across active products" /><div className={styles.healthSummary}><div className={styles.healthNumber}><strong>{healthy}</strong><span>of {activeProducts.length} products healthy</span></div>{["Inventory 1", "Raw Materials", "Finished Products"].map((area) => { const areaProducts = activeProducts.filter((product) => product.area === area); const good = areaProducts.filter((product) => productStatus(state, product, today) === "Healthy").length; const percent = Math.round(good / Math.max(1, areaProducts.length) * 100); return <div className={styles.healthBar} key={area}><span><b>{area}</b><small>{good}/{areaProducts.length} healthy</small></span><i><b style={{ width: `${percent}%` }} /></i></div>; })}</div></section>
      <section className={styles.panel}><PanelHeader eyebrow="Recent activity" title="Latest operational changes" action={<button type="button" onClick={() => navigate(role === "Admin" ? "Activity / History" : "History")}>Full History <ArrowRight /></button>} /><ActivityList activities={state.activities.slice(0, 6)} /></section>
    </div>
    <section className={styles.attentionPanel}><PanelHeader eyebrow="Needs attention" title="Current operational queue" /><div>{lowStock.slice(0, 3).map((product) => <article key={product.id}><span data-tone="warning"><AlertTriangle /></span><div><strong>{product.name}</strong><small>{product.area} · {formatNumber(productQuantity(state, product.id))} {product.unit} available</small></div><em>{productStatus(state, product, today)}</em></article>)}{pendingRequests.slice(0, 2).map((request) => <article key={request.id}><span><ClipboardList /></span><div><strong>{request.id} · {request.requestedByName}</strong><small>{request.items.length} products · {request.message}</small></div><em>Pending</em></article>)}</div></section>
  </>;
}

function UsersView({ state, actor, commit }: { state: DemoState; actor: User; commit: Commit }) {
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  return <section className={styles.panel}><PanelHeader eyebrow="Admin access" title={`${state.users.length} demo employees`} action={<button className={styles.primaryButton} type="button" onClick={() => setEditing(null)}><Plus /> Create User</button>} /><div className={styles.dataWrap}><table className={styles.dataTable}><thead><tr><th>Employee</th><th>Role</th><th>Location</th><th>Status</th><th>Access</th><th>Actions</th></tr></thead><tbody>{state.users.map((user) => <tr key={user.id}><td data-label="Employee"><strong>{user.name}</strong></td><td data-label="Role">{areaRoleLabel(user.role)}</td><td data-label="Location">{user.branchId ? state.destinations.find((destination) => destination.id === user.branchId)?.name : "Operations"}</td><td data-label="Status"><StatusBadge status={user.status} /></td><td data-label="Access"><StatusBadge status={user.active ? "Active" : "Inactive"} /></td><td data-label="Actions"><div className={styles.rowActions}><button type="button" onClick={() => setEditing(user)}><Pencil /> Edit</button><button type="button" onClick={() => commit(toggleUserActive(state, user.id, actor), `${user.name} access updated. Historical activity remains unchanged.`)}>{user.active ? "Deactivate" : "Activate"}</button></div></td></tr>)}</tbody></table></div>{editing !== undefined && <UserDialog state={state} user={editing ?? undefined} close={() => setEditing(undefined)} save={(input) => { const result = saveUser(state, input, actor, editing?.id); if (commit(result, `${input.name} saved.`)) setEditing(undefined); }} />}</section>;
}

function UserDialog({ state, user, close, save }: { state: DemoState; user?: User; close: () => void; save: (input: Omit<User, "id">) => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "Inventory 1");
  const [branchId, setBranchId] = useState(user?.branchId ?? "downtown");
  const [status, setStatus] = useState<User["status"]>(user?.status ?? "Offline");
  return <Modal title={user ? "Edit user" : "Create user"} eyebrow="User management" close={close}><form className={styles.modalForm} onSubmit={(event) => { event.preventDefault(); save({ name, role, ...(role === "Branch" ? { branchId } : {}), active: user?.active ?? true, status }); }}><Field label="Employee name"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label="Role"><select value={role} onChange={(event) => setRole(event.target.value as Role)}>{ROLES.map((item) => <option key={item}>{item}</option>)}</select></Field>{role === "Branch" && <Field label="Branch"><select value={branchId} onChange={(event) => setBranchId(event.target.value)}>{state.destinations.filter((destination) => destination.type === "Branch" && destination.active).map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}</select></Field>}<Field label="Current status"><select value={status} onChange={(event) => setStatus(event.target.value as User["status"])}><option>Online</option><option>Offline</option></select></Field><ModalFooter close={close} submit={user ? "Save Changes" : "Create User"} /></form></Modal>;
}

function ProductsView({ state, actor, today, commit }: { state: DemoState; actor: User; today: string; commit: Commit }) {
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [area, setArea] = useState<"All" | InventoryArea>("All");
  const visible = state.products.filter((product) => area === "All" || product.area === area);
  return <section className={styles.panel}><PanelHeader eyebrow="Product rules" title={`${state.products.filter((product) => product.active).length} active products`} action={<button className={styles.primaryButton} type="button" onClick={() => setEditing(null)}><Plus /> Add Product</button>} /><div className={styles.tableTools}><div className={styles.segmented}>{["All", ...INVENTORY_AREAS].map((item) => <button type="button" aria-pressed={area === item} onClick={() => setArea(item as typeof area)} key={item}>{item}</button>)}</div></div><div className={styles.dataWrap}><table className={styles.dataTable}><thead><tr><th>Product</th><th>Inventory</th><th>Category</th><th>Available</th><th>Minimum</th><th>Expiry warning</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((product) => <tr key={product.id}><td data-label="Product"><strong>{product.name}</strong><small>{product.active ? "Active" : "Inactive"}</small></td><td data-label="Inventory">{product.area}</td><td data-label="Category">{product.category}</td><td data-label="Available"><b>{formatNumber(productQuantity(state, product.id))} {product.unit}</b></td><td data-label="Minimum">{formatNumber(product.minimumStock)} {product.unit}</td><td data-label="Expiry warning">{product.expiryWarningDays} days</td><td data-label="Status"><StatusBadge status={product.active ? productStatus(state, product, today) : "Inactive"} /></td><td data-label="Actions"><div className={styles.rowActions}><button type="button" onClick={() => setEditing(product)}><Pencil /> Edit</button><button type="button" onClick={() => commit(toggleProductActive(state, product.id, actor), `${product.name} ${product.active ? "deactivated" : "activated"}. Historical records remain available.`)}>{product.active ? "Deactivate" : "Activate"}</button></div></td></tr>)}</tbody></table></div>{editing !== undefined && <ProductDialog state={state} product={editing ?? undefined} close={() => setEditing(undefined)} save={(input) => { const result = saveProduct(state, input, actor, editing?.id); if (commit(result, `${input.name} saved.`)) setEditing(undefined); }} />}</section>;
}

function ProductDialog({ state, product, close, save }: { state: DemoState; product?: Product; close: () => void; save: (input: Omit<Product, "id" | "active"> & { active?: boolean }) => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [area, setArea] = useState<InventoryArea>(product?.area ?? "Inventory 1");
  const [category, setCategory] = useState(product?.category ?? "Meat");
  const [unit, setUnit] = useState<Unit>(product?.unit ?? "kg");
  const [minimum, setMinimum] = useState(String(product?.minimumStock ?? 0));
  const [warning, setWarning] = useState(String(product?.expiryWarningDays ?? 3));
  const hasHistory = product ? state.batches.some((batch) => batch.productId === product.id) || state.activities.some((activity) => activity.productId === product.id) : false;
  return <Modal title={product ? "Edit product" : "Add product"} eyebrow="Product management" close={close}><form className={styles.modalForm} onSubmit={(event) => { event.preventDefault(); save({ name, area, category, unit, minimumStock: Number(minimum), expiryWarningDays: Number(warning), ...(area === "Finished Products" ? { shelfLifeDays: product?.shelfLifeDays ?? 3 } : {}), active: product?.active ?? true }); }}><Field label="Product name"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></Field><div className={styles.formRow}><Field label="Inventory assignment"><select value={area} disabled={hasHistory} onChange={(event) => setArea(event.target.value as InventoryArea)}>{INVENTORY_AREAS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Category"><input value={category} onChange={(event) => setCategory(event.target.value)} /></Field></div><div className={styles.formRow}><Field label="Unit"><select value={unit} disabled={hasHistory} onChange={(event) => setUnit(event.target.value as Unit)}>{UNITS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Minimum stock"><input type="number" min="0" step="any" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></Field></div>{hasHistory && <p className={styles.fieldNote}>Unit and inventory assignment are protected because this product has stock history.</p>}<Field label="Expiry warning period (days)"><input type="number" min="0" step="1" value={warning} onChange={(event) => setWarning(event.target.value)} /></Field><ModalFooter close={close} submit={product ? "Save Changes" : "Add Product"} /></form></Modal>;
}

function EntitiesView({ state, actor, kind, commit }: { state: DemoState; actor: User; kind: "suppliers" | "destinations"; commit: Commit }) {
  const [editing, setEditing] = useState<NamedEntity | Destination | null | undefined>(undefined);
  const collection = state[kind];
  const title = kind === "suppliers" ? "Suppliers" : "Destinations / Branches";
  return <section className={styles.panel}><PanelHeader eyebrow="Master data" title={`${collection.filter((item) => item.active).length} active ${title.toLowerCase()}`} action={<button className={styles.primaryButton} type="button" onClick={() => setEditing(null)}><Plus /> Add {kind === "suppliers" ? "Supplier" : "Destination"}</button>} /><div className={styles.entityGrid}>{collection.map((entity) => <article key={entity.id}><span data-active={entity.active}>{kind === "suppliers" ? <Truck /> : <Building2 />}</span><div><h2>{entity.name}</h2><p>{kind === "destinations" ? (entity as Destination).type : "Inbound supplier"}</p></div><StatusBadge status={entity.active ? "Active" : "Inactive"} /><footer><button type="button" onClick={() => setEditing(entity)}><Pencil /> Edit</button><button type="button" onClick={() => commit(toggleEntityActive(state, kind, entity.id, actor), `${entity.name} ${entity.active ? "deactivated" : "activated"}. Historical records remain unchanged.`)}>{entity.active ? "Deactivate" : "Activate"}</button></footer></article>)}</div>{editing !== undefined && <EntityDialog entity={editing ?? undefined} kind={kind} close={() => setEditing(undefined)} save={(input) => { const result = saveEntity(state, kind, input, actor, editing?.id); if (commit(result, `${input.name} saved.`)) setEditing(undefined); }} />}</section>;
}

function EntityDialog({ entity, kind, close, save }: { entity?: NamedEntity | Destination; kind: "suppliers" | "destinations"; close: () => void; save: (input: { name: string; type?: Destination["type"]; active?: boolean }) => void }) {
  const [name, setName] = useState(entity?.name ?? "");
  const [type, setType] = useState<Destination["type"]>(kind === "destinations" && entity && "type" in entity ? entity.type : "Branch");
  return <Modal title={`${entity ? "Edit" : "Add"} ${kind === "suppliers" ? "supplier" : "destination"}`} eyebrow="Master data" close={close}><form className={styles.modalForm} onSubmit={(event) => { event.preventDefault(); save({ name, ...(kind === "destinations" ? { type } : {}), active: entity?.active ?? true }); }}><Field label="Name"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></Field>{kind === "destinations" && <Field label="Destination type"><select value={type} onChange={(event) => setType(event.target.value as Destination["type"])}><option>Branch</option><option>Kitchen</option></select></Field>}<ModalFooter close={close} submit={entity ? "Save Changes" : "Add"} /></form></Modal>;
}

function StockView({ state, today, area, title }: { state: DemoState; today: string; area: InventoryArea; title: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const products = state.products.filter((product) => product.active && product.area === area && product.name.toLowerCase().includes(search.toLowerCase()) && (status === "All" || productStatus(state, product, today) === status));
  return <section className={styles.panel}><PanelHeader eyebrow={area} title={title} /><div className={styles.tableTools}><label className={styles.searchField}><Search /><input aria-label="Search stock" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." /></label><select aria-label="Filter stock status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Healthy</option><option>Low Stock</option><option>Expiring Soon</option><option>Out of Stock</option></select></div><div className={styles.dataWrap}><table className={styles.dataTable}><thead><tr><th>Product</th><th>Available</th><th>Minimum</th><th>Batch / expiry</th><th>Status</th></tr></thead><tbody>{products.map((product) => { const batches = productBatches(state, product.id); return <tr key={product.id}><td data-label="Product"><strong>{product.name}</strong><small>{product.category}</small></td><td data-label="Available"><b>{formatNumber(productQuantity(state, product.id))} {product.unit}</b></td><td data-label="Minimum">{formatNumber(product.minimumStock)} {product.unit}</td><td data-label="Batch / expiry"><div className={styles.batchStack}>{batches.slice(0, 2).map((batch) => <span key={batch.id}><b>{batch.id}</b> · {formatNumber(batch.quantity)} {product.unit}{batch.expiryDate ? ` · ${formatDate(batch.expiryDate)}` : ""}</span>)}{batches.length > 2 && <small>+{batches.length - 2} more batches</small>}</div></td><td data-label="Status"><StatusBadge status={productStatus(state, product, today)} /></td></tr>; })}</tbody></table></div>{!products.length && <EmptyState title="No matching stock" text="Clear the search or status filter to see products." />}</section>;
}

function FactoryOverview({ state, today }: { state: DemoState; today: string }) {
  return <div className={styles.stack}><StockView state={state} today={today} area="Raw Materials" title="Raw Materials" /><StockView state={state} today={today} area="Finished Products" title="Finished Products" /></div>;
}

function StockInView({ state, actor, today, area, commit }: { state: DemoState; actor: User; today: string; area: "Inventory 1" | "Raw Materials"; commit: Commit }) {
  const products = state.products.filter((product) => product.active && product.area === area);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [expiryDate, setExpiryDate] = useState(offsetDate(today, 4));
  const [date, setDate] = useState(today);
  const [changeDate, setChangeDate] = useState(false);
  const [lastBatch, setLastBatch] = useState<Batch | null>(null);
  const product = state.products.find((item) => item.id === productId);
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = receiveStock(state, { productId, quantity: Number(quantity), expiryDate, date, supplierId }, actor, today);
    if (commit(result, `${product?.name ?? "Stock"} received and batch saved.`)) { setLastBatch(result.value ?? null); setQuantity(""); setDate(today); setChangeDate(false); }
  }
  return <div className={styles.formLayout}><form className={styles.operationForm} onSubmit={submit}><FormStep number="1" title={area === "Raw Materials" ? "What raw material arrived?" : "What product arrived?"} /><Field label="Product"><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name} — {formatNumber(productQuantity(state, item.id))} {item.unit}</option>)}</select></Field>{product && <Available product={product} state={state} today={today} />}<FormStep number="2" title="How much arrived?" /><QuantityField value={quantity} setValue={setQuantity} unit={product?.unit} /><FormStep number="3" title="Which supplier sent it?" /><Field label="Supplier"><select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="">Choose a supplier</option>{state.suppliers.filter((supplier) => supplier.active).map((supplier) => <option value={supplier.id} key={supplier.id}>{supplier.name}</option>)}</select></Field><FormStep number="4" title="When does this batch expire?" /><Field label="Expiry date"><input type="date" min={date} value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></Field><DateControl number="5" today={today} date={date} setDate={setDate} changed={changeDate} setChanged={setChangeDate} label="Receiving date" /><button className={styles.submitButton} type="submit"><ArrowDownToLine /> Add Stock &amp; Save Batch</button></form><aside className={lastBatch ? styles.successCard : styles.helpCard}>{lastBatch ? <><span><Check /></span><p>Stock received</p><h2>{product?.name}</h2><strong>+{formatNumber(lastBatch.quantity)} {product?.unit}</strong><div><b>Batch {lastBatch.id}</b><small>Expires {lastBatch.expiryDate && formatDate(lastBatch.expiryDate)}</small></div></> : <><span><ArrowDownToLine /></span><h2>Batch-level receiving</h2><p>Every delivery records its supplier, quantity, expiry date, employee, and receiving date.</p><ul><li><Check /> Stock updates immediately</li><li><Check /> Alerts recalculate automatically</li><li><Check /> History keeps the employee name</li></ul></>}</aside></div>;
}

function StockOutView({ state, actor, today, factory, commit }: { state: DemoState; actor: User; today: string; factory: boolean; commit: Commit }) {
  const area: InventoryArea = factory ? "Finished Products" : "Inventory 1";
  const products = state.products.filter((product) => product.active && product.area === area);
  const [productId, setProductId] = useState(factory ? "marinated-chicken" : products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(factory ? "20" : "");
  const [destinationId, setDestinationId] = useState(factory ? "downtown" : "");
  const [date, setDate] = useState(today);
  const [changeDate, setChangeDate] = useState(false);
  const [lastShipment, setLastShipment] = useState<Shipment | null>(null);
  const product = state.products.find((item) => item.id === productId);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (factory) {
      const result = createShipment(state, { productId, quantity: Number(quantity), date, destinationId }, actor, today);
      if (commit(result, `${result.value?.id ?? "Shipment"} created for branch confirmation.`)) { setLastShipment(result.value ?? null); setQuantity(""); setDate(today); setChangeDate(false); }
      return;
    }
    const result = issueInventoryOneStock(state, { productId, quantity: Number(quantity), date, destinationId }, actor, today);
    if (commit(result, `${product?.name ?? "Stock"} sent successfully.`)) { setQuantity(""); setDate(today); setChangeDate(false); }
  }
  const destinations = state.destinations.filter((destination) => destination.active && (!factory || destination.type === "Branch"));
  return <div className={styles.formLayout}><form className={styles.operationForm} onSubmit={submit}><FormStep number="1" title={factory ? "What finished product is being sent?" : "What product is leaving?"} /><Field label={factory ? "Finished product" : "Product"}><select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.map((item) => <option value={item.id} key={item.id}>{item.name} — {formatNumber(productQuantity(state, item.id))} {item.unit}</option>)}</select></Field>{product && <Available product={product} state={state} today={today} />}<FormStep number="2" title="How much is leaving?" /><QuantityField value={quantity} setValue={setQuantity} unit={product?.unit} /><FormStep number="3" title={factory ? "Which branch will receive it?" : "Where is it going?"} /><Field label={factory ? "Destination branch" : "Destination / Branch"}><select value={destinationId} onChange={(event) => setDestinationId(event.target.value)}><option value="">Choose a destination</option>{destinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}</select></Field><DateControl number="4" today={today} date={date} setDate={setDate} changed={changeDate} setChanged={setChangeDate} label={factory ? "Shipment date" : "Stock-out date"} /><button className={`${styles.submitButton} ${styles.outButton}`} type="submit"><ArrowUpFromLine /> {factory ? "Create Branch Shipment" : "Remove Stock"}</button></form><aside className={lastShipment ? styles.successCard : styles.helpCard}>{lastShipment ? <><span><Truck /></span><p>Shipment created</p><h2>{lastShipment.id}</h2><strong>{formatNumber(lastShipment.sentQuantity)} {lastShipment.unit}</strong><div><b>{lastShipment.productName}</b><small>To {lastShipment.destinationName} · awaiting confirmation</small></div></> : <><span>{factory ? <Truck /> : <ArrowUpFromLine />}</span><h2>{factory ? "Traceable branch delivery" : "Protected stock issue"}</h2><p>{factory ? "Sent quantity is preserved so the branch can confirm its actual receipt later." : "The system deducts the oldest usable batches first and never permits negative stock."}</p><ul><li><Check /> Destination required</li><li><Check /> Employee recorded</li><li><Check /> Excess quantities blocked</li></ul></>}</aside></div>;
}

function ProductionView({ state, actor, today, commit }: { state: DemoState; actor: User; today: string; commit: Commit }) {
  const rawProducts = state.products.filter((product) => product.active && product.area === "Raw Materials");
  const finishedProducts = state.products.filter((product) => product.active && product.area === "Finished Products");
  const [rawProductId, setRawProductId] = useState("raw-chicken");
  const [rawQuantity, setRawQuantity] = useState("20");
  const [outputs, setOutputs] = useState([{ productId: "chicken-fillet", quantity: "12" }, { productId: "marinated-chicken", quantity: "5" }]);
  const [waste, setWaste] = useState("3");
  const [date, setDate] = useState(today);
  const [changeDate, setChangeDate] = useState(false);
  const [lastProduction, setLastProduction] = useState<string | null>(null);
  const raw = state.products.find((product) => product.id === rawProductId);
  const rawValue = Number(rawQuantity) || 0;
  const outputTotal = outputs.reduce((total, output) => total + (Number(output.quantity) || 0), 0);
  const wasteValue = Number(waste) || 0;
  const accounted = Math.round((outputTotal + wasteValue) * 1000) / 1000;
  const difference = Math.round((rawValue - accounted) * 1000) / 1000;
  const balanced = rawValue > 0 && difference === 0;
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = transformStock(state, { rawProductId, rawQuantity: Number(rawQuantity), outputs: outputs.map((output) => ({ productId: output.productId, quantity: Number(output.quantity) })), waste: Number(waste), date }, actor, today);
    if (commit(result, `${result.value?.id ?? "Production"} saved. Raw stock, finished products, waste, and history updated together.`)) setLastProduction(result.value?.id ?? null);
  }
  return <div className={styles.productionLayout}><form className={styles.productionForm} onSubmit={submit}><section><PanelHeader eyebrow="Raw input" title="Material used" /><div className={styles.formSection}><Field label="Raw material"><select value={rawProductId} onChange={(event) => setRawProductId(event.target.value)}>{rawProducts.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select></Field>{raw && <Available product={raw} state={state} today={today} />}<QuantityField label="Raw quantity used" value={rawQuantity} setValue={setRawQuantity} unit={raw?.unit} /></div></section><section><PanelHeader eyebrow="Finished output" title="What did production create?" action={<button type="button" onClick={() => setOutputs((current) => [...current, { productId: "", quantity: "" }])}><Plus /> Add output</button>} /><div className={styles.outputList}>{outputs.map((output, index) => <div className={styles.outputRow} key={index}><span>{index + 1}</span><select aria-label={`Finished product ${index + 1}`} value={output.productId} onChange={(event) => setOutputs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, productId: event.target.value } : item))}><option value="">Choose finished product</option>{finishedProducts.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select><div><input aria-label={`Finished quantity ${index + 1}`} type="number" min="0" step="any" value={output.quantity} onChange={(event) => setOutputs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item))} /><b>{raw?.unit}</b></div>{outputs.length > 1 && <button type="button" aria-label={`Remove finished output ${index + 1}`} onClick={() => setOutputs((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X /></button>}</div>)}</div></section><section><PanelHeader eyebrow="Waste" title="Material not converted" /><div className={styles.formSection}><QuantityField label="Waste quantity" value={waste} setValue={setWaste} unit={raw?.unit} /><DateControl number="" today={today} date={date} setDate={setDate} changed={changeDate} setChanged={setChangeDate} label="Production date" /></div></section><button className={styles.submitButton} type="submit" disabled={!balanced}><Factory /> Confirm Balanced Production</button></form><aside className={styles.balanceCard} data-balanced={balanced}><span>{balanced ? <CheckCircle2 /> : <CircleGauge />}</span><p>Production balance</p><h2>{formatNumber(rawValue)} = {formatNumber(outputTotal)} + {formatNumber(wasteValue)}</h2><dl><div><dt>Raw Used</dt><dd>{formatNumber(rawValue)} {raw?.unit}</dd></div><div><dt>Finished Output</dt><dd>{formatNumber(outputTotal)} {raw?.unit}</dd></div><div><dt>Waste</dt><dd>{formatNumber(wasteValue)} {raw?.unit}</dd></div><div><dt>Accounted For</dt><dd>{formatNumber(accounted)} {raw?.unit}</dd></div></dl><strong>{balanced ? "Balanced ✓" : difference > 0 ? `${formatNumber(difference)} ${raw?.unit} remains unaccounted for.` : difference < 0 ? `Exceeds raw quantity by ${formatNumber(Math.abs(difference))} ${raw?.unit}.` : "Enter a raw quantity."}</strong>{lastProduction && <small>{lastProduction} was saved atomically.</small>}</aside></div>;
}

function PurchaseRequestsView({ state, actor, today, role, commit }: { state: DemoState; actor: User; today: string; role: Role; commit: Commit }) {
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = role === "Inventory 1" || role === "Admin";
  const canReview = role === "Supervisor" || role === "Admin";
  const requests = role === "Inventory 1" ? state.purchaseRequests.filter((request) => request.requestedById === actor.id) : state.purchaseRequests;
  return <section className={styles.panel}><PanelHeader eyebrow="Purchasing workflow" title={`${requests.length} purchase requests`} action={canCreate ? <button className={styles.primaryButton} type="button" onClick={() => setCreateOpen(true)}><Plus /> New Request</button> : undefined} /><div className={styles.requestList}>{requests.map((request) => <article key={request.id}><header><div><span>{request.id}</span><h2>{request.requestedByName}</h2><small>{formatDate(request.requestDate)} · {request.items.length} product{request.items.length === 1 ? "" : "s"}</small></div><StatusBadge status={request.status} /></header><ul>{request.items.map((item) => <li key={item.productId}><span>{item.productName}</span><strong>{formatNumber(item.quantity)} {item.unit}</strong></li>)}</ul>{request.message && <blockquote>{request.message}</blockquote>}<footer><span>{request.reviewedByName ? `Last updated by ${request.reviewedByName}` : "Awaiting supervisor review"}</span>{canReview && <div>{request.status === "Pending" && <><button type="button" onClick={() => commit(updatePurchaseStatus(state, request.id, "Rejected", actor), `${request.id} rejected; the requester was notified.`)}>Reject</button><button type="button" onClick={() => commit(updatePurchaseStatus(state, request.id, "Accepted", actor), `${request.id} accepted; the requester was notified.`)}>Accept</button></>}{request.status === "Accepted" && <button className={styles.completeButton} type="button" onClick={() => commit(updatePurchaseStatus(state, request.id, "Purchase Complete", actor), `${request.id} marked Purchase Complete; the requester was notified.`)}><Check /> Purchase Complete</button>}</div>}</footer></article>)}</div>{createOpen && <PurchaseRequestDialog state={state} actor={actor} today={today} close={() => setCreateOpen(false)} save={(input) => { const result = createPurchaseRequest(state, input, actor, today); if (commit(result, `${result.value?.id ?? "Purchase request"} submitted to the Supervisor.`)) setCreateOpen(false); }} />}</section>;
}

function PurchaseRequestDialog({ state, actor, today, close, save }: { state: DemoState; actor: User; today: string; close: () => void; save: (input: { items: Array<{ productId: string; quantity: number }>; message?: string; date: string }) => void }) {
  const products = state.products.filter((product) => product.active && product.area === "Inventory 1");
  const [items, setItems] = useState([{ productId: "chicken-breast", quantity: "30" }, { productId: "mozzarella", quantity: "10" }]);
  const [message, setMessage] = useState("Required before weekend service.");
  return <Modal title="New purchase request" eyebrow={`Requested by ${actor.name}`} close={close}><form className={styles.modalForm} onSubmit={(event) => { event.preventDefault(); save({ items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) })), message, date: today }); }}><div className={styles.purchaseLines}>{items.map((item, index) => <div key={index}><select aria-label={`Requested product ${index + 1}`} value={item.productId} onChange={(event) => setItems((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, productId: event.target.value } : line))}><option value="">Choose product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select><input aria-label={`Requested quantity ${index + 1}`} type="number" min="0" step="any" value={item.quantity} onChange={(event) => setItems((current) => current.map((line, lineIndex) => lineIndex === index ? { ...line, quantity: event.target.value } : line))} /><b>{state.products.find((product) => product.id === item.productId)?.unit ?? "unit"}</b>{items.length > 1 && <button type="button" aria-label={`Remove request line ${index + 1}`} onClick={() => setItems((current) => current.filter((_, lineIndex) => lineIndex !== index))}><X /></button>}</div>)}</div><button className={styles.addLineButton} type="button" onClick={() => setItems((current) => [...current, { productId: "", quantity: "" }])}><Plus /> Add another product</button><Field label="Optional message"><textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} /></Field><div className={styles.requestMeta}><CalendarDays /><span><small>Request date</small><strong>Today · {formatDate(today)}</strong></span></div><ModalFooter close={close} submit="Submit Request" /></form></Modal>;
}

function MessagesView({ state, commit, actor }: { state: DemoState; commit: Commit; actor: User }) {
  const pending = state.purchaseRequests.filter((request) => request.status === "Pending");
  const discrepancies = state.shipments.filter((shipment) => shipment.status === "Discrepancy");
  return <div className={styles.dashboardGrid}><section className={styles.panel}><PanelHeader eyebrow="Requests" title="Pending purchase decisions" /><div className={styles.compactQueue}>{pending.map((request) => <article key={request.id}><span><ClipboardList /></span><div><strong>{request.id} · {request.requestedByName}</strong><small>{request.items.map((item) => item.productName).join(", ")}</small></div><div><button type="button" onClick={() => commit(updatePurchaseStatus(state, request.id, "Rejected", actor), `${request.id} rejected.`)}>Reject</button><button type="button" onClick={() => commit(updatePurchaseStatus(state, request.id, "Accepted", actor), `${request.id} accepted.`)}>Accept</button></div></article>)}</div></section><section className={styles.panel}><PanelHeader eyebrow="Delivery exceptions" title="Branch discrepancies" /><div className={styles.compactQueue}>{discrepancies.map((shipment) => <article key={shipment.id}><span data-tone="warning"><SlidersHorizontal /></span><div><strong>{shipment.id} · {shipment.destinationName}</strong><small>{shipment.productName}: sent {formatNumber(shipment.sentQuantity)} {shipment.unit}, received {formatNumber(shipment.receivedQuantity ?? 0)} {shipment.unit}</small></div><StatusBadge status="Needs Review" /></article>)}</div></section></div>;
}

function NotificationsView({ notifications, markRead, markAll }: { notifications: Notification[]; markRead: (id: string) => void; markAll: () => void }) {
  return <section className={styles.panel}><PanelHeader eyebrow="In-system notifications" title={`${notifications.filter((notification) => !notification.read).length} unread`} action={<button type="button" onClick={markAll}><Check /> Mark all read</button>} /><div className={styles.notificationList}>{notifications.map((notification) => { const Icon = notificationIcons[notification.type]; return <article data-read={notification.read} key={notification.id}><span data-type={notification.type}><Icon /></span><div><p>{notification.type}</p><h2>{notification.title}</h2><strong>{notification.description}</strong><small>{formatTimestamp(notification.timestamp)}{notification.relatedId ? ` · ${notification.relatedId}` : ""}</small></div><button type="button" onClick={() => markRead(notification.id)} disabled={notification.read}>{notification.read ? "Read" : "Mark read"}</button></article>; })}</div>{!notifications.length && <EmptyState title="No notifications" text="There are no operational alerts for this role." />}</section>;
}

function HistoryView({ state, role, actor }: { state: DemoState; role: Role; actor: User }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [area, setArea] = useState("All");
  const [userId, setUserId] = useState("All");
  const [productId, setProductId] = useState("All");
  const [branchId, setBranchId] = useState("All");
  const [date, setDate] = useState("");
  const roleActivities = role === "Branch" ? state.activities.filter((activity) => activity.branchId === actor.branchId) : role === "Inventory 1" ? state.activities.filter((activity) => activity.area === "Inventory 1" || activity.userId === actor.id) : role === "Factory" ? state.activities.filter((activity) => ["Raw Materials", "Finished Products"].includes(activity.area ?? "")) : state.activities;
  const visible = roleActivities.filter((activity) => {
    const haystack = `${activity.title} ${activity.productName} ${activity.userName} ${activity.source} ${activity.destination} ${activity.reference} ${activity.details}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (type === "All" || activity.type === type) && (area === "All" || activity.area === area) && (userId === "All" || activity.userId === userId) && (productId === "All" || activity.productId === productId) && (branchId === "All" || activity.branchId === branchId) && (!date || activity.date === date);
  });
  return <section className={styles.panel}><PanelHeader eyebrow="Operational traceability" title={`${visible.length} history records`} /><div className={styles.historyFilters}><label className={styles.searchField}><Search /><input aria-label="Search history" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search history..." /></label><select aria-label="Filter history action" value={type} onChange={(event) => setType(event.target.value)}><option>All</option>{ACTIVITY_TYPES.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter history inventory" value={area} onChange={(event) => setArea(event.target.value)}><option>All</option>{INVENTORY_AREAS.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter history user" value={userId} onChange={(event) => setUserId(event.target.value)}><option value="All">All users</option>{state.users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</select><select aria-label="Filter history product" value={productId} onChange={(event) => setProductId(event.target.value)}><option value="All">All products</option>{state.products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select><select aria-label="Filter history branch" value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="All">All branches</option>{state.destinations.filter((destination) => destination.type === "Branch").map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}</select><input aria-label="Filter history date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div><div className={styles.dataWrap}><table className={styles.dataTable}><thead><tr><th>Date / time</th><th>Employee</th><th>Action</th><th>Product / details</th><th>Quantity</th><th>Source / destination</th><th>Reference</th><th>Status</th></tr></thead><tbody>{visible.map((activity) => <tr key={activity.id}><td data-label="Date / time">{formatTimestamp(activity.timestamp)}</td><td data-label="Employee"><strong>{activity.userName}</strong></td><td data-label="Action"><ActivityBadge type={activity.type} /></td><td data-label="Product / details"><strong>{activity.productName ?? activity.title}</strong>{activity.productName && <small>{activity.title}</small>}{activity.details && <small>{activity.details}</small>}</td><td data-label="Quantity">{activity.quantity !== undefined ? `${activity.quantity > 0 && activity.type === "Stock In" ? "+" : ""}${formatNumber(activity.quantity)} ${activity.unit ?? ""}` : "—"}</td><td data-label="Source / destination">{activity.source ?? activity.destination ?? "—"}</td><td data-label="Reference">{activity.reference ?? "—"}</td><td data-label="Status"><StatusBadge status={activity.status ?? "Recorded"} /></td></tr>)}</tbody></table></div>{!visible.length && <EmptyState title="No matching history" text="Adjust the filters to restore operational records." />}</section>;
}

function IncomingDeliveries({ state, actor, commit }: { state: DemoState; actor: User; commit: Commit }) {
  const [selected, setSelected] = useState<Shipment | null>(null);
  const shipments = state.shipments.filter((shipment) => shipment.destinationId === actor.branchId && shipment.status === "Awaiting Confirmation");
  return <><div className={styles.shipmentGrid}>{shipments.map((shipment) => <article key={shipment.id}><header><span><Truck /></span><StatusBadge status={shipment.status} /></header><p>Shipment {shipment.id}</p><h2>{shipment.productName}</h2><dl><div><dt>Sent quantity</dt><dd>{formatNumber(shipment.sentQuantity)} {shipment.unit}</dd></div><div><dt>From</dt><dd>{shipment.source}</dd></div><div><dt>Date</dt><dd>{formatDate(shipment.date)}</dd></div></dl><button className={styles.primaryButton} type="button" onClick={() => setSelected(shipment)}>Review Receipt <ArrowRight /></button></article>)}</div>{!shipments.length && <EmptyState title="No deliveries awaiting confirmation" text="New factory shipments will appear here." />}{selected && <ReceiptDialog shipment={selected} actor={actor} state={state} close={() => setSelected(null)} save={(quantity) => { const result = confirmShipmentReceipt(state, { shipmentId: selected.id, receivedQuantity: quantity }, actor); if (commit(result, result.value?.status === "Confirmed" ? `Matched receipt confirmed for ${selected.id}.` : `Receipt confirmed with a ${formatNumber(result.value?.difference ?? 0)} ${selected.unit} discrepancy. Admin was notified.`)) setSelected(null); }} />}</>;
}

function ReceiptDialog({ shipment, actor, state, close, save }: { shipment: Shipment; actor: User; state: DemoState; close: () => void; save: (quantity: number) => void }) {
  const [received, setReceived] = useState("");
  const amount = Number(received);
  const valid = received !== "" && Number.isFinite(amount) && amount >= 0;
  const difference = valid ? Math.round((amount - shipment.sentQuantity) * 1000) / 1000 : 0;
  const branch = state.destinations.find((destination) => destination.id === actor.branchId)?.name;
  return <Modal title={`Confirm ${shipment.id}`} eyebrow={branch ?? "Receiving branch"} close={close}><form className={styles.modalForm} onSubmit={(event) => { event.preventDefault(); save(Number(received)); }}><div className={styles.sentSummary}><span>Sent Quantity</span><strong>{formatNumber(shipment.sentQuantity)} {shipment.unit}</strong><small>{shipment.productName} · From {shipment.source}</small></div><Field label="Actual Quantity Received"><div className={styles.unitInput}><input autoFocus type="number" min="0" step="any" value={received} onChange={(event) => setReceived(event.target.value)} /><b>{shipment.unit}</b></div></Field><div className={styles.receiptComparison} data-match={valid && difference === 0} data-discrepancy={valid && difference !== 0}><div><span>Sent</span><strong>{formatNumber(shipment.sentQuantity)} {shipment.unit}</strong></div><div><span>Received</span><strong>{valid ? formatNumber(amount) : "—"} {shipment.unit}</strong></div><div><span>Difference</span><strong>{valid ? `${difference > 0 ? "+" : ""}${formatNumber(difference)} ${shipment.unit}` : "—"}</strong></div><p>{!valid ? "Enter the actual received quantity." : difference === 0 ? "Matched Receipt ✓" : difference < 0 ? `Shortage of ${formatNumber(Math.abs(difference))} ${shipment.unit}` : `Over-delivery of ${formatNumber(difference)} ${shipment.unit}`}</p></div><ModalFooter close={close} submit="Confirm Receipt" /></form></Modal>;
}

function ReceivingHistory({ state, actor }: { state: DemoState; actor: User }) {
  const shipments = state.shipments.filter((shipment) => shipment.destinationId === actor.branchId && shipment.status !== "Awaiting Confirmation");
  return <section className={styles.panel}><PanelHeader eyebrow="Branch receiving" title={`${shipments.length} confirmed deliveries`} /><div className={styles.dataWrap}><table className={styles.dataTable}><thead><tr><th>Shipment</th><th>Product</th><th>Date</th><th>Sent</th><th>Received</th><th>Difference</th><th>Status</th></tr></thead><tbody>{shipments.map((shipment) => <tr key={shipment.id}><td data-label="Shipment"><strong>{shipment.id}</strong></td><td data-label="Product">{shipment.productName}</td><td data-label="Date">{formatDate(shipment.date)}</td><td data-label="Sent">{formatNumber(shipment.sentQuantity)} {shipment.unit}</td><td data-label="Received">{formatNumber(shipment.receivedQuantity ?? 0)} {shipment.unit}</td><td data-label="Difference"><b data-difference={(shipment.difference ?? 0) !== 0}>{(shipment.difference ?? 0) > 0 ? "+" : ""}{formatNumber(shipment.difference ?? 0)} {shipment.unit}</b></td><td data-label="Status"><StatusBadge status={shipment.status} /></td></tr>)}</tbody></table></div></section>;
}

function PanelHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <header className={styles.panelHeader}><div><p>{eyebrow}</p><h2>{title}</h2></div>{action}</header>;
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return <div className={styles.activityList}>{activities.map((activity) => <article key={activity.id}><span data-type={activity.type}>{activity.type === "Stock In" ? <ArrowDownToLine /> : activity.type === "Stock Out" || activity.type === "Shipment" ? <ArrowUpFromLine /> : activity.type === "Production" ? <Factory /> : activity.type === "Discrepancy" ? <AlertTriangle /> : <ClipboardCheck />}</span><div><strong>{activity.title}</strong><small>{activity.userName} · {formatTimestamp(activity.timestamp)}</small></div><b>{activity.reference}</b></article>)}</div>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={styles.statusBadge} data-status={status}>{status}</span>;
}

function ActivityBadge({ type }: { type: Activity["type"] }) {
  return <span className={styles.activityBadge} data-type={type}>{type}</span>;
}

function Available({ product, state, today }: { product: Product; state: DemoState; today: string }) {
  return <div className={styles.available}><span>Available now</span><strong>{formatNumber(productQuantity(state, product.id))} {product.unit}</strong><StatusBadge status={productStatus(state, product, today)} /></div>;
}

function FormStep({ number, title }: { number: string; title: string }) {
  return <div className={styles.formStep}>{number && <span>{number}</span>}<h2>{title}</h2></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function QuantityField({ label = "Quantity", value, setValue, unit }: { label?: string; value: string; setValue: (value: string) => void; unit?: Unit }) {
  return <Field label={label}><div className={styles.unitInput}><input type="number" min="0" step="any" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0" /><b>{unit ?? "unit"}</b></div></Field>;
}

function DateControl({ number, today, date, setDate, changed, setChanged, label }: { number: string; today: string; date: string; setDate: (date: string) => void; changed: boolean; setChanged: (changed: boolean) => void; label: string }) {
  return <>{number && <FormStep number={number} title="Date" />}<div className={styles.dateControl}><CalendarDays /><div><span>{changed ? "Selected date" : "Today"}</span><strong>{formatDate(date)}</strong></div><button type="button" onClick={() => { if (changed) setDate(today); setChanged(!changed); }}>{changed ? "Use today" : "Change"}</button></div>{changed && <Field label={label}><input type="date" max={today} value={date} onChange={(event) => setDate(event.target.value)} /></Field>}</>;
}

function Modal({ eyebrow, title, close, children }: { eyebrow: string; title: string; close: () => void; children: React.ReactNode }) {
  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><div><p>{eyebrow}</p><h2 id="modal-title">{title}</h2></div><button type="button" onClick={close} aria-label="Close dialog"><X /></button></header>{children}</section></div>;
}

function ModalFooter({ close, submit }: { close: () => void; submit: string }) {
  return <footer className={styles.modalFooter}><button type="button" onClick={close}>Cancel</button><button className={styles.primaryButton} type="submit"><Check /> {submit}</button></footer>;
}

function ConfirmDialog({ title, children, confirmLabel, close, confirm }: { title: string; children: React.ReactNode; confirmLabel: string; close: () => void; confirm: () => void }) {
  return <Modal title={title} eyebrow="Please confirm" close={close}><div className={styles.confirmBody}>{children}</div><footer className={styles.modalFooter}><button type="button" onClick={close}>Cancel</button><button className={styles.dangerButton} type="button" onClick={confirm}>{confirmLabel}</button></footer></Modal>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className={styles.emptyState}><Search /><h2>{title}</h2><p>{text}</p></div>;
}
