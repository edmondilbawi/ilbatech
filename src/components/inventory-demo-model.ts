export const DEMO_STATE_VERSION = 2;
export const DEMO_STORAGE_KEY = "ilbatech-restaurant-operations-demo-v2";

export const ROLES = ["Admin", "Supervisor", "Inventory 1", "Factory", "Branch"] as const;
export type Role = (typeof ROLES)[number];

export const UNITS = ["kg", "g", "L", "ml", "pcs", "boxes"] as const;
export type Unit = (typeof UNITS)[number];

export const INVENTORY_AREAS = ["Inventory 1", "Raw Materials", "Finished Products"] as const;
export type InventoryArea = (typeof INVENTORY_AREAS)[number];

export type User = {
  id: string;
  name: string;
  role: Role;
  branchId?: string;
  active: boolean;
  status: "Online" | "Offline";
};

export type Product = {
  id: string;
  name: string;
  area: InventoryArea;
  category: string;
  unit: Unit;
  minimumStock: number;
  expiryWarningDays: number;
  shelfLifeDays?: number;
  active: boolean;
};

export type NamedEntity = {
  id: string;
  name: string;
  active: boolean;
};

export type Destination = NamedEntity & {
  type: "Branch" | "Kitchen";
};

export type Batch = {
  id: string;
  productId: string;
  quantity: number;
  receivedDate: string;
  expiryDate?: string;
  supplierId?: string;
  reference: string;
  productionDate?: string;
};

