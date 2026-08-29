import assert from "node:assert/strict";
import test from "node:test";

const model = await import(new URL("./inventory-demo-model.ts", import.meta.url).href) as typeof import("./inventory-demo-model");
type Role = import("./inventory-demo-model").Role;
const {
  activeUserForRole,
  confirmShipmentReceipt,
  createPurchaseRequest,
  createSeedState,
  createShipment,
  getLocalDate,
  issueInventoryOneStock,
  loadDemoState,
  markAllNotificationsRead,
  productBatches,
  productQuantity,
  productStatus,
  receiveStock,
  saveEntity,
  saveProduct,
  saveUser,
  toggleEntityActive,
  toggleProductActive,
  toggleUserActive,
  transformStock,
  updatePurchaseStatus,
  visibleNotifications,
} = model;

const TODAY = "2026-08-30";
const TIMESTAMP = "2026-08-30T10:00:00.000Z";
const laterTimestamp = (hour: number) => `2026-08-30T${String(hour).padStart(2, "0")}:00:00.000Z`;
const seed = () => createSeedState(TODAY);

test("seed data covers all five roles, both inventories, batches, requests, shipments and alerts", () => {
  const state = seed();
  assert.deepEqual(["Admin", "Supervisor", "Inventory 1", "Factory", "Branch"].map((role) => activeUserForRole(state, role as Role).role), ["Admin", "Supervisor", "Inventory 1", "Factory", "Branch"]);
  assert.equal(productQuantity(state, "chicken-breast"), 18.5);
  assert.equal(productQuantity(state, "raw-chicken"), 40);
  assert.equal(productQuantity(state, "marinated-chicken"), 18);
  assert.ok(productBatches(state, "chicken-breast").length > 1);
  assert.ok(state.purchaseRequests.some((request) => request.status === "Pending"));
  assert.ok(state.shipments.some((shipment) => shipment.status === "Awaiting Confirmation"));
  assert.ok(state.shipments.some((shipment) => shipment.status === "Discrepancy"));
  assert.ok(state.notifications.some((notification) => notification.type === "Low Stock"));
  assert.ok(state.notifications.some((notification) => notification.type === "Approaching Expiry"));
});

test("Inventory 1 Stock In creates one batch, increases stock, records supplier and employee, and clears a resolved low alert", () => {
  const state = seed();
  const actor = activeUserForRole(state, "Inventory 1");
  assert.equal(productQuantity(state, "tomatoes"), 8);
  assert.equal(productStatus(state, state.products.find((product) => product.id === "tomatoes")!, TODAY), "Low Stock");
  const result = receiveStock(state, { productId: "tomatoes", quantity: 10, expiryDate: "2026-09-03", date: TODAY, supplierId: "green-valley" }, actor, TODAY, TIMESTAMP);
  assert.equal(result.error, undefined);
  assert.equal(productQuantity(result.state, "tomatoes"), 18);
  assert.equal(result.state.batches.length, state.batches.length + 1);
  assert.equal(result.value?.supplierId, "green-valley");
  assert.equal(result.state.activities[0].userName, "Omar Hassan");
  assert.equal(result.state.activities[0].source, "Green Valley Produce");
  assert.equal(result.state.notifications.some((notification) => notification.id === "alert-low-tomatoes"), false);
});

test("Stock In validates role, product, quantity, supplier, expiry and date", () => {
  const state = seed();
  const inventoryActor = activeUserForRole(state, "Inventory 1");
  const factoryActor = activeUserForRole(state, "Factory");
  const valid = { productId: "chicken-breast", quantity: 2, expiryDate: "2026-09-03", date: TODAY, supplierId: "fresh-foods" };
  assert.equal(receiveStock(state, valid, factoryActor, TODAY).error, "This role can't receive stock for that inventory.");
  assert.equal(receiveStock(state, { ...valid, productId: "marinated-chicken" }, inventoryActor, TODAY).error, "Choose an active product for this inventory.");
  assert.equal(receiveStock(state, { ...valid, quantity: 0 }, inventoryActor, TODAY).error, "Enter a quantity greater than 0.");
  assert.equal(receiveStock(state, { ...valid, supplierId: "" }, inventoryActor, TODAY).error, "Choose an active supplier.");
  assert.equal(receiveStock(state, { ...valid, expiryDate: "2026-08-29" }, inventoryActor, TODAY).error, "Choose a valid expiry date on or after the receiving date.");
  assert.equal(receiveStock(state, { ...valid, date: "2026-08-31" }, inventoryActor, TODAY).error, "Choose today or an earlier valid date.");
});

