import assert from "node:assert/strict";
import test from "node:test";

const model = (await import(
  new URL("./ecommerce-demo-model.ts", import.meta.url).href
)) as typeof import("./ecommerce-demo-model");
const {
  CATEGORIES,
  DELIVERY_OPTIONS,
  PRODUCTS,
  TRACKING_STAGES,
  calculateTotals,
  canCancelOrder,
  canReturnOrder,
  cancelOrder,
  createInitialCommerceState,
  createPlacedOrder,
  defaultSelections,
  filterAndSortProducts,
  loadCommerceState,
  makeCartItem,
  productById,
  productUnitPrice,
  reorderItems,
  requestReturn,
  searchProducts,
  toggleWishlist,
  variantIsAvailable,
} = model;

test("catalog contains a complete 30–50 item fictional range across all eight requested categories", () => {
  assert.ok(PRODUCTS.length >= 30 && PRODUCTS.length <= 50);
  assert.deepEqual(
    new Set(PRODUCTS.map((product) => product.category)),
    new Set(CATEGORIES),
  );
  assert.ok(
    PRODUCTS.every(
      (product) =>
        product.image.startsWith("/images/commerce/") &&
        product.image.endsWith(".webp"),
    ),
  );
  assert.ok(
    PRODUCTS.every(
      (product) => product.brand && product.seller && product.specs.length >= 4,
    ),
  );
});

test("search matches product names, categories, subcategories, and keywords", () => {
  const headphones = searchProducts("headphones");
  assert.ok(headphones.some((product) => product.id === "aura-headphones"));
  assert.ok(headphones.some((product) => product.id === "pulse-earbuds"));
  assert.ok(
    searchProducts("coffee").some((product) => product.id === "crema-espresso"),
  );
  assert.equal(searchProducts("definitely-not-a-product").length, 0);
});

test("category, price, rating, stock, brand, and delivery filters all affect results", () => {
  const results = filterAndSortProducts(
    PRODUCTS,
    {
      category: "Electronics",
      maxPrice: 200,
      minRating: 4.5,
      availableOnly: true,
      brand: "Brava Audio",
      delivery: "Same-Day",
    },
    "featured",
  );
  assert.deepEqual(
    results.map((product) => product.id),
    ["aura-headphones"],
  );
});

test("sorting supports low price, high price, rating, newest, and featured", () => {
  const filters = {
    category: "All" as const,
    maxPrice: 2000,
    minRating: 0,
    availableOnly: false,
    brand: "All",
    delivery: "Any" as const,
  };
  assert.equal(
    filterAndSortProducts(PRODUCTS, filters, "price-low")[0].id,
    "earbud-case",
  );
  assert.equal(
    filterAndSortProducts(PRODUCTS, filters, "price-high")[0].id,
    "arcbook-pro",
  );
  assert.equal(
    filterAndSortProducts(PRODUCTS, filters, "rating")[0].rating,
    4.8,
  );
  assert.equal(
    filterAndSortProducts(PRODUCTS, filters, "newest")[0].id,
    "camera-sling",
  );
  assert.equal(
    filterAndSortProducts(PRODUCTS, filters, "featured")[0].featured,
    true,
  );
});

test("variant pricing and unavailable variants are deterministic", () => {
  const laptop = productById("arcbook-air")!;
  assert.equal(
    productUnitPrice(laptop, { Storage: "512GB", Color: "Silver" }),
    1049,
  );
  assert.equal(
    variantIsAvailable(laptop, { Storage: "1TB", Color: "Silver" }),
    false,
  );
  assert.equal(
    variantIsAvailable(laptop, { Storage: "256GB", Color: "Silver" }),
    true,
  );
  assert.equal(productById("transit-tote")!.stock, 0);
  assert.equal(
    variantIsAvailable(
      productById("transit-tote")!,
      defaultSelections(productById("transit-tote")!),
    ),
    false,
  );
});

test("WELCOME10, express delivery, tax, and final total are exact", () => {
  const headphones = makeCartItem(
    "aura-headphones",
    { Color: "Black" },
    2,
    "headphones",
  );
  const hub = makeCartItem("travel-hub", { Color: "Graphite" }, 1, "hub");
  assert.deepEqual(
    calculateTotals([headphones, hub], "WELCOME10", DELIVERY_OPTIONS[1]),
    {
      subtotal: 303.98,
      discount: 30.4,
      shipping: 7.99,
      tax: 13.68,
      total: 295.25,
    },
  );
});

