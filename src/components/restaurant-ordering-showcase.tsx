"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, Bike, Check, CheckCircle2, ChevronRight, Clock3, CreditCard,
  Heart, MapPin, Minus, PackageCheck, Plus, ReceiptText, RefreshCcw, Search,
  ShoppingBag, Sparkles, Store, Trash2, UserRound, UtensilsCrossed, WalletCards, X,
} from "lucide-react";
import { getSitePath } from "@/config/site";
import {
  BRANCHES, DEFAULT_CUSTOMIZATION, ORDERING_STORAGE_KEY, PRODUCTS, branchById, calculateTotals,
  createInitialOrderingState, createPlacedOrder, customizationSummary, formatMoney, itemUnitPrice,
  loadOrderingState, makeCartItem, productById, roundMoney, trackingStages,
  type AccountMode, type CartItem, type Customization, type Order, type OrderingState, type OrderType,
  type PaymentMethod, type Product,
} from "./ordering-demo-model";
import styles from "./restaurant-ordering-showcase.module.css";

type Screen = "Landing" | "Locations" | "Menu" | "Favorites" | "Cart" | "Checkout" | "Confirmation" | "Tracking" | "Receipt" | "Orders" | "Account";
type Filter = "All items" | "Available now" | "Vegetarian";
const CATEGORIES = ["Featured", "Meals", "Burgers", "Chicken", "Wraps", "Sides", "Drinks", "Desserts", "Breakfast"] as const;
const ORDER_TYPES: Array<{ type: OrderType; description: string; icon: typeof Store }> = [
  { type: "Pickup", description: "Order ahead and collect at the counter.", icon: ShoppingBag },
  { type: "Delivery", description: "Delivered from a nearby Ember Bite.", icon: Bike },
  { type: "Dine In", description: "Order now and enter your table number.", icon: UtensilsCrossed },
  { type: "Drive-Thru", description: "Tell us your vehicle and collect outside.", icon: Store },
];

const cloneCustomization = (value: Customization): Customization => ({ ...value, removed: [...value.removed], additions: [...value.additions] });
const productCustomization = (product: Product): Customization => ({
  ...cloneCustomization(DEFAULT_CUSTOMIZATION),
  patty: product.id === "ember-double" || product.id === "smokehouse-meal" ? "Double" : "Single",
  meal: product.category === "Meals",
});

function useAccessibleDialog(close: () => void) {
  const closeRef = useRef(close);

  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    const dialog = document.querySelector<HTMLElement>("[role='dialog']");
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex='-1'])") ?? []);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab") return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.body.style.overflow = "hidden";
    dialog?.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => focusable()[0]?.focus());
    return () => {
      dialog?.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
}