export const ACTIVITY_TYPES = [
  "Stock In",
  "Stock Out",
  "Production",
  "Waste",
  "Purchase Request",
  "Purchase Status Change",
  "Shipment",
  "Branch Receipt",
  "Discrepancy",
  "Master Data",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type Activity = {
  id: string;
  type: ActivityType;
  date: string;
  timestamp: string;
  userId: string;
  userName: string;
  title: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unit?: Unit;
  source?: string;
  destination?: string;
  reference?: string;
  status?: string;
  area?: InventoryArea;
  branchId?: string;
  details?: string;
};

export const PURCHASE_STATUSES = ["Pending", "Accepted", "Rejected", "Purchase Complete"] as const;
export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export type PurchaseRequest = {
  id: string;
  items: Array<{ productId: string; productName: string; quantity: number; unit: Unit }>;
  message?: string;
  requestDate: string;
  requestedById: string;
  requestedByName: string;
  status: PurchaseStatus;
  reviewedByName?: string;
  updatedAt: string;
};

export const NOTIFICATION_TYPES = ["Low Stock", "Approaching Expiry", "Delivery Discrepancy", "Purchase Update", "Operational"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  roles: Role[];
  userId?: string;
  branchId?: string;
  relatedId?: string;
};

export type ProductionRecord = {
  id: string;
  date: string;
  rawProductId: string;
  rawProductName: string;
  rawQuantity: number;
  unit: Unit;
  outputs: Array<{ productId: string; productName: string; quantity: number; batchId: string }>;
  waste: number;
  employeeId: string;
  employeeName: string;
};

export type ShipmentStatus = "Awaiting Confirmation" | "Confirmed" | "Discrepancy";

export type Shipment = {
  id: string;
  productId: string;
  productName: string;
  sentQuantity: number;
  unit: Unit;
  source: "Factory";
  destinationId: string;
  destinationName: string;
  date: string;
  sentById: string;
  sentByName: string;
  status: ShipmentStatus;
  receivedQuantity?: number;
  difference?: number;
  receivedById?: string;
  receivedByName?: string;
  receivedAt?: string;
};

export type DemoState = {
  version: typeof DEMO_STATE_VERSION;
  users: User[];
  products: Product[];
  suppliers: NamedEntity[];
  destinations: Destination[];
  batches: Batch[];
  activities: Activity[];
  purchaseRequests: PurchaseRequest[];
  notifications: Notification[];
  productions: ProductionRecord[];
  shipments: Shipment[];
};

export type DemoResult<T = undefined> = {
  state: DemoState;
  error?: string;
  value?: T;
};

export type ProductInput = Omit<Product, "id" | "active"> & { active?: boolean };
export type UserInput = Omit<User, "id">;

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function dateTimestamp(date: string, time = "10:00:00") {
  return `${date}T${time}.000Z`;
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextReference(prefix: string, ids: string[], floor: number) {
  const maximum = ids.reduce((current, id) => {
    const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(current, Number(match[1])) : current;
  }, floor);
  return `${prefix}-${maximum + 1}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function getLocalDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidMovementDate(value: string, today = getLocalDate()) {
  return isIsoDate(value) && value <= today;
}

export function daysUntil(date: string, today = getLocalDate()) {
  const start = new Date(`${today}T00:00:00Z`).getTime();
  const end = new Date(`${date}T00:00:00Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function productQuantity(state: DemoState, productId: string) {
  return round(state.batches.filter((batch) => batch.productId === productId).reduce((total, batch) => total + batch.quantity, 0));
}

export function productBatches(state: DemoState, productId: string) {
  return state.batches
    .filter((batch) => batch.productId === productId && batch.quantity > 0)
    .sort((a, b) => (a.expiryDate ?? "9999-12-31").localeCompare(b.expiryDate ?? "9999-12-31") || a.receivedDate.localeCompare(b.receivedDate));
}

export function productStatus(state: DemoState, product: Product, today = getLocalDate()) {
  const quantity = productQuantity(state, product.id);
  if (quantity === 0) return "Out of Stock" as const;
  if (quantity <= product.minimumStock) return "Low Stock" as const;
  if (productBatches(state, product.id).some((batch) => batch.expiryDate && daysUntil(batch.expiryDate, today) <= product.expiryWarningDays)) return "Expiring Soon" as const;
  return "Healthy" as const;
}

export function activeUserForRole(state: DemoState, role: Role) {
  const preferred: Record<Role, string> = {
    Admin: "admin-user",
    Supervisor: "maya-khalil",
    "Inventory 1": "omar-hassan",
    Factory: "karim-saleh",
    Branch: "jad-nassar",
  };
  return state.users.find((user) => user.id === preferred[role]) ?? state.users.find((user) => user.role === role && user.active) ?? state.users[0];
}

function alertRoles(area: InventoryArea): Role[] {
  return area === "Inventory 1" ? ["Admin", "Supervisor", "Inventory 1"] : ["Admin", "Supervisor", "Factory"];
}

export function reconcileAlerts(state: DemoState, today = getLocalDate()): DemoState {
  const existingAlerts = new Map(state.notifications.filter((notification) => notification.id.startsWith("alert-")).map((notification) => [notification.id, notification]));
  const alerts: Notification[] = [];
  state.products.filter((product) => product.active).forEach((product) => {
    const quantity = productQuantity(state, product.id);
    if (quantity <= product.minimumStock) {
      const id = `alert-low-${product.id}`;
      alerts.push({
        id,
        type: "Low Stock",
        title: `${product.name} is low`,
        description: `${product.name} has ${formatQuantity(quantity)} ${product.unit} available; minimum stock is ${formatQuantity(product.minimumStock)} ${product.unit}.`,
        timestamp: existingAlerts.get(id)?.timestamp ?? dateTimestamp(today, "08:00:00"),
        read: existingAlerts.get(id)?.read ?? false,
        roles: alertRoles(product.area),
        relatedId: product.id,
      });
    }
    productBatches(state, product.id).forEach((batch) => {
      if (!batch.expiryDate) return;
      const days = daysUntil(batch.expiryDate, today);
      if (days <= product.expiryWarningDays) {
        const id = `alert-expiry-${batch.id}`;
        alerts.push({
          id,
          type: "Approaching Expiry",
          title: days < 0 ? `${product.name} batch expired` : `${product.name} batch expiring soon`,
          description: days < 0 ? `Batch ${batch.id} expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago.` : `Batch ${batch.id} expires in ${days} day${days === 1 ? "" : "s"}.`,
          timestamp: existingAlerts.get(id)?.timestamp ?? dateTimestamp(today, "08:05:00"),
          read: existingAlerts.get(id)?.read ?? false,
          roles: alertRoles(product.area),
          relatedId: batch.id,
        });
      }
    });
  });
  return { ...state, notifications: [...alerts, ...state.notifications.filter((notification) => !notification.id.startsWith("alert-"))] };
}

export function visibleNotifications(state: DemoState, role: Role, user: User) {
  return state.notifications.filter((notification) => {
    if (notification.userId && notification.userId === user.id) return true;
    if (!notification.roles.includes(role)) return false;
    return role !== "Branch" || !notification.branchId || notification.branchId === user.branchId;
  });
}

function baseProducts(): Product[] {
  return [
    { id: "chicken-breast", name: "Chicken Breast", area: "Inventory 1", category: "Meat", unit: "kg", minimumStock: 10, expiryWarningDays: 3, active: true },
    { id: "beef-tenderloin", name: "Beef Tenderloin", area: "Inventory 1", category: "Meat", unit: "kg", minimumStock: 12, expiryWarningDays: 3, active: true },
    { id: "potatoes", name: "Potatoes", area: "Inventory 1", category: "Vegetables", unit: "kg", minimumStock: 20, expiryWarningDays: 5, active: true },
    { id: "tomatoes", name: "Tomatoes", area: "Inventory 1", category: "Vegetables", unit: "kg", minimumStock: 12, expiryWarningDays: 2, active: true },
    { id: "mozzarella", name: "Mozzarella", area: "Inventory 1", category: "Dairy", unit: "kg", minimumStock: 8, expiryWarningDays: 3, active: true },
    { id: "olive-oil", name: "Olive Oil", area: "Inventory 1", category: "Dry Goods", unit: "L", minimumStock: 10, expiryWarningDays: 30, active: true },
    { id: "flour", name: "Flour", area: "Inventory 1", category: "Dry Goods", unit: "kg", minimumStock: 25, expiryWarningDays: 14, active: true },
    { id: "raw-chicken", name: "Raw Chicken", area: "Raw Materials", category: "Meat", unit: "kg", minimumStock: 15, expiryWarningDays: 2, active: true },
    { id: "beef-trim", name: "Beef Trim", area: "Raw Materials", category: "Meat", unit: "kg", minimumStock: 12, expiryWarningDays: 2, active: true },
    { id: "raw-garlic", name: "Garlic", area: "Raw Materials", category: "Vegetables", unit: "kg", minimumStock: 5, expiryWarningDays: 4, active: true },
    { id: "paprika", name: "Paprika", area: "Raw Materials", category: "Seasoning", unit: "kg", minimumStock: 2, expiryWarningDays: 30, active: true },
    { id: "chicken-fillet", name: "Chicken Fillet", area: "Finished Products", category: "Prepared Meat", unit: "kg", minimumStock: 8, expiryWarningDays: 2, shelfLifeDays: 4, active: true },
    { id: "marinated-chicken", name: "Marinated Chicken", area: "Finished Products", category: "Prepared Meat", unit: "kg", minimumStock: 10, expiryWarningDays: 2, shelfLifeDays: 3, active: true },
    { id: "burger-patty-mix", name: "Burger Patty Mix", area: "Finished Products", category: "Prepared Meat", unit: "kg", minimumStock: 8, expiryWarningDays: 2, shelfLifeDays: 3, active: true },
    { id: "prepared-sauce", name: "Prepared Sauce", area: "Finished Products", category: "Sauce", unit: "kg", minimumStock: 5, expiryWarningDays: 2, shelfLifeDays: 4, active: true },
  ];
}

export function createSeedState(today = getLocalDate()): DemoState {
  const users: User[] = [
    { id: "admin-user", name: "Admin User", role: "Admin", active: true, status: "Online" },
    { id: "maya-khalil", name: "Maya Khalil", role: "Supervisor", active: true, status: "Online" },
    { id: "omar-hassan", name: "Omar Hassan", role: "Inventory 1", active: true, status: "Online" },
    { id: "karim-saleh", name: "Karim Saleh", role: "Factory", active: true, status: "Online" },
    { id: "jad-nassar", name: "Jad Nassar", role: "Branch", branchId: "downtown", active: true, status: "Online" },
    { id: "lina-farhat", name: "Lina Farhat", role: "Branch", branchId: "marina", active: false, status: "Offline" },
  ];
  const products = baseProducts();
  const suppliers: NamedEntity[] = [
    { id: "fresh-foods", name: "Fresh Foods Co.", active: true },
    { id: "prime-meat", name: "Prime Meat Supply", active: true },
    { id: "green-valley", name: "Green Valley Produce", active: true },
    { id: "med-dairy", name: "Mediterranean Dairy", active: true },
  ];
  const destinations: Destination[] = [
    { id: "downtown", name: "Downtown Branch", type: "Branch", active: true },
    { id: "marina", name: "Marina Branch", type: "Branch", active: true },
    { id: "main-kitchen", name: "Main Kitchen", type: "Kitchen", active: true },
    { id: "airport", name: "Airport Branch", type: "Branch", active: true },
  ];
  const batch = (id: string, productId: string, quantity: number, receivedOffset: number, expiryOffset: number | undefined, supplierId: string, reference: string, productionDate?: string): Batch => ({
    id, productId, quantity, receivedDate: addDays(today, receivedOffset), ...(expiryOffset !== undefined ? { expiryDate: addDays(today, expiryOffset) } : {}), supplierId, reference, ...(productionDate ? { productionDate } : {}),
  });
  const batches: Batch[] = [
    batch("B-301", "chicken-breast", 8.5, -2, 2, "fresh-foods", "SI-1081"),
    batch("B-298", "chicken-breast", 10, -5, 1, "fresh-foods", "SI-1074"),
    batch("B-295", "beef-tenderloin", 26, -3, 2, "prime-meat", "SI-1078"),
    batch("B-288", "potatoes", 42, -4, 8, "green-valley", "SI-1069"),
    batch("B-302", "tomatoes", 8, -1, 1, "green-valley", "SI-1084"),
    batch("B-303", "mozzarella", 2, -1, 2, "med-dairy", "SI-1085"),
    batch("B-287", "mozzarella", 4.2, -4, 6, "med-dairy", "SI-1068"),
    batch("B-274", "olive-oil", 24, -14, 120, "fresh-foods", "SI-1048"),
    batch("B-266", "flour", 85, -18, 75, "fresh-foods", "SI-1032"),
    batch("B-401", "raw-chicken", 25, -1, 2, "prime-meat", "FI-2041"),
    batch("B-397", "raw-chicken", 15, -3, 1, "prime-meat", "FI-2037"),
    batch("B-394", "beef-trim", 30, -2, 2, "prime-meat", "FI-2034"),
    batch("B-389", "raw-garlic", 12, -4, 7, "green-valley", "FI-2029"),
    batch("B-380", "paprika", 5, -10, 90, "fresh-foods", "FI-2018"),
    batch("B-501", "chicken-fillet", 8, -1, 3, "fresh-foods", "PD-2031", addDays(today, -1)),
    batch("B-498", "marinated-chicken", 18, -1, 2, "fresh-foods", "PD-2030", addDays(today, -1)),
    batch("B-490", "burger-patty-mix", 14, -2, 1, "fresh-foods", "PD-2027", addDays(today, -2)),
    batch("B-487", "prepared-sauce", 9, -2, 2, "fresh-foods", "PD-2026", addDays(today, -2)),
  ];
  const activities: Activity[] = [
    { id: "activity-1", type: "Branch Receipt", date: addDays(today, -1), timestamp: dateTimestamp(addDays(today, -1), "16:20:00"), userId: "jad-nassar", userName: "Jad Nassar", title: "Downtown Branch confirmed delivery", productId: "marinated-chicken", productName: "Marinated Chicken", quantity: 18.5, unit: "kg", source: "Factory", destination: "Downtown Branch", reference: "TR-1047", status: "Discrepancy", area: "Finished Products", branchId: "downtown", details: "Sent 20 kg · received 18.5 kg · difference −1.5 kg" },
    { id: "activity-2", type: "Discrepancy", date: addDays(today, -1), timestamp: dateTimestamp(addDays(today, -1), "16:20:01"), userId: "jad-nassar", userName: "Jad Nassar", title: "Delivery shortage recorded", productId: "marinated-chicken", productName: "Marinated Chicken", quantity: -1.5, unit: "kg", destination: "Downtown Branch", reference: "TR-1047", status: "Needs Review", area: "Finished Products", branchId: "downtown" },
    { id: "activity-3", type: "Production", date: addDays(today, -1), timestamp: dateTimestamp(addDays(today, -1), "11:15:00"), userId: "karim-saleh", userName: "Karim Saleh", title: "Raw Chicken transformed", productId: "raw-chicken", productName: "Raw Chicken", quantity: 24, unit: "kg", reference: "PD-2031", status: "Balanced", area: "Raw Materials", details: "16 kg Chicken Fillet · 6 kg Marinated Chicken · 2 kg waste" },
    { id: "activity-4", type: "Stock In", date: addDays(today, -1), timestamp: dateTimestamp(addDays(today, -1), "08:40:00"), userId: "omar-hassan", userName: "Omar Hassan", title: "Mozzarella received", productId: "mozzarella", productName: "Mozzarella", quantity: 2, unit: "kg", source: "Mediterranean Dairy", reference: "SI-1085", status: "Received", area: "Inventory 1" },
    { id: "activity-5", type: "Stock Out", date: addDays(today, -2), timestamp: dateTimestamp(addDays(today, -2), "18:10:00"), userId: "omar-hassan", userName: "Omar Hassan", title: "Potatoes sent to Main Kitchen", productId: "potatoes", productName: "Potatoes", quantity: 8, unit: "kg", destination: "Main Kitchen", reference: "SO-2091", status: "Completed", area: "Inventory 1" },
    { id: "activity-6", type: "Purchase Request", date: addDays(today, -2), timestamp: dateTimestamp(addDays(today, -2), "09:20:00"), userId: "omar-hassan", userName: "Omar Hassan", title: "Purchase request submitted", reference: "PR-1042", status: "Pending", area: "Inventory 1", details: "Chicken Breast 30 kg · Mozzarella 10 kg" },
  ];
  const purchaseRequests: PurchaseRequest[] = [
    { id: "PR-1042", items: [{ productId: "chicken-breast", productName: "Chicken Breast", quantity: 30, unit: "kg" }, { productId: "mozzarella", productName: "Mozzarella", quantity: 10, unit: "kg" }], message: "Required before weekend service.", requestDate: addDays(today, -2), requestedById: "omar-hassan", requestedByName: "Omar Hassan", status: "Pending", updatedAt: dateTimestamp(addDays(today, -2), "09:20:00") },
    { id: "PR-1041", items: [{ productId: "olive-oil", productName: "Olive Oil", quantity: 20, unit: "L" }], message: "For next week's prep schedule.", requestDate: addDays(today, -4), requestedById: "omar-hassan", requestedByName: "Omar Hassan", status: "Accepted", reviewedByName: "Maya Khalil", updatedAt: dateTimestamp(addDays(today, -3), "14:10:00") },
  ];
  const shipments: Shipment[] = [
    { id: "TR-1048", productId: "chicken-fillet", productName: "Chicken Fillet", sentQuantity: 6, unit: "kg", source: "Factory", destinationId: "downtown", destinationName: "Downtown Branch", date: today, sentById: "karim-saleh", sentByName: "Karim Saleh", status: "Awaiting Confirmation" },
    { id: "TR-1047", productId: "marinated-chicken", productName: "Marinated Chicken", sentQuantity: 20, unit: "kg", source: "Factory", destinationId: "downtown", destinationName: "Downtown Branch", date: addDays(today, -1), sentById: "karim-saleh", sentByName: "Karim Saleh", status: "Discrepancy", receivedQuantity: 18.5, difference: -1.5, receivedById: "jad-nassar", receivedByName: "Jad Nassar", receivedAt: dateTimestamp(addDays(today, -1), "16:20:00") },
    { id: "TR-1046", productId: "burger-patty-mix", productName: "Burger Patty Mix", sentQuantity: 12, unit: "kg", source: "Factory", destinationId: "marina", destinationName: "Marina Branch", date: addDays(today, -2), sentById: "karim-saleh", sentByName: "Karim Saleh", status: "Confirmed", receivedQuantity: 12, difference: 0, receivedById: "lina-farhat", receivedByName: "Lina Farhat", receivedAt: dateTimestamp(addDays(today, -2), "13:30:00") },
  ];
  const notifications: Notification[] = [
    { id: "notification-discrepancy-1047", type: "Delivery Discrepancy", title: "Delivery discrepancy", description: "Downtown Branch received 18.5 kg of 20 kg Marinated Chicken sent.", timestamp: dateTimestamp(addDays(today, -1), "16:20:01"), read: false, roles: ["Admin", "Supervisor"], relatedId: "TR-1047" },
    { id: "notification-purchase-1041", type: "Purchase Update", title: "Purchase request accepted", description: "Your purchase request PR-1041 was accepted by Maya Khalil.", timestamp: dateTimestamp(addDays(today, -3), "14:10:00"), read: false, roles: ["Inventory 1"], userId: "omar-hassan", relatedId: "PR-1041" },
    { id: "notification-shipment-1048", type: "Operational", title: "Incoming delivery", description: "Shipment TR-1048 from Factory is awaiting confirmation.", timestamp: dateTimestamp(today, "09:10:00"), read: false, roles: ["Branch"], branchId: "downtown", relatedId: "TR-1048" },
  ];
  const productions: ProductionRecord[] = [
    { id: "PD-2031", date: addDays(today, -1), rawProductId: "raw-chicken", rawProductName: "Raw Chicken", rawQuantity: 24, unit: "kg", outputs: [{ productId: "chicken-fillet", productName: "Chicken Fillet", quantity: 16, batchId: "B-501" }, { productId: "marinated-chicken", productName: "Marinated Chicken", quantity: 6, batchId: "B-498" }], waste: 2, employeeId: "karim-saleh", employeeName: "Karim Saleh" },
  ];
  return reconcileAlerts({ version: DEMO_STATE_VERSION, users, products, suppliers, destinations, batches, activities, purchaseRequests, notifications, productions, shipments }, today);
}

export function isValidDemoState(value: unknown): value is DemoState {
  if (!isPlainObject(value) || value.version !== DEMO_STATE_VERSION) return false;
  const arrayKeys = ["users", "products", "suppliers", "destinations", "batches", "activities", "purchaseRequests", "notifications", "productions", "shipments"] as const;
  if (!arrayKeys.every((key) => Array.isArray(value[key]))) return false;
  const candidate = value as unknown as DemoState;
  const usersValid = candidate.users.every((user) => isPlainObject(user) && typeof user.id === "string" && typeof user.name === "string" && ROLES.includes(user.role as Role) && typeof user.active === "boolean");
  const productsValid = candidate.products.every((product) => isPlainObject(product) && typeof product.id === "string" && typeof product.name === "string" && INVENTORY_AREAS.includes(product.area as InventoryArea) && UNITS.includes(product.unit as Unit) && isFiniteNonNegative(product.minimumStock) && isFiniteNonNegative(product.expiryWarningDays) && typeof product.active === "boolean");
  const entitiesValid = [...candidate.suppliers, ...candidate.destinations].every((entity) => isPlainObject(entity) && typeof entity.id === "string" && typeof entity.name === "string" && typeof entity.active === "boolean");
  const batchesValid = candidate.batches.every((batch) => isPlainObject(batch) && typeof batch.id === "string" && typeof batch.productId === "string" && isFiniteNonNegative(batch.quantity) && isIsoDate(batch.receivedDate) && (batch.expiryDate === undefined || isIsoDate(batch.expiryDate)));
  const activitiesValid = candidate.activities.every((activity) => isPlainObject(activity) && typeof activity.id === "string" && ACTIVITY_TYPES.includes(activity.type as ActivityType) && isIsoDate(activity.date) && typeof activity.userName === "string");
  const requestsValid = candidate.purchaseRequests.every((request) => isPlainObject(request) && typeof request.id === "string" && Array.isArray(request.items) && PURCHASE_STATUSES.includes(request.status as PurchaseStatus));
  const notificationsValid = candidate.notifications.every((notification) => isPlainObject(notification) && typeof notification.id === "string" && NOTIFICATION_TYPES.includes(notification.type as NotificationType) && typeof notification.read === "boolean" && Array.isArray(notification.roles));
  const productionsValid = candidate.productions.every((production) => isPlainObject(production) && typeof production.id === "string" && isFiniteNonNegative(production.rawQuantity) && isFiniteNonNegative(production.waste) && Array.isArray(production.outputs));
  const shipmentsValid = candidate.shipments.every((shipment) => isPlainObject(shipment) && typeof shipment.id === "string" && isFiniteNonNegative(shipment.sentQuantity) && ["Awaiting Confirmation", "Confirmed", "Discrepancy"].includes(String(shipment.status)));
  return usersValid && productsValid && entitiesValid && batchesValid && activitiesValid && requestsValid && notificationsValid && productionsValid && shipmentsValid;
}

export function loadDemoState(serialized: string | null, today = getLocalDate()) {
  if (!serialized) return createSeedState(today);
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isValidDemoState(parsed) ? reconcileAlerts(parsed, today) : createSeedState(today);
  } catch {
    return createSeedState(today);
  }
}

function requireAdmin(actor: User) {
  return actor.active && actor.role === "Admin" ? undefined : "Only Admin can make this change.";
}

function addActivity(state: DemoState, activity: Omit<Activity, "id">) {
  return { ...state, activities: [{ id: uniqueId("activity"), ...activity }, ...state.activities] };
}

export function saveUser(state: DemoState, input: UserInput, actor: User, userId?: string, timestamp = new Date().toISOString()): DemoResult<User> {
  const permissionError = requireAdmin(actor);
  if (permissionError) return { state, error: permissionError };
  if (!input.name.trim()) return { state, error: "Enter the employee's name." };
  if (!ROLES.includes(input.role)) return { state, error: "Choose a valid role." };
  if (input.role === "Branch" && !state.destinations.some((destination) => destination.id === input.branchId && destination.type === "Branch" && destination.active)) return { state, error: "Choose the employee's branch." };
  const current = userId ? state.users.find((user) => user.id === userId) : undefined;
  if (userId && !current) return { state, error: "Employee not found." };
  const user: User = { id: current?.id ?? uniqueId("user"), name: input.name.trim(), role: input.role, ...(input.role === "Branch" ? { branchId: input.branchId } : {}), active: input.active, status: input.active ? input.status : "Offline" };
  let next = { ...state, users: current ? state.users.map((item) => item.id === current.id ? user : item) : [...state.users, user] };
  next = addActivity(next, { type: "Master Data", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${user.name} ${current ? "updated" : "created"}`, status: user.active ? "Active" : "Inactive", details: `${user.role} role` });
  return { state: next, value: user };
}

export function toggleUserActive(state: DemoState, userId: string, actor: User, timestamp = new Date().toISOString()): DemoResult<User> {
  const permissionError = requireAdmin(actor);
  if (permissionError) return { state, error: permissionError };
  const current = state.users.find((user) => user.id === userId);
  if (!current) return { state, error: "Employee not found." };
  if (current.id === actor.id) return { state, error: "You can't deactivate the user you are currently viewing as." };
  const user = { ...current, active: !current.active, status: current.active ? "Offline" as const : current.status };
  let next = { ...state, users: state.users.map((item) => item.id === userId ? user : item) };
  next = addActivity(next, { type: "Master Data", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${user.name} ${user.active ? "activated" : "deactivated"}`, status: user.active ? "Active" : "Inactive", details: "Historical employee activity remains unchanged." });
  return { state: next, value: user };
}

export function saveProduct(state: DemoState, input: ProductInput, actor: User, productId?: string, timestamp = new Date().toISOString()): DemoResult<Product> {
  const permissionError = requireAdmin(actor);
  if (permissionError) return { state, error: permissionError };
  if (!input.name.trim()) return { state, error: "Enter a product name." };
  if (!INVENTORY_AREAS.includes(input.area)) return { state, error: "Choose an inventory assignment." };
  if (!input.category.trim()) return { state, error: "Enter a category." };
  if (!UNITS.includes(input.unit)) return { state, error: "Choose a valid unit." };
  if (!Number.isFinite(input.minimumStock) || input.minimumStock < 0) return { state, error: "Minimum stock must be 0 or more." };
  if (!Number.isFinite(input.expiryWarningDays) || input.expiryWarningDays < 0) return { state, error: "Expiry warning must be 0 days or more." };
  const current = productId ? state.products.find((product) => product.id === productId) : undefined;
  if (productId && !current) return { state, error: "Product not found." };
  const hasHistory = current && (state.batches.some((batch) => batch.productId === current.id) || state.activities.some((activity) => activity.productId === current.id));
  if (hasHistory && (input.unit !== current.unit || input.area !== current.area)) return { state, error: "Unit and inventory assignment can't change because this product has stock history." };
  const product: Product = { id: current?.id ?? uniqueId("product"), name: input.name.trim(), area: input.area, category: input.category.trim(), unit: input.unit, minimumStock: round(input.minimumStock), expiryWarningDays: Math.round(input.expiryWarningDays), ...(input.shelfLifeDays ? { shelfLifeDays: Math.round(input.shelfLifeDays) } : {}), active: input.active ?? true };
  let next = { ...state, products: current ? state.products.map((item) => item.id === current.id ? product : item) : [...state.products, product] };
  next = addActivity(next, { type: "Master Data", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${product.name} ${current ? "updated" : "created"}`, productId: product.id, productName: product.name, status: product.active ? "Active" : "Inactive", area: product.area });
  return { state: reconcileAlerts(next, timestamp.slice(0, 10)), value: product };
}

export function toggleProductActive(state: DemoState, productId: string, actor: User, timestamp = new Date().toISOString()): DemoResult<Product> {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return { state, error: "Product not found." };
  return saveProduct(state, { ...product, active: !product.active }, actor, productId, timestamp);
}

export function saveEntity(state: DemoState, kind: "suppliers" | "destinations", input: { name: string; type?: Destination["type"]; active?: boolean }, actor: User, entityId?: string, timestamp = new Date().toISOString()): DemoResult<NamedEntity | Destination> {
  const permissionError = requireAdmin(actor);
  if (permissionError) return { state, error: permissionError };
  if (!input.name.trim()) return { state, error: `Enter a ${kind === "suppliers" ? "supplier" : "destination"} name.` };
  const collection = state[kind];
  const current = entityId ? collection.find((entity) => entity.id === entityId) : undefined;
  if (entityId && !current) return { state, error: "Item not found." };
  if (collection.some((entity) => entity.id !== entityId && entity.active && entity.name.toLowerCase() === input.name.trim().toLowerCase())) return { state, error: "That name is already active." };
  const base = { id: current?.id ?? uniqueId(kind === "suppliers" ? "supplier" : "destination"), name: input.name.trim(), active: input.active ?? current?.active ?? true };
  const entity = kind === "destinations" ? { ...base, type: input.type ?? (current as Destination | undefined)?.type ?? "Branch" } : base;
  let next = { ...state, [kind]: current ? collection.map((item) => item.id === current.id ? entity : item) : [...collection, entity] } as DemoState;
  next = addActivity(next, { type: "Master Data", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${entity.name} ${current ? "updated" : "created"}`, status: entity.active ? "Active" : "Inactive", details: kind === "suppliers" ? "Supplier" : "Destination / Branch" });
  return { state: next, value: entity };
}

export function toggleEntityActive(state: DemoState, kind: "suppliers" | "destinations", entityId: string, actor: User, timestamp = new Date().toISOString()) {
  const entity = state[kind].find((item) => item.id === entityId);
  if (!entity) return { state, error: "Item not found." } as DemoResult;
  return saveEntity(state, kind, { ...entity, active: !entity.active }, actor, entityId, timestamp);
}

function canOperateArea(actor: User, area: InventoryArea) {
  if (!actor.active) return false;
  if (actor.role === "Admin") return true;
  return area === "Inventory 1" ? actor.role === "Inventory 1" : actor.role === "Factory";
}

function deductBatches(state: DemoState, productId: string, quantity: number) {
  let remaining = round(quantity);
  const orderedIds = productBatches(state, productId).map((batch) => batch.id);
  const deductions = new Map<string, number>();
  orderedIds.forEach((id) => {
    if (remaining <= 0) return;
    const batch = state.batches.find((item) => item.id === id)!;
    const used = Math.min(batch.quantity, remaining);
    deductions.set(id, round(used));
    remaining = round(remaining - used);
  });
  return state.batches.map((batch) => deductions.has(batch.id) ? { ...batch, quantity: round(batch.quantity - deductions.get(batch.id)!) } : batch);
}

export function receiveStock(state: DemoState, input: { productId: string; quantity: number; expiryDate?: string; date: string; supplierId: string }, actor: User, today = getLocalDate(), timestamp = new Date().toISOString()): DemoResult<Batch> {
  const product = state.products.find((item) => item.id === input.productId && item.active);
  if (!product || product.area === "Finished Products") return { state, error: "Choose an active product for this inventory." };
  if (!canOperateArea(actor, product.area)) return { state, error: "This role can't receive stock for that inventory." };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { state, error: "Enter a quantity greater than 0." };
  const supplier = state.suppliers.find((item) => item.id === input.supplierId && item.active);
  if (!supplier) return { state, error: "Choose an active supplier." };
  if (!isValidMovementDate(input.date, today)) return { state, error: "Choose today or an earlier valid date." };
  if (!input.expiryDate || !isIsoDate(input.expiryDate) || input.expiryDate < input.date) return { state, error: "Choose a valid expiry date on or after the receiving date." };
  const reference = nextReference(product.area === "Inventory 1" ? "SI" : "FI", state.activities.map((activity) => activity.reference ?? ""), product.area === "Inventory 1" ? 1085 : 2041);
  const batchId = nextReference("B", state.batches.map((batch) => batch.id), 501);
  const batch: Batch = { id: batchId, productId: product.id, quantity: round(input.quantity), receivedDate: input.date, expiryDate: input.expiryDate, supplierId: supplier.id, reference };
  let next: DemoState = { ...state, batches: [...state.batches, batch] };
  next = addActivity(next, { type: "Stock In", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: `${product.name} received`, productId: product.id, productName: product.name, quantity: batch.quantity, unit: product.unit, source: supplier.name, reference, status: "Received", area: product.area, details: `Batch ${batch.id} · expires ${input.expiryDate}` });
  return { state: reconcileAlerts(next, today), value: batch };
}

export function issueInventoryOneStock(state: DemoState, input: { productId: string; quantity: number; date: string; destinationId: string }, actor: User, today = getLocalDate(), timestamp = new Date().toISOString()): DemoResult<Activity> {
  const product = state.products.find((item) => item.id === input.productId && item.active && item.area === "Inventory 1");
  if (!product) return { state, error: "Choose an active Inventory 1 product." };
  if (!canOperateArea(actor, product.area)) return { state, error: "This role can't remove Inventory 1 stock." };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { state, error: "Enter a quantity greater than 0." };
  const available = productQuantity(state, product.id);
  if (input.quantity > available) return { state, error: `Insufficient stock. Available quantity: ${formatQuantity(available)} ${product.unit}.` };
  const destination = state.destinations.find((item) => item.id === input.destinationId && item.active);
  if (!destination) return { state, error: "Choose an active destination or branch." };
  if (!isValidMovementDate(input.date, today)) return { state, error: "Choose today or an earlier valid date." };
  const reference = nextReference("SO", state.activities.map((activity) => activity.reference ?? ""), 2091);
  const activity: Activity = { id: uniqueId("activity"), type: "Stock Out", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: `${product.name} sent to ${destination.name}`, productId: product.id, productName: product.name, quantity: round(input.quantity), unit: product.unit, destination: destination.name, reference, status: "Completed", area: product.area, branchId: destination.type === "Branch" ? destination.id : undefined };
  const next = reconcileAlerts({ ...state, batches: deductBatches(state, product.id, input.quantity), activities: [activity, ...state.activities] }, today);
  return { state: next, value: activity };
}

export function createPurchaseRequest(state: DemoState, input: { items: Array<{ productId: string; quantity: number }>; message?: string; date: string }, actor: User, today = getLocalDate(), timestamp = new Date().toISOString()): DemoResult<PurchaseRequest> {
  if (!actor.active || !["Inventory 1", "Admin"].includes(actor.role)) return { state, error: "This role can't create purchase requests." };
  if (!isValidMovementDate(input.date, today)) return { state, error: "Choose today or an earlier valid request date." };
  const cleanItems = input.items.filter((item) => item.productId || item.quantity);
  if (!cleanItems.length) return { state, error: "Add at least one product to the request." };
  const seen = new Set<string>();
  const items: PurchaseRequest["items"] = [];
  for (const item of cleanItems) {
    const product = state.products.find((candidate) => candidate.id === item.productId && candidate.active && candidate.area === "Inventory 1");
    if (!product) return { state, error: "Choose an active Inventory 1 product for every request line." };
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) return { state, error: "Every requested quantity must be greater than 0." };
    if (seen.has(product.id)) return { state, error: "Each product can appear only once in a request." };
    seen.add(product.id);
    items.push({ productId: product.id, productName: product.name, quantity: round(item.quantity), unit: product.unit });
  }
  const id = nextReference("PR", state.purchaseRequests.map((request) => request.id), 1042);
  const request: PurchaseRequest = { id, items, ...(input.message?.trim() ? { message: input.message.trim() } : {}), requestDate: input.date, requestedById: actor.id, requestedByName: actor.name, status: "Pending", updatedAt: timestamp };
  const activity: Activity = { id: uniqueId("activity"), type: "Purchase Request", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: "Purchase request submitted", reference: id, status: "Pending", area: "Inventory 1", details: items.map((item) => `${item.productName} ${formatQuantity(item.quantity)} ${item.unit}`).join(" · ") };
  const notification: Notification = { id: uniqueId("notification"), type: "Operational", title: "New purchase request", description: `${actor.name} submitted ${id} with ${items.length} product${items.length === 1 ? "" : "s"}.`, timestamp, read: false, roles: ["Admin", "Supervisor"], relatedId: id };
  return { state: { ...state, purchaseRequests: [request, ...state.purchaseRequests], activities: [activity, ...state.activities], notifications: [notification, ...state.notifications] }, value: request };
}

export function updatePurchaseStatus(state: DemoState, requestId: string, status: PurchaseStatus, actor: User, timestamp = new Date().toISOString()): DemoResult<PurchaseRequest> {
  if (!actor.active || !["Supervisor", "Admin"].includes(actor.role)) return { state, error: "Only a Supervisor or Admin can update purchase requests." };
  const request = state.purchaseRequests.find((item) => item.id === requestId);
  if (!request) return { state, error: "Purchase request not found." };
  const allowed = request.status === "Pending" ? ["Accepted", "Rejected"] : request.status === "Accepted" ? ["Purchase Complete"] : [];
  if (!allowed.includes(status)) return { state, error: `${request.id} can't move from ${request.status} to ${status}.` };
  const updated: PurchaseRequest = { ...request, status, reviewedByName: actor.name, updatedAt: timestamp };
  const description = status === "Purchase Complete" ? `Purchase Request ${request.id} was marked Purchase Complete by ${actor.name}.` : `Your purchase request ${request.id} was ${status.toLowerCase()} by ${actor.name}.`;
  const notification: Notification = { id: uniqueId("notification"), type: "Purchase Update", title: `Purchase request ${status.toLowerCase()}`, description, timestamp, read: false, roles: ["Inventory 1"], userId: request.requestedById, relatedId: request.id };
  const activity: Activity = { id: uniqueId("activity"), type: "Purchase Status Change", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${request.id} marked ${status}`, reference: request.id, status, area: "Inventory 1", details: `Requested by ${request.requestedByName}` };
  return { state: { ...state, purchaseRequests: state.purchaseRequests.map((item) => item.id === request.id ? updated : item), notifications: [notification, ...state.notifications], activities: [activity, ...state.activities] }, value: updated };
}

export function transformStock(state: DemoState, input: { rawProductId: string; rawQuantity: number; outputs: Array<{ productId: string; quantity: number }>; waste: number; date: string }, actor: User, today = getLocalDate(), timestamp = new Date().toISOString()): DemoResult<ProductionRecord> {
  if (!actor.active || !["Factory", "Admin"].includes(actor.role)) return { state, error: "This role can't record production." };
  const raw = state.products.find((product) => product.id === input.rawProductId && product.active && product.area === "Raw Materials");
  if (!raw) return { state, error: "Choose an active raw material." };
  if (!Number.isFinite(input.rawQuantity) || input.rawQuantity <= 0) return { state, error: "Enter a raw quantity greater than 0." };
  const available = productQuantity(state, raw.id);
  if (input.rawQuantity > available) return { state, error: `Insufficient stock. Available quantity: ${formatQuantity(available)} ${raw.unit}.` };
  if (!Number.isFinite(input.waste) || input.waste < 0) return { state, error: "Waste must be 0 or more." };
  if (!isValidMovementDate(input.date, today)) return { state, error: "Choose today or an earlier valid production date." };
  const outputInputs = input.outputs.filter((output) => output.productId || output.quantity);
  if (!outputInputs.length) return { state, error: "Add at least one finished product." };
  const outputs: Array<{ product: Product; quantity: number }> = [];
  const seen = new Set<string>();
  for (const output of outputInputs) {
    const product = state.products.find((candidate) => candidate.id === output.productId && candidate.active && candidate.area === "Finished Products");
    if (!product) return { state, error: "Choose an active finished product for every output." };
    if (product.unit !== raw.unit) return { state, error: `Finished outputs must use ${raw.unit} for this transformation.` };
    if (!Number.isFinite(output.quantity) || output.quantity <= 0) return { state, error: "Every finished quantity must be greater than 0." };
    if (seen.has(product.id)) return { state, error: "Each finished product can appear only once." };
    seen.add(product.id);
    outputs.push({ product, quantity: round(output.quantity) });
  }
  const totalOutput = round(outputs.reduce((total, output) => total + output.quantity, 0));
  const difference = round(input.rawQuantity - totalOutput - input.waste);
  if (difference > 0) return { state, error: `${formatQuantity(difference)} ${raw.unit} remains unaccounted for.` };
  if (difference < 0) return { state, error: `Finished output and waste exceed raw quantity by ${formatQuantity(Math.abs(difference))} ${raw.unit}.` };
  const id = nextReference("PD", state.productions.map((production) => production.id), 2031);
  let nextBatchNumber = state.batches.reduce((maximum, batch) => Math.max(maximum, Number(batch.id.match(/^B-(\d+)$/)?.[1] ?? 0)), 501);
  const outputRecords: ProductionRecord["outputs"] = [];
  const newBatches: Batch[] = outputs.map(({ product, quantity }) => {
    nextBatchNumber += 1;
    const batchId = `B-${nextBatchNumber}`;
    outputRecords.push({ productId: product.id, productName: product.name, quantity, batchId });
    return { id: batchId, productId: product.id, quantity, receivedDate: input.date, productionDate: input.date, expiryDate: addDays(input.date, product.shelfLifeDays ?? 3), reference: id };
  });
  const production: ProductionRecord = { id, date: input.date, rawProductId: raw.id, rawProductName: raw.name, rawQuantity: round(input.rawQuantity), unit: raw.unit, outputs: outputRecords, waste: round(input.waste), employeeId: actor.id, employeeName: actor.name };
  const details = `${outputRecords.map((output) => `${formatQuantity(output.quantity)} ${raw.unit} ${output.productName}`).join(" · ")} · ${formatQuantity(input.waste)} ${raw.unit} waste`;
  const productionActivity: Activity = { id: uniqueId("activity"), type: "Production", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: `${raw.name} transformed`, productId: raw.id, productName: raw.name, quantity: production.rawQuantity, unit: raw.unit, reference: id, status: "Balanced", area: "Raw Materials", details };
  const wasteActivity: Activity | undefined = input.waste > 0 ? { id: uniqueId("activity"), type: "Waste", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: "Production waste recorded", productId: raw.id, productName: raw.name, quantity: round(input.waste), unit: raw.unit, reference: id, status: "Recorded", area: "Raw Materials" } : undefined;
  const next = reconcileAlerts({ ...state, batches: [...deductBatches(state, raw.id, input.rawQuantity), ...newBatches], productions: [production, ...state.productions], activities: [productionActivity, ...(wasteActivity ? [wasteActivity] : []), ...state.activities] }, today);
  return { state: next, value: production };
}

export function createShipment(state: DemoState, input: { productId: string; quantity: number; date: string; destinationId: string }, actor: User, today = getLocalDate(), timestamp = new Date().toISOString()): DemoResult<Shipment> {
  if (!actor.active || !["Factory", "Admin"].includes(actor.role)) return { state, error: "This role can't send finished products." };
  const product = state.products.find((item) => item.id === input.productId && item.active && item.area === "Finished Products");
  if (!product) return { state, error: "Choose an active finished product." };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { state, error: "Enter a quantity greater than 0." };
  const available = productQuantity(state, product.id);
  if (input.quantity > available) return { state, error: `Insufficient stock. Available quantity: ${formatQuantity(available)} ${product.unit}.` };
  const destination = state.destinations.find((item) => item.id === input.destinationId && item.active && item.type === "Branch");
  if (!destination) return { state, error: "Choose an active branch." };
  if (!isValidMovementDate(input.date, today)) return { state, error: "Choose today or an earlier valid shipment date." };
  const id = nextReference("TR", state.shipments.map((shipment) => shipment.id), 1048);
  const shipment: Shipment = { id, productId: product.id, productName: product.name, sentQuantity: round(input.quantity), unit: product.unit, source: "Factory", destinationId: destination.id, destinationName: destination.name, date: input.date, sentById: actor.id, sentByName: actor.name, status: "Awaiting Confirmation" };
  const activity: Activity = { id: uniqueId("activity"), type: "Shipment", date: input.date, timestamp, userId: actor.id, userName: actor.name, title: `${product.name} sent to ${destination.name}`, productId: product.id, productName: product.name, quantity: shipment.sentQuantity, unit: product.unit, source: "Factory", destination: destination.name, reference: id, status: "Awaiting Confirmation", area: "Finished Products", branchId: destination.id };
  const notification: Notification = { id: uniqueId("notification"), type: "Operational", title: "Incoming delivery", description: `Shipment ${id} from Factory is awaiting confirmation.`, timestamp, read: false, roles: ["Branch"], branchId: destination.id, relatedId: id };
  const next = reconcileAlerts({ ...state, batches: deductBatches(state, product.id, input.quantity), shipments: [shipment, ...state.shipments], activities: [activity, ...state.activities], notifications: [notification, ...state.notifications] }, today);
  return { state: next, value: shipment };
}

export function confirmShipmentReceipt(state: DemoState, input: { shipmentId: string; receivedQuantity: number }, actor: User, timestamp = new Date().toISOString()): DemoResult<Shipment> {
  if (!actor.active || actor.role !== "Branch") return { state, error: "Only the receiving branch can confirm this delivery." };
  const shipment = state.shipments.find((item) => item.id === input.shipmentId);
  if (!shipment || shipment.destinationId !== actor.branchId) return { state, error: "Shipment not found for this branch." };
  if (shipment.status !== "Awaiting Confirmation") return { state, error: "This delivery has already been confirmed." };
  if (!Number.isFinite(input.receivedQuantity) || input.receivedQuantity < 0) return { state, error: "Actual received quantity must be 0 or more." };
  const receivedQuantity = round(input.receivedQuantity);
  const difference = round(receivedQuantity - shipment.sentQuantity);
  const status: ShipmentStatus = difference === 0 ? "Confirmed" : "Discrepancy";
  const updated: Shipment = { ...shipment, receivedQuantity, difference, receivedById: actor.id, receivedByName: actor.name, receivedAt: timestamp, status };
  const receiptActivity: Activity = { id: uniqueId("activity"), type: "Branch Receipt", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: `${shipment.destinationName} confirmed delivery`, productId: shipment.productId, productName: shipment.productName, quantity: receivedQuantity, unit: shipment.unit, source: shipment.source, destination: shipment.destinationName, reference: shipment.id, status, area: "Finished Products", branchId: shipment.destinationId, details: `Sent ${formatQuantity(shipment.sentQuantity)} ${shipment.unit} · received ${formatQuantity(receivedQuantity)} ${shipment.unit} · difference ${difference > 0 ? "+" : ""}${formatQuantity(difference)} ${shipment.unit}` };
  const addedActivities: Activity[] = [receiptActivity];
  const addedNotifications: Notification[] = [];
  if (difference !== 0) {
    addedActivities.push({ id: uniqueId("activity"), type: "Discrepancy", date: timestamp.slice(0, 10), timestamp, userId: actor.id, userName: actor.name, title: difference < 0 ? "Delivery shortage recorded" : "Over-delivery recorded", productId: shipment.productId, productName: shipment.productName, quantity: difference, unit: shipment.unit, destination: shipment.destinationName, reference: shipment.id, status: "Needs Review", area: "Finished Products", branchId: shipment.destinationId });
    addedNotifications.push({ id: uniqueId("notification"), type: "Delivery Discrepancy", title: "Delivery discrepancy", description: `${shipment.destinationName} received ${formatQuantity(receivedQuantity)} ${shipment.unit} of ${formatQuantity(shipment.sentQuantity)} ${shipment.unit} sent.`, timestamp, read: false, roles: ["Admin", "Supervisor"], relatedId: shipment.id });
  } else {
    addedNotifications.push({ id: uniqueId("notification"), type: "Operational", title: "Matched receipt confirmed", description: `${shipment.destinationName} confirmed all ${formatQuantity(receivedQuantity)} ${shipment.unit} from shipment ${shipment.id}.`, timestamp, read: false, roles: ["Admin", "Supervisor", "Factory"], relatedId: shipment.id });
  }
  return { state: { ...state, shipments: state.shipments.map((item) => item.id === shipment.id ? updated : item), activities: [...addedActivities, ...state.activities], notifications: [...addedNotifications, ...state.notifications] }, value: updated };
}

export function markNotificationRead(state: DemoState, notificationId: string, read = true): DemoState {
  return { ...state, notifications: state.notifications.map((notification) => notification.id === notificationId ? { ...notification, read } : notification) };
}

export function markAllNotificationsRead(state: DemoState, role: Role, user: User): DemoState {
  const visibleIds = new Set(visibleNotifications(state, role, user).map((notification) => notification.id));
  return { ...state, notifications: state.notifications.map((notification) => visibleIds.has(notification.id) ? { ...notification, read: true } : notification) };
}
