"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getContactPath, getSitePath } from "@/config/site";
import styles from "./ecommerce-showcase.module.css";

const CATEGORIES = ["All", "New Arrivals", "Essentials", "Accessories"] as const;
type Category = (typeof CATEGORIES)[number];
type ProductCategory = Exclude<Category, "All">;
type SortOption = "featured" | "low" | "high" | "newest";
type Tone = "stone" | "sand" | "ink" | "clay" | "olive" | "mist";
type Shape = "lamp" | "carryall" | "carafe" | "clock" | "throw" | "vessel" | "tray" | "mat" | "clip" | "folio" | "sleeve" | "pouch";

type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  detail: string;
  variants: readonly string[];
  badge?: "New" | "Featured";
  featured: boolean;
  release: number;
  tone: Tone;
  shape: Shape;
};

const PRODUCTS: readonly Product[] = [
  { id: "form-lamp", name: "Form Table Lamp", category: "New Arrivals", price: 148, description: "A softly sculpted light for quiet corners.", detail: "An editorial lighting concept with a compact silhouette, warm diffusion, and a restrained material palette designed for bedside or reading spaces.", variants: ["Chalk", "Clay", "Ink"], badge: "New", featured: true, release: 12, tone: "clay", shape: "lamp" },
  { id: "fold-carryall", name: "Fold Carryall", category: "New Arrivals", price: 124, description: "Structured canvas with an adaptable profile.", detail: "A considered everyday carry concept with a generous main compartment, reinforced handles, and a form that works from weekday to weekend.", variants: ["Natural", "Olive", "Charcoal"], badge: "New", featured: true, release: 11, tone: "olive", shape: "carryall" },
  { id: "studio-carafe", name: "Studio Carafe", category: "New Arrivals", price: 72, description: "Clear geometry for the everyday table.", detail: "A balanced serving object concept with a comfortable neck, quiet proportions, and a shape intended to move easily from kitchen to dining table.", variants: ["Clear", "Smoke", "Amber"], badge: "New", featured: false, release: 10, tone: "mist", shape: "carafe" },
  { id: "pebble-clock", name: "Pebble Desk Clock", category: "New Arrivals", price: 86, description: "A small timepiece with a calm visual presence.", detail: "A minimal desk-clock concept that favors legibility and tactile simplicity, with a softened case and an uncluttered dial.", variants: ["Stone", "Moss", "Black"], badge: "New", featured: false, release: 9, tone: "stone", shape: "clock" },
  { id: "linen-throw", name: "Washed Linen Throw", category: "Essentials", price: 112, description: "Relaxed texture for layered living spaces.", detail: "A breathable textile concept with a soft washed finish, subtle fringe, and a versatile weight for seating, reading, or bedroom layering.", variants: ["Oat", "Terracotta", "Slate"], badge: "Featured", featured: true, release: 8, tone: "sand", shape: "throw" },
  { id: "column-vessel", name: "Column Vessel", category: "Essentials", price: 64, description: "Sculptural storage in a compact footprint.", detail: "A cylindrical vessel concept for stems, utensils, or desktop objects, shaped around a quiet vertical rhythm and matte finish.", variants: ["Bone", "Umber", "Olive"], featured: false, release: 7, tone: "stone", shape: "vessel" },
  { id: "oak-catchall", name: "Oak Catchall", category: "Essentials", price: 58, description: "A defined place for small daily objects.", detail: "A shallow catchall concept with rounded edges and divided space for keys, stationery, or entryway essentials.", variants: ["Natural Oak", "Dark Oak"], badge: "Featured", featured: true, release: 6, tone: "sand", shape: "tray" },
  { id: "desk-mat", name: "Soft Desk Mat", category: "Essentials", price: 68, description: "A composed surface for focused work.", detail: "A low-profile desk mat concept that creates a softer working surface while visually organizing keyboard, notebook, and everyday tools.", variants: ["Mushroom", "Forest", "Black"], featured: false, release: 5, tone: "ink", shape: "mat" },
  { id: "loop-clip", name: "Loop Key Clip", category: "Accessories", price: 34, description: "A tactile loop for keys and small tools.", detail: "A compact carry accessory concept pairing a flexible loop with a simple metal closure for easy attachment and removal.", variants: ["Tan", "Oxide", "Black"], featured: false, release: 4, tone: "clay", shape: "clip" },
  { id: "travel-folio", name: "Travel Folio", category: "Accessories", price: 92, description: "Documents and essentials, kept together.", detail: "A slim travel organizer concept with structured sections for notes, tickets, and small essentials—presented without account or personalization infrastructure.", variants: ["Sand", "Olive", "Ink"], badge: "Featured", featured: true, release: 3, tone: "olive", shape: "folio" },
  { id: "card-sleeve", name: "Folded Card Sleeve", category: "Accessories", price: 42, description: "A minimal profile for essential cards.", detail: "A small folded sleeve concept with an understated seam, compact proportions, and three illustrative finish options.", variants: ["Stone", "Cedar", "Black"], featured: false, release: 2, tone: "stone", shape: "sleeve" },
  { id: "canvas-pouch", name: "Utility Canvas Pouch", category: "Accessories", price: 48, description: "Flexible organization for everyday carry.", detail: "A zip pouch concept sized for cables, stationery, or travel pieces, using structured canvas and a simple pull detail.", variants: ["Natural", "Rust", "Charcoal"], featured: false, release: 1, tone: "sand", shape: "pouch" },
];