test("Inventory 1 Stock Out deducts batches, records destination and never permits negative stock", () => {
  const state = seed();
  const actor = activeUserForRole(state, "Inventory 1");
  const success = issueInventoryOneStock(state, { productId: "chicken-breast", quantity: 10, date: TODAY, destinationId: "main-kitchen" }, actor, TODAY, TIMESTAMP);
  assert.equal(success.error, undefined);
  assert.equal(productQuantity(success.state, "chicken-breast"), 8.5);
  assert.equal(success.state.activities.length, state.activities.length + 1);
  assert.equal(success.value?.destination, "Main Kitchen");
  assert.equal(productStatus(success.state, success.state.products.find((product) => product.id === "chicken-breast")!, TODAY), "Low Stock");
  const historyLength = success.state.activities.length;
  const blocked = issueInventoryOneStock(success.state, { productId: "chicken-breast", quantity: 9, date: TODAY, destinationId: "main-kitchen" }, actor, TODAY, TIMESTAMP);
  assert.equal(blocked.error, "Insufficient stock. Available quantity: 8.5 kg.");
  assert.equal(productQuantity(blocked.state, "chicken-breast"), 8.5);
  assert.equal(blocked.state.activities.length, historyLength);
});

test("Factory Stock In increases raw material and records a raw batch", () => {
  const state = seed();
  const actor = activeUserForRole(state, "Factory");
  const result = receiveStock(state, { productId: "raw-chicken", quantity: 15, expiryDate: "2026-09-02", date: TODAY, supplierId: "prime-meat" }, actor, TODAY, TIMESTAMP);
  assert.equal(result.error, undefined);
  assert.equal(productQuantity(result.state, "raw-chicken"), 55);
  assert.equal(result.state.activities[0].area, "Raw Materials");
  assert.equal(result.state.activities[0].userName, "Karim Saleh");
});

test("exact production story balances 20 kg atomically across two outputs and waste", () => {
  const state = seed();
  const actor = activeUserForRole(state, "Factory");
  const result = transformStock(state, { rawProductId: "raw-chicken", rawQuantity: 20, outputs: [{ productId: "chicken-fillet", quantity: 12 }, { productId: "marinated-chicken", quantity: 5 }], waste: 3, date: TODAY }, actor, TODAY, TIMESTAMP);
  assert.equal(result.error, undefined);
  assert.equal(result.value?.rawQuantity, 20);
  assert.equal(result.value?.outputs.reduce((total, output) => total + output.quantity, 0), 17);
  assert.equal(result.value?.waste, 3);
  assert.equal(productQuantity(result.state, "raw-chicken"), 20);
  assert.equal(productQuantity(result.state, "chicken-fillet"), 20);
  assert.equal(productQuantity(result.state, "marinated-chicken"), 23);
  assert.equal(result.state.productions.length, state.productions.length + 1);
  assert.equal(result.state.activities.filter((activity) => activity.reference === result.value?.id).length, 2);
});

test("production blocks unaccounted, excessive, unavailable, duplicate and invalid output quantities without mutation", () => {
  const state = seed();
  const actor = activeUserForRole(state, "Factory");
  const base = { rawProductId: "raw-chicken", rawQuantity: 20, outputs: [{ productId: "chicken-fillet", quantity: 12 }, { productId: "marinated-chicken", quantity: 5 }], waste: 3, date: TODAY };
  assert.equal(transformStock(state, { ...base, waste: 2 }, actor, TODAY).error, "1 kg remains unaccounted for.");
  assert.equal(transformStock(state, { ...base, waste: 4 }, actor, TODAY).error, "Finished output and waste exceed raw quantity by 1 kg.");
  assert.equal(transformStock(state, { ...base, rawQuantity: 50, outputs: [{ productId: "chicken-fillet", quantity: 47 }] }, actor, TODAY).error, "Insufficient stock. Available quantity: 40 kg.");
  assert.equal(transformStock(state, { ...base, outputs: [{ productId: "chicken-fillet", quantity: 12 }, { productId: "chicken-fillet", quantity: 5 }] }, actor, TODAY).error, "Each finished product can appear only once.");
  assert.equal(transformStock(state, { ...base, outputs: [{ productId: "chicken-fillet", quantity: -1 }] }, actor, TODAY).error, "Every finished quantity must be greater than 0.");
  assert.equal(productQuantity(state, "raw-chicken"), 40);
});

function productionStoryState() {
  const state = seed();
  const actor = activeUserForRole(state, "Factory");
  return transformStock(state, { rawProductId: "raw-chicken", rawQuantity: 20, outputs: [{ productId: "chicken-fillet", quantity: 12 }, { productId: "marinated-chicken", quantity: 5 }], waste: 3, date: TODAY }, actor, TODAY, TIMESTAMP).state;
}

