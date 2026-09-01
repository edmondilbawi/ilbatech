export type OrderType = "Delivery" | "Pickup" | "Dine In" | "Drive-Thru";
export type Category = "Featured" | "Meals" | "Burgers" | "Chicken" | "Wraps" | "Sides" | "Drinks" | "Desserts" | "Breakfast";
export type PaymentMethod = "Card" | "Digital Wallet" | "Cash";
export type AccountMode = "Guest" | "Account";

export type Branch = {
  id: string;
  name: string;
  address: string;
  distance: string;
  prepMinutes: string;
  open: boolean;
  delivery: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  image: string;
  imageAlt: string;
  available: boolean;
  featured?: boolean;
  vegetarian?: boolean;
  mealEligible?: boolean;
  customizable?: boolean;
  calories: number;
};

export type Customization = {
  patty: "Single" | "Double";
  cheese: "No Cheese" | "Cheddar" | "Extra Cheddar";
  removed: string[];
  additions: string[];
  sauce: "Light" | "Standard" | "Extra";
  meal: boolean;
  side: "Regular Fries" | "Large Fries" | "Side Salad" | "Loaded Fries";
  drink: "Cola" | "Diet Cola" | "Lemon-Lime" | "Water" | "Orange Juice";
  size: "Medium" | "Large";
};

export type CartItem = { key: string; productId: string; quantity: number; customization: Customization };
export type CustomerDetails = { name: string; phone: string; email: string };
export type Order = {
  id: string;
  placedAt: string;
  displayDate: string;
  branchId: string;
  orderType: OrderType;
  items: CartItem[];
  promo: string;
  paymentMethod: PaymentMethod;
  customer: CustomerDetails;
  fulfillmentNote: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  statusIndex: number;
  statusTimes: string[];
};

export type OrderingState = {
  version: 2;
  orderType: OrderType | null;
  branchId: string | null;
  cart: CartItem[];
  favorites: string[];
  promo: string;
  accountMode: AccountMode;
  currentOrder: Order | null;
  orderHistory: Order[];
  placedCount: number;
};

export const ORDERING_STORAGE_KEY = "ilbatech-restaurant-ordering-v2";
export const LEGACY_ORDERING_STORAGE_KEY = "ilbatech-ember-bite-demo-v1";
export const DEMO_DATE = "2026-08-30";

export const BRANCHES: Branch[] = [
  { id: "downtown", name: "Downtown", address: "12 Market Lane", distance: "1.2 km", prepMinutes: "12–15 min", open: true, delivery: true },
  { id: "marina", name: "Marina", address: "8 Harbor Walk", distance: "3.4 km", prepMinutes: "15–18 min", open: true, delivery: true },
  { id: "city-center", name: "City Center", address: "Level 2, Central Mall", distance: "4.1 km", prepMinutes: "10–14 min", open: true, delivery: false },
  { id: "airport", name: "Airport", address: "Departures Food Hall", distance: "9.8 km", prepMinutes: "Opens 06:00", open: false, delivery: false },
];

