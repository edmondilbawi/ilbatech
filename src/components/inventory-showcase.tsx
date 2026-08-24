"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  History,
  House,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { getSitePath } from "@/config/site";
import {
  addPlace,
  addProduct,
  createSeedState,
  editPlace,
  editProduct,
  estimatedStockValue,
  expiryStatus,
  getLocalDate,
  INVENTORY_STORAGE_KEY,
  InventoryState,
  loadInventoryState,
  Movement,
  moveStockIn,
  moveStockOut,
  Product,
  ProductInput,
  removePlace,
  removeProduct,
  stockStatus,
  SUBCATEGORIES,
  Subcategory,
  Unit,
  UNITS,
} from "./inventory-demo-model";
import styles from "./inventory-showcase.module.css";

type View = "Home" | "Products" | "Stock In" | "Stock Out" | "History";
type PlaceKind = "sources" | "destinations";
type Modal =
  | { type: "product"; product?: Product }
  | { type: "remove-product"; product: Product }
  | { type: "places"; kind: PlaceKind }
  | { type: "reset" }
  | null;

const STATIC_DATE = "2026-08-24";
const INITIAL_STATE = createSeedState(STATIC_DATE);
const NAVIGATION = [
  { label: "Home", icon: House },
  { label: "Products", icon: Boxes },
  { label: "Stock In", icon: ArrowDownToLine },
  { label: "Stock Out", icon: ArrowUpFromLine },
  { label: "History", icon: History },
] as const;

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a date";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function categoryLabel(category: Subcategory) {
  const short: Partial<Record<Subcategory, string>> = {
    "Bread & Bakery": "Bread",
    "Spices & Seasonings": "Spices",
    "Packaging / Disposables": "Packaging",
    "Frozen Items": "Frozen",
  };
  return short[category] ?? category;
}

function movementLabel(movement: Movement) {
  return movement.type === "IN" ? movement.sourceName : movement.destinationName;
}

