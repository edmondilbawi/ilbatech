import assert from "node:assert/strict";
import test from "node:test";

const model = await import(new URL("./ordering-demo-model.ts", import.meta.url).href) as typeof import("./ordering-demo-model");
const { BRANCHES, DEFAULT_CUSTOMIZATION, PRODUCTS, calculateTotals, createInitialOrderingState, createPlacedOrder, itemUnitPrice, loadOrderingState, makeCartItem, trackingStages } = model;

test("menu contains a complete quick-service range with original local imagery", () => {
  assert.equal(PRODUCTS.length, 20);
  assert.deepEqual(new Set(PRODUCTS.map((product) => product.category)), new Set(["Meals", "Burgers", "Chicken", "Wraps", "Sides", "Drinks", "Desserts", "Breakfast"]));
  assert.ok(PRODUCTS.every((product) => product.image.startsWith("/images/ordering/") && product.image.endsWith(".webp")));
  assert.ok(PRODUCTS.some((product) => !product.available));
  assert.ok(PRODUCTS.some((product) => product.vegetarian));
  assert.equal(BRANCHES.length, 4);
});

test("burger, add-on, and meal customization updates the deterministic unit price", () => {
  const customization = { ...DEFAULT_CUSTOMIZATION, patty: "Double" as const, cheese: "Extra Cheddar" as const, removed: ["Pickles"], meal: true, side: "Large Fries" as const, drink: "Diet Cola" as const, size: "Large" as const };
  const item = makeCartItem("classic-smash", customization, 1, "custom-burger");
  assert.equal(itemUnitPrice(item), 18.9);
});

test("WELCOME10 produces exact pickup totals", () => {
  const burger = makeCartItem("classic-smash", { ...DEFAULT_CUSTOMIZATION, patty: "Double", cheese: "Extra Cheddar", removed: ["Pickles"], meal: true, side: "Large Fries", drink: "Diet Cola", size: "Large" }, 1, "burger");
  const dessert = makeCartItem("lava-cake", DEFAULT_CUSTOMIZATION, 1, "dessert");
  assert.deepEqual(calculateTotals([burger, dessert], "Pickup", "WELCOME10"), { subtotal: 24.1, discount: 2.41, deliveryFee: 0, tax: 1.08, total: 22.77 });
});

test("delivery adds a deterministic fee and tax", () => {
  const item = makeCartItem("seasoned-fries", DEFAULT_CUSTOMIZATION, 1, "fries");
  assert.deepEqual(calculateTotals([item], "Delivery", ""), { subtotal: 3.49, discount: 0, deliveryFee: 3.49, tax: .35, total: 7.33 });
});

test("FREESIDE only discounts eligible side or meal carts", () => {
  const burger = makeCartItem("classic-smash", DEFAULT_CUSTOMIZATION, 1, "burger");
  const fries = makeCartItem("seasoned-fries", DEFAULT_CUSTOMIZATION, 1, "fries");
  assert.equal(calculateTotals([burger], "Pickup", "FREESIDE").discount, 0);
  assert.equal(calculateTotals([burger, fries], "Pickup", "FREESIDE").discount, 3.49);
});

test("placed orders capture customer, fulfillment, items, totals and safe payment label", () => {
  const state = { ...createInitialOrderingState(), orderType: "Pickup" as const, branchId: "downtown", cart: [makeCartItem("ember-double", DEFAULT_CUSTOMIZATION, 2, "double")], promo: "WELCOME10" };
  const order = createPlacedOrder(state, { name: "Demo Guest", phone: "+961 70 000 000", email: "guest@example.test" }, "Card", "Pickup counter");
  assert.equal(order.id, "#QSR-1084");
  assert.equal(order.customer.name, "Demo Guest");
  assert.equal(order.paymentMethod, "Card");
  assert.equal(order.items[0].quantity, 2);
  assert.equal("cardNumber" in order, false);
});

test("tracking stages adapt to pickup and delivery", () => {
  assert.deepEqual(trackingStages("Pickup"), ["Order Received", "Confirmed", "Preparing", "Ready", "Completed"]);
  assert.deepEqual(trackingStages("Delivery"), ["Order Received", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered"]);
});

test("persistence restores valid state and safely resets malformed data", () => {
  const state = createInitialOrderingState();
  state.orderType = "Pickup";
  state.branchId = "downtown";
  state.favorites.push("ember-double");
  assert.deepEqual(loadOrderingState(JSON.stringify(state)), state);
  assert.deepEqual(loadOrderingState("not-json"), createInitialOrderingState());
  assert.deepEqual(loadOrderingState(JSON.stringify({ ...state, version: 99 })), createInitialOrderingState());
});

test("version 1 ordering data migrates without losing customer state", () => {
  const state = createInitialOrderingState();
  state.orderType = "Pickup";
  state.branchId = "downtown";
  state.favorites.push("ember-double");
  const loaded = loadOrderingState(JSON.stringify({ ...state, version: 1 }));
  assert.equal(loaded.version, 2);
  assert.equal(loaded.orderType, "Pickup");
  assert.equal(loaded.branchId, "downtown");
  assert.deepEqual(loaded.favorites, ["crispy-club", "ember-double"]);
});