export function RestaurantOrderingShowcase() {
  const [state, setState] = useState<OrderingState>(() => createInitialOrderingState());
  const [screen, setScreen] = useState<Screen>("Landing");
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Featured");
  const [filter, setFilter] = useState<Filter>("All items");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadOrderingState(window.localStorage.getItem(ORDERING_STORAGE_KEY));
      setState(loaded);
      setPromoInput(loaded.promo);
      setScreen(loaded.currentOrder ? "Confirmation" : loaded.orderType && loaded.branchId ? "Menu" : "Landing");
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem(ORDERING_STORAGE_KEY, JSON.stringify(state)); }, [ready, state]);
  useEffect(() => {
    if (screen !== "Tracking" || !state.currentOrder) return;
    const stages = trackingStages(state.currentOrder.orderType);
    if (state.currentOrder.statusIndex >= stages.length - 1) return;
    const timer = window.setTimeout(() => advanceTracking(), 2600);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, state.currentOrder?.statusIndex]);

  const branch = branchById(state.branchId);
  const totals = useMemo(() => calculateTotals(state.cart, state.orderType, state.promo), [state.cart, state.orderType, state.promo]);
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  function navigate(next: Screen) { setScreen(next); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function chooseOrderType(orderType: OrderType) { setState((current) => ({ ...current, orderType, branchId: null, currentOrder: null })); navigate("Locations"); }
  function chooseBranch(branchId: string) { setState((current) => ({ ...current, branchId })); navigate("Menu"); setNotice(`${branchById(branchId)?.name} selected.`); }
  function toggleFavorite(productId: string) { setState((current) => ({ ...current, favorites: current.favorites.includes(productId) ? current.favorites.filter((id) => id !== productId) : [...current.favorites, productId] })); }
  function openProduct(product: Product, item?: CartItem) { if (!product.available) { setNotice(`${product.name} is temporarily unavailable.`); return; } setEditingItem(item ?? null); setSelectedProduct(product); }
  function saveProduct(product: Product, customization: Customization, quantity: number) {
    setState((current) => ({ ...current, cart: editingItem ? current.cart.map((item) => item.key === editingItem.key ? makeCartItem(product.id, customization, quantity, editingItem.key) : item) : [...current.cart, makeCartItem(product.id, customization, quantity)] }));
    setSelectedProduct(null); setEditingItem(null); setNotice(editingItem ? `${product.name} updated.` : `${product.name} added to your order.`);
  }
  function updateQuantity(key: string, delta: number) { setState((current) => ({ ...current, cart: current.cart.flatMap((item) => item.key !== key ? [item] : item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []) })); }
  function removeItem(key: string) { setState((current) => ({ ...current, cart: current.cart.filter((item) => item.key !== key) })); }
  function quickAdd(productId: string) { const product = productById(productId); if (!product?.available) return; setState((current) => ({ ...current, cart: [...current.cart, makeCartItem(product.id, productCustomization(product))] })); setNotice(`${product.name} added.`); }
  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return setPromoMessage({ tone: "error", text: "Enter a promotion code." });
    if (!["WELCOME10", "FREESIDE"].includes(code)) return setPromoMessage({ tone: "error", text: "That code is not valid for this demo." });
    if (code === "FREESIDE" && !state.cart.some((item) => productById(item.productId)?.category === "Sides" || item.customization.meal)) return setPromoMessage({ tone: "error", text: "Add a side or meal before using FREESIDE." });
    setState((current) => ({ ...current, promo: code })); setPromoMessage({ tone: "success", text: `${code} applied ✓` });
  }
  function reorder(order: Order) {
    setState((current) => ({ ...current, orderType: order.orderType, branchId: order.branchId, cart: order.items.map((item, index) => makeCartItem(item.productId, item.customization, item.quantity, `reorder-${order.id}-${index}`)), promo: "", currentOrder: null }));
    setPromoInput(""); navigate("Cart"); setNotice(`${order.id} was added to your cart.`);
  }
  function placeOrder(customer: { name: string; phone: string; email: string }, payment: PaymentMethod, fulfillmentNote: string) {
    const order = createPlacedOrder(state, customer, payment, fulfillmentNote);
    setState((current) => ({ ...current, currentOrder: order, orderHistory: [order, ...current.orderHistory], cart: [], promo: "", placedCount: current.placedCount + 1 }));
    setPromoInput(""); setCheckoutStep(1); navigate("Confirmation");
  }
  function advanceTracking() {
    setState((current) => {
      if (!current.currentOrder) return current;
      const stages = trackingStages(current.currentOrder.orderType);
      const next = Math.min(current.currentOrder.statusIndex + 1, stages.length - 1);
      const currentOrder = { ...current.currentOrder, statusIndex: next, statusTimes: [...current.currentOrder.statusTimes, ["2:36 PM", "2:43 PM", "2:48 PM", "2:55 PM"][next - 2] ?? "2:55 PM"] };
      return { ...current, currentOrder, orderHistory: current.orderHistory.map((order) => order.id === currentOrder.id ? currentOrder : order) };
    });
  }
  function resetDemo() { window.localStorage.removeItem(ORDERING_STORAGE_KEY); setState(createInitialOrderingState()); setPromoInput(""); setPromoMessage(null); setResetOpen(false); navigate("Landing"); setNotice("Demo restored to its original state."); }

  return <div className={styles.demo} data-ready={ready}>
    <ConceptBar />
    <header className={styles.header}>
      <button className={styles.brand} type="button" onClick={() => navigate(state.orderType && state.branchId ? "Menu" : "Landing")} aria-label="Ember Bite home"><span><UtensilsCrossed /></span><strong>EMBER BITE</strong></button>
      {state.orderType && branch && <button className={styles.orderContext} type="button" onClick={() => navigate("Locations")}><MapPin /><span><small>{state.orderType}</small><strong>{branch.name}</strong></span><ChevronRight /></button>}
      <nav className={styles.desktopNav} aria-label="Ordering sections">{(["Menu", "Favorites", "Orders", "Account"] as Screen[]).map((item) => <button type="button" data-active={screen === item} onClick={() => navigate(item)} key={item}>{item === "Favorites" ? <Heart /> : item === "Orders" ? <ReceiptText /> : item === "Account" ? <UserRound /> : <UtensilsCrossed />}{item}</button>)}</nav>
      <div className={styles.headerActions}><button className={styles.reset} type="button" aria-label="Reset demo" title="Reset Demo" onClick={() => setResetOpen(true)}><RefreshCcw /><span>Reset</span></button><button className={styles.cartButton} type="button" onClick={() => navigate("Cart")}><ShoppingBag /><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button></div>
    </header>
    {notice && <div className={styles.notice} role="status"><CheckCircle2 /><span>{notice}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><X /></button></div>}
    <main id="ordering-main" className={screen === "Landing" ? styles.mainLanding : styles.main}>
      {screen === "Landing" && <Landing choose={chooseOrderType} />}
      {screen === "Locations" && <Locations orderType={state.orderType} choose={chooseBranch} back={() => navigate("Landing")} />}
      {screen === "Menu" && <MenuScreen category={category} setCategory={setCategory} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} favorites={state.favorites} toggleFavorite={toggleFavorite} openProduct={openProduct} />}
      {screen === "Favorites" && <CollectionScreen title="Your favorites" eyebrow="Saved for later" empty="Tap the heart on any menu item to save it here." products={PRODUCTS.filter((product) => state.favorites.includes(product.id))} favorites={state.favorites} toggleFavorite={toggleFavorite} openProduct={openProduct} />}
      {screen === "Cart" && <CartScreen state={state} totals={totals} promoInput={promoInput} setPromoInput={setPromoInput} promoMessage={promoMessage} applyPromo={applyPromo} updateQuantity={updateQuantity} removeItem={removeItem} edit={openProduct} quickAdd={quickAdd} continueShopping={() => navigate("Menu")} checkout={() => state.cart.length && navigate("Checkout")} />}
      {screen === "Checkout" && <CheckoutScreen state={state} totals={totals} step={checkoutStep} setStep={setCheckoutStep} setAccountMode={(accountMode) => setState((current) => ({ ...current, accountMode }))} placeOrder={placeOrder} back={() => navigate("Cart")} />}
      {screen === "Confirmation" && state.currentOrder && <Confirmation order={state.currentOrder} track={() => navigate("Tracking")} receipt={() => navigate("Receipt")} menu={() => navigate("Menu")} />}
      {screen === "Tracking" && state.currentOrder && <Tracking order={state.currentOrder} advance={advanceTracking} receipt={() => navigate("Receipt")} />}
      {screen === "Receipt" && state.currentOrder && <Receipt order={state.currentOrder} back={() => navigate("Tracking")} />}
      {screen === "Orders" && <Orders history={state.orderHistory} current={state.currentOrder} reorder={reorder} track={() => navigate("Tracking")} receipt={(order) => { setState((current) => ({ ...current, currentOrder: order })); navigate("Receipt"); }} />}
      {screen === "Account" && <Account state={state} setMode={(accountMode) => setState((current) => ({ ...current, accountMode }))} orders={() => navigate("Orders")} favorites={() => navigate("Favorites")} />}
    </main>
    {selectedProduct && <ProductDialog product={selectedProduct} initialItem={editingItem} close={() => { setSelectedProduct(null); setEditingItem(null); }} save={saveProduct} />}
    {resetOpen && <ConfirmDialog close={() => setResetOpen(false)} confirm={resetDemo} />}
    {state.orderType && state.branchId && <nav className={styles.mobileNav} aria-label="Mobile ordering sections">{(["Menu", "Favorites", "Orders", "Account"] as Screen[]).map((item) => <button type="button" data-active={screen === item} onClick={() => navigate(item)} key={item}>{item === "Favorites" ? <Heart /> : item === "Orders" ? <ReceiptText /> : item === "Account" ? <UserRound /> : <UtensilsCrossed />}<span>{item}</span></button>)}</nav>}
  </div>;
}

