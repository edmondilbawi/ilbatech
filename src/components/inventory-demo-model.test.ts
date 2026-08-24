import assert from "node:assert/strict";
import test from "node:test";
const inventoryModel = await import(new URL("./inventory-demo-model.ts", import.meta.url).href) as typeof import("./inventory-demo-model");
const {
  addPlace,
  addProduct,
  createSeedState,
  editPlace,
  editProduct,
  estimatedStockValue,
  getLocalDate,
  loadInventoryState,
  moveStockIn,
  moveStockOut,
  removePlace,
  removeProduct,
  stockStatus,
} = inventoryModel;

const TODAY = "2026-08-24";
const TIMESTAMP = "2026-08-24T10:00:00.000Z";

function seed() {
  return createSeedState(TODAY);
}

test("the exact client flow updates Chicken Breast and stores reliable history", () => {
  const initial = seed();
  const chicken = initial.products.find((product) => product.id === "chicken-breast")!;
  assert.equal(chicken.quantity, 8);

  const stockIn = moveStockIn(initial, {
    productId: chicken.id,
    quantity: 10,
    sourceId: "fresh-foods",
    cost: 5.2,
    effectiveDate: TODAY,
  }, TODAY, TIMESTAMP);
  assert.equal(stockIn.error, undefined);
  assert.equal(stockIn.state.products.find((product) => product.id === chicken.id)?.quantity, 18);
  assert.equal(stockIn.state.movements.length, initial.movements.length + 1);
  assert.deepEqual(
    [stockIn.movement?.previousQuantity, stockIn.movement?.resultingQuantity, stockIn.movement?.sourceName],
    [8, 18, "Fresh Foods Supplier"],
  );
  assert.equal(stockIn.movement?.destinationId, undefined);

  const stockOut = moveStockOut(stockIn.state, {
    productId: chicken.id,
    quantity: 3,
    destinationId: "main-kitchen",
    effectiveDate: TODAY,
  }, TODAY, TIMESTAMP);
  assert.equal(stockOut.error, undefined);
  assert.equal(stockOut.state.products.find((product) => product.id === chicken.id)?.quantity, 15);
  assert.deepEqual(
    [stockOut.movement?.previousQuantity, stockOut.movement?.resultingQuantity, stockOut.movement?.destinationName],
    [18, 15, "Main Kitchen"],
  );
  assert.equal(stockOut.movement?.sourceId, undefined);

  const blocked = moveStockOut(stockOut.state, {
    productId: chicken.id,
    quantity: 20,
    destinationId: "main-kitchen",
    effectiveDate: TODAY,
  }, TODAY, TIMESTAMP);
  assert.equal(blocked.error, "Not enough stock.");
  assert.equal(blocked.state, stockOut.state);
  assert.equal(blocked.state.products.find((product) => product.id === chicken.id)?.quantity, 15);
  assert.equal(blocked.state.movements.length, stockOut.state.movements.length);
});

test("Stock In requires an active product, positive amount, source, cost and valid date", () => {
  const state = seed();
  const base = { productId: "chicken-breast", quantity: 1, sourceId: "fresh-foods", cost: 5, effectiveDate: TODAY };
  assert.equal(moveStockIn(state, { ...base, productId: "" }, TODAY).error, "Choose a product.");
  assert.equal(moveStockIn(state, { ...base, quantity: 0 }, TODAY).error, "Enter an amount greater than 0.");
  assert.equal(moveStockIn(state, { ...base, quantity: Number.NaN }, TODAY).error, "Enter an amount greater than 0.");
  assert.equal(moveStockIn(state, { ...base, sourceId: "" }, TODAY).error, "Choose where the stock came from.");
  assert.equal(moveStockIn(state, { ...base, cost: 0 }, TODAY).error, "Enter a valid purchase cost.");
  assert.equal(moveStockIn(state, { ...base, effectiveDate: "2026-08-25" }, TODAY).error, "Choose today or an earlier valid date.");
});

test("Stock Out requires an active product, positive amount, destination and valid date", () => {
  const state = seed();
  const base = { productId: "chicken-breast", quantity: 1, destinationId: "main-kitchen", effectiveDate: TODAY };
  assert.equal(moveStockOut(state, { ...base, productId: "" }, TODAY).error, "Choose a product.");
  assert.equal(moveStockOut(state, { ...base, quantity: -1 }, TODAY).error, "Enter an amount greater than 0.");
  assert.equal(moveStockOut(state, { ...base, destinationId: "" }, TODAY).error, "Choose where the stock is going.");
  assert.equal(moveStockOut(state, { ...base, effectiveDate: "not-a-date" }, TODAY).error, "Choose today or an earlier valid date.");
});

test("automatic local date and a manual backdate are both supported", () => {
  assert.equal(getLocalDate(new Date(2026, 7, 24, 12)), TODAY);
  const result = moveStockOut(seed(), {
    productId: "chicken-breast",
    quantity: 1,
    destinationId: "main-kitchen",
    effectiveDate: "2026-08-23",
  }, TODAY, TIMESTAMP);
  assert.equal(result.movement?.effectiveDate, "2026-08-23");
});