export function InventoryShowcase() {
  const [view, setView] = useState<View>("Home");
  const [inventory, setInventory] = useState<InventoryState>(INITIAL_STATE);
  const [today, setToday] = useState(STATIC_DATE);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Subcategory>("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [successMovement, setSuccessMovement] = useState<Movement | null>(null);
  const [modal, setModal] = useState<Modal>(null);

  const [stockInProduct, setStockInProduct] = useState("");
  const [stockInQuantity, setStockInQuantity] = useState("");
  const [stockInSource, setStockInSource] = useState("");
  const [stockInCost, setStockInCost] = useState("");
  const [stockInExpiry, setStockInExpiry] = useState("");
  const [stockInDate, setStockInDate] = useState(STATIC_DATE);
  const [changeStockInDate, setChangeStockInDate] = useState(false);
  const [newSourceOpen, setNewSourceOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");

  const [stockOutProduct, setStockOutProduct] = useState("");
  const [stockOutQuantity, setStockOutQuantity] = useState("");
  const [stockOutDestination, setStockOutDestination] = useState("");
  const [stockOutDate, setStockOutDate] = useState(STATIC_DATE);
  const [changeStockOutDate, setChangeStockOutDate] = useState(false);
  const [newDestinationOpen, setNewDestinationOpen] = useState(false);
  const [newDestinationName, setNewDestinationName] = useState("");

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const localToday = getLocalDate();
      setToday(localToday);
      setStockInDate(localToday);
      setStockOutDate(localToday);
      setInventory(loadInventoryState(window.localStorage.getItem(INVENTORY_STORAGE_KEY), localToday));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory, ready]);

  const products = useMemo(() => inventory.products.filter((product) => product.active), [inventory.products]);
  const activeSources = inventory.sources.filter((source) => source.active);
  const activeDestinations = inventory.destinations.filter((destination) => destination.active);
  const selectedStockInProduct = products.find((product) => product.id === stockInProduct);
  const selectedStockOutProduct = products.find((product) => product.id === stockOutProduct);
  const lowStockProducts = products.filter((product) => stockStatus(product) !== "In Stock");
  const expiringProducts = products.filter((product) => {
    const status = expiryStatus(product, today);
    return status && status.days <= 7;
  });
  const visibleProducts = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.subcategory}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (category === "All" || product.subcategory === category);
  });

  function changeView(nextView: View) {
    setView(nextView);
    setError("");
    setNotice("");
    setSuccessMovement(null);
    document.getElementById("inventory-main")?.scrollIntoView({ block: "start" });
  }

  function resetFeedback() {
    setError("");
    setNotice("");
    setSuccessMovement(null);
  }

  function submitStockIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    const result = moveStockIn(inventory, {
      productId: stockInProduct,
      quantity: Number(stockInQuantity),
      sourceId: stockInSource,
      cost: Number(stockInCost),
      effectiveDate: stockInDate,
      ...(selectedStockInProduct?.expiryDate && stockInExpiry ? { expiryDate: stockInExpiry } : {}),
    }, today);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInventory(result.state);
    setSuccessMovement(result.movement ?? null);
    setStockInQuantity("");
    setStockInCost("");
    setChangeStockInDate(false);
    setStockInDate(today);
  }

  function submitStockOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    const result = moveStockOut(inventory, {
      productId: stockOutProduct,
      quantity: Number(stockOutQuantity),
      destinationId: stockOutDestination,
      effectiveDate: stockOutDate,
    }, today);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInventory(result.state);
    setSuccessMovement(result.movement ?? null);
    setStockOutQuantity("");
    setChangeStockOutDate(false);
    setStockOutDate(today);
  }

  function addNewPlace(kind: PlaceKind, name: string) {
    resetFeedback();
    const result = addPlace(inventory, kind, name);
    if (result.error) {
      setError(result.error);
      return;
    }
    const added = result.state[kind].at(-1);
    setInventory(result.state);
    if (kind === "sources") {
      setStockInSource(added?.id ?? "");
      setNewSourceName("");
      setNewSourceOpen(false);
      setNotice(`${added?.name} added and selected.`);
    } else {
      setStockOutDestination(added?.id ?? "");
      setNewDestinationName("");
      setNewDestinationOpen(false);
      setNotice(`${added?.name} added and selected.`);
    }
  }

  function confirmRemoveProduct(product: Product) {
    const result = removeProduct(inventory, product.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    const hasHistory = inventory.movements.some((movement) => movement.productId === product.id);
    setInventory(result.state);
    setModal(null);
    setNotice(hasHistory ? `${product.name} removed from future use. Its previous records remain in History.` : `${product.name} removed.`);
  }

  function resetDemo() {
    const resetState = createSeedState(today);
    window.localStorage.removeItem(INVENTORY_STORAGE_KEY);
    setInventory(resetState);
    setStockInProduct("");
    setStockInQuantity("");
    setStockInSource("");
    setStockInCost("");
    setStockOutProduct("");
    setStockOutQuantity("");
    setStockOutDestination("");
    setStockInDate(today);
    setStockOutDate(today);
    setChangeStockInDate(false);
    setChangeStockOutDate(false);
    setModal(null);
    setView("Home");
    setError("");
    setSuccessMovement(null);
    setNotice("Demo restored to its original sample products and history.");
  }

  return (
    <main className={styles.demo}>
      <div className={styles.conceptBar}>
        <div>
          <span><b>ILBATECH Concept Preview</b> Restaurant inventory · fictional sample data</span>
          <a href={getSitePath("/work")}><ArrowLeft aria-hidden="true" /> Return to Work</a>
        </div>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#inventory-main" aria-label="Restaurant Stock home">
          <span><Boxes aria-hidden="true" /></span>
          <span><strong>Restaurant Stock</strong><small>Food inventory</small></span>
        </a>
        <div className={styles.headerActions}>
          <span className={styles.sampleBadge}>Sample data</span>
          <button type="button" className={styles.resetButton} onClick={() => setModal({ type: "reset" })}><RefreshCcw aria-hidden="true" /> Reset Demo</button>
        </div>
      </header>

      <nav className={styles.navigation} aria-label="Restaurant inventory sections">
        {NAVIGATION.map(({ label, icon: Icon }) => (
          <button type="button" aria-current={view === label ? "page" : undefined} onClick={() => changeView(label)} key={label}>
            <Icon aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </nav>

      <div id="inventory-main" className={styles.workspace}>
        <div className={styles.pageHeader}>
          <div>
            <p>Food inventory</p>
            <h1>{view}</h1>
            <span>{view === "Home" ? "See what needs attention today." : view === "Products" ? "Find and manage restaurant products." : view === "Stock In" ? "Add products that arrived at the restaurant." : view === "Stock Out" ? "Record products leaving your stock." : "See every saved stock change."}</span>
          </div>
          {view === "Products" && <button type="button" className={styles.primaryButton} onClick={() => setModal({ type: "product" })}><Plus aria-hidden="true" /> Add Product</button>}
        </div>

        <div className={styles.feedback} aria-live="polite">
          {notice && <div className={styles.notice}><Check aria-hidden="true" /> {notice}</div>}
          {error && <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" /><div><strong>{error}</strong>{error === "Not enough stock." && selectedStockOutProduct && <span>Available: {formatNumber(selectedStockOutProduct.quantity)} {selectedStockOutProduct.unit} · You entered: {stockOutQuantity || "0"} {selectedStockOutProduct.unit}</span>}</div></div>}
        </div>

        {view === "Home" && (
          <HomeView inventory={inventory} products={products} lowStockProducts={lowStockProducts} expiringProducts={expiringProducts} changeView={changeView} />
        )}

        {view === "Products" && (
          <section aria-labelledby="products-title">
            <h2 id="products-title" className={styles.visuallyHidden}>Products</h2>
            <div className={styles.productTools}>
              <label className={styles.searchField}><Search aria-hidden="true" /><span className={styles.visuallyHidden}>Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
              <div className={styles.filters} aria-label="Filter products by subcategory">
                <button type="button" aria-pressed={category === "All"} onClick={() => setCategory("All")}>All</button>
                {SUBCATEGORIES.map((item) => <button type="button" aria-pressed={category === item} onClick={() => setCategory(item)} key={item}>{categoryLabel(item)}</button>)}
              </div>
            </div>
            {visibleProducts.length ? <div className={styles.productGrid}>{visibleProducts.map((product) => (
              <ProductCard product={product} today={today} edit={() => setModal({ type: "product", product })} remove={() => setModal({ type: "remove-product", product })} key={product.id} />
            ))}</div> : <div className={styles.emptyState}><Search aria-hidden="true" /><h2>No products found</h2><p>Try another search or choose All.</p><button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
          </section>
        )}

        {view === "Stock In" && (
          <div className={styles.formLayout}>
            <form className={styles.stockForm} onSubmit={submitStockIn} noValidate>
              <FormHeading number="1" label="What product?" />
              <label className={styles.field}><span>Select product</span><select value={stockInProduct} onChange={(event) => { const product = products.find((item) => item.id === event.target.value); setStockInProduct(event.target.value); setStockInCost(product ? String(product.cost) : ""); setStockInExpiry(product?.expiryDate ?? ""); resetFeedback(); }}><option value="">Choose a product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name} — {formatNumber(product.quantity)} {product.unit}</option>)}</select></label>
              {selectedStockInProduct && <StockAvailable product={selectedStockInProduct} />}

              <FormHeading number="2" label="How much?" />
              <label className={styles.field}><span>Quantity</span><div className={styles.amountField}><input inputMode="decimal" type="number" min="0" step="any" value={stockInQuantity} onChange={(event) => setStockInQuantity(event.target.value)} placeholder="0" /><b>{selectedStockInProduct?.unit ?? "unit"}</b></div></label>

              <FormHeading number="3" label="Where did it come from?" />
              <label className={styles.field}><span>Source</span><select value={stockInSource} onChange={(event) => setStockInSource(event.target.value)}><option value="">Choose a source</option>{activeSources.map((source) => <option value={source.id} key={source.id}>{source.name}</option>)}</select></label>
              <div className={styles.inlineActions}><button type="button" onClick={() => setNewSourceOpen((open) => !open)}><Plus aria-hidden="true" /> Add new source</button><button type="button" onClick={() => setModal({ type: "places", kind: "sources" })}><Settings2 aria-hidden="true" /> Manage sources</button></div>
              {newSourceOpen && <InlinePlaceForm label="Source name" value={newSourceName} setValue={setNewSourceName} add={() => addNewPlace("sources", newSourceName)} cancel={() => setNewSourceOpen(false)} />}

              <FormHeading number="4" label="Purchase cost" />
              <label className={styles.field}><span>Cost per {selectedStockInProduct?.unit ?? "unit"}</span><div className={styles.costField}><b>$</b><input inputMode="decimal" type="number" min="0" step="any" value={stockInCost} onChange={(event) => setStockInCost(event.target.value)} placeholder="0.00" /></div></label>

              {selectedStockInProduct?.expiryDate && <><FormHeading number="5" label="Expiry date" /><label className={styles.field}><span>Product expiry</span><input type="date" value={stockInExpiry} onChange={(event) => setStockInExpiry(event.target.value)} /></label></>}

              <DateField number={selectedStockInProduct?.expiryDate ? "6" : "5"} today={today} value={stockInDate} changed={changeStockInDate} setChanged={setChangeStockInDate} setValue={setStockInDate} />
              <button className={styles.submitButton} type="submit"><ArrowDownToLine aria-hidden="true" /> Add Stock</button>
            </form>
            <StockSidePanel kind="IN" product={selectedStockInProduct} movement={successMovement?.type === "IN" ? successMovement : null} />
          </div>
        )}

        {view === "Stock Out" && (
          <div className={styles.formLayout}>
            <form className={styles.stockForm} onSubmit={submitStockOut} noValidate>
              <FormHeading number="1" label="What product?" />
              <label className={styles.field}><span>Select product</span><select value={stockOutProduct} onChange={(event) => { setStockOutProduct(event.target.value); resetFeedback(); }}><option value="">Choose a product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name} — {formatNumber(product.quantity)} {product.unit}</option>)}</select></label>
              {selectedStockOutProduct && <StockAvailable product={selectedStockOutProduct} />}

              <FormHeading number="2" label="How much?" />
              <label className={styles.field}><span>Quantity</span><div className={styles.amountField}><input inputMode="decimal" type="number" min="0" step="any" value={stockOutQuantity} onChange={(event) => setStockOutQuantity(event.target.value)} placeholder="0" /><b>{selectedStockOutProduct?.unit ?? "unit"}</b></div></label>

              <FormHeading number="3" label="Where is it going?" />
              <label className={styles.field}><span>Destination</span><select value={stockOutDestination} onChange={(event) => setStockOutDestination(event.target.value)}><option value="">Choose a destination</option>{activeDestinations.map((destination) => <option value={destination.id} key={destination.id}>{destination.name}</option>)}</select></label>
              <div className={styles.inlineActions}><button type="button" onClick={() => setNewDestinationOpen((open) => !open)}><Plus aria-hidden="true" /> Add new destination</button><button type="button" onClick={() => setModal({ type: "places", kind: "destinations" })}><Settings2 aria-hidden="true" /> Manage destinations</button></div>
              {newDestinationOpen && <InlinePlaceForm label="Destination name" value={newDestinationName} setValue={setNewDestinationName} add={() => addNewPlace("destinations", newDestinationName)} cancel={() => setNewDestinationOpen(false)} />}

              <DateField number="4" today={today} value={stockOutDate} changed={changeStockOutDate} setChanged={setChangeStockOutDate} setValue={setStockOutDate} />
              <button className={`${styles.submitButton} ${styles.outButton}`} type="submit"><ArrowUpFromLine aria-hidden="true" /> Remove Stock</button>
            </form>
            <StockSidePanel kind="OUT" product={selectedStockOutProduct} movement={successMovement?.type === "OUT" ? successMovement : null} />
          </div>
        )}

        {view === "History" && <HistoryView movements={inventory.movements} />}
      </div>

      {modal?.type === "product" && <ProductModal inventory={inventory} product={modal.product} today={today} close={() => setModal(null)} save={(nextInventory, message) => { setInventory(nextInventory); setModal(null); setNotice(message); setError(""); }} setError={setError} />}
      {modal?.type === "remove-product" && <ConfirmModal title="Remove this product?" close={() => setModal(null)} confirm={() => confirmRemoveProduct(modal.product)} confirmLabel="Remove"><p>{inventory.movements.some((movement) => movement.productId === modal.product.id) ? "This product has stock history. It will be removed from active products, but its previous records will stay in History." : "This product has no stock history and will be permanently removed."}</p><strong>{modal.product.name}</strong></ConfirmModal>}
      {modal?.type === "places" && <PlacesModal inventory={inventory} kind={modal.kind} close={() => setModal(null)} update={(nextInventory, message) => { setInventory(nextInventory); setNotice(message); setError(""); }} />}
      {modal?.type === "reset" && <ConfirmModal title="Reset demo?" close={() => setModal(null)} confirm={resetDemo} confirmLabel="Reset"><p>This will restore the original sample products and history.</p></ConfirmModal>}
    </main>
  );
}