function ConceptBar() { return <div className={styles.conceptBar}><div><span><b>Interactive Concept Demo</b><small>This preview demonstrates possible functionality. Final systems are customized according to each business&apos;s requirements.</small></span><a href={getSitePath("/work")}><ArrowLeft /> Return to Work</a></div></div>; }

function Landing({ choose }: { choose: (type: OrderType) => void }) {
  return <section className={styles.hero}><div className={styles.heroCopy}><span>Fired fresh. Made your way.</span><h1>Your next favorite order starts here.</h1><p>Choose how you&apos;d like to order, then customize every bite.</p><div className={styles.orderTypeGrid}>{ORDER_TYPES.map(({ type, description, icon: Icon }) => <button type="button" onClick={() => choose(type)} key={type}><Icon /><span><strong>{type}</strong><small>{description}</small></span><ArrowRight /></button>)}</div><small className={styles.heroFine}>Demo orders only · No real payment or delivery</small></div><div className={styles.heroVisual}><Image src="/images/ordering/double-burger.webp" width={900} height={675} unoptimized priority alt="Ember Bite double burger with cheddar, pickles and lettuce" /><div><Sparkles /><span><small>Featured</small><strong>Ember Double</strong><b>From $8.90</b></span></div></div></section>;
}

function Locations({ orderType, choose, back }: { orderType: OrderType | null; choose: (id: string) => void; back: () => void }) {
  return <section className={styles.flowPage}><PageIntro back={back} eyebrow={`${orderType ?? "Order"} setup`} title="Choose your Ember Bite" text="Select a fictional branch to see its current availability and preparation estimate." /><div className={styles.locationGrid}>{BRANCHES.map((branch) => { const disabled = !branch.open || (orderType === "Delivery" && !branch.delivery); return <article className={styles.locationCard} data-disabled={disabled} key={branch.id}><div className={styles.locationIcon}><Store /></div><div><span className={branch.open ? styles.openBadge : styles.closedBadge}>{branch.open ? "Open now" : "Closed"}</span><h2>{branch.name}</h2><p>{branch.address}</p><dl><div><dt><Clock3 /> Estimate</dt><dd>{branch.prepMinutes}</dd></div><div><dt><MapPin /> Distance</dt><dd>{branch.distance}</dd></div></dl>{orderType === "Delivery" && <small>{branch.delivery ? "Delivery available" : "Pickup only at this location"}</small>}</div><button type="button" disabled={disabled} onClick={() => choose(branch.id)}>{disabled ? "Unavailable" : `Select ${branch.name}`}<ArrowRight /></button></article>; })}</div></section>;
}

function PageIntro({ back, eyebrow, title, text }: { back?: () => void; eyebrow: string; title: string; text: string }) { return <header className={styles.pageIntro}>{back && <button type="button" onClick={back} aria-label="Go back"><ArrowLeft /></button>}<div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></header>; }
type ProductActions = { favorites: string[]; toggleFavorite: (id: string) => void; openProduct: (product: Product, item?: CartItem) => void };