test("low-stock status reacts immediately to Stock Out and Stock In", () => {
  const state = seed();
  const chicken = state.products.find((product) => product.id === "chicken-breast")!;
  const out = moveStockOut(state, { productId: chicken.id, quantity: 4, destinationId: "main-kitchen", effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const lowChicken = out.state.products.find((product) => product.id === chicken.id)!;
  assert.equal(stockStatus(lowChicken), "Low Stock");
  const stockIn = moveStockIn(out.state, { productId: chicken.id, quantity: 6, sourceId: "fresh-foods", cost: 5.2, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  assert.equal(stockStatus(stockIn.state.products.find((product) => product.id === chicken.id)!), "In Stock");
});

test("product creation records a consistent opening balance and editing preserves quantity", () => {
  const state = seed();
  const created = addProduct(state, {
    name: "Cups",
    subcategory: "Packaging / Disposables",
    quantity: 50,
    unit: "pcs",
    cost: 0.09,
    lowStockLevel: 20,
  }, TODAY, TIMESTAMP);
  assert.equal(created.error, undefined);
  const product = created.state.products.at(-1)!;
  assert.equal(product.quantity, 50);
  assert.equal(created.movement?.openingBalance, true);
  assert.deepEqual([created.movement?.previousQuantity, created.movement?.resultingQuantity], [0, 50]);

  const edited = editProduct(created.state, product.id, { ...product, name: "Paper Cups", cost: 0.1 });
  assert.equal(edited.error, undefined);
  assert.equal(edited.state.products.find((item) => item.id === product.id)?.name, "Paper Cups");
  assert.equal(edited.state.products.find((item) => item.id === product.id)?.quantity, 50);
});

test("unit changes are blocked after history exists", () => {
  const state = seed();
  const chicken = state.products.find((product) => product.id === "chicken-breast")!;
  const used = moveStockIn(state, { productId: chicken.id, quantity: 1, sourceId: "fresh-foods", cost: 5.2, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const result = editProduct(used.state, chicken.id, { ...chicken, quantity: 9, unit: "pcs" });
  assert.equal(result.error, "Unit can't be changed because this product already has stock history.");
});

test("safe product removal archives used products and preserves movement snapshots", () => {
  const state = seed();
  const chicken = state.products.find((product) => product.id === "chicken-breast")!;
  const used = moveStockIn(state, { productId: chicken.id, quantity: 1, sourceId: "fresh-foods", cost: 5, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const removed = removeProduct(used.state, chicken.id);
  assert.equal(removed.state.products.find((product) => product.id === chicken.id)?.active, false);
  assert.equal(removed.state.movements[0].productName, "Chicken Breast");
  assert.equal(moveStockOut(removed.state, { productId: chicken.id, quantity: 1, destinationId: "main-kitchen", effectiveDate: TODAY }, TODAY).error, "This product is no longer active.");
});

test("unused products are removed permanently", () => {
  const state = seed();
  const product = state.products.find((item) => item.id === "black-pepper")!;
  assert.equal(state.movements.some((movement) => movement.productId === product.id), false);
  const removed = removeProduct(state, product.id);
  assert.equal(removed.state.products.some((item) => item.id === product.id), false);
});

test("source add, rename and safe removal work without changing historical names", () => {
  const state = seed();
  const added = addPlace(state, "sources", "Local Market");
  const source = added.state.sources.at(-1)!;
  assert.equal(source.name, "Local Market");
  const renamed = editPlace(added.state, "sources", source.id, "Neighborhood Market");
  assert.equal(renamed.state.sources.at(-1)?.name, "Neighborhood Market");

  const used = moveStockIn(renamed.state, { productId: "chicken-breast", quantity: 1, sourceId: source.id, cost: 5, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const removed = removePlace(used.state, "sources", source.id);
  assert.equal(removed.state.sources.find((item) => item.id === source.id)?.active, false);
  assert.equal(removed.state.movements[0].sourceName, "Neighborhood Market");
  assert.equal(moveStockIn(removed.state, { productId: "chicken-breast", quantity: 1, sourceId: source.id, cost: 5, effectiveDate: TODAY }, TODAY).error, "Choose where the stock came from.");
});

test("destination add, rename and safe removal work without changing historical names", () => {
  const state = seed();
  const added = addPlace(state, "destinations", "Outdoor Kitchen");
  const destination = added.state.destinations.at(-1)!;
  const renamed = editPlace(added.state, "destinations", destination.id, "Garden Kitchen");
  const used = moveStockOut(renamed.state, { productId: "chicken-breast", quantity: 1, destinationId: destination.id, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const removed = removePlace(used.state, "destinations", destination.id);
  assert.equal(removed.state.destinations.find((item) => item.id === destination.id)?.active, false);
  assert.equal(removed.state.movements[0].destinationName, "Garden Kitchen");
  assert.equal(moveStockOut(removed.state, { productId: "chicken-breast", quantity: 1, destinationId: destination.id, effectiveDate: TODAY }, TODAY).error, "Choose where the stock is going.");
});

test("persistence accepts valid state and safely replaces malformed or incompatible data", () => {
  const state = seed();
  assert.deepEqual(loadInventoryState(JSON.stringify(state), TODAY), state);
  assert.equal(loadInventoryState("bad json", TODAY).products.find((product) => product.id === "chicken-breast")?.quantity, 8);
  assert.equal(loadInventoryState(JSON.stringify({ ...state, version: 999 }), TODAY).version, 1);
  assert.equal(loadInventoryState(JSON.stringify({ ...state, products: [{ broken: true }] }), TODAY).products.length, state.products.length);
});

test("reset seed is deterministic and estimated stock value reflects quantity and cost changes", () => {
  const initial = seed();
  const initialValue = estimatedStockValue(initial);
  const stockIn = moveStockIn(initial, { productId: "chicken-breast", quantity: 10, sourceId: "fresh-foods", cost: 5.2, effectiveDate: TODAY }, TODAY, TIMESTAMP);
  const expectedChange = (18 * 5.2) - (8 * 4.8);
  assert.equal(estimatedStockValue(stockIn.state), Math.round((initialValue + expectedChange) * 1000) / 1000);
  assert.equal(createSeedState(TODAY).products.find((product) => product.id === "chicken-breast")?.quantity, 8);
  assert.equal(createSeedState(TODAY).movements.length, 2);
});
