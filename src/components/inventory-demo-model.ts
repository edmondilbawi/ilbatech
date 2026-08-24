export const INVENTORY_STATE_VERSION = 1;
export const INVENTORY_STORAGE_KEY = "ilbatech-restaurant-inventory-demo-v1";

export const UNITS = ["kg", "g", "L", "ml", "pcs", "boxes"] as const;
export type Unit = (typeof UNITS)[number];

export const SUBCATEGORIES = [
  "Meat",
  "Bread & Bakery",
  "Drinks",
  "Sauces",
  "Dairy",
  "Vegetables",
  "Fruits",
  "Dry Goods",
  "Frozen Items",
  "Spices & Seasonings",
  "Packaging / Disposables",
] as const;
export type Subcategory = (typeof SUBCATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  subcategory: Subcategory;
  quantity: number;
  unit: Unit;
  cost: number;
  lowStockLevel: number;
  expiryDate?: string;
  active: boolean;
  lastMovementDate?: string;
};

export type NamedPlace = {
  id: string;
  name: string;
  active: boolean;
};

export type Movement = {
  id: string;
  productId: string;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  unit: Unit;
  sourceId?: string;
  sourceName?: string;
  destinationId?: string;
  destinationName?: string;
  previousQuantity: number;
  resultingQuantity: number;
  purchaseCost?: number;
  effectiveDate: string;
  timestamp: string;
  openingBalance?: boolean;
};

export type InventoryState = {
  version: typeof INVENTORY_STATE_VERSION;
  products: Product[];
  sources: NamedPlace[];
  destinations: NamedPlace[];
  movements: Movement[];
};

export type ProductInput = {
  name: string;
  subcategory: Subcategory;
  quantity: number;
  unit: Unit;
  cost: number;
  lowStockLevel: number;
  expiryDate?: string;
};

type Result = { state: InventoryState; error?: string; movement?: Movement };

const productSeeds: Array<Omit<Product, "expiryDate" | "lastMovementDate"> & { expiryOffset?: number }> = [
  { id: "chicken-breast", name: "Chicken Breast", subcategory: "Meat", quantity: 8, unit: "kg", cost: 4.8, lowStockLevel: 5, active: true, expiryOffset: 5 },
  { id: "beef-patties", name: "Beef Patties", subcategory: "Meat", quantity: 12, unit: "kg", cost: 7.4, lowStockLevel: 5, active: true, expiryOffset: 12 },
  { id: "minced-beef", name: "Minced Beef", subcategory: "Meat", quantity: 4, unit: "kg", cost: 6.3, lowStockLevel: 5, active: true, expiryOffset: 3 },
  { id: "burger-buns", name: "Burger Buns", subcategory: "Bread & Bakery", quantity: 48, unit: "pcs", cost: 0.28, lowStockLevel: 20, active: true, expiryOffset: 4 },
  { id: "tortilla-wraps", name: "Tortilla Wraps", subcategory: "Bread & Bakery", quantity: 30, unit: "pcs", cost: 0.34, lowStockLevel: 12, active: true, expiryOffset: 10 },
  { id: "water", name: "Water", subcategory: "Drinks", quantity: 72, unit: "pcs", cost: 0.22, lowStockLevel: 24, active: true },
  { id: "coca-cola", name: "Coca-Cola", subcategory: "Drinks", quantity: 36, unit: "pcs", cost: 0.48, lowStockLevel: 18, active: true },
  { id: "orange-juice", name: "Orange Juice", subcategory: "Drinks", quantity: 8, unit: "L", cost: 1.65, lowStockLevel: 4, active: true, expiryOffset: 6 },
  { id: "ketchup", name: "Ketchup", subcategory: "Sauces", quantity: 6, unit: "L", cost: 2.1, lowStockLevel: 3, active: true, expiryOffset: 45 },
  { id: "garlic-sauce", name: "Garlic Sauce", subcategory: "Sauces", quantity: 2, unit: "L", cost: 3.2, lowStockLevel: 3, active: true, expiryOffset: 4 },
  { id: "mozzarella", name: "Mozzarella", subcategory: "Dairy", quantity: 7, unit: "kg", cost: 5.7, lowStockLevel: 3, active: true, expiryOffset: 5 },
  { id: "milk", name: "Milk", subcategory: "Dairy", quantity: 3, unit: "L", cost: 1.15, lowStockLevel: 4, active: true, expiryOffset: 2 },
  { id: "tomatoes", name: "Tomatoes", subcategory: "Vegetables", quantity: 9, unit: "kg", cost: 1.4, lowStockLevel: 4, active: true, expiryOffset: 6 },
  { id: "lettuce", name: "Lettuce", subcategory: "Vegetables", quantity: 0, unit: "pcs", cost: 0.75, lowStockLevel: 8, active: true, expiryOffset: 3 },
  { id: "onions", name: "Onions", subcategory: "Vegetables", quantity: 14, unit: "kg", cost: 0.85, lowStockLevel: 5, active: true, expiryOffset: 18 },
  { id: "lemons", name: "Lemons", subcategory: "Fruits", quantity: 6, unit: "kg", cost: 1.35, lowStockLevel: 3, active: true, expiryOffset: 9 },
  { id: "rice", name: "Rice", subcategory: "Dry Goods", quantity: 22, unit: "kg", cost: 1.55, lowStockLevel: 8, active: true },
  { id: "flour", name: "Flour", subcategory: "Dry Goods", quantity: 10, unit: "kg", cost: 0.9, lowStockLevel: 5, active: true },
  { id: "french-fries", name: "French Fries", subcategory: "Frozen Items", quantity: 18, unit: "kg", cost: 2.45, lowStockLevel: 7, active: true, expiryOffset: 90 },
  { id: "black-pepper", name: "Black Pepper", subcategory: "Spices & Seasonings", quantity: 900, unit: "g", cost: 0.012, lowStockLevel: 400, active: true },
  { id: "burger-boxes", name: "Burger Boxes", subcategory: "Packaging / Disposables", quantity: 65, unit: "pcs", cost: 0.18, lowStockLevel: 30, active: true },
  { id: "paper-bags", name: "Paper Bags", subcategory: "Packaging / Disposables", quantity: 24, unit: "pcs", cost: 0.12, lowStockLevel: 30, active: true },
];