function MenuScreen({ category, setCategory, filter, setFilter, search, setSearch, ...actions }: ProductActions & { category: (typeof CATEGORIES)[number]; setCategory: (category: (typeof CATEGORIES)[number]) => void; filter: Filter; setFilter: (filter: Filter) => void; search: string; setSearch: (value: string) => void }) {
  const products = PRODUCTS.filter((product) => (category === "Featured" ? product.featured : product.category === category) && product.name.toLowerCase().includes(search.toLowerCase()) && (filter === "All items" || filter === "Available now" && product.available || filter === "Vegetarian" && product.vegetarian));
  return <section><PageIntro eyebrow="Order your way" title="What are you craving?" text="Freshly made favorites, easy customization, and clear prices." /><div className={styles.menuTools}><label><Search /><input aria-label="Search menu" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search burgers, sides, drinks…" /></label><select aria-label="Filter menu" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option>All items</option><option>Available now</option><option>Vegetarian</option></select></div><div className={styles.categoryRail} aria-label="Menu categories">{CATEGORIES.map((item) => <button type="button" aria-pressed={category === item} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>{products.length ? <div className={styles.productGrid}>{products.map((product) => <ProductCard product={product} {...actions} key={product.id} />)}</div> : <div className={styles.empty}><Search /><h2>No menu matches</h2><p>Try another category or clear your search.</p></div>}</section>;
}
function CollectionScreen({ title, eyebrow, empty, products, ...actions }: ProductActions & { title: string; eyebrow: string; empty: string; products: Product[] }) { return <section><PageIntro eyebrow={eyebrow} title={title} text="Your Ember Bite picks, ready when you are." />{products.length ? <div className={styles.productGrid}>{products.map((product) => <ProductCard product={product} {...actions} key={product.id} />)}</div> : <div className={styles.empty}><Heart /><h2>No favorites yet</h2><p>{empty}</p></div>}</section>; }