test("Factory sends 20 kg Marinated Chicken and preserves an awaiting branch shipment", () => {
  const state = productionStoryState();
  const actor = activeUserForRole(state, "Factory");
  const result = createShipment(state, { productId: "marinated-chicken", quantity: 20, destinationId: "downtown", date: TODAY }, actor, TODAY, laterTimestamp(11));
  assert.equal(result.error, undefined);
  assert.equal(productQuantity(result.state, "marinated-chicken"), 3);
  assert.equal(result.value?.sentQuantity, 20);
  assert.equal(result.value?.destinationName, "Downtown Branch");
  assert.equal(result.value?.status, "Awaiting Confirmation");
  assert.ok(result.state.notifications.some((notification) => notification.relatedId === result.value?.id && notification.roles.includes("Branch")));
});

test("branch shortage receipt preserves sent and received quantities and creates exact Admin discrepancy notification", () => {
  const produced = productionStoryState();
  const factory = activeUserForRole(produced, "Factory");
  const sent = createShipment(produced, { productId: "marinated-chicken", quantity: 20, destinationId: "downtown", date: TODAY }, factory, TODAY, laterTimestamp(11));
  const branch = activeUserForRole(sent.state, "Branch");
  const receipt = confirmShipmentReceipt(sent.state, { shipmentId: sent.value!.id, receivedQuantity: 18.5 }, branch, laterTimestamp(12));
  assert.equal(receipt.error, undefined);
  assert.equal(receipt.value?.sentQuantity, 20);
  assert.equal(receipt.value?.receivedQuantity, 18.5);
  assert.equal(receipt.value?.difference, -1.5);
  assert.equal(receipt.value?.status, "Discrepancy");
  assert.ok(receipt.state.notifications.some((notification) => notification.description === "Downtown Branch received 18.5 kg of 20 kg sent." && notification.roles.includes("Admin")));
  assert.ok(receipt.state.activities.some((activity) => activity.type === "Discrepancy" && activity.reference === sent.value?.id));
});

test("branch receipts handle matched and over-delivery outcomes without overwriting sent stock", () => {
  const state = seed();
  const branch = activeUserForRole(state, "Branch");
  const matched = confirmShipmentReceipt(state, { shipmentId: "TR-1048", receivedQuantity: 6 }, branch, TIMESTAMP);
  assert.equal(matched.value?.status, "Confirmed");
  assert.equal(matched.value?.difference, 0);
  assert.ok(matched.state.notifications.some((notification) => notification.title === "Matched receipt confirmed" && notification.relatedId === "TR-1048"));

  const factory = activeUserForRole(matched.state, "Factory");
  const newShipment = createShipment(matched.state, { productId: "marinated-chicken", quantity: 2, destinationId: "downtown", date: TODAY }, factory, TODAY, laterTimestamp(11));
  const over = confirmShipmentReceipt(newShipment.state, { shipmentId: newShipment.value!.id, receivedQuantity: 3 }, branch, laterTimestamp(12));
  assert.equal(over.value?.sentQuantity, 2);
  assert.equal(over.value?.receivedQuantity, 3);
  assert.equal(over.value?.difference, 1);
  assert.equal(over.value?.status, "Discrepancy");
});

test("multi-product purchase request progresses Pending to Accepted to Purchase Complete and notifies requester", () => {
  const state = seed();
  const inventoryActor = activeUserForRole(state, "Inventory 1");
  const created = createPurchaseRequest(state, { items: [{ productId: "chicken-breast", quantity: 30 }, { productId: "mozzarella", quantity: 10 }], message: "Required before weekend service.", date: TODAY }, inventoryActor, TODAY, TIMESTAMP);
  assert.equal(created.error, undefined);
  assert.equal(created.value?.status, "Pending");
  assert.equal(created.value?.items.length, 2);
  const supervisor = activeUserForRole(created.state, "Supervisor");
  const accepted = updatePurchaseStatus(created.state, created.value!.id, "Accepted", supervisor, laterTimestamp(11));
  assert.equal(accepted.value?.status, "Accepted");
  assert.ok(accepted.state.notifications.some((notification) => notification.userId === inventoryActor.id && notification.description.includes("accepted by Maya Khalil")));
  const completed = updatePurchaseStatus(accepted.state, created.value!.id, "Purchase Complete", supervisor, laterTimestamp(12));
  assert.equal(completed.value?.status, "Purchase Complete");
  assert.ok(completed.state.notifications.some((notification) => notification.description.includes("marked Purchase Complete")));
  assert.equal(updatePurchaseStatus(completed.state, created.value!.id, "Accepted", supervisor).error, `${created.value!.id} can't move from Purchase Complete to Accepted.`);
});