test("SAVE20 applies only when the subtotal reaches $150", () => {
  const low = makeCartItem("drift-mouse", { Color: "Black" }, 1, "low");
  const high = makeCartItem("crema-espresso", { Color: "Cream" }, 1, "high");
  assert.equal(
    calculateTotals([low], "SAVE20", DELIVERY_OPTIONS[0]).discount,
    0,
  );
  assert.equal(
    calculateTotals([high], "SAVE20", DELIVERY_OPTIONS[0]).discount,
    20,
  );
});

test("changing delivery changes shipping and total without changing merchandise", () => {
  const item = makeCartItem("aura-headphones", { Color: "Black" }, 1, "audio");
  const standard = calculateTotals([item], "", DELIVERY_OPTIONS[0]);
  const sameDay = calculateTotals([item], "", DELIVERY_OPTIONS[2]);
  assert.equal(standard.subtotal, sameDay.subtotal);
  assert.equal(sameDay.shipping, 12.99);
  assert.equal(Math.round((sameDay.total - standard.total) * 100) / 100, 12.99);
});

test("wishlist add and remove operations are stable", () => {
  assert.deepEqual(toggleWishlist([], "aura-headphones"), ["aura-headphones"]);
  assert.deepEqual(toggleWishlist(["aura-headphones"], "aura-headphones"), []);
});

test("order creation captures safe commerce data without card fields", () => {
  const state = createInitialCommerceState();
  const item = makeCartItem(
    "aura-headphones",
    { Color: "Black" },
    1,
    "new-audio",
  );
  const order = createPlacedOrder(
    [item],
    state.addresses[0],
    DELIVERY_OPTIONS[1],
    "Card",
    "WELCOME10",
  );
  assert.equal(order.id, "#EC-10842");
  assert.equal(order.address.label, "Home");
  assert.equal(order.delivery.name, "Express Delivery");
  assert.equal(order.paymentMethod, "Card");
  assert.equal("cardNumber" in order, false);
});

test("tracking contains the complete six-stage customer journey", () => {
  assert.deepEqual(TRACKING_STAGES, [
    "Order Placed",
    "Payment Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ]);
});

test("buy again rebuilds available products with variants and quantities", () => {
  const order = createInitialCommerceState().orders[0];
  const items = reorderItems(order);
  assert.equal(items.length, 1);
  assert.equal(items[0].productId, "aura-headphones");
  assert.equal(items[0].selections.Color, "Black");
});

test("return eligibility and requests only apply to delivered orders", () => {
  const delivered = createInitialCommerceState().orders[0];
  const processing = createInitialCommerceState().orders[2];
  assert.equal(canReturnOrder(delivered), true);
  assert.equal(canReturnOrder(processing), false);
  const requested = requestReturn(
    delivered,
    delivered.items[0].key,
    1,
    "Not as expected",
    "Drop-off",
  );
  assert.equal(requested.status, "Return Requested");
  assert.equal(requested.returnRequest?.id, "#RET-6842");
});

test("cancellation only applies to eligible unshipped orders", () => {
  const processing = createInitialCommerceState().orders[2];
  const delivered = createInitialCommerceState().orders[0];
  assert.equal(canCancelOrder(processing), true);
  assert.equal(canCancelOrder(delivered), false);
  assert.equal(cancelOrder(processing).status, "Cancelled");
  assert.equal(cancelOrder(delivered).status, "Delivered");
});

test("reset data is complete and malformed persistence safely falls back", () => {
  const state = createInitialCommerceState();
  assert.equal(state.orders.length, 5);
  assert.equal(state.addresses.length, 2);
  assert.equal(state.notifications.length, 3);
  assert.deepEqual(loadCommerceState(JSON.stringify(state)), state);
  assert.deepEqual(loadCommerceState("not-json"), createInitialCommerceState());
  assert.deepEqual(
    loadCommerceState(JSON.stringify({ ...state, version: 99 })),
    createInitialCommerceState(),
  );
});