function ProductCard({ product, favorites, toggleFavorite, openProduct }: ProductActions & { product: Product }) {
  const favorite = favorites.includes(product.id);
  return <article className={styles.productCard} data-unavailable={!product.available}><button className={styles.productImage} type="button" onClick={() => openProduct(product)} disabled={!product.available}><Image src={product.image} width={900} height={675} unoptimized alt={product.imageAlt} />{product.featured && <span>Featured</span>}{!product.available && <b>Temporarily unavailable</b>}</button><button className={styles.favorite} type="button" data-active={favorite} aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} favorites`} onClick={() => toggleFavorite(product.id)}><Heart /></button><div><div className={styles.productMeta}>{product.vegetarian && <span>Vegetarian</span>}<small>{product.calories} cal</small></div><h2>{product.name}</h2><p>{product.description}</p><footer><strong>{formatMoney(product.price)}</strong><button type="button" disabled={!product.available} onClick={() => openProduct(product)}>{product.customizable || product.mealEligible ? "Customize" : "Add"}<Plus /></button></footer></div></article>;
}

function ProductDialog({ product, initialItem, close, save }: { product: Product; initialItem: CartItem | null; close: () => void; save: (product: Product, customization: Customization, quantity: number) => void }) {
  useAccessibleDialog(close);
  const [custom, setCustom] = useState<Customization>(() => initialItem ? cloneCustomization(initialItem.customization) : productCustomization(product));
  const [quantity, setQuantity] = useState(initialItem?.quantity ?? 1);
  const preview = makeCartItem(product.id, custom, quantity, "preview");
  const toggleArray = (field: "removed" | "additions", value: string) => setCustom((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  return <div className={styles.backdrop} onMouseDown={(event) => event.currentTarget === event.target && close()}><section className={styles.productDialog} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title"><button className={styles.dialogClose} type="button" aria-label="Close product" onClick={close}><X /></button><div className={styles.dialogImage}><Image src={product.image} width={900} height={675} unoptimized alt={product.imageAlt} /></div><div className={styles.dialogContent}><span className={styles.eyebrow}>{initialItem ? "Edit your item" : product.category}</span><h1 id="product-dialog-title">{product.name}</h1><p>{product.description}</p><div className={styles.nutrition}><span>{product.calories} base calories</span><span>Nutrition shown for demo</span></div>{product.customizable && <><OptionGroup title="Patty"><Option name="patty" label="Single" checked={custom.patty === "Single"} onChange={() => setCustom({ ...custom, patty: "Single" })} /><Option name="patty" label="Double" price="+$3.00" checked={custom.patty === "Double"} onChange={() => setCustom({ ...custom, patty: "Double" })} /></OptionGroup><OptionGroup title="Cheese"><Option name="cheese" label="No Cheese" price="−$0.50" checked={custom.cheese === "No Cheese"} onChange={() => setCustom({ ...custom, cheese: "No Cheese" })} /><Option name="cheese" label="Cheddar" checked={custom.cheese === "Cheddar"} onChange={() => setCustom({ ...custom, cheese: "Cheddar" })} /><Option name="cheese" label="Extra Cheddar" price="+$1.50" checked={custom.cheese === "Extra Cheddar"} onChange={() => setCustom({ ...custom, cheese: "Extra Cheddar" })} /></OptionGroup><OptionGroup title="Remove"><CheckOption label="Onion" checked={custom.removed.includes("Onion")} onChange={() => toggleArray("removed", "Onion")} /><CheckOption label="Pickles" checked={custom.removed.includes("Pickles")} onChange={() => toggleArray("removed", "Pickles")} /><CheckOption label="Lettuce" checked={custom.removed.includes("Lettuce")} onChange={() => toggleArray("removed", "Lettuce")} /><CheckOption label="Sauce" checked={custom.removed.includes("Sauce")} onChange={() => toggleArray("removed", "Sauce")} /></OptionGroup><OptionGroup title="Add"><CheckOption label="Smoky strips" price="+$1.75" checked={custom.additions.includes("Smoky strips")} onChange={() => toggleArray("additions", "Smoky strips")} /><CheckOption label="Extra Patty" price="+$3.00" checked={custom.additions.includes("Extra Patty")} onChange={() => toggleArray("additions", "Extra Patty")} /><CheckOption label="Jalapeños" price="+$0.50" checked={custom.additions.includes("Jalapeños")} onChange={() => toggleArray("additions", "Jalapeños")} /></OptionGroup><OptionGroup title="Sauce"><Option name="sauce" label="Light" checked={custom.sauce === "Light"} onChange={() => setCustom({ ...custom, sauce: "Light" })} /><Option name="sauce" label="Standard" checked={custom.sauce === "Standard"} onChange={() => setCustom({ ...custom, sauce: "Standard" })} /><Option name="sauce" label="Extra" checked={custom.sauce === "Extra"} onChange={() => setCustom({ ...custom, sauce: "Extra" })} /></OptionGroup></>}{product.mealEligible && <section className={styles.mealBuilder}><label className={styles.mealToggle}><input type="checkbox" checked={custom.meal} onChange={(event) => setCustom({ ...custom, meal: event.target.checked })} /><span><UtensilsCrossed /><b>Make it a meal</b><small>Add a side and drink · +$5.50</small></span><Check /></label>{custom.meal && <div><SelectField label="Choose side" value={custom.side} onChange={(value) => setCustom({ ...custom, side: value as Customization["side"] })} options={["Regular Fries", "Large Fries (+$1.00)", "Side Salad", "Loaded Fries (+$2.00)"]} normalize={(value) => value.replace(/ \(.+\)/, "")} /><SelectField label="Choose drink" value={custom.drink} onChange={(value) => setCustom({ ...custom, drink: value as Customization["drink"] })} options={["Cola", "Diet Cola", "Lemon-Lime", "Water", "Orange Juice (+$0.50)"]} normalize={(value) => value.replace(/ \(.+\)/, "")} /><SelectField label="Meal size" value={custom.size} onChange={(value) => setCustom({ ...custom, size: value as Customization["size"] })} options={["Medium", "Large (+$1.50)"]} normalize={(value) => value.replace(/ \(.+\)/, "")} /></div>}</section>}<div className={styles.dialogAction}><div className={styles.stepper}><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus /></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}><Plus /></button></div><button className={styles.primary} type="button" onClick={() => save(product, custom, quantity)}><span>{initialItem ? "Update item" : "Add to order"}</span><strong>{formatMoney(roundMoney(itemUnitPrice(preview) * quantity))}</strong></button></div></div></section></div>;
}
function OptionGroup({ title, children }: { title: string; children: React.ReactNode }) { return <fieldset className={styles.optionGroup}><legend>{title}</legend><div>{children}</div></fieldset>; }
function Option({ name, label, price, checked, onChange }: { name: string; label: string; price?: string; checked: boolean; onChange: () => void }) { return <label><input type="radio" name={name} checked={checked} onChange={onChange} /><span>{label}</span>{price && <small>{price}</small>}</label>; }
function CheckOption({ label, price, checked, onChange }: { label: string; price?: string; checked: boolean; onChange: () => void }) { return <label><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span>{price && <small>{price}</small>}</label>; }
function SelectField({ label, value, options, onChange, normalize = (input) => input }: { label: string; value: string; options: string[]; onChange: (value: string) => void; normalize?: (value: string) => string }) { return <label className={styles.field}><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={normalize(option)} key={option}>{option}</option>)}</select></label>; }

function CartScreen({ state, totals, promoInput, setPromoInput, promoMessage, applyPromo, updateQuantity, removeItem, edit, quickAdd, continueShopping, checkout }: { state: OrderingState; totals: ReturnType<typeof calculateTotals>; promoInput: string; setPromoInput: (value: string) => void; promoMessage: { tone: "success" | "error"; text: string } | null; applyPromo: () => void; updateQuantity: (key: string, delta: number) => void; removeItem: (key: string) => void; edit: (product: Product, item: CartItem) => void; quickAdd: (id: string) => void; continueShopping: () => void; checkout: () => void }) {
  return <section><PageIntro eyebrow="Your order" title={state.cart.length ? "Review your cart" : "Your cart is empty"} text={state.cart.length ? "Adjust quantities, edit choices, or add something extra before checkout." : "Browse the menu and build an order made your way."} /><div className={styles.cartLayout}><div>{state.cart.length ? <div className={styles.cartItems}>{state.cart.map((item) => { const product = productById(item.productId)!; return <article className={styles.cartItem} key={item.key}><Image src={product.image} width={900} height={675} unoptimized alt="" /><div><h2>{product.name}</h2><p>{customizationSummary(item) || product.description}</p><button type="button" onClick={() => edit(product, item)}>Edit customization</button></div><div className={styles.cartItemActions}><strong>{formatMoney(itemUnitPrice(item) * item.quantity)}</strong><div className={styles.stepper}><button type="button" aria-label={`Decrease ${product.name}`} onClick={() => updateQuantity(item.key, -1)}><Minus /></button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${product.name}`} onClick={() => updateQuantity(item.key, 1)}><Plus /></button></div><button type="button" aria-label={`Remove ${product.name}`} onClick={() => removeItem(item.key)}><Trash2 /></button></div></article>; })}</div> : <div className={styles.empty}><ShoppingBag /><h2>Ready when you are</h2><p>Add a burger, meal, side, or dessert to begin.</p><button className={styles.primary} type="button" onClick={continueShopping}>Browse menu</button></div>}<section className={styles.upsell}><span>Complete your meal</span><h2>You may also like</h2><div>{["seasoned-fries", "lava-cake", "berry-shake"].map((id) => { const product = productById(id)!; return <article key={id}><Image src={product.image} width={900} height={675} unoptimized alt="" /><span><strong>{product.name}</strong><small>{formatMoney(product.price)}</small></span><button type="button" aria-label={`Add ${product.name}`} onClick={() => quickAdd(id)}><Plus /></button></article>; })}</div></section></div><aside className={styles.summary}><h2>Order summary</h2><div className={styles.promo}><label htmlFor="promo-code">Promotion code</label><div><input id="promo-code" value={promoInput} onChange={(event) => setPromoInput(event.target.value)} placeholder="WELCOME10 or FREESIDE" /><button type="button" onClick={applyPromo}>Apply</button></div>{promoMessage && <p data-tone={promoMessage.tone}>{promoMessage.text}</p>}</div><Totals totals={totals} promo={state.promo} /><button className={styles.primary} type="button" disabled={!state.cart.length} onClick={checkout}>Checkout <ArrowRight /></button><button className={styles.textButton} type="button" onClick={continueShopping}><ArrowLeft /> Continue shopping</button></aside></div></section>;
}
function Totals({ totals, promo }: { totals: ReturnType<typeof calculateTotals>; promo: string }) { return <dl className={styles.totals}><div><dt>Subtotal</dt><dd>{formatMoney(totals.subtotal)}</dd></div>{totals.discount > 0 && <div className={styles.discount}><dt>Discount {promo && `(${promo})`}</dt><dd>−{formatMoney(totals.discount)}</dd></div>}{totals.deliveryFee > 0 && <div><dt>Delivery fee</dt><dd>{formatMoney(totals.deliveryFee)}</dd></div>}<div><dt>Tax</dt><dd>{formatMoney(totals.tax)}</dd></div><div className={styles.grandTotal}><dt>Total</dt><dd>{formatMoney(totals.total)}</dd></div></dl>; }