function HomeView({ inventory, products, lowStockProducts, expiringProducts, changeView }: { inventory: InventoryState; products: Product[]; lowStockProducts: Product[]; expiringProducts: Product[]; changeView: (view: View) => void }) {
  return <>
    <section className={styles.summaryGrid} aria-label="Inventory summary">
      <button type="button" onClick={() => changeView("Products")}><span><Boxes aria-hidden="true" /></span><small>Products</small><strong>{products.length}</strong><i>View all <ChevronRight /></i></button>
      <button type="button" onClick={() => changeView("Products")}><span data-tone="warning"><AlertTriangle aria-hidden="true" /></span><small>Low Stock</small><strong>{lowStockProducts.length}</strong><i>Needs attention <ChevronRight /></i></button>
      <button type="button" onClick={() => changeView("Products")}><span data-tone="expiry"><CalendarDays aria-hidden="true" /></span><small>Expiring Soon</small><strong>{expiringProducts.length}</strong><i>Within 7 days <ChevronRight /></i></button>
      <div><span><CircleDollarSign aria-hidden="true" /></span><small>Estimated Stock Value</small><strong>{currency.format(estimatedStockValue(inventory))}</strong><i>Quantity × current cost</i></div>
    </section>
    <div className={styles.homeGrid}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><p>Low stock</p><h2>Products needing attention</h2></div><button type="button" onClick={() => changeView("Products")}>View Products <ChevronRight /></button></div>
        <div className={styles.attentionList}>{lowStockProducts.slice(0, 5).map((product) => <article key={product.id}><span data-status={stockStatus(product)}><AlertTriangle /></span><div><strong>{product.name}</strong><small>{product.subcategory} · Low-stock level: {formatNumber(product.lowStockLevel)} {product.unit}</small></div><b>{formatNumber(product.quantity)} {product.unit}</b><em data-status={stockStatus(product)}>{stockStatus(product)}</em></article>)}</div>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><p>Recent activity</p><h2>Latest stock changes</h2></div><button type="button" onClick={() => changeView("History")}>View History <ChevronRight /></button></div>
        <div className={styles.activityList}>{inventory.movements.slice(0, 5).map((movement) => <article key={movement.id}><span data-type={movement.type}>{movement.type === "IN" ? <ArrowDownToLine /> : <ArrowUpFromLine />}</span><div><strong>{movement.productName}</strong><small>{formatDate(movement.effectiveDate)} · {movementLabel(movement)}</small></div><b>{movement.type === "IN" ? "+" : "−"}{formatNumber(movement.quantity)} {movement.unit}</b></article>)}</div>
      </section>
    </div>
    <section className={styles.checks}><div><Check /><span><strong>Stock can&apos;t go below zero</strong><small>Unavailable quantities are always blocked.</small></span></div><div><History /><span><strong>Every change is saved</strong><small>Before and after quantities stay in History.</small></span></div><div><Clock3 /><span><strong>Dates are automatic</strong><small>Today is used unless you choose another date.</small></span></div></section>
  </>;
}