const image = (name: string) => `/images/ordering/${name}.webp`;
export const PRODUCTS: Product[] = [
  { id: "ember-double", name: "Double Stack", description: "Two flame-seared patties, cheddar, pickles, lettuce and smoky house sauce.", category: "Burgers", price: 8.9, image: image("double-burger"), imageAlt: "Double beef burger with cheddar, pickles and lettuce", available: true, featured: true, mealEligible: true, customizable: true, calories: 690 },
  { id: "classic-smash", name: "Classic Smash", description: "A seared beef patty with onion, pickles and house sauce.", category: "Burgers", price: 6.4, image: image("double-burger"), imageAlt: "Classic seared beef burger", available: true, mealEligible: true, customizable: true, calories: 510 },
  { id: "smokehouse-meal", name: "Double Stack Meal", description: "Double Stack, seasoned fries and a fountain drink.", category: "Meals", price: 13.9, image: image("double-burger"), imageAlt: "Double burger meal", available: true, featured: true, mealEligible: true, customizable: true, calories: 1120 },
  { id: "crispy-club", name: "Crispy Pepper Club", description: "Crispy chicken, lettuce, pickles and cracked-pepper cream.", category: "Chicken", price: 7.6, image: image("crispy-chicken"), imageAlt: "Crispy chicken sandwich with lettuce and pickles", available: true, featured: true, mealEligible: true, customizable: true, calories: 640 },
  { id: "chicken-meal", name: "Crispy Club Meal", description: "Crispy Pepper Club with a side and drink of your choice.", category: "Meals", price: 12.6, image: image("crispy-chicken"), imageAlt: "Crispy chicken sandwich meal", available: true, mealEligible: true, customizable: true, calories: 1010 },
  { id: "fire-tenders", name: "Firehouse Tenders", description: "Five crunchy chicken tenders with smoky dipping sauce.", category: "Chicken", price: 7.9, image: image("chicken-tenders"), imageAlt: "Five crispy chicken tenders with dipping sauce", available: true, calories: 590 },
  { id: "chili-tenders", name: "Hot Honey Tenders", description: "Crispy tenders brushed with a sweet chili glaze.", category: "Chicken", price: 8.4, image: image("chicken-tenders"), imageAlt: "Golden crispy chicken tenders", available: false, calories: 620 },
  { id: "grilled-wrap", name: "Green Flame Wrap", description: "Grilled chicken, crisp greens, tomato and herb yogurt.", category: "Wraps", price: 7.2, image: image("chicken-wrap"), imageAlt: "Grilled chicken wrap with fresh vegetables", available: true, featured: true, mealEligible: true, calories: 480 },
  { id: "garden-wrap", name: "Garden Crunch Wrap", description: "Crisp vegetables, herb yogurt and seasoned potato crunch.", category: "Wraps", price: 6.8, image: image("chicken-wrap"), imageAlt: "Fresh vegetable wrap", available: true, vegetarian: true, mealEligible: true, calories: 430 },
  { id: "wrap-meal", name: "Green Flame Meal", description: "Grilled chicken wrap with your choice of side and drink.", category: "Meals", price: 12.2, image: image("chicken-wrap"), imageAlt: "Grilled chicken wrap meal", available: true, mealEligible: true, calories: 860 },
  { id: "seasoned-fries", name: "House Seasoned Fries", description: "Golden skin-on fries with house seasoning.", category: "Sides", price: 3.49, image: image("seasoned-fries"), imageAlt: "Golden seasoned french fries", available: true, vegetarian: true, calories: 330 },
  { id: "loaded-fries", name: "Loaded Fries", description: "Seasoned fries with cheddar, jalapeños and smoky house sauce.", category: "Sides", price: 5.49, image: image("seasoned-fries"), imageAlt: "Seasoned fries with creamy herb dip", available: true, vegetarian: true, calories: 510 },
  { id: "side-salad", name: "Crisp Garden Cup", description: "Lettuce, tomato, cucumber and lemon-herb dressing.", category: "Sides", price: 3.29, image: image("chicken-wrap"), imageAlt: "Fresh garden vegetables", available: true, vegetarian: true, calories: 120 },
  { id: "berry-shake", name: "Strawberry Cloud Shake", description: "Strawberry and vanilla shake finished with whipped cream.", category: "Drinks", price: 4.6, image: image("strawberry-shake"), imageAlt: "Pink strawberry milkshake with whipped cream", available: true, vegetarian: true, featured: true, calories: 440 },
  { id: "citrus-fizz", name: "Citrus Mint Fizz", description: "Sparkling lemon, lime and mint served over ice.", category: "Drinks", price: 2.9, image: image("strawberry-shake"), imageAlt: "Refreshing chilled beverage", available: true, vegetarian: true, calories: 110 },
  { id: "bottled-water", name: "Still Water", description: "Chilled still water.", category: "Drinks", price: 1.8, image: image("strawberry-shake"), imageAlt: "Chilled drink", available: true, vegetarian: true, calories: 0 },
  { id: "lava-cake", name: "Molten Cocoa Cake", description: "Warm chocolate cake with a flowing center and vanilla soft serve.", category: "Desserts", price: 5.2, image: image("chocolate-cake"), imageAlt: "Warm chocolate lava cake with vanilla soft serve", available: true, vegetarian: true, featured: true, calories: 520 },
  { id: "mini-cake", name: "Cocoa Melt Bite", description: "A smaller warm chocolate cake with cocoa dust.", category: "Desserts", price: 3.6, image: image("chocolate-cake"), imageAlt: "Small warm chocolate cake", available: true, vegetarian: true, calories: 310 },
  { id: "sunrise-stack", name: "Sunrise Rosti Stack", description: "Folded egg, cheddar and crispy potato rosti on brioche.", category: "Breakfast", price: 5.9, image: image("breakfast-sandwich"), imageAlt: "Breakfast sandwich with egg, cheddar and potato rosti", available: true, vegetarian: true, featured: true, calories: 540 },
  { id: "breakfast-meal", name: "Sunrise Breakfast Meal", description: "Rosti Stack with seasoned bites and fresh coffee.", category: "Breakfast", price: 9.4, image: image("breakfast-sandwich"), imageAlt: "Breakfast sandwich with coffee", available: true, vegetarian: true, calories: 760 },
];