function CheckoutScreen({ state, totals, step, setStep, setAccountMode, placeOrder, back }: { state: OrderingState; totals: ReturnType<typeof calculateTotals>; step: number; setStep: (step: number) => void; setAccountMode: (mode: AccountMode) => void; placeOrder: (customer: { name: string; phone: string; email: string }, payment: PaymentMethod, fulfillmentNote: string) => void; back: () => void }) {
  const [note, setNote] = useState(state.orderType === "Pickup" ? "Pickup counter" : ""); const [name, setName] = useState(state.accountMode === "Account" ? "Noura Karim" : ""); const [phone, setPhone] = useState(state.accountMode === "Account" ? "+961 70 555 014" : ""); const [email, setEmail] = useState(state.accountMode === "Account" ? "noura@example.test" : ""); const [payment, setPayment] = useState<PaymentMethod>("Card"); const [card, setCard] = useState(""); const [expiry, setExpiry] = useState(""); const [cvv, setCvv] = useState(""); const [error, setError] = useState(""); const branch = branchById(state.branchId)!;
  function next() { if (step === 1 && state.orderType === "Delivery" && !note.trim()) return setError("Enter a delivery address."); if (step === 1 && state.orderType === "Dine In" && !note.trim()) return setError("Enter your table number."); if (step === 1 && state.orderType === "Drive-Thru" && !note.trim()) return setError("Enter a vehicle description or plate."); if (step === 2 && (!name.trim() || !phone.trim())) return setError("Enter your name and phone number."); setError(""); setStep(step + 1); }
  function submit() { if (payment === "Card" && (card.replace(/\s/g, "") !== "4242424242424242" || !expiry || cvv !== "123")) { setError("Use demo card 4242 4242 4242 4242, any future expiry, and CVV 123."); return; } setError(""); placeOrder({ name, phone, email }, payment, note || `${state.orderType} at ${branch.name}`); }
  return <section><PageIntro back={step === 1 ? back : () => setStep(step - 1)} eyebrow="Secure demo checkout" title="Almost there" text="No money will be processed and payment details are never stored." /><div className={styles.checkoutLayout}><div className={styles.checkoutCard}><ol className={styles.checkoutSteps}>{["Fulfillment", "Your details", "Payment"].map((label, index) => <li data-active={step === index + 1} data-done={step > index + 1} key={label}><span>{step > index + 1 ? <Check /> : index + 1}</span>{label}</li>)}</ol>{error && <p className={styles.formError} role="alert">{error}</p>}{step === 1 && <div className={styles.checkoutSection}><span className={styles.eyebrow}>Step 1</span><h2>{state.orderType} details</h2><div className={styles.branchSummary}><Store /><span><strong>{branch.name}</strong><small>{branch.address} · {branch.prepMinutes}</small></span></div>{state.orderType === "Delivery" && <TextField label="Delivery address" value={note} setValue={setNote} placeholder="Apartment, street, city" />}{state.orderType === "Pickup" && <TextField label="Pickup instructions (optional)" value={note} setValue={setNote} placeholder="Anything the team should know?" />}{state.orderType === "Dine In" && <TextField label="Table number" value={note} setValue={setNote} placeholder="Example: Table 14" />}{state.orderType === "Drive-Thru" && <TextField label="Vehicle or plate" value={note} setValue={setNote} placeholder="Example: White hatchback" />}<button className={styles.primary} type="button" onClick={next}>Continue to details <ArrowRight /></button></div>}{step === 2 && <div className={styles.checkoutSection}><span className={styles.eyebrow}>Step 2</span><h2>How should we contact you?</h2><div className={styles.accountChoice}><button type="button" data-active={state.accountMode === "Guest"} onClick={() => setAccountMode("Guest")}><UserRound />Guest checkout</button><button type="button" data-active={state.accountMode === "Account"} onClick={() => { setAccountMode("Account"); setName("Noura Karim"); setPhone("+961 70 555 014"); setEmail("noura@example.test"); }}><Heart />Use demo account</button></div><TextField label="Full name" value={name} setValue={setName} /><TextField label="Phone number" value={phone} setValue={setPhone} inputMode="tel" /><TextField label="Email (optional)" value={email} setValue={setEmail} inputMode="email" /><button className={styles.primary} type="button" onClick={next}>Continue to payment <ArrowRight /></button></div>}{step === 3 && <div className={styles.checkoutSection}><span className={styles.eyebrow}>Step 3</span><h2>Select payment</h2><div className={styles.paymentOptions}>{(["Card", "Digital Wallet", "Cash"] as PaymentMethod[]).map((method) => <button type="button" data-active={payment === method} onClick={() => setPayment(method)} key={method}>{method === "Card" ? <CreditCard /> : method === "Digital Wallet" ? <WalletCards /> : <ShoppingBag />}<span><strong>{method === "Digital Wallet" ? "Mobile Wallet" : method}</strong><small>{method === "Card" ? "Simulated card payment" : method === "Digital Wallet" ? "Generic demo wallet" : "Pay at collection where available"}</small></span><Check /></button>)}</div>{payment === "Card" && <div className={styles.cardFields}><div className={styles.demoCardNote}><CreditCard /><span><strong>Safe demo card</strong><small>Use 4242 4242 4242 4242 · No details are stored.</small></span></div><TextField label="Card number" value={card} setValue={setCard} inputMode="numeric" placeholder="4242 4242 4242 4242" /><div><TextField label="Expiry" value={expiry} setValue={setExpiry} placeholder="12/30" /><TextField label="CVV" value={cvv} setValue={setCvv} inputMode="numeric" placeholder="123" /></div></div>}<button className={styles.primary} type="button" onClick={submit}>Place simulated order · {formatMoney(totals.total)}</button></div>}</div><aside className={styles.summary}><h2>Your total</h2><p>{state.cart.reduce((sum, item) => sum + item.quantity, 0)} items · {state.orderType} from {branch.name}</p><Totals totals={totals} promo={state.promo} /><small><Check /> No real payment is processed in this concept demo.</small></aside></div></section>;
}
function TextField({ label, value, setValue, placeholder, inputMode = "text" }: { label: string; value: string; setValue: (value: string) => void; placeholder?: string; inputMode?: "text" | "tel" | "email" | "numeric" }) { return <label className={styles.field}><span>{label}</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} inputMode={inputMode} /></label>; }