function ProductCard({ product, today, edit, remove }: { product: Product; today: string; edit: () => void; remove: () => void }) {
  const status = stockStatus(product);
  const expiry = expiryStatus(product, today);
  return <article className={styles.productCard}>
    <header><span>{product.subcategory}</span><div><button type="button" onClick={edit} aria-label={`Edit ${product.name}`}><Pencil /></button><button type="button" onClick={remove} aria-label={`Remove ${product.name}`}><Trash2 /></button></div></header>
    <h2>{product.name}</h2>
    <div className={styles.quantity}><strong>{formatNumber(product.quantity)}</strong><span>{product.unit}</span></div>
    <dl><div><dt>Current cost</dt><dd>{currency.format(product.cost)} / {product.unit}</dd></div><div><dt>Stock status</dt><dd><span data-status={status}>{status}</span></dd></div><div><dt>Expiry</dt><dd>{expiry ? <span data-expiry={expiry.days <= 7}>{expiry.label}</span> : "Not set"}</dd></div></dl>
  </article>;
}

function FormHeading({ number, label }: { number: string; label: string }) {
  return <div className={styles.formHeading}><span>{number}</span><h2>{label}</h2></div>;
}

function StockAvailable({ product }: { product: Product }) {
  return <div className={styles.available}><span>Available now</span><strong>{formatNumber(product.quantity)} {product.unit}</strong><em data-status={stockStatus(product)}>{stockStatus(product)}</em></div>;
}