const sourceSeeds: NamedPlace[] = [
  { id: "fresh-foods", name: "Fresh Foods Supplier", active: true },
  { id: "beverage-distributor", name: "Beverage Distributor", active: true },
  { id: "bakery-supplier", name: "Bakery Supplier", active: true },
  { id: "central-warehouse", name: "Central Warehouse", active: true },
];

const destinationSeeds: NamedPlace[] = [
  { id: "main-kitchen", name: "Main Kitchen", active: true },
  { id: "prep-kitchen", name: "Prep Kitchen", active: true },
  { id: "bar", name: "Bar", active: true },
  { id: "catering", name: "Catering", active: true },
  { id: "waste", name: "Waste / Spoilage", active: true },
  { id: "branch-transfer", name: "Branch Transfer", active: true },
];

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}

export function getLocalDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createSeedState(today = getLocalDate()): InventoryState {
  const products = productSeeds.map(({ expiryOffset, ...product }) => ({
    ...product,
    ...(expiryOffset ? { expiryDate: addDays(today, expiryOffset) } : {}),
  }));
  const tomato = products.find((product) => product.id === "tomatoes")!;
  const water = products.find((product) => product.id === "water")!;
  const movements: Movement[] = [
    {
      id: "seed-out-tomatoes",
      productId: tomato.id,
      productName: tomato.name,
      type: "OUT",
      quantity: 2,
      unit: tomato.unit,
      destinationId: "prep-kitchen",
      destinationName: "Prep Kitchen",
      previousQuantity: 11,
      resultingQuantity: 9,
      effectiveDate: addDays(today, -1),
      timestamp: `${addDays(today, -1)}T12:15:00.000Z`,
    },
    {
      id: "seed-in-water",
      productId: water.id,
      productName: water.name,
      type: "IN",
      quantity: 24,
      unit: water.unit,
      sourceId: "beverage-distributor",
      sourceName: "Beverage Distributor",
      previousQuantity: 48,
      resultingQuantity: 72,
      purchaseCost: water.cost,
      effectiveDate: addDays(today, -2),
      timestamp: `${addDays(today, -2)}T09:30:00.000Z`,
    },
  ];
  return {
    version: INVENTORY_STATE_VERSION,
    products: products.map((product) => {
      const latest = movements.find((movement) => movement.productId === product.id);
      return latest ? { ...product, lastMovementDate: latest.effectiveDate } : product;
    }),
    sources: sourceSeeds.map((source) => ({ ...source })),
    destinations: destinationSeeds.map((destination) => ({ ...destination })),
    movements,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIsoDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidMovementDate(value: string, today = getLocalDate()) {
  return isValidIsoDate(value) && value <= today;
}

export function isValidInventoryState(value: unknown): value is InventoryState {
  if (!isPlainObject(value) || value.version !== INVENTORY_STATE_VERSION) return false;
  if (!Array.isArray(value.products) || !Array.isArray(value.sources) || !Array.isArray(value.destinations) || !Array.isArray(value.movements)) return false;
  const validPlaces = (places: unknown[]) => places.every((place) => isPlainObject(place) && typeof place.id === "string" && place.id.length > 0 && typeof place.name === "string" && place.name.trim().length > 0 && typeof place.active === "boolean");
  if (!validPlaces(value.sources) || !validPlaces(value.destinations)) return false;
  const validProducts = value.products.every((product) => isPlainObject(product)
    && typeof product.id === "string"
    && typeof product.name === "string"
    && SUBCATEGORIES.includes(product.subcategory as Subcategory)
    && typeof product.quantity === "number" && Number.isFinite(product.quantity) && product.quantity >= 0
    && UNITS.includes(product.unit as Unit)
    && typeof product.cost === "number" && Number.isFinite(product.cost) && product.cost >= 0
    && typeof product.lowStockLevel === "number" && Number.isFinite(product.lowStockLevel) && product.lowStockLevel >= 0
    && typeof product.active === "boolean"
    && (product.expiryDate === undefined || isValidIsoDate(product.expiryDate)));
  if (!validProducts) return false;
  return value.movements.every((movement) => {
    if (!isPlainObject(movement)
      || typeof movement.id !== "string"
      || typeof movement.productId !== "string"
      || typeof movement.productName !== "string"
      || (movement.type !== "IN" && movement.type !== "OUT")
      || typeof movement.quantity !== "number" || !Number.isFinite(movement.quantity) || movement.quantity <= 0
      || !UNITS.includes(movement.unit as Unit)
      || typeof movement.previousQuantity !== "number" || movement.previousQuantity < 0
      || typeof movement.resultingQuantity !== "number" || movement.resultingQuantity < 0
      || !isValidIsoDate(movement.effectiveDate)
      || typeof movement.timestamp !== "string") return false;
    const expectedResult = movement.type === "IN"
      ? round(movement.previousQuantity + movement.quantity)
      : round(movement.previousQuantity - movement.quantity);
    const hasCorrectPlace = movement.type === "IN"
      ? typeof movement.sourceName === "string" && movement.sourceName.length > 0 && movement.destinationName === undefined
      : typeof movement.destinationName === "string" && movement.destinationName.length > 0 && movement.sourceName === undefined;
    return expectedResult === movement.resultingQuantity && hasCorrectPlace;
  });
}

export function loadInventoryState(serialized: string | null, today = getLocalDate()) {
  if (!serialized) return createSeedState(today);
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isValidInventoryState(parsed) ? parsed : createSeedState(today);
  } catch {
    return createSeedState(today);
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function productInputError(input: ProductInput) {
  if (!input.name.trim()) return "Enter a product name.";
  if (!SUBCATEGORIES.includes(input.subcategory)) return "Choose a subcategory.";
  if (!UNITS.includes(input.unit)) return "Choose a unit.";
  if (!Number.isFinite(input.quantity) || input.quantity < 0) return "Starting quantity must be 0 or more.";
  if (!Number.isFinite(input.cost) || input.cost < 0) return "Purchase cost must be 0 or more.";
  if (!Number.isFinite(input.lowStockLevel) || input.lowStockLevel < 0) return "Low-stock level must be 0 or more.";
  if (input.expiryDate && !isValidIsoDate(input.expiryDate)) return "Choose a valid expiry date.";
  return undefined;
}

export function addProduct(state: InventoryState, input: ProductInput, effectiveDate: string, timestamp = new Date().toISOString()): Result {
  const error = productInputError(input);
  if (error) return { state, error };
  if (!isValidIsoDate(effectiveDate)) return { state, error: "Choose a valid date." };
  const product: Product = {
    id: makeId("product"),
    name: input.name.trim(),
    subcategory: input.subcategory,
    quantity: round(input.quantity),
    unit: input.unit,
    cost: round(input.cost),
    lowStockLevel: round(input.lowStockLevel),
    ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
    active: true,
    ...(input.quantity > 0 ? { lastMovementDate: effectiveDate } : {}),
  };
  if (input.quantity === 0) return { state: { ...state, products: [...state.products, product] } };
  const movement: Movement = {
    id: makeId("movement"),
    productId: product.id,
    productName: product.name,
    type: "IN",
    quantity: product.quantity,
    unit: product.unit,
    sourceName: "Opening balance",
    previousQuantity: 0,
    resultingQuantity: product.quantity,
    purchaseCost: product.cost,
    effectiveDate,
    timestamp,
    openingBalance: true,
  };
  return { state: { ...state, products: [...state.products, product], movements: [movement, ...state.movements] }, movement };
}

export function editProduct(state: InventoryState, productId: string, input: ProductInput): Result {
  const product = state.products.find((item) => item.id === productId && item.active);
  if (!product) return { state, error: "This product is no longer active." };
  const error = productInputError(input);
  if (error) return { state, error };
  const hasHistory = state.movements.some((movement) => movement.productId === productId);
  if (hasHistory && input.unit !== product.unit) return { state, error: "Unit can't be changed because this product already has stock history." };
  const updated: Product = {
    ...product,
    name: input.name.trim(),
    subcategory: input.subcategory,
    unit: input.unit,
    cost: round(input.cost),
    lowStockLevel: round(input.lowStockLevel),
    ...(input.expiryDate ? { expiryDate: input.expiryDate } : { expiryDate: undefined }),
  };
  return { state: { ...state, products: state.products.map((item) => item.id === productId ? updated : item) } };
}

export function removeProduct(state: InventoryState, productId: string): Result {
  const product = state.products.find((item) => item.id === productId && item.active);
  if (!product) return { state, error: "This product is no longer active." };
  const hasHistory = state.movements.some((movement) => movement.productId === productId);
  return {
    state: {
      ...state,
      products: hasHistory
        ? state.products.map((item) => item.id === productId ? { ...item, active: false } : item)
        : state.products.filter((item) => item.id !== productId),
    },
  };
}

export function moveStockIn(state: InventoryState, input: { productId: string; quantity: number; sourceId: string; cost: number; effectiveDate: string; expiryDate?: string }, today = getLocalDate(), timestamp = new Date().toISOString()): Result {
  const product = state.products.find((item) => item.id === input.productId && item.active);
  if (!product) return { state, error: input.productId ? "This product is no longer active." : "Choose a product." };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { state, error: "Enter an amount greater than 0." };
  const source = state.sources.find((item) => item.id === input.sourceId && item.active);
  if (!source) return { state, error: "Choose where the stock came from." };
  if (!Number.isFinite(input.cost) || input.cost <= 0) return { state, error: "Enter a valid purchase cost." };
  if (!isValidMovementDate(input.effectiveDate, today)) return { state, error: "Choose today or an earlier valid date." };
  if (input.expiryDate && !isValidIsoDate(input.expiryDate)) return { state, error: "Choose a valid expiry date." };
  const resultingQuantity = round(product.quantity + input.quantity);
  const movement: Movement = {
    id: makeId("movement"),
    productId: product.id,
    productName: product.name,
    type: "IN",
    quantity: round(input.quantity),
    unit: product.unit,
    sourceId: source.id,
    sourceName: source.name,
    previousQuantity: product.quantity,
    resultingQuantity,
    purchaseCost: round(input.cost),
    effectiveDate: input.effectiveDate,
    timestamp,
  };
  return {
    state: {
      ...state,
      products: state.products.map((item) => item.id === product.id ? {
        ...item,
        quantity: resultingQuantity,
        cost: round(input.cost),
        lastMovementDate: input.effectiveDate,
        ...(input.expiryDate ? { expiryDate: input.expiryDate } : {}),
      } : item),
      movements: [movement, ...state.movements],
    },
    movement,
  };
}

export function moveStockOut(state: InventoryState, input: { productId: string; quantity: number; destinationId: string; effectiveDate: string }, today = getLocalDate(), timestamp = new Date().toISOString()): Result {
  const product = state.products.find((item) => item.id === input.productId && item.active);
  if (!product) return { state, error: input.productId ? "This product is no longer active." : "Choose a product." };
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { state, error: "Enter an amount greater than 0." };
  const destination = state.destinations.find((item) => item.id === input.destinationId && item.active);
  if (!destination) return { state, error: "Choose where the stock is going." };
  if (!isValidMovementDate(input.effectiveDate, today)) return { state, error: "Choose today or an earlier valid date." };
  if (input.quantity > product.quantity) return { state, error: "Not enough stock." };
  const resultingQuantity = round(product.quantity - input.quantity);
  const movement: Movement = {
    id: makeId("movement"),
    productId: product.id,
    productName: product.name,
    type: "OUT",
    quantity: round(input.quantity),
    unit: product.unit,
    destinationId: destination.id,
    destinationName: destination.name,
    previousQuantity: product.quantity,
    resultingQuantity,
    effectiveDate: input.effectiveDate,
    timestamp,
  };
  return {
    state: {
      ...state,
      products: state.products.map((item) => item.id === product.id ? { ...item, quantity: resultingQuantity, lastMovementDate: input.effectiveDate } : item),
      movements: [movement, ...state.movements],
    },
    movement,
  };
}

export function addPlace(state: InventoryState, kind: "sources" | "destinations", name: string): Result {
  const cleanName = name.trim();
  if (!cleanName) return { state, error: `Enter a ${kind === "sources" ? "source" : "destination"} name.` };
  if (state[kind].some((item) => item.active && item.name.toLowerCase() === cleanName.toLowerCase())) return { state, error: "That name is already in the list." };
  const place = { id: makeId(kind === "sources" ? "source" : "destination"), name: cleanName, active: true };
  return { state: { ...state, [kind]: [...state[kind], place] } };
}

export function editPlace(state: InventoryState, kind: "sources" | "destinations", id: string, name: string): Result {
  const cleanName = name.trim();
  if (!cleanName) return { state, error: "Enter a name." };
  const place = state[kind].find((item) => item.id === id && item.active);
  if (!place) return { state, error: "This item is no longer active." };
  if (state[kind].some((item) => item.id !== id && item.active && item.name.toLowerCase() === cleanName.toLowerCase())) return { state, error: "That name is already in the list." };
  return { state: { ...state, [kind]: state[kind].map((item) => item.id === id ? { ...item, name: cleanName } : item) } };
}

export function removePlace(state: InventoryState, kind: "sources" | "destinations", id: string): Result {
  const place = state[kind].find((item) => item.id === id && item.active);
  if (!place) return { state, error: "This item is no longer active." };
  const historyKey = kind === "sources" ? "sourceId" : "destinationId";
  const hasHistory = state.movements.some((movement) => movement[historyKey] === id);
  return {
    state: {
      ...state,
      [kind]: hasHistory
        ? state[kind].map((item) => item.id === id ? { ...item, active: false } : item)
        : state[kind].filter((item) => item.id !== id),
    },
  };
}

export function stockStatus(product: Product) {
  if (product.quantity === 0) return "Out of Stock" as const;
  if (product.quantity <= product.lowStockLevel) return "Low Stock" as const;
  return "In Stock" as const;
}

export function expiryStatus(product: Product, today = getLocalDate()) {
  if (!product.expiryDate) return undefined;
  const start = new Date(`${today}T00:00:00Z`).getTime();
  const end = new Date(`${product.expiryDate}T00:00:00Z`).getTime();
  const days = Math.round((end - start) / 86_400_000);
  if (days < 0) return { label: "Expired", days } as const;
  if (days === 0) return { label: "Expires today", days } as const;
  if (days <= 7) return { label: `Expires in ${days} ${days === 1 ? "day" : "days"}`, days } as const;
  return { label: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${product.expiryDate}T00:00:00Z`)), days } as const;
}

export function estimatedStockValue(state: InventoryState) {
  return round(state.products.filter((product) => product.active).reduce((total, product) => total + product.quantity * product.cost, 0));
}