type CartItem = { productId: string; variant: string; quantity: number };
type PanelState = "cart" | "review" | "details" | "confirmed" | null;
type CheckoutDetails = { name: string; email: string; city: string };

const EMPTY_CHECKOUT: CheckoutDetails = { name: "", email: "", city: "" };
const money = (value: number) => `USD ${value.toFixed(2)}`;

export function EcommerceShowcase() {
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [panelState, setPanelState] = useState<PanelState>(null);
  const [checkout, setCheckout] = useState<CheckoutDetails>(EMPTY_CHECKOUT);
  const [checkoutError, setCheckoutError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const activeProduct = PRODUCTS.find((product) => product.id === activeProductId) ?? null;
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return PRODUCTS
      .filter((product) => category === "All" || product.category === category)
      .filter((product) => !normalizedQuery || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(normalizedQuery))
      .filter((product) => !featuredOnly || product.featured)
      .filter((product) => !savedOnly || savedIds.includes(product.id))
      .sort((a, b) => {
        if (sort === "low") return a.price - b.price;
        if (sort === "high") return b.price - a.price;
        if (sort === "newest") return b.release - a.release;
        return Number(b.featured) - Number(a.featured) || b.release - a.release;
      });
  }, [category, featuredOnly, query, savedIds, savedOnly, sort]);

  useEffect(() => {
    const overlayOpen = Boolean(activeProduct || panelState);
    if (!overlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-dialog-focus]")?.focus();
    }, 0);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setActiveProductId(null);
      setPanelState(null);
      window.setTimeout(() => lastFocusRef.current?.focus(), 0);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProduct, panelState]);

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
  }

  function handleCategoryKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % CATEGORIES.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = CATEGORIES.length - 1;
    selectCategory(CATEGORIES[nextIndex]);
    categoryRefs.current[nextIndex]?.focus();
  }

  function scrollToCatalog(focusSearch = false) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("commerce-catalog")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    if (focusSearch) window.setTimeout(() => searchRef.current?.focus(), reducedMotion ? 0 : 350);
    setMobileMenuOpen(false);
  }

  function toggleSaved(productId: string) {
    setSavedIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
    const product = PRODUCTS.find((candidate) => candidate.id === productId);
    setAnnouncement(`${product?.name ?? "Product"} ${savedIds.includes(productId) ? "removed from" : "saved to"} local favorites.`);
  }

  function showSaved() {
    setSavedOnly((current) => !current);
    scrollToCatalog();
  }

  function rememberFocus() {
    lastFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  function openProduct(product: Product) {
    rememberFocus();
    setPanelState(null);
    setActiveProductId(product.id);
    setSelectedVariant(product.variants[0]);
    setDetailQuantity(1);
  }

  function openCart() {
    rememberFocus();
    setMobileMenuOpen(false);
    setActiveProductId(null);
    setPanelState("cart");
    setCheckoutError("");
  }

  function closeOverlay() {
    setActiveProductId(null);
    setPanelState(null);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }

  function trapDialogFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function addToCart(product: Product, variant: string, quantity: number) {
    setCart((current) => {
      const match = current.find((item) => item.productId === product.id && item.variant === variant);
      if (match) return current.map((item) => item === match ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, { productId: product.id, variant, quantity }];
    });
    setAnnouncement(`${quantity} ${product.name}, ${variant}, added to the demonstration cart.`);
  }

  function updateCartQuantity(productId: string, variant: string, change: number) {
    setCart((current) => current.map((item) => item.productId === productId && item.variant === variant ? { ...item, quantity: Math.max(1, item.quantity + change) } : item));
  }

  function removeCartItem(productId: string, variant: string) {
    const product = PRODUCTS.find((candidate) => candidate.id === productId);
    setCart((current) => current.filter((item) => !(item.productId === productId && item.variant === variant)));
    setAnnouncement(`${product?.name ?? "Product"} removed from the demonstration cart.`);
  }

  function updateCheckout(field: keyof CheckoutDetails, value: string) {
    setCheckout((current) => ({ ...current, [field]: value }));
    setCheckoutError("");
  }

  function confirmDemoCheckout() {
    if (!checkout.name.trim() || !checkout.email.trim() || !checkout.city.trim()) {
      setCheckoutError("Complete each field with sample information to continue the demonstration.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(checkout.email)) {
      setCheckoutError("Enter a valid sample email address.");
      return;
    }
    setCheckoutError("");
    setPanelState("confirmed");
    setAnnouncement("Checkout demonstration complete. No order or payment was submitted.");
  }

  function resetCommerceDemo() {
    setCart([]);
    setCheckout(EMPTY_CHECKOUT);
    setCheckoutError("");
    setPanelState(null);
    setAnnouncement("Demonstration cart cleared.");
  }

  return (
    <main className={styles.storefront}>
      <p className={styles.announcement} aria-live="polite" aria-atomic="true">{announcement}</p>

      <div className={styles.conceptBar}>
        <div className={styles.shell}>
          <span><b>ILBATECH Concept Preview</b> Front-end commerce demonstration</span>
          <a href={getSitePath("/work")}><ArrowLeft size={14} /> Return to Work</a>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.shell}>
          <a className={styles.brand} href="#commerce-top" aria-label="Concept Store demonstration home"><strong>CONCEPT / STORE</strong><small>Curated design objects</small></a>
          <nav className={styles.desktopNav} aria-label="Storefront concept navigation">
            <a href="#commerce-catalog">Shop</a><a href="#commerce-editorial">Collection</a><a href="#commerce-principles">Principles</a>
          </nav>
          <div className={styles.headerActions}>
            <button type="button" aria-label="Search products" onClick={() => scrollToCatalog(true)}><Search /></button>
            <button type="button" aria-label={`Show saved products, ${savedIds.length} saved`} aria-pressed={savedOnly} onClick={showSaved}><Heart /><span>{savedIds.length}</span></button>
            <button type="button" aria-label={`Open demonstration cart, ${cartCount} items`} onClick={openCart}><ShoppingBag /><span>{cartCount}</span></button>
          </div>
          <button className={styles.menuButton} type="button" aria-expanded={mobileMenuOpen} aria-controls="commerce-mobile-navigation" aria-label={mobileMenuOpen ? "Close store navigation" : "Open store navigation"} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
          {mobileMenuOpen && (
            <nav id="commerce-mobile-navigation" className={styles.mobileNav} aria-label="Storefront mobile navigation">
              <a href="#commerce-catalog" onClick={() => setMobileMenuOpen(false)}>Shop all products</a>
              <a href="#commerce-editorial" onClick={() => setMobileMenuOpen(false)}>The collection</a>
              <a href="#commerce-principles" onClick={() => setMobileMenuOpen(false)}>Store principles</a>
              <button type="button" onClick={openCart}>Open cart · {cartCount}</button>
            </nav>
          )}
        </div>
      </header>

      <section id="commerce-top" className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Concept collection · Edition 01</p>
            <h1>Objects worth living with.</h1>
            <p>A premium storefront concept for thoughtfully presented products, intuitive discovery, and a clear path from curiosity to cart.</p>
            <div className={styles.heroActions}>
              <button type="button" onClick={() => scrollToCatalog()}>Shop collection <ArrowRight size={15} /></button>
              <button type="button" onClick={() => scrollToCatalog(true)}>Explore products</button>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroStage}>
              <span className={styles.heroEdition}>01 / OBJECT STUDY</span>
              <div className={styles.heroLamp}><i /><b /></div>
              <div className={styles.heroTray}><i /><i /></div>
              <div className={styles.heroCard}><small>THE EVERYDAY EDIT</small><strong>Form.<br />Function.<br />Quiet detail.</strong><span>Concept retail presentation</span></div>
            </div>
          </div>
        </div>
        <div className={`${styles.shell} ${styles.heroFoot}`}><span>Example storefront pillars</span><span>Considered presentation</span><span>Useful product information</span><span>Mobile-first shopping</span></div>
      </section>

      <section id="commerce-catalog" className={styles.catalog}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Interactive catalog</p><h2>The everyday edit.</h2></div>
            <p>Search the demonstration collection, switch categories, refine the view, and choose how products are ordered.</p>
          </div>

          <div className={styles.discoveryPanel}>
            <div className={styles.categoryTabs} role="tablist" aria-label="Product categories">
              {CATEGORIES.map((item, index) => (
                <button
                  ref={(element) => { categoryRefs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`commerce-category-${index}`}
                  aria-selected={category === item}
                  aria-controls="commerce-products"
                  tabIndex={category === item ? 0 : -1}
                  onClick={() => selectCategory(item)}
                  onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                  key={item}
                >{item}</button>
              ))}
            </div>
            <div className={styles.discoveryControls}>
              <label className={styles.searchField}><span>Search collection</span><div><Search size={16} /><input ref={searchRef} type="search" value={query} placeholder="Search products" onChange={(event) => setQuery(event.target.value)} /></div></label>
              <fieldset className={styles.refineFilters}>
                <legend>Refine</legend>
                <button type="button" aria-pressed={featuredOnly} onClick={() => setFeaturedOnly((current) => !current)}><Sparkles size={13} /> Featured</button>
                <button type="button" aria-pressed={savedOnly} onClick={() => setSavedOnly((current) => !current)}><Heart size={13} /> Saved</button>
              </fieldset>
              <label className={styles.sortField}><span>Sort by</span><div><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="newest">Newest</option></select></div></label>
            </div>
          </div>

          <div className={styles.catalogStatus} aria-live="polite"><span>{category}</span><small>{visibleProducts.length} demonstration {visibleProducts.length === 1 ? "product" : "products"}</small></div>
          <div id="commerce-products" className={styles.productGrid} role="tabpanel" aria-labelledby={`commerce-category-${CATEGORIES.indexOf(category)}`}>
            {visibleProducts.map((product) => (
              <article className={styles.productCard} key={product.id}>
                <div className={styles.productVisual} data-tone={product.tone} data-shape={product.shape}>
                  {product.badge && <small>{product.badge}</small>}
                  <button type="button" aria-label={`${savedIds.includes(product.id) ? "Remove" : "Save"} ${product.name}`} aria-pressed={savedIds.includes(product.id)} onClick={() => toggleSaved(product.id)}><Heart /></button>
                  <div aria-hidden="true"><i /><b /><span /></div>
                </div>
                <div className={styles.productInfo}>
                  <div><p>{product.category}</p><h3>{product.name}</h3><span>{money(product.price)}</span></div>
                  <p>{product.description}</p>
                  <button type="button" onClick={() => openProduct(product)}>View product <ArrowRight size={14} /></button>
                </div>
              </article>
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className={styles.emptyCatalog} role="status"><Search size={24} /><h3>No matching demo products</h3><p>Clear the current search or refinements to continue browsing.</p><button type="button" onClick={() => { setQuery(""); setFeaturedOnly(false); setSavedOnly(false); }}>Clear refinements</button></div>
          )}
        </div>
      </section>

      <section id="commerce-editorial" className={styles.editorial}>
        <div className={`${styles.shell} ${styles.editorialGrid}`}>
          <div className={styles.editorialVisual} aria-hidden="true"><div><span>Material study / 01</span><i /><i /><b /></div></div>
          <div className={styles.editorialCopy}><p className={styles.eyebrow}>Product storytelling</p><h2>Space for the detail that makes a product distinct.</h2><p>This concept shows how editorial pacing and useful commerce information can work together—giving product form, finish, and purpose room to be understood before the purchase decision.</p><div><span>Refined visual hierarchy</span><span>Clear variants and pricing</span><span>Consistent discovery patterns</span></div></div>
        </div>
      </section>

      <section id="commerce-principles" className={styles.principles}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Commerce principles</p><h2>Designed around confident decisions.</h2></div><p>The interface keeps the collection expressive while making every practical shopping action clear and reachable.</p></div>
          <div className={styles.principleGrid}><article><span>01</span><h3>Discover naturally.</h3><p>Search, categories, saved products, and sorting help different shoppers find a useful path.</p></article><article><span>02</span><h3>Understand quickly.</h3><p>Product details, variants, pricing, and quantity stay close to the product presentation.</p></article><article><span>03</span><h3>Move with clarity.</h3><p>Cart feedback and a lightweight checkout demonstration make the next action unambiguous.</p></article></div>
        </div>
      </section>

      <section className={styles.ilbatechCta}>
        <div className={`${styles.shell} ${styles.ilbatechCtaGrid}`}>
          <div><p>ILBATECH · Concept Project</p><h2>Have a similar commerce project in mind?</h2></div>
          <div><p>This concept was created by ILBATECH to demonstrate an approach to modern digital commerce experiences.</p><div><a href={getContactPath("E-Commerce")}>Discuss a Similar Project <ArrowRight size={15} /></a></div></div>
        </div>
      </section>

      <div className={styles.mobileCommerceBar}><button type="button" onClick={() => scrollToCatalog()}><Search size={16} /> Browse</button><button type="button" onClick={openCart}><ShoppingBag size={16} /> Cart · {cartCount}</button></div>

      {activeProduct && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlay(); }}>
          <div ref={dialogRef} className={styles.productDialog} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" onKeyDown={trapDialogFocus}>
            <button data-dialog-focus className={styles.dialogClose} type="button" aria-label="Close product details" onClick={closeOverlay}><X /></button>
            <div className={styles.detailVisual} data-tone={activeProduct.tone} data-shape={activeProduct.shape}><span>Product study</span><div aria-hidden="true"><i /><b /><span /></div></div>
            <div className={styles.detailContent}>
              <p className={styles.eyebrow}>{activeProduct.category} · Demonstration product</p>
              <h2 id="product-dialog-title">{activeProduct.name}</h2>
              <strong>{money(activeProduct.price)}</strong>
              <p>{activeProduct.detail}</p>
              <fieldset className={styles.variantPicker}><legend>Choose finish <span aria-live="polite">Selected: {selectedVariant}</span></legend><div>{activeProduct.variants.map((variant) => <button type="button" aria-pressed={selectedVariant === variant} onClick={() => setSelectedVariant(variant)} key={variant}>{variant}</button>)}</div></fieldset>
              <div className={styles.detailPurchase}>
                <div className={styles.quantityControl} aria-label="Product quantity"><button type="button" aria-label="Decrease quantity" disabled={detailQuantity === 1} onClick={() => setDetailQuantity((current) => Math.max(1, current - 1))}><Minus /></button><span aria-live="polite">{detailQuantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setDetailQuantity((current) => current + 1)}><Plus /></button></div>
                <button type="button" onClick={() => addToCart(activeProduct, selectedVariant, detailQuantity)}><ShoppingBag size={16} /> Add to Cart · {money(activeProduct.price * detailQuantity)}</button>
              </div>
              <div className={styles.detailSecondary}><button type="button" aria-pressed={savedIds.includes(activeProduct.id)} onClick={() => toggleSaved(activeProduct.id)}><Heart size={15} /> {savedIds.includes(activeProduct.id) ? "Saved locally" : "Save product"}</button><button type="button" onClick={openCart}>View cart ({cartCount}) <ArrowRight size={14} /></button></div>
              <p className={styles.productNote}>Illustrative product, pricing, finishes, and availability for this front-end concept only.</p>
            </div>
          </div>
        </div>
      )}

      {panelState && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlay(); }}>
          <aside ref={dialogRef} className={styles.cartPanel} role="dialog" aria-modal="true" aria-labelledby="cart-panel-title" onKeyDown={trapDialogFocus}>
            <div className={styles.panelHeader}><div><p>Local-only commerce demo</p><h2 id="cart-panel-title">{panelState === "cart" ? "Your cart" : panelState === "review" ? "Review" : panelState === "details" ? "Delivery details" : "Demonstration complete"}</h2></div><button data-dialog-focus type="button" aria-label="Close cart and checkout panel" onClick={closeOverlay}><X /></button></div>

            {panelState === "cart" && (
              <div className={styles.cartView}>
                {cart.length === 0 ? (
                  <div className={styles.emptyCart}><ShoppingBag size={28} /><h3>Your demo cart is empty.</h3><p>Explore a product, choose a finish, and add it to see the full cart experience.</p><button type="button" onClick={() => { closeOverlay(); scrollToCatalog(); }}>Browse products</button></div>
                ) : (
                  <>
                    <div className={styles.cartItems}>{cart.map((item) => { const product = PRODUCTS.find((candidate) => candidate.id === item.productId)!; return <article className={styles.cartItem} key={`${item.productId}-${item.variant}`}><div className={styles.cartThumb} data-tone={product.tone} data-shape={product.shape}><div aria-hidden="true"><i /><b /><span /></div></div><div><p>{product.category}</p><h3>{product.name}</h3><span>{item.variant}</span><strong>{money(product.price * item.quantity)}</strong><div><div className={styles.quantityControl}><button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={item.quantity === 1} onClick={() => updateCartQuantity(item.productId, item.variant, -1)}><Minus /></button><span aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => updateCartQuantity(item.productId, item.variant, 1)}><Plus /></button></div><button type="button" aria-label={`Remove ${product.name} from cart`} onClick={() => removeCartItem(item.productId, item.variant)}><Trash2 /> Remove</button></div></div></article>; })}</div>
                    <div className={styles.cartSummary}><div><span>Demo subtotal</span><strong>{money(cartSubtotal)}</strong></div><p>Shipping and taxes are intentionally not calculated in this front-end concept.</p><button type="button" onClick={() => setPanelState("review")}>Review demo checkout <ArrowRight size={15} /></button></div>
                  </>
                )}
              </div>
            )}

            {panelState === "review" && (
              <div className={styles.checkoutView}>
                <div className={styles.stepIndicator}><span>01</span><p>Cart review</p><small>1 of 2</small></div>
                <div className={styles.reviewItems}>{cart.map((item) => { const product = PRODUCTS.find((candidate) => candidate.id === item.productId)!; return <div key={`${item.productId}-${item.variant}`}><span>{item.quantity} × {product.name}<small>{item.variant}</small></span><strong>{money(product.price * item.quantity)}</strong></div>; })}</div>
                <div className={styles.reviewTotal}><span>Demo subtotal</span><strong>{money(cartSubtotal)}</strong></div>
                <div className={styles.checkoutNotice}><Check size={15} /><p>This demonstration does not calculate shipping, tax, or payment. No order will be submitted.</p></div>
                <div className={styles.checkoutActions}><button type="button" onClick={() => setPanelState("cart")}><ArrowLeft size={14} /> Edit cart</button><button type="button" onClick={() => setPanelState("details")}>Contact & delivery details <ArrowRight size={14} /></button></div>
              </div>
            )}

            {panelState === "details" && (
              <form className={styles.checkoutView} onSubmit={(event) => event.preventDefault()} noValidate>
                <div className={styles.stepIndicator}><span>02</span><p>Sample contact & delivery</p><small>2 of 2</small></div>
                <div className={styles.paymentExclusion}><PackageCheck size={20} /><div><strong>No payment information</strong><p>This demonstration never asks for card, bank, password, or identity details.</p></div></div>
                {checkoutError && <p className={styles.formError} role="alert">{checkoutError}</p>}
                <div className={styles.checkoutFields}><label><span>Sample name</span><input type="text" autoComplete="off" placeholder="Demo Shopper" value={checkout.name} onChange={(event) => updateCheckout("name", event.target.value)} /></label><label><span>Sample email</span><input type="email" autoComplete="off" placeholder="demo@example.com" value={checkout.email} onChange={(event) => updateCheckout("email", event.target.value)} /></label><label><span>Demonstration delivery city</span><input type="text" autoComplete="off" placeholder="Sample City" value={checkout.city} onChange={(event) => updateCheckout("city", event.target.value)} /></label></div>
                <p className={styles.checkoutPrivacy}>Use sample information only. Details remain in this component&apos;s temporary state and are not sent or stored.</p>
                <div className={styles.checkoutActions}><button type="button" onClick={() => setPanelState("review")}><ArrowLeft size={14} /> Back to review</button><button type="button" onClick={confirmDemoCheckout}>Complete demonstration <ArrowRight size={14} /></button></div>
              </form>
            )}

            {panelState === "confirmed" && (
              <div className={styles.confirmation} role="status"><span><Check size={26} /></span><p className={styles.eyebrow}>Checkout demonstration complete</p><h3>No order was placed.</h3><p>No payment was requested and no contact or delivery information was submitted or stored.</p><div><button type="button" onClick={resetCommerceDemo}>Reset commerce demo</button><button type="button" onClick={closeOverlay}>Continue browsing</button></div></div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