function Confirmation({ order, track, receipt, menu }: { order: Order; track: () => void; receipt: () => void; menu: () => void }) { const branch = branchById(order.branchId)!; return <section className={styles.completion}><div className={styles.successMark}><Check /></div><span>Order confirmed</span><h1>{order.id}</h1><p>Thanks, {order.customer.name.split(" ")[0]}. The kitchen at {branch.name} has your order.</p><div className={styles.estimate}><Clock3 /><span><small>Estimated preparation</small><strong>{branch.prepMinutes}</strong></span></div><dl><div><dt>Order type</dt><dd>{order.orderType}</dd></div><div><dt>Location</dt><dd>{branch.name}</dd></div><div><dt>Items</dt><dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div><div><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl><button className={styles.primary} type="button" onClick={track}>Track order <ArrowRight /></button><div><button className={styles.textButton} type="button" onClick={receipt}><ReceiptText /> View receipt</button><button className={styles.textButton} type="button" onClick={menu}>Back to menu</button></div></section>; }

function Tracking({ order, advance, receipt }: { order: Order; advance: () => void; receipt: () => void }) { const stages = trackingStages(order.orderType); const complete = order.statusIndex === stages.length - 1; return <section className={styles.tracking}><PageIntro eyebrow={`${order.id} · ${order.orderType}`} title={complete ? "Order complete" : "We’re on it"} text={complete ? "Your simulated order journey is complete." : "This demo advances automatically so you can see the full customer experience."} /><div className={styles.trackingCard}><div className={styles.trackingSummary}><PackageCheck /><span><small>Current status</small><strong>{stages[order.statusIndex]}</strong></span><b>{branchById(order.branchId)?.prepMinutes}</b></div><ol>{stages.map((stage, index) => <li data-state={index < order.statusIndex ? "done" : index === order.statusIndex ? "current" : "future"} key={stage}><span>{index <= order.statusIndex ? <Check /> : index + 1}</span><div><strong>{stage}</strong><small>{order.statusTimes[index] ?? "Waiting"}</small></div></li>)}</ol><div className={styles.trackingActions}>{!complete && <button className={styles.secondary} type="button" onClick={advance}>Advance demo status</button>}{complete && <button className={styles.primary} type="button" onClick={receipt}>Open digital receipt <ReceiptText /></button>}</div></div></section>; }