function DateField({ number, today, value, changed, setChanged, setValue }: { number: string; today: string; value: string; changed: boolean; setChanged: (changed: boolean) => void; setValue: (value: string) => void }) {
  return <><FormHeading number={number} label="Date" /><div className={styles.dateField}><CalendarDays aria-hidden="true" /><div><span>{changed ? "Selected date" : "Today"}</span><strong>{formatDate(value)}</strong></div><button type="button" onClick={() => { if (changed) setValue(today); setChanged(!changed); }}>{changed ? "Use today" : "Change"}</button></div>{changed && <label className={styles.field}><span>Movement date</span><input type="date" max={today} value={value} onChange={(event) => setValue(event.target.value)} /></label>}</>;
}

function InlinePlaceForm({ label, value, setValue, add, cancel }: { label: string; value: string; setValue: (value: string) => void; add: () => void; cancel: () => void }) {
  return <div className={styles.inlineForm}><label><span>{label}</span><input autoFocus value={value} onChange={(event) => setValue(event.target.value)} /></label><button type="button" onClick={add}>Add</button><button type="button" onClick={cancel} aria-label="Cancel"><X /></button></div>;
}

function StockSidePanel({ kind, product, movement }: { kind: "IN" | "OUT"; product?: Product; movement: Movement | null }) {
  if (movement) return <aside className={styles.successCard} aria-live="polite"><span><Check /></span><p>Stock {kind === "IN" ? "added" : "removed"}</p><h2>{movement.productName}</h2><strong>{kind === "IN" ? "+" : "−"}{formatNumber(movement.quantity)} {movement.unit}</strong><div><b>{formatNumber(movement.previousQuantity)} {movement.unit}</b><ChevronRight /><b>{formatNumber(movement.resultingQuantity)} {movement.unit}</b></div><small>{kind === "IN" ? "From" : "To"}</small><em>{movementLabel(movement)}</em></aside>;
  return <aside className={styles.helpCard}><span>{kind === "IN" ? <ArrowDownToLine /> : <ArrowUpFromLine />}</span><h2>{kind === "IN" ? "Add a delivery" : "Record stock used"}</h2><p>{kind === "IN" ? "Choose a product, enter what arrived, and select where it came from." : "Choose a product, enter what left, and select where it went."}</p>{product && <div><small>Selected product</small><strong>{product.name}</strong><span>{formatNumber(product.quantity)} {product.unit} available</span></div>}</aside>;
}