export const DEFAULT_CUSTOMIZATION: Customization = {
  patty: "Single",
  cheese: "Cheddar",
  removed: [],
  additions: [],
  sauce: "Standard",
  meal: false,
  side: "Regular Fries",
  drink: "Cola",
  size: "Medium",
};

export function productById(id: string) { return PRODUCTS.find((product) => product.id === id); }
export function branchById(id: string | null) { return BRANCHES.find((branch) => branch.id === id); }
export function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
export function formatMoney(value: number) { return `$${value.toFixed(2)}`; }

export function itemUnitPrice(item: CartItem) {
  const product = productById(item.productId);
  if (!product) return 0;
  const custom = item.customization;
  let price = product.price;
  if (product.customizable) {
    if (custom.patty === "Double" && product.id !== "ember-double" && product.id !== "smokehouse-meal") price += 3;
    if (custom.cheese === "No Cheese") price -= .5;
    if (custom.cheese === "Extra Cheddar") price += 1.5;
    if (custom.additions.includes("Smoky strips")) price += 1.75;
    if (custom.additions.includes("Extra Patty")) price += 3;
    if (custom.additions.includes("Jalapeños")) price += .5;
  }
  if (custom.meal && !product.name.includes("Meal")) price += 5.5;
  if (custom.meal) {
    if (custom.side === "Large Fries") price += 1;
    if (custom.side === "Loaded Fries") price += 2;
    if (custom.drink === "Orange Juice") price += .5;
    if (custom.size === "Large") price += 1.5;
  }
  return roundMoney(Math.max(0, price));
}

export function customizationSummary(item: CartItem) {
  const product = productById(item.productId);
  const custom = item.customization;
  const parts: string[] = [];
  if (product?.customizable) {
    parts.push(custom.patty, custom.cheese, `${custom.sauce} sauce`);
    if (custom.removed.length) parts.push(`No ${custom.removed.join(", ")}`);
    if (custom.additions.length) parts.push(custom.additions.join(", "));
  }
  if (custom.meal) parts.push(`${custom.size} meal`, custom.side, custom.drink);
  return parts.join(" · ");
}