function Receipt({ order, back }: { order: Order; back: () => void }) { const branch = branchById(order.branchId)!; return <section><PageIntro back={back} eyebrow="Digital receipt" title={order.id} text={`${order.displayDate}, 2026 · 2:32 PM`} /><article className={styles.receipt}><header><span><UtensilsCrossed /></span><div><strong>EMBER BITE</strong><small>{branch.name} · {branch.address}</small></div></header><div className={styles.receiptMeta}><span><small>Fulfillment</small><strong>{order.orderType}</strong></span><span><small>Payment</small><strong>{order.paymentMethod === "Digital Wallet" ? "Mobile Wallet" : order.paymentMethod}</strong></span><span><small>Customer</small><strong>{order.customer.name}</strong></span></div><div className={styles.receiptItems}>{order.items.map((item) => { const product = productById(item.productId)!; return <div key={item.key}><span><strong>{item.quantity} × {product.name}</strong><small>{customizationSummary(item) || "Standard preparation"}</small></span><b>{formatMoney(itemUnitPrice(item) * item.quantity)}</b></div>; })}</div><Totals totals={{ subtotal: order.subtotal, discount: order.discount, deliveryFee: order.deliveryFee, tax: order.tax, total: order.total }} promo={order.promo} /><footer><CheckCircle2 /><span><strong>Simulated payment complete</strong><small>No real money was processed.</small></span></footer></article></section>; }

function Orders({ history, current, reorder, track, receipt }: { history: Order[]; current: Order | null; reorder: (order: Order) => void; track: () => void; receipt: (order: Order) => void }) { return <section><PageIntro eyebrow="Your orders" title="Order history" text="Reorder a favorite or revisit a digital receipt." /><div className={styles.orderList}>{history.map((order) => <article key={order.id}><div><span>{order.id}</span><h2>{order.displayDate}</h2><p>{order.items.map((item) => `${item.quantity}× ${productById(item.productId)?.name}`).join(", ")}</p></div><div><strong>{formatMoney(order.total)}</strong><small>{order.statusIndex === trackingStages(order.orderType).length - 1 ? "Completed" : trackingStages(order.orderType)[order.statusIndex]}</small></div><footer>{current?.id === order.id && order.statusIndex < trackingStages(order.orderType).length - 1 && <button className={styles.primary} type="button" onClick={track}>Track order</button>}<button className={styles.secondary} type="button" onClick={() => receipt(order)}>Receipt</button><button className={styles.secondary} type="button" onClick={() => reorder(order)}>Reorder</button></footer></article>)}</div></section>; }

function Account({ state, setMode, orders, favorites }: { state: OrderingState; setMode: (mode: AccountMode) => void; orders: () => void; favorites: () => void }) { return <section><PageIntro eyebrow="Demo customer" title="Your Ember Bite" text="Compare guest checkout with a convenient returning-customer experience." /><div className={styles.accountGrid}><section className={styles.profileCard}><div className={styles.avatar}>NK</div><span className={styles.eyebrow}>Account customer</span><h2>Noura Karim</h2><p>noura@example.test · +961 70 555 014</p><span className={styles.loyalty}><Sparkles /> 1,240 Ember Points</span><button className={styles.primary} type="button" onClick={() => setMode("Account")}>{state.accountMode === "Account" ? "Account selected ✓" : "Use for checkout"}</button></section><div className={styles.accountDetails}><article><MapPin /><div><span>Saved address</span><h2>Home</h2><p>24 Cedar Street, Downtown · Leave at reception</p></div></article><article><Heart /><div><span>Favorites</span><h2>{state.favorites.length} saved items</h2><button type="button" onClick={favorites}>View favorites <ArrowRight /></button></div></article><article><ReceiptText /><div><span>Recent orders</span><h2>{state.orderHistory.length} demo orders</h2><button type="button" onClick={orders}>View and reorder <ArrowRight /></button></div></article></div></div></section>; }
function ConfirmDialog({ close, confirm }: { close: () => void; confirm: () => void }) {
  useAccessibleDialog(close);
  return <div className={styles.backdrop} onMouseDown={(event) => event.currentTarget === event.target && close()}><section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="reset-title"><button className={styles.dialogClose} type="button" aria-label="Close reset dialog" onClick={close}><X /></button><RefreshCcw /><h2 id="reset-title">Reset the ordering demo?</h2><p>This clears the cart, favorites, branch, customer choice, and simulated orders.</p><div><button className={styles.secondary} type="button" onClick={close}>Cancel</button><button className={styles.danger} type="button" onClick={confirm}>Reset Demo</button></div></section></div>;
}