function HistoryView({ movements }: { movements: Movement[] }) {
  return <section className={styles.panel} aria-labelledby="history-title">
    <div className={styles.panelHeader}><div><p>Saved history</p><h2 id="history-title">All stock changes</h2></div><span className={styles.historyCount}>{movements.length} records · newest first</span></div>
    <div className={styles.historyWrap}><table className={styles.historyTable}><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Source / Destination</th><th>Before</th><th>After</th><th>Cost</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td data-label="Date">{formatDate(movement.effectiveDate)}</td><td data-label="Product"><strong>{movement.productName}</strong></td><td data-label="Type"><span data-type={movement.type}>{movement.type === "IN" ? <ArrowDownToLine /> : <ArrowUpFromLine />}{movement.type}</span></td><td data-label="Quantity"><b>{movement.type === "IN" ? "+" : "−"}{formatNumber(movement.quantity)} {movement.unit}</b></td><td data-label={movement.type === "IN" ? "Source" : "Destination"}>{movementLabel(movement) ?? "—"}</td><td data-label="Before">{formatNumber(movement.previousQuantity)} {movement.unit}</td><td data-label="After">{formatNumber(movement.resultingQuantity)} {movement.unit}</td><td data-label="Cost">{movement.purchaseCost !== undefined ? `${currency.format(movement.purchaseCost)}/${movement.unit}` : "—"}</td></tr>)}</tbody></table></div>
  </section>;
}