test("purchase request validates lines and role permissions", () => {
  const state = seed();
  const inventoryActor = activeUserForRole(state, "Inventory 1");
  const factoryActor = activeUserForRole(state, "Factory");
  assert.equal(createPurchaseRequest(state, { items: [], date: TODAY }, inventoryActor, TODAY).error, "Add at least one product to the request.");
  assert.equal(createPurchaseRequest(state, { items: [{ productId: "chicken-breast", quantity: 0 }], date: TODAY }, inventoryActor, TODAY).error, "Every requested quantity must be greater than 0.");
  assert.equal(createPurchaseRequest(state, { items: [{ productId: "chicken-breast", quantity: 1 }, { productId: "chicken-breast", quantity: 2 }], date: TODAY }, inventoryActor, TODAY).error, "Each product can appear only once in a request.");
  assert.equal(createPurchaseRequest(state, { items: [{ productId: "chicken-breast", quantity: 1 }], date: TODAY }, factoryActor, TODAY).error, "This role can't create purchase requests.");
});

test("Admin master-data actions work while non-Admin actions are blocked and history snapshots remain", () => {
  const state = seed();
  const admin = activeUserForRole(state, "Admin");
  const supervisor = activeUserForRole(state, "Supervisor");
  const userCreated = saveUser(state, { name: "Rami Daher", role: "Branch", branchId: "airport", active: true, status: "Offline" }, admin, undefined, TIMESTAMP);
  assert.equal(userCreated.value?.role, "Branch");
  assert.equal(saveUser(state, { name: "Blocked", role: "Factory", active: true, status: "Offline" }, supervisor).error, "Only Admin can make this change.");
  const inactive = toggleUserActive(userCreated.state, "omar-hassan", admin, laterTimestamp(11));
  assert.equal(inactive.value?.active, false);
  assert.ok(inactive.state.activities.some((activity) => activity.userName === "Omar Hassan" && activity.type === "Stock In"));

  const productCreated = saveProduct(inactive.state, { name: "Prepared Garlic Sauce", area: "Finished Products", category: "Sauce", unit: "kg", minimumStock: 3, expiryWarningDays: 2, shelfLifeDays: 4 }, admin, undefined, laterTimestamp(12));
  assert.equal(productCreated.value?.active, true);
  const deactivatedProduct = toggleProductActive(productCreated.state, "mozzarella", admin, laterTimestamp(13));
  assert.equal(deactivatedProduct.value?.active, false);
  assert.ok(deactivatedProduct.state.activities.some((activity) => activity.productName === "Mozzarella"));

  const supplierCreated = saveEntity(deactivatedProduct.state, "suppliers", { name: "Local Produce Hub" }, admin, undefined, laterTimestamp(14));
  assert.equal(supplierCreated.value?.name, "Local Produce Hub");
  const supplierToggled = toggleEntityActive(supplierCreated.state, "suppliers", supplierCreated.value!.id, admin, laterTimestamp(15));
  assert.equal(supplierToggled.value?.active, false);
});

test("role-specific notifications expose only relevant alerts and read state is preserved", () => {
  const state = seed();
  const branch = activeUserForRole(state, "Branch");
  const admin = activeUserForRole(state, "Admin");
  const branchNotifications = visibleNotifications(state, "Branch", branch);
  assert.ok(branchNotifications.every((notification) => notification.roles.includes("Branch") && (!notification.branchId || notification.branchId === branch.branchId)));
  assert.ok(!branchNotifications.some((notification) => notification.type === "Low Stock"));
  const adminNotifications = visibleNotifications(state, "Admin", admin);
  assert.ok(adminNotifications.some((notification) => notification.type === "Delivery Discrepancy"));
  const marked = markAllNotificationsRead(state, "Admin", admin);
  assert.ok(visibleNotifications(marked, "Admin", admin).every((notification) => notification.read));
  assert.ok(visibleNotifications(marked, "Branch", branch).some((notification) => !notification.read));
});

test("persistence survives valid refresh data and safely replaces malformed or incompatible state", () => {
  const state = seed();
  assert.deepEqual(loadDemoState(JSON.stringify(state), TODAY), state);
  assert.equal(loadDemoState("not-json", TODAY).version, 2);
  assert.equal(loadDemoState(JSON.stringify({ ...state, version: 1 }), TODAY).version, 2);
  assert.equal(loadDemoState(JSON.stringify({ ...state, batches: [{ broken: true }] }), TODAY).batches.length, state.batches.length);
});

test("reset data and local date remain deterministic", () => {
  assert.equal(getLocalDate(new Date(2026, 7, 30, 12)), TODAY);
  const first = seed();
  const reset = seed();
  assert.equal(productQuantity(first, "raw-chicken"), productQuantity(reset, "raw-chicken"));
  assert.equal(first.purchaseRequests[0].status, reset.purchaseRequests[0].status);
  assert.equal(first.shipments[0].status, reset.shipments[0].status);
  assert.equal(first.productions.length, reset.productions.length);
});