export function calculateTotals(cart: CartItem[], orderType: OrderType | null, promo: string) {
  const subtotal = roundMoney(cart.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0));
  const normalized = promo.trim().toUpperCase();
  const freeSideEligible = cart.some((item) => productById(item.productId)?.category === "Sides" || item.customization.meal);
  const discount = normalized === "WELCOME10" ? roundMoney(subtotal * .1) : normalized === "FREESIDE" && freeSideEligible ? Math.min(3.49, subtotal) : 0;
  const deliveryFee = orderType === "Delivery" && subtotal > 0 ? 3.49 : 0;
  const tax = roundMoney((subtotal - discount + deliveryFee) * .05);
  const total = roundMoney(subtotal - discount + deliveryFee + tax);
  return { subtotal, discount, deliveryFee, tax, total };
}

function historicOrder(id: string, displayDate: string, item: CartItem, total: number): Order {
  return { id, placedAt: `${DEMO_DATE}T10:00:00.000Z`, displayDate, branchId: "downtown", orderType: "Pickup", items: [item], promo: "", paymentMethod: "Card", customer: { name: "Noura Karim", phone: "+961 70 555 014", email: "noura@example.test" }, fulfillmentNote: "Pickup counter", subtotal: total / 1.05, discount: 0, deliveryFee: 0, tax: total - total / 1.05, total, statusIndex: 4, statusTimes: ["12:08", "12:09", "12:12", "12:20", "12:25"] };
}

const historyCustomization = { ...DEFAULT_CUSTOMIZATION, patty: "Double" as const, cheese: "Extra Cheddar" as const, removed: ["Pickles"], meal: true, side: "Large Fries" as const, drink: "Diet Cola" as const, size: "Large" as const };

export function createInitialOrderingState(): OrderingState {
  return {
    version: 2,
    orderType: null,
    branchId: null,
    cart: [],
    favorites: ["crispy-club"],
    promo: "",
    accountMode: "Guest",
    currentOrder: null,
    orderHistory: [
      historicOrder("#10482", "August 27", { key: "history-10482", productId: "ember-double", quantity: 1, customization: historyCustomization }, 28.4),
      historicOrder("#10461", "August 21", { key: "history-10461", productId: "grilled-wrap", quantity: 2, customization: { ...DEFAULT_CUSTOMIZATION, meal: true, drink: "Lemon-Lime" } }, 25.62),
    ],
    placedCount: 0,
  };
}

export function loadOrderingState(raw: string | null): OrderingState {
  if (!raw) return createInitialOrderingState();
  try {
    const parsed = JSON.parse(raw) as OrderingState;
    if (![1, 2].includes(parsed.version) || !Array.isArray(parsed.cart) || !Array.isArray(parsed.favorites) || !Array.isArray(parsed.orderHistory)) return createInitialOrderingState();
    return { ...parsed, version: 2 };
  } catch { return createInitialOrderingState(); }
}

export function makeCartItem(productId: string, customization: Customization = DEFAULT_CUSTOMIZATION, quantity = 1, key = `${productId}-${Date.now()}`): CartItem {
  return { key, productId, quantity, customization: { ...customization, removed: [...customization.removed], additions: [...customization.additions] } };
}

export function createPlacedOrder(state: OrderingState, customer: CustomerDetails, paymentMethod: PaymentMethod, fulfillmentNote: string): Order {
  if (!state.orderType || !state.branchId || !state.cart.length) throw new Error("Order details are incomplete.");
  const totals = calculateTotals(state.cart, state.orderType, state.promo);
  return {
    id: `#QSR-${1084 + state.placedCount}`,
    placedAt: `${DEMO_DATE}T14:32:00.000Z`,
    displayDate: "August 30",
    branchId: state.branchId,
    orderType: state.orderType,
    items: state.cart.map((item) => makeCartItem(item.productId, item.customization, item.quantity, item.key)),
    promo: state.promo,
    paymentMethod,
    customer,
    fulfillmentNote,
    ...totals,
    statusIndex: 1,
    statusTimes: ["2:32 PM", "2:33 PM"],
  };
}

export function trackingStages(orderType: OrderType) {
  return orderType === "Delivery" ? ["Order Received", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered"] : ["Order Received", "Confirmed", "Preparing", "Ready", "Completed"];
}