function ProductModal({ inventory, product, today, close, save, setError }: { inventory: InventoryState; product?: Product; today: string; close: () => void; save: (state: InventoryState, message: string) => void; setError: (error: string) => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [subcategory, setSubcategory] = useState<Subcategory>(product?.subcategory ?? "Meat");
  const [unit, setUnit] = useState<Unit>(product?.unit ?? "kg");
  const [quantity, setQuantity] = useState(product ? String(product.quantity) : "0");
  const [cost, setCost] = useState(product ? String(product.cost) : "0");
  const [lowStockLevel, setLowStockLevel] = useState(product ? String(product.lowStockLevel) : "0");
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate ?? "");
  const [localError, setLocalError] = useState("");
  const hasHistory = product ? inventory.movements.some((movement) => movement.productId === product.id) : false;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: ProductInput = { name, subcategory, unit, quantity: Number(quantity), cost: Number(cost), lowStockLevel: Number(lowStockLevel), ...(expiryDate ? { expiryDate } : {}) };
    const result = product ? editProduct(inventory, product.id, input) : addProduct(inventory, input, today);
    if (result.error) { setLocalError(result.error); setError(result.error); return; }
    save(result.state, `${name.trim()} ${product ? "updated" : "added to Products"}.`);
  }

  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><header><div><p>Products</p><h2 id="product-modal-title">{product ? "Edit product" : "Add Product"}</h2></div><button type="button" onClick={close} aria-label="Close"><X /></button></header><form className={styles.modalForm} onSubmit={submit} noValidate>
    {localError && <div className={styles.error} role="alert"><AlertTriangle /><strong>{localError}</strong></div>}
    <label className={styles.field}><span>Product name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label className={styles.field}><span>Subcategory</span><select value={subcategory} onChange={(event) => setSubcategory(event.target.value as Subcategory)}>{SUBCATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
    <div className={styles.fieldRow}><label className={styles.field}><span>Unit</span><select value={unit} disabled={hasHistory} onChange={(event) => setUnit(event.target.value as Unit)}>{UNITS.map((item) => <option key={item}>{item}</option>)}</select>{hasHistory && <small>Unit can&apos;t be changed because this product has stock history.</small>}</label>{!product ? <label className={styles.field}><span>Starting quantity</span><input type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label> : <div className={styles.readOnlyField}><span>Current quantity</span><strong>{quantity} {unit}</strong><small>Use Stock In or Stock Out to change this.</small></div>}</div>
    <div className={styles.fieldRow}><label className={styles.field}><span>Purchase cost per {unit}</span><input type="number" min="0" step="any" value={cost} onChange={(event) => setCost(event.target.value)} /></label><label className={styles.field}><span>Low-stock level</span><input type="number" min="0" step="any" value={lowStockLevel} onChange={(event) => setLowStockLevel(event.target.value)} /></label></div>
    <label className={styles.field}><span>Expiry date <small>(optional)</small></span><input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></label>
    <footer><button type="button" onClick={close}>Cancel</button><button className={styles.primaryButton} type="submit"><Check /> {product ? "Save Changes" : "Add Product"}</button></footer>
  </form></section></div>;
}

function PlacesModal({ inventory, kind, close, update }: { inventory: InventoryState; kind: PlaceKind; close: () => void; update: (state: InventoryState, message: string) => void }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [localError, setLocalError] = useState("");
  const singular = kind === "sources" ? "source" : "destination";

  function add() {
    const result = addPlace(inventory, kind, newName);
    if (result.error) { setLocalError(result.error); return; }
    update(result.state, `${newName.trim()} added.`);
    setNewName("");
  }

  function rename() {
    const result = editPlace(inventory, kind, editingId, editingName);
    if (result.error) { setLocalError(result.error); return; }
    update(result.state, `${editingName.trim()} saved. Previous History names stay unchanged.`);
    setEditingId("");
  }

  function remove(id: string, name: string) {
    const result = removePlace(inventory, kind, id);
    if (result.error) { setLocalError(result.error); return; }
    const key = kind === "sources" ? "sourceId" : "destinationId";
    const used = inventory.movements.some((movement) => movement[key] === id);
    update(result.state, used ? `${name} removed from future choices. Previous History records remain readable.` : `${name} removed.`);
  }

  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="places-modal-title"><header><div><p>Stock {kind === "sources" ? "In" : "Out"}</p><h2 id="places-modal-title">Manage {kind}</h2></div><button type="button" onClick={close} aria-label="Close"><X /></button></header><div className={styles.placesBody}>
    <p>Keep this list short and clear. Removing a used {singular} never erases it from History.</p>
    {localError && <div className={styles.error} role="alert"><AlertTriangle /><strong>{localError}</strong></div>}
    <div className={styles.placeAdd}><label><span>New {singular} name</span><input value={newName} onChange={(event) => setNewName(event.target.value)} /></label><button type="button" onClick={add}><Plus /> Add</button></div>
    <div className={styles.placeList}>{inventory[kind].filter((place) => place.active).map((place) => <div key={place.id}>{editingId === place.id ? <><input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} /><button type="button" onClick={rename}><Check /> Save</button><button type="button" onClick={() => setEditingId("")} aria-label="Cancel"><X /></button></> : <><strong>{place.name}</strong><button type="button" onClick={() => { setEditingId(place.id); setEditingName(place.name); }}><Pencil /> Edit</button><button type="button" onClick={() => remove(place.id, place.name)}><Trash2 /> Remove</button></>}</div>)}</div>
  </div></section></div>;
}

function ConfirmModal({ title, children, close, confirm, confirmLabel }: { title: string; children: React.ReactNode; close: () => void; confirm: () => void; confirmLabel: string }) {
  return <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}><section className={`${styles.modal} ${styles.confirmModal}`} role="dialog" aria-modal="true" aria-labelledby="confirm-title"><header><div><p>Please confirm</p><h2 id="confirm-title">{title}</h2></div><button type="button" onClick={close} aria-label="Close"><X /></button></header><div className={styles.confirmBody}>{children}</div><footer><button type="button" onClick={close}>Cancel</button><button type="button" className={styles.dangerButton} onClick={confirm}>{confirmLabel}</button></footer></section></div>;
}
