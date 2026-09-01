"use client";

import NextImage from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  CreditCard,
  Filter,
  Heart,
  Home,
  MapPin,
  Menu,
  Minus,
  Package,
  PackageCheck,
  Plus,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import {
  type ComponentProps,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getContactPath, getSitePath } from "@/config/site";
import {
  CATEGORIES,
  COMMERCE_STORAGE_KEY,
  DELIVERY_OPTIONS,
  LEGACY_COMMERCE_STORAGE_KEY,
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
  formatMoney,
  loadCommerceState,
  makeCartItem,
  productById,
  productUnitPrice,
  reorderItems,
  requestReturn,
  searchProducts,
  toggleWishlist,
  variantIsAvailable,
  type Address,
  type CartItem,
  type Category,
  type CommerceState,
  type DeliveryOption,
  type Order,
  type PaymentMethod,
  type Product,
  type ProductFilters,
  type SortOption,
} from "./ecommerce-demo-model";
import styles from "./ecommerce-showcase.module.css";

type Screen =
  | "home"
  | "catalog"
  | "product"
  | "wishlist"
  | "cart"
  | "checkout"
  | "confirmation"
  | "tracking"
  | "orders"
  | "order-detail"
  | "return"
  | "account"
  | "compare"
  | "deals"
  | "notifications";

const DEFAULT_FILTERS: ProductFilters = {
  category: "All",
  maxPrice: 1500,
  minRating: 0,
  availableOnly: false,
  brand: "All",
  delivery: "Any",
};
const CATEGORY_ART: Record<Category, string> = {
  Electronics: "/images/commerce/headphones.webp",
  Computers: "/images/commerce/laptop.webp",
  "Home & Kitchen": "/images/commerce/espresso.webp",
  Fashion: "/images/commerce/sneakers.webp",
  Beauty: "/images/commerce/skincare.webp",
  Sports: "/images/commerce/fitness.webp",
  Office: "/images/commerce/chair.webp",
  Accessories: "/images/commerce/backpack.webp",
};
const BRANDS = [
  "All",
  ...Array.from(new Set(PRODUCTS.map((product) => product.brand))).sort(),
];

function Image(props: ComponentProps<typeof NextImage>) {
  return <NextImage {...props} unoptimized />;
}

function StarRating({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count?: number;
  compact?: boolean;
}) {
  return (
    <span
      className={styles.rating}
      aria-label={`${rating} out of 5 stars${count ? `, ${count} reviews` : ""}`}
    >
      <Star size={compact ? 12 : 14} fill="currentColor" /> <b>{rating}</b>
      {count !== undefined && <small>({count.toLocaleString()})</small>}
    </span>
  );
}

function ProductCard({
  product,
  wished,
  compared,
  onOpen,
  onWish,
  onQuickAdd,
  onCompare,
}: {
  product: Product;
  wished: boolean;
  compared: boolean;
  onOpen: () => void;
  onWish: () => void;
  onQuickAdd: () => void;
  onCompare: () => void;
}) {
  const saved = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  return (
    <article className={styles.productCard}>
      <div className={styles.cardImage}>
        <button
          className={styles.wishButton}
          type="button"
          aria-pressed={wished}
          aria-label={`${wished ? "Remove" : "Add"} ${product.name} ${wished ? "from" : "to"} wishlist`}
          onClick={onWish}
        >
          <Heart size={17} fill={wished ? "currentColor" : "none"} />
        </button>
        {saved > 0 && <span className={styles.dealBadge}>{saved}% off</span>}
        <button
          type="button"
          className={styles.imageButton}
          onClick={onOpen}
          aria-label={`Open ${product.name}`}
        >
          <Image
            src={product.image}
            alt={product.imageAlt}
            width={900}
            height={675}
            sizes="(max-width: 520px) 46vw, (max-width: 960px) 30vw, 250px"
          />
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardMeta}>
          {product.brand} · {product.subcategory.split("·")[0]}
        </p>
        <button type="button" className={styles.productTitle} onClick={onOpen}>
          {product.name}
        </button>
        <StarRating
          rating={product.rating}
          count={product.reviewCount}
          compact
        />
        <div className={styles.priceLine}>
          <strong>{formatMoney(product.price)}</strong>
          {product.originalPrice && <s>{formatMoney(product.originalPrice)}</s>}
        </div>
        <p
          className={
            product.stock === 0
              ? styles.outStock
              : product.stock <= 3
                ? styles.lowStock
                : styles.delivery
          }
        >
          {product.stock === 0
            ? "Out of stock"
            : product.stock <= 3
              ? `Only ${product.stock} left`
              : `${product.delivery} delivery`}
        </p>
        <div className={styles.cardActions}>
          <button
            type="button"
            onClick={onQuickAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Unavailable" : "Quick add"}
          </button>
          <button type="button" aria-pressed={compared} onClick={onCompare}>
            <Scale size={14} /> {compared ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}

function StepTrail({ current }: { current: number }) {
  const labels = ["Address", "Delivery", "Payment", "Review"];
  return (
    <ol className={styles.stepTrail} aria-label="Checkout progress">
      {labels.map((label, index) => (
        <li className={index <= current ? styles.stepActive : ""} key={label}>
          <span>{index < current ? <Check size={13} /> : index + 1}</span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}

export function EcommerceShowcase() {
  const [commerce, setCommerce] = useState<CommerceState>(() =>
    createInitialCommerceState(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeProductId, setActiveProductId] = useState("aura-headphones");
  const [selectedOrderId, setSelectedOrderId] = useState("#EC-10476");
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");
  const [visibleCount, setVisibleCount] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutAddressId, setCheckoutAddressId] = useState("home");
  const [deliveryId, setDeliveryId] =
    useState<DeliveryOption["id"]>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [paymentError, setPaymentError] = useState("");
  const [buyNowItems, setBuyNowItems] = useState<CartItem[] | null>(null);
  const [promoDraft, setPromoDraft] = useState("");
  const [promoFeedback, setPromoFeedback] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [addressEditor, setAddressEditor] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState({
    label: "",
    name: "",
    line1: "",
    city: "",
    phone: "",
  });
  const [returnDraft, setReturnDraft] = useState({
    itemKey: "",
    quantity: 1,
    reason: "",
    method: "",
  });
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(COMMERCE_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_COMMERCE_STORAGE_KEY);
      setCommerce(loadCommerceState(stored));
      window.localStorage.removeItem(LEGACY_COMMERCE_STORAGE_KEY);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        COMMERCE_STORAGE_KEY,
        JSON.stringify(commerce),
      );
  }, [commerce, hydrated]);
  useEffect(() => {
    if (!resetOpen && !filterOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setResetOpen(false);
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [filterOpen, resetOpen]);

  const activeProduct = productById(activeProductId) ?? PRODUCTS[0];
  const selectedOrder =
    commerce.orders.find((order) => order.id === selectedOrderId) ??
    commerce.orders[0];
  const selectedVariants =
    commerce.selectedVariants[activeProduct.id] ??
    defaultSelections(activeProduct);
  const selectedDelivery =
    DELIVERY_OPTIONS.find((option) => option.id === deliveryId) ??
    DELIVERY_OPTIONS[0];
  const checkoutItems = buyNowItems ?? commerce.cart;
  const checkoutTotals = calculateTotals(
    checkoutItems,
    commerce.promo,
    selectedDelivery,
  );
  const cartCount = commerce.cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadCount = commerce.notifications.filter(
    (notice) => !notice.read,
  ).length;
  const selectedAddress =
    commerce.addresses.find((address) => address.id === checkoutAddressId) ??
    commerce.addresses[0];
  const suggestions = useMemo(
    () => searchProducts(queryDraft).slice(0, 5),
    [queryDraft],
  );
  const catalogProducts = useMemo(
    () => filterAndSortProducts(searchProducts(query), filters, sort),
    [filters, query, sort],
  );

  function patchCommerce(patch: Partial<CommerceState>) {
    setCommerce((current) => ({ ...current, ...patch }));
  }
  function go(next: Screen) {
    setScreen(next);
    setMobileMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  function browseCategory(category: Category | "All") {
    setFilters((current) => ({ ...current, category }));
    setQuery("");
    setQueryDraft("");
    setVisibleCount(12);
    go("catalog");
  }
  function runSearch(value = queryDraft) {
    const clean = value.trim();
    setQuery(clean);
    setQueryDraft(clean);
    setSuggestionsOpen(false);
    setVisibleCount(12);
    if (clean)
      patchCommerce({
        recentSearches: [
          clean,
          ...commerce.recentSearches.filter(
            (item) => item.toLowerCase() !== clean.toLowerCase(),
          ),
        ].slice(0, 5),
      });
    go("catalog");
  }
  function openProduct(product: Product) {
    setActiveProductId(product.id);
    setGalleryIndex(0);
    setQuantity(1);
    patchCommerce({
      recentlyViewed: [
        product.id,
        ...commerce.recentlyViewed.filter((id) => id !== product.id),
      ].slice(0, 6),
    });
    go("product");
  }
  function chooseVariant(name: string, value: string) {
    const next = { ...selectedVariants, [name]: value };
    patchCommerce({
      selectedVariants: {
        ...commerce.selectedVariants,
        [activeProduct.id]: next,
      },
    });
  }
  function addItem(
    product: Product,
    selections = defaultSelections(product),
    count = 1,
    openCart = false,
  ) {
    if (!variantIsAvailable(product, selections)) {
      setAnnouncement("That option is currently unavailable.");
      return;
    }
    const item = makeCartItem(product.id, selections, count);
    const existing = commerce.cart.find((entry) => entry.key === item.key);
    const cart = existing
      ? commerce.cart.map((entry) =>
          entry.key === item.key
            ? { ...entry, quantity: entry.quantity + count }
            : entry,
        )
      : [...commerce.cart, item];
    patchCommerce({ cart });
    setAnnouncement(`${product.name} added to cart.`);
    if (openCart) go("cart");
  }
  function toggleWish(product: Product) {
    const wasSaved = commerce.wishlist.includes(product.id);
    patchCommerce({ wishlist: toggleWishlist(commerce.wishlist, product.id) });
    setAnnouncement(
      `${product.name} ${wasSaved ? "removed from" : "added to"} wishlist.`,
    );
  }
  function toggleCompare(product: Product) {
    if (compareIds.includes(product.id)) {
      setCompareIds(compareIds.filter((id) => id !== product.id));
      return;
    }
    if (compareIds.length === 3) {
      setAnnouncement("Compare supports up to three products.");
      return;
    }
    setCompareIds([...compareIds, product.id]);
    setAnnouncement(`${product.name} added to compare.`);
  }
  function updateCartQuantity(key: string, change: number) {
    patchCommerce({
      cart: commerce.cart.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    });
  }
  function updateCartVariant(item: CartItem, name: string, value: string) {
    const product = productById(item.productId);
    if (!product) return;
    const selections = { ...item.selections, [name]: value };
    const changed = makeCartItem(product.id, selections, item.quantity);
    patchCommerce({
      cart: commerce.cart.map((entry) =>
        entry.key === item.key ? changed : entry,
      ),
    });
  }
  function removeCartItem(key: string) {
    patchCommerce({ cart: commerce.cart.filter((item) => item.key !== key) });
    setAnnouncement("Item removed from cart.");
  }
  function saveForLater(item: CartItem) {
    patchCommerce({
      cart: commerce.cart.filter((entry) => entry.key !== item.key),
      savedForLater: [
        ...commerce.savedForLater.filter((entry) => entry.key !== item.key),
        item,
      ],
    });
    setAnnouncement("Item saved for later.");
  }
  function restoreSaved(item: CartItem) {
    const existing = commerce.cart.find((entry) => entry.key === item.key);
    patchCommerce({
      savedForLater: commerce.savedForLater.filter(
        (entry) => entry.key !== item.key,
      ),
      cart: existing
        ? commerce.cart.map((entry) =>
            entry.key === item.key
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry,
          )
        : [...commerce.cart, item],
    });
    setAnnouncement("Item moved to cart.");
  }
  function applyPromo() {
    const code = promoDraft.trim().toUpperCase();
    const subtotal = calculateTotals(
      commerce.cart,
      "",
      DELIVERY_OPTIONS[0],
    ).subtotal;
    if (code === "WELCOME10") {
      patchCommerce({ promo: code });
      setPromoFeedback("WELCOME10 applied: 10% off.");
      return;
    }
    if (code === "SAVE20" && subtotal >= 150) {
      patchCommerce({ promo: code });
      setPromoFeedback("SAVE20 applied: $20 off.");
      return;
    }
    if (code === "SAVE20") {
      setPromoFeedback("SAVE20 requires a merchandise subtotal of $150.");
      return;
    }
    setPromoFeedback("That code is invalid or expired. Try WELCOME10.");
  }
  function startCheckout(items: CartItem[] | null = null) {
    if ((items ?? commerce.cart).length === 0) return;
    setBuyNowItems(items);
    setCheckoutStep(0);
    setPaymentError("");
    setCheckoutAddressId(
      commerce.addresses.find((address) => address.isDefault)?.id ??
        commerce.addresses[0]?.id ??
        "",
    );
    go("checkout");
  }
  function beginAddress(address?: Address) {
    setAddressEditor(address?.id ?? "new");
    setAddressDraft(
      address
        ? {
            label: address.label,
            name: address.name,
            line1: address.line1,
            city: address.city,
            phone: address.phone,
          }
        : { label: "", name: "", line1: "", city: "", phone: "" },
    );
  }
  function saveAddress(event: FormEvent) {
    event.preventDefault();
    if (Object.values(addressDraft).some((value) => !value.trim())) {
      setAnnouncement("Complete every address field.");
      return;
    }
    const id =
      addressEditor === "new"
        ? `address-${Date.now()}`
        : (addressEditor ?? `address-${Date.now()}`);
    const address: Address = {
      id,
      ...addressDraft,
      isDefault: commerce.addresses.length === 0,
    };
    const addresses =
      addressEditor === "new"
        ? [...commerce.addresses, address]
        : commerce.addresses.map((entry) =>
            entry.id === id
              ? { ...address, isDefault: entry.isDefault }
              : entry,
          );
    patchCommerce({ addresses });
    setCheckoutAddressId(id);
    setAddressEditor(null);
    setAnnouncement("Address saved in this browser.");
  }
  function setDefaultAddress(id: string) {
    patchCommerce({
      addresses: commerce.addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    });
  }
  function continueCheckout() {
    if (checkoutStep === 0 && !selectedAddress) {
      setPaymentError("Select or add a delivery address.");
      return;
    }
    if (checkoutStep === 2 && paymentMethod === "Card") {
      const number = card.number.replace(/\s/g, "");
      if (
        number !== "4242424242424242" ||
        !/^\d{2}\/\d{2}$/.test(card.expiry) ||
        !/^\d{3,4}$/.test(card.cvv) ||
        !card.name.trim()
      ) {
        setPaymentError(
          "Use the test card 4242 4242 4242 4242 and complete every card field.",
        );
        return;
      }
    }
    setPaymentError("");
    setCheckoutStep((step) => Math.min(3, step + 1));
  }
  function placeOrder() {
    if (!selectedAddress || checkoutItems.length === 0) return;
    const order = createPlacedOrder(
      checkoutItems,
      selectedAddress,
      selectedDelivery,
      paymentMethod,
      commerce.promo,
    );
    setCommerce((current) => ({
      ...current,
      cart: buyNowItems ? current.cart : [],
      orders: [
        order,
        ...current.orders.filter((entry) => entry.id !== order.id),
      ],
      currentOrderId: order.id,
      notifications: [
        {
          id: "notice-confirmed",
          title: "Order confirmed",
          text: `${order.id} has been placed successfully.`,
          time: "Just now",
          read: false,
          tone: "order",
        },
        ...current.notifications,
      ],
    }));
    setSelectedOrderId(order.id);
    setBuyNowItems(null);
    setCard({ number: "", expiry: "", cvv: "", name: "" });
    go("confirmation");
  }
  function advanceTracking(order: Order) {
    const nextIndex = Math.min(
      TRACKING_STAGES.length - 1,
      order.statusIndex + 1,
    );
    const status =
      nextIndex >= 5 ? "Delivered" : nextIndex >= 3 ? "Shipped" : "Processing";
    const nextOrder: Order = {
      ...order,
      status,
      statusIndex: nextIndex,
      arrival: nextIndex >= 5 ? "Delivered August 30" : order.arrival,
    };
    setCommerce((current) => ({
      ...current,
      orders: current.orders.map((entry) =>
        entry.id === order.id ? nextOrder : entry,
      ),
      notifications:
        nextIndex >= 3
          ? [
              {
                id: `notice-${order.id}-${nextIndex}`,
                title: TRACKING_STAGES[nextIndex],
                text: `${order.id} status updated in the simulation.`,
                time: "Just now",
                read: false,
                tone: "order",
              },
              ...current.notifications,
            ]
          : current.notifications,
    }));
    setAnnouncement(`Tracking advanced to ${TRACKING_STAGES[nextIndex]}.`);
  }
  function buyAgain(order: Order) {
    const again = reorderItems(order);
    setCommerce((current) => {
      const cart = current.cart.map((item) => ({ ...item }));
      again.forEach((item) => {
        const match = cart.find(
          (entry) =>
            entry.productId === item.productId &&
            JSON.stringify(entry.selections) ===
              JSON.stringify(item.selections),
        );
        if (match) match.quantity += item.quantity;
        else cart.push(item);
      });
      return { ...current, cart };
    });
    setAnnouncement(
      `${again.length} available ${again.length === 1 ? "item" : "items"} added to cart.`,
    );
    go("cart");
  }
  function submitReturn() {
    if (!selectedOrder) return;
    const updated = requestReturn(
      selectedOrder,
      returnDraft.itemKey,
      returnDraft.quantity,
      returnDraft.reason,
      returnDraft.method,
    );
    if (!updated.returnRequest) {
      setAnnouncement("Select an item, reason, and return method.");
      return;
    }
    patchCommerce({
      orders: commerce.orders.map((order) =>
        order.id === updated.id ? updated : order,
      ),
    });
    setSelectedOrderId(updated.id);
    setAnnouncement("Return requested. Reference #RET-6842.");
    go("order-detail");
  }
  function cancelEligible(order: Order) {
    if (!window.confirm(`Cancel simulated order ${order.id}?`)) return;
    const updated = cancelOrder(order);
    patchCommerce({
      orders: commerce.orders.map((entry) =>
        entry.id === order.id ? updated : entry,
      ),
    });
    setAnnouncement(
      updated.status === "Cancelled"
        ? `${order.id} cancelled.`
        : "This order can no longer be cancelled.",
    );
  }
  function resetDemo() {
    const initial = createInitialCommerceState();
    setCommerce(initial);
    window.localStorage.removeItem(LEGACY_COMMERCE_STORAGE_KEY);
    window.localStorage.setItem(COMMERCE_STORAGE_KEY, JSON.stringify(initial));
    setQuery("");
    setQueryDraft("");
    setFilters(DEFAULT_FILTERS);
    setCompareIds([]);
    setResetOpen(false);
    setBuyNowItems(null);
    setPromoDraft("");
    setPromoFeedback("");
    setAnnouncement("Data restored to its original state.");
    go("home");
  }
  function renderCards(products: Product[], limit?: number) {
    return (
      <div className={styles.productGrid}>
        {products.slice(0, limit).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            wished={commerce.wishlist.includes(product.id)}
            compared={compareIds.includes(product.id)}
            onOpen={() => openProduct(product)}
            onWish={() => toggleWish(product)}
            onQuickAdd={() => addItem(product)}
            onCompare={() => toggleCompare(product)}
          />
        ))}
      </div>
    );
  }
  function sectionHeader(
    kicker: string,
    title: string,
    action?: { label: string; run: () => void },
  ) {
    return (
      <div className={styles.sectionHeader}>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
        {action && (
          <button type="button" onClick={action.run}>
            {action.label} <ArrowRight size={15} />
          </button>
        )}
      </div>
    );
  }
  const totals = calculateTotals(
    commerce.cart,
    commerce.promo,
    DELIVERY_OPTIONS[0],
  );

  return (
    <main id="commerce-top" className={styles.storefront}>
      <a className={styles.skipLink} href="#store-content">
        Skip to store content
      </a>
      <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <div className={styles.conceptBar}>
        <div className={styles.shell}>
          <span>
            <b>ILBATECH</b>
            <i>E-Commerce Store</i>
          </span>
          <a href={getSitePath("/work")}>
            <ArrowLeft size={13} /> ILBATECH Work
          </a>
        </div>
      </div>
      <header className={styles.header}>
        <div className={`${styles.shell} ${styles.headerMain}`}>
          <button
            className={styles.mobileMenuButton}
            type="button"
            aria-label="Open store menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu />
          </button>
          <button
            className={styles.brand}
            type="button"
            onClick={() => go("home")}
            aria-label="ILBATECH home"
          >
            <span>I</span>
            <strong>ILBATECH</strong>
          </button>
          <form
            className={styles.searchBox}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              runSearch();
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search products"
              type="search"
              placeholder="Search products, categories and brands"
              value={queryDraft}
              onChange={(event) => {
                setQueryDraft(event.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() =>
                window.setTimeout(() => setSuggestionsOpen(false), 150)
              }
            />
            <button type="submit">Search</button>
            {suggestionsOpen && (
              <div className={styles.suggestions}>
                {queryDraft ? (
                  suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setQueryDraft(product.name);
                        runSearch(product.name);
                      }}
                    >
                      <Search size={14} />
                      <span>
                        <b>{product.name}</b>
                        <small>
                          {product.category} · {product.brand}
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div>
                    <small>Recent searches</small>
                    {commerce.recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQueryDraft(term);
                          runSearch(term);
                        }}
                      >
                        <Clock3 size={14} /> {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
          <nav
            className={styles.headerActions}
            aria-label="Customer navigation"
          >
            <button
              type="button"
              aria-label="Account"
              onClick={() => go("account")}
            >
              <CircleUserRound />
              <span>
                <small>Hello, Noura</small>Account
              </span>
            </button>
            <button
              type="button"
              aria-label="Returns & Orders"
              onClick={() => go("orders")}
            >
              <Package />
              <span>
                <small>Returns &</small>Orders
              </span>
            </button>
            <button
              type="button"
              onClick={() => go("wishlist")}
              aria-label={`Wishlist, ${commerce.wishlist.length} items`}
            >
              <Heart />
              <b>{commerce.wishlist.length}</b>
            </button>
            <button
              type="button"
              onClick={() => go("cart")}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart />
              <b>{cartCount}</b>
            </button>
          </nav>
        </div>
        <div className={styles.categoryBar}>
          <div className={styles.shell}>
            <button type="button" onClick={() => browseCategory("All")}>
              <Menu size={15} /> All products
            </button>
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => browseCategory(category)}
              >
                {category}
              </button>
            ))}
            <button type="button" onClick={() => go("deals")}>
              <Tag size={14} /> Deals
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className={styles.mobileMenu} aria-label="Mobile store menu">
            <button onClick={() => browseCategory("All")}>
              Browse all products
            </button>
            {CATEGORIES.map((category) => (
              <button key={category} onClick={() => browseCategory(category)}>
                {category}
              </button>
            ))}
            <button onClick={() => go("deals")}>Today&apos;s deals</button>
            <button onClick={() => go("orders")}>Orders & returns</button>
          </nav>
        )}
      </header>
      <div id="store-content">
        {screen === "home" && (
          <>
            <section className={styles.hero}>
              <div className={`${styles.shell} ${styles.heroGrid}`}>
                <div className={styles.heroCopy}>
                  <p className={styles.eyebrow}>
                    <Sparkles size={14} /> Shop by category
                  </p>
                  <h1>
                    Find what{" "}
                    <br />
                    <em>you need.</em>
                  </h1>
                  <p>
                    Browse technology, home, style, wellness, and office
                    essentials from independent brands.
                  </p>
                  <div>
                    <button type="button" onClick={() => browseCategory("All")}>
                      Shop the collection <ArrowRight size={16} />
                    </button>
                    <button type="button" onClick={() => go("deals")}>
                      View today&apos;s deals
                    </button>
                  </div>
                  <small>
                    <Truck size={14} /> Free standard delivery on eligible
                    orders
                  </small>
                </div>
                <div className={styles.heroVisual}>
                  <div className={styles.heroImage}>
                    <Image
                      src="/images/commerce/headphones.webp"
                      alt="Matte black Aura wireless headphones"
                      width={900}
                      height={675}
                      sizes="(max-width: 780px) 100vw, 48vw"
                      priority
                    />
                  </div>
                  <div className={styles.heroOffer}>
                    <span>Editor&apos;s pick</span>
                    <strong>Aura ANC Headphones</strong>
                    <p>Save $40 today</p>
                    <button
                      type="button"
                      onClick={() => openProduct(PRODUCTS[0])}
                    >
                      View product <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <section className={`${styles.shell} ${styles.categoriesSection}`}>
              {sectionHeader(
                "Shop by category",
                "Find your next everyday essential",
                {
                  label: "View all products",
                  run: () => browseCategory("All"),
                },
              )}
              <div className={styles.categoryGrid}>
                {CATEGORIES.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => browseCategory(category)}
                  >
                    <span>
                      <Image
                        src={CATEGORY_ART[category]}
                        alt=""
                        width={900}
                        height={675}
                        sizes="(max-width: 520px) 45vw, 150px"
                      />
                    </span>
                    <b>{category}</b>
                    <small>
                      {
                        PRODUCTS.filter(
                          (product) => product.category === category,
                        ).length
                      }{" "}
                      products
                    </small>
                  </button>
                ))}
              </div>
            </section>
            <section className={styles.homeSection}>
              <div className={styles.shell}>
                {sectionHeader("Handpicked", "Featured products", {
                  label: "Browse featured",
                  run: () => browseCategory("All"),
                })}
                {renderCards(
                  PRODUCTS.filter((product) => product.featured),
                  8,
                )}
              </div>
            </section>
            <section className={`${styles.shell} ${styles.promoBanner}`}>
              <div>
                <p>Weekend price edit</p>
                <h2>Better tools for everyday rituals.</h2>
                <span>
                  Save on select technology and home favorites through tonight.
                </span>
                <button type="button" onClick={() => go("deals")}>
                  Shop current offers <ArrowRight size={15} />
                </button>
              </div>
              <Image
                src="/images/commerce/espresso-detail.webp"
                alt="Cream espresso maker detail"
                width={900}
                height={675}
                sizes="(max-width: 760px) 100vw, 46vw"
              />
            </section>
            <section className={styles.homeSection}>
              <div className={styles.shell}>
                {sectionHeader("Loved by shoppers", "Best sellers")}
                {renderCards(
                  PRODUCTS.filter((product) => product.bestSeller),
                  4,
                )}
              </div>
            </section>
            <section className={styles.homeSection}>
              <div className={styles.shell}>
                {sectionHeader("Just landed", "New arrivals", {
                  label: "Shop newest",
                  run: () => {
                    setSort("newest");
                    browseCategory("All");
                  },
                })}
                {renderCards(
                  PRODUCTS.filter((product) => product.newArrival),
                  4,
                )}
              </div>
            </section>
            <section className={styles.homeSection}>
              <div className={styles.shell}>
                {sectionHeader("For you", "Recommended today")}
                {renderCards(
                  PRODUCTS.filter((product) =>
                    [
                      "aura-headphones",
                      "crema-espresso",
                      "trail-sneakers",
                      "forma-chair",
                    ].includes(product.id),
                  ),
                )}
              </div>
            </section>
            {commerce.recentlyViewed.length > 0 && (
              <section className={styles.homeSection}>
                <div className={styles.shell}>
                  {sectionHeader(
                    "Pick up where you left off",
                    "Recently viewed",
                  )}
                  {renderCards(
                    commerce.recentlyViewed.flatMap(
                      (id) => productById(id) ?? [],
                    ),
                    6,
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {screen === "catalog" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <button onClick={() => go("home")}>Home</button>
              <ChevronRight />
              {filters.category !== "All" && (
                <>
                  <button onClick={() => browseCategory(filters.category)}>
                    {filters.category}
                  </button>
                  <ChevronRight />
                </>
              )}
              <span>
                {query
                  ? `Results for “${query}”`
                  : filters.category === "All"
                    ? "All products"
                    : filters.category}
              </span>
            </nav>
            <div className={styles.catalogHeading}>
              <div>
                <p className={styles.eyebrow}>Shop products</p>
                <h1>
                  {query
                    ? `Search results for “${query}”`
                    : filters.category === "All"
                      ? "All products"
                      : filters.category}
                </h1>
                <span>{catalogProducts.length} matching products</span>
              </div>
              <button
                className={styles.mobileFilterButton}
                type="button"
                onClick={() => setFilterOpen(true)}
              >
                <Filter size={16} /> Filters
              </button>
            </div>
            {!query && filters.category !== "All" && (
              <div className={styles.subcategories}>
                {Array.from(
                  new Set(
                    PRODUCTS.filter(
                      (product) => product.category === filters.category,
                    ).map((product) =>
                      product.subcategory.split("·")[0].trim(),
                    ),
                  ),
                ).map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => {
                      setQuery(subcategory);
                      setQueryDraft(subcategory);
                    }}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.catalogLayout}>
              <aside
                className={`${styles.filters} ${filterOpen ? styles.filtersOpen : ""}`}
                aria-label="Product filters"
              >
                <div className={styles.filterMobileHeader}>
                  <b>Filters</b>
                  <button
                    type="button"
                    aria-label="Close filters"
                    onClick={() => setFilterOpen(false)}
                  >
                    <X />
                  </button>
                </div>
                <label>
                  Category
                  <select
                    value={filters.category}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        category: event.target
                          .value as ProductFilters["category"],
                      })
                    }
                  >
                    <option value="All">All categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Maximum price <b>{formatMoney(filters.maxPrice)}</b>
                  <input
                    type="range"
                    min="25"
                    max="1500"
                    step="25"
                    value={filters.maxPrice}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        maxPrice: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <fieldset>
                  <legend>Customer rating</legend>
                  {[4.5, 4, 3, 0].map((rating) => (
                    <label key={rating}>
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === rating}
                        onChange={() =>
                          setFilters({ ...filters, minRating: rating })
                        }
                      />
                      <Star size={13} fill="currentColor" />{" "}
                      {rating ? `${rating}+` : "Any rating"}
                    </label>
                  ))}
                </fieldset>
                <label>
                  Brand
                  <select
                    value={filters.brand}
                    onChange={(event) =>
                      setFilters({ ...filters, brand: event.target.value })
                    }
                  >
                    {BRANDS.map((brand) => (
                      <option key={brand}>{brand}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Delivery speed
                  <select
                    value={filters.delivery}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        delivery: event.target
                          .value as ProductFilters["delivery"],
                      })
                    }
                  >
                    <option>Any</option>
                    <option>Same-Day</option>
                    <option>Tomorrow</option>
                    <option>Standard</option>
                  </select>
                </label>
                <label className={styles.checkFilter}>
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        availableOnly: event.target.checked,
                      })
                    }
                  />{" "}
                  In stock only
                </label>
                <button
                  className={styles.clearButton}
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Clear all filters
                </button>
                <button
                  className={styles.applyMobileFilters}
                  type="button"
                  onClick={() => setFilterOpen(false)}
                >
                  Show {catalogProducts.length} products
                </button>
              </aside>
              <div className={styles.results}>
                <div className={styles.resultToolbar}>
                  <span>{catalogProducts.length} results</span>
                  <label>
                    Sort by
                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(event.target.value as SortOption)
                      }
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </label>
                </div>
                {catalogProducts.length ? (
                  <>
                    {renderCards(catalogProducts, visibleCount)}
                    {visibleCount < catalogProducts.length && (
                      <button
                        className={styles.loadMore}
                        type="button"
                        onClick={() => setVisibleCount((count) => count + 12)}
                      >
                        Load more products
                      </button>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Search />
                    <h2>No products found</h2>
                    <p>Try another search or clear the current filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setQueryDraft("");
                        setFilters(DEFAULT_FILTERS);
                      }}
                    >
                      Clear search & filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            {filterOpen && (
              <button
                className={styles.drawerBackdrop}
                aria-label="Close filters"
                onClick={() => setFilterOpen(false)}
              />
            )}
          </section>
        )}

        {screen === "product" && activeProduct && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <button onClick={() => go("home")}>Home</button>
              <ChevronRight />
              <button onClick={() => browseCategory(activeProduct.category)}>
                {activeProduct.category}
              </button>
              <ChevronRight />
              <button
                onClick={() => {
                  const subcategory = activeProduct.subcategory.split("·")[0];
                  setQuery(subcategory);
                  setQueryDraft(subcategory);
                  go("catalog");
                }}
              >
                {activeProduct.subcategory.split("·")[0]}
              </button>
              <ChevronRight />
              <span>{activeProduct.name}</span>
            </nav>
            <div className={styles.productDetail}>
              <div className={styles.gallery}>
                <div className={styles.thumbnails}>
                  {activeProduct.images.map((image, index) => (
                    <button
                      type="button"
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={galleryIndex === index}
                      onClick={() => setGalleryIndex(index)}
                      key={`${image}-${index}`}
                    >
                      <Image
                        src={image}
                        alt=""
                        width={900}
                        height={675}
                        sizes="76px"
                      />
                    </button>
                  ))}
                </div>
                <div className={styles.mainImage}>
                  <Image
                    src={
                      activeProduct.images[galleryIndex] ?? activeProduct.image
                    }
                    alt={activeProduct.imageAlt}
                    width={900}
                    height={675}
                    sizes="(max-width: 760px) 100vw, 48vw"
                  />
                </div>
              </div>
              <div className={styles.productSummary}>
                <p className={styles.eyebrow}>
                  {activeProduct.brand} · {activeProduct.subcategory}
                </p>
                <h1>{activeProduct.name}</h1>
                <div className={styles.reviewLine}>
                  <StarRating
                    rating={activeProduct.rating}
                    count={activeProduct.reviewCount}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("product-reviews")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Read reviews
                  </button>
                </div>
                <div className={styles.detailPrice}>
                  <strong>
                    {formatMoney(
                      productUnitPrice(activeProduct, selectedVariants),
                    )}
                  </strong>
                  {activeProduct.originalPrice && (
                    <>
                      <s>{formatMoney(activeProduct.originalPrice)}</s>
                      <span>
                        Save{" "}
                        {formatMoney(
                          activeProduct.originalPrice - activeProduct.price,
                        )}
                      </span>
                    </>
                  )}
                </div>
                <p className={styles.productDescription}>
                  {activeProduct.description}
                </p>
                <div className={styles.fulfillment}>
                  <p>
                    <Truck />
                    <span>
                      <b>{activeProduct.delivery} delivery</b>
                      <small>Order within 4 hrs 18 min</small>
                    </span>
                  </p>
                  <p>
                    <RotateCcw />
                    <span>
                      <b>30-day returns</b>
                      <small>Easy 30-day return process</small>
                    </span>
                  </p>
                </div>
                {activeProduct.variants.map((group) => (
                  <fieldset className={styles.variantGroup} key={group.name}>
                    <legend>
                      {group.name}: <b>{selectedVariants[group.name]}</b>
                    </legend>
                    <div>
                      {group.options.map((option) => (
                        <button
                          type="button"
                          key={option.label}
                          disabled={!option.available}
                          aria-pressed={
                            selectedVariants[group.name] === option.label
                          }
                          onClick={() =>
                            chooseVariant(group.name, option.label)
                          }
                        >
                          {option.label}
                          {option.priceDelta > 0 && (
                            <small>+{formatMoney(option.priceDelta)}</small>
                          )}
                          {!option.available && <small>Unavailable</small>}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <p
                  className={
                    activeProduct.stock === 0
                      ? styles.outStock
                      : activeProduct.stock <= 3
                        ? styles.lowStock
                        : styles.inStock
                  }
                >
                  {activeProduct.stock === 0
                    ? "Out of stock"
                    : activeProduct.stock <= 3
                      ? `Only ${activeProduct.stock} left in stock`
                      : "In stock and ready to ship"}
                </p>
                <div className={styles.purchaseRow}>
                  <div className={styles.quantity}>
                    <button
                      type="button"
                      disabled={quantity === 1}
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                    >
                      <Minus />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      disabled={
                        activeProduct.stock === 0 ||
                        quantity >= activeProduct.stock
                      }
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity((value) =>
                          Math.min(activeProduct.stock, value + 1),
                        )
                      }
                    >
                      <Plus />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={
                      !variantIsAvailable(activeProduct, selectedVariants)
                    }
                    onClick={() =>
                      addItem(activeProduct, selectedVariants, quantity)
                    }
                  >
                    <ShoppingCart size={17} /> Add to cart
                  </button>
                  <button
                    type="button"
                    disabled={
                      !variantIsAvailable(activeProduct, selectedVariants)
                    }
                    onClick={() =>
                      startCheckout([
                        makeCartItem(
                          activeProduct.id,
                          selectedVariants,
                          quantity,
                        ),
                      ])
                    }
                  >
                    Buy now
                  </button>
                </div>
                <div className={styles.detailActions}>
                  <button
                    type="button"
                    aria-pressed={commerce.wishlist.includes(activeProduct.id)}
                    onClick={() => toggleWish(activeProduct)}
                  >
                    <Heart
                      size={16}
                      fill={
                        commerce.wishlist.includes(activeProduct.id)
                          ? "currentColor"
                          : "none"
                      }
                    />{" "}
                    {commerce.wishlist.includes(activeProduct.id)
                      ? "In wishlist"
                      : "Add to wishlist"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={compareIds.includes(activeProduct.id)}
                    onClick={() => toggleCompare(activeProduct)}
                  >
                    <Scale size={16} />{" "}
                    {compareIds.includes(activeProduct.id)
                      ? "Added to compare"
                      : "Compare"}
                  </button>
                </div>
                <div className={styles.sellerBox}>
                  <Store />
                  <div>
                    <span>
                      Sold by <b>{activeProduct.seller}</b>
                    </span>
                    <span>
                      Fulfilled by <b>ILBATECH</b>
                    </span>
                    <span>
                      Seller rating <b>{activeProduct.sellerRating} / 5</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.productInformation}>
              <article>
                <p className={styles.eyebrow}>Product details</p>
                <h2>Everyday features</h2>
                <p>{activeProduct.details}</p>
                <div className={styles.returnPromise}>
                  <ShieldCheck />
                  <span>
                    <b>Simple, flexible returns</b>
                    <small>
                      Eligible items can be returned within 30 days from your
                      account.
                    </small>
                  </span>
                </div>
              </article>
              <article>
                <p className={styles.eyebrow}>Specifications</p>
                <dl>
                  {activeProduct.specs.map(([term, value]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
            {activeProduct.bundleIds.length > 0 && (
              <section className={styles.bundle}>
                <div>
                  <p className={styles.eyebrow}>Complete the setup</p>
                  <h2>Frequently bought together</h2>
                </div>
                <div className={styles.bundleItems}>
                  {[
                    activeProduct,
                    ...activeProduct.bundleIds.flatMap(
                      (id) => productById(id) ?? [],
                    ),
                  ].map((product, index) => (
                    <div key={product.id}>
                      {index > 0 && <Plus />}
                      <span>
                        <Image
                          src={product.image}
                          alt=""
                          width={900}
                          height={675}
                          sizes="100px"
                        />
                      </span>
                      <p>
                        <b>{product.name}</b>
                        <small>{formatMoney(product.price)}</small>
                      </p>
                    </div>
                  ))}
                </div>
                <div className={styles.bundleAction}>
                  <strong>
                    {formatMoney(
                      [
                        activeProduct,
                        ...activeProduct.bundleIds.flatMap(
                          (id) => productById(id) ?? [],
                        ),
                      ].reduce((sum, product) => sum + product.price, 0),
                    )}
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      [
                        activeProduct,
                        ...activeProduct.bundleIds.flatMap(
                          (id) => productById(id) ?? [],
                        ),
                      ].forEach((product) => addItem(product))
                    }
                  >
                    Add all to cart
                  </button>
                </div>
              </section>
            )}
            <section id="product-reviews" className={styles.reviewsSection}>
              <div className={styles.reviewOverview}>
                <p className={styles.eyebrow}>Customer feedback</p>
                <h2>Reviews & ratings</h2>
                <strong>{activeProduct.rating}</strong>
                <StarRating rating={activeProduct.rating} />
                <small>
                  Based on {activeProduct.reviewCount.toLocaleString()} reviews
                </small>
                <div>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <p key={star}>
                      <span>{star}★</span>
                      <i>
                        <b
                          style={{
                            width: `${star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : 2}%`,
                          }}
                        />
                      </i>
                      <small>
                        {star === 5
                          ? "68%"
                          : star === 4
                            ? "22%"
                            : star === 3
                              ? "7%"
                              : "2%"}
                      </small>
                    </p>
                  ))}
                </div>
              </div>
              <div className={styles.reviewList}>
                {activeProduct.reviews.map((review) => (
                  <article key={`${review.name}-${review.date}`}>
                    <StarRating rating={review.rating} compact />
                    <h3>{review.title}</h3>
                    <p>{review.text}</p>
                    <footer>
                      <b>{review.name}</b>
                      {review.verified && (
                        <span>
                          <CheckCircle2 /> Verified purchase
                        </span>
                      )}
                      <small>{review.date}</small>
                    </footer>
                  </article>
                ))}
              </div>
            </section>
            <section className={styles.qaSection}>
              <p className={styles.eyebrow}>Product Q&A</p>
              <h2>Questions from shoppers</h2>
              {activeProduct.questions.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <Plus />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </section>
            <section className={styles.homeSection}>
              {sectionHeader("Keep exploring", "Customers also viewed")}
              {renderCards(
                activeProduct.relatedIds.flatMap((id) => productById(id) ?? []),
              )}
            </section>
          </section>
        )}

        {screen === "wishlist" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            {sectionHeader(
              "Saved for later",
              `Your wishlist (${commerce.wishlist.length})`,
            )}
            {commerce.wishlist.length ? (
              <div className={styles.productGrid}>
                {commerce.wishlist
                  .flatMap((id) => productById(id) ?? [])
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wished
                      compared={compareIds.includes(product.id)}
                      onOpen={() => openProduct(product)}
                      onWish={() => toggleWish(product)}
                      onQuickAdd={() => {
                        addItem(product);
                        patchCommerce({
                          wishlist: commerce.wishlist.filter(
                            (id) => id !== product.id,
                          ),
                        });
                        setAnnouncement(
                          `${product.name} moved from wishlist to cart.`,
                        );
                      }}
                      onCompare={() => toggleCompare(product)}
                    />
                  ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Heart />
                <h2>Your wishlist is ready for ideas.</h2>
                <p>
                  Save products as you browse, then move them to your cart
                  anytime.
                </p>
                <button onClick={() => browseCategory("All")}>
                  Browse products
                </button>
              </div>
            )}
          </section>
        )}

        {screen === "cart" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            {sectionHeader(
              "Shopping bag",
              `Your cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`,
            )}
            {commerce.cart.length ? (
              <div className={styles.cartLayout}>
                <div>
                  <div className={styles.cartItems}>
                    {commerce.cart.map((item) => {
                      const product = productById(item.productId);
                      if (!product) return null;
                      return (
                        <article key={item.key} className={styles.cartItem}>
                          <button
                            className={styles.cartImage}
                            type="button"
                            onClick={() => openProduct(product)}
                          >
                            <Image
                              src={product.image}
                              alt={product.imageAlt}
                              width={900}
                              height={675}
                              sizes="130px"
                            />
                          </button>
                          <div className={styles.cartInfo}>
                            <p>{product.brand}</p>
                            <button
                              type="button"
                              onClick={() => openProduct(product)}
                            >
                              <h2>{product.name}</h2>
                            </button>
                            <span className={styles.inStock}>
                              In stock · {product.delivery}
                            </span>
                            <div className={styles.cartVariants}>
                              {product.variants.map((group) => (
                                <label key={group.name}>
                                  {group.name}
                                  <select
                                    value={item.selections[group.name]}
                                    onChange={(event) =>
                                      updateCartVariant(
                                        item,
                                        group.name,
                                        event.target.value,
                                      )
                                    }
                                  >
                                    {group.options.map((option) => (
                                      <option
                                        key={option.label}
                                        disabled={!option.available}
                                        value={option.label}
                                      >
                                        {option.label}
                                        {!option.available
                                          ? " — unavailable"
                                          : ""}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              ))}
                            </div>
                            <div className={styles.cartControls}>
                              <div className={styles.quantity}>
                                <button
                                  type="button"
                                  disabled={item.quantity === 1}
                                  aria-label={`Decrease ${product.name} quantity`}
                                  onClick={() =>
                                    updateCartQuantity(item.key, -1)
                                  }
                                >
                                  <Minus />
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`Increase ${product.name} quantity`}
                                  onClick={() =>
                                    updateCartQuantity(item.key, 1)
                                  }
                                >
                                  <Plus />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => saveForLater(item)}
                              >
                                Save for later
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!commerce.wishlist.includes(product.id))
                                    toggleWish(product);
                                  removeCartItem(item.key);
                                }}
                              >
                                Move to wishlist
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCartItem(item.key)}
                              >
                                <Trash2 /> Remove
                              </button>
                            </div>
                          </div>
                          <strong>
                            {formatMoney(
                              productUnitPrice(product, item.selections) *
                                item.quantity,
                            )}
                          </strong>
                        </article>
                      );
                    })}
                  </div>
                  {commerce.savedForLater.length > 0 && (
                    <div className={styles.savedSection}>
                      <h2>Saved for later ({commerce.savedForLater.length})</h2>
                      {commerce.savedForLater.map((item) => {
                        const product = productById(item.productId);
                        if (!product) return null;
                        return (
                          <article key={item.key}>
                            <Image
                              src={product.image}
                              alt=""
                              width={900}
                              height={675}
                              sizes="90px"
                            />
                            <div>
                              <b>{product.name}</b>
                              <small>
                                {formatMoney(
                                  productUnitPrice(product, item.selections),
                                )}
                              </small>
                              <button onClick={() => restoreSaved(item)}>
                                Move to cart
                              </button>
                              <button
                                onClick={() =>
                                  patchCommerce({
                                    savedForLater:
                                      commerce.savedForLater.filter(
                                        (entry) => entry.key !== item.key,
                                      ),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
                <aside className={styles.orderSummary}>
                  <h2>Order summary</h2>
                  <label>
                    Promotion code
                    <div>
                      <input
                        value={promoDraft}
                        onChange={(event) => setPromoDraft(event.target.value)}
                        placeholder="WELCOME10"
                      />
                      <button type="button" onClick={applyPromo}>
                        Apply
                      </button>
                    </div>
                  </label>
                  {promoFeedback && (
                    <p
                      className={
                        promoFeedback.includes("applied")
                          ? styles.promoSuccess
                          : styles.promoError
                      }
                    >
                      {promoFeedback}
                    </p>
                  )}
                  <dl>
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatMoney(totals.subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Discount</dt>
                      <dd>
                        {totals.discount
                          ? `−${formatMoney(totals.discount)}`
                          : formatMoney(0)}
                      </dd>
                    </div>
                    <div>
                      <dt>Standard delivery</dt>
                      <dd>
                        {totals.shipping
                          ? formatMoney(totals.shipping)
                          : "FREE"}
                      </dd>
                    </div>
                    <div>
                      <dt>Estimated tax</dt>
                      <dd>{formatMoney(totals.tax)}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd>{formatMoney(totals.total)}</dd>
                    </div>
                  </dl>
                  <button type="button" onClick={() => startCheckout()}>
                    Proceed to checkout <ArrowRight />
                  </button>
                  <p>
                    <ShieldCheck /> Safe, simulated checkout. No payment is
                    processed.
                  </p>
                </aside>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <ShoppingCart />
                <h2>Your cart is empty.</h2>
                <p>Browse products and add an item to your cart.</p>
                <button onClick={() => browseCategory("All")}>
                  Continue shopping
                </button>
              </div>
            )}
          </section>
        )}

        {screen === "checkout" && (
          <section className={`${styles.shell} ${styles.checkoutPage}`}>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => go(buyNowItems ? "product" : "cart")}
            >
              <ArrowLeft /> Back
            </button>
            <div className={styles.checkoutHeader}>
              <div>
                <p className={styles.eyebrow}>Checkout</p>
                <h1>Complete your order</h1>
              </div>
              <span>
                <ShieldCheck /> Demo payment only
              </span>
            </div>
            <StepTrail current={checkoutStep} />
            <div className={styles.checkoutLayout}>
              <div className={styles.checkoutCard}>
                <div className={styles.accountChoice}>
                  <button
                    type="button"
                    aria-pressed={commerce.accountMode === "Account"}
                    onClick={() => patchCommerce({ accountMode: "Account" })}
                  >
                    <CircleUserRound /> Noura&apos;s account
                    <small>Use saved addresses and order history</small>
                  </button>
                  <button
                    type="button"
                    aria-pressed={commerce.accountMode === "Guest"}
                    onClick={() => patchCommerce({ accountMode: "Guest" })}
                  >
                    <Package /> Continue as guest
                    <small>No account creation required</small>
                  </button>
                </div>
                {checkoutStep === 0 && (
                  <div>
                    <div className={styles.checkoutTitle}>
                      <div>
                        <span>01</span>
                        <h2>Delivery address</h2>
                      </div>
                      <button type="button" onClick={() => beginAddress()}>
                        + Add address
                      </button>
                    </div>
                    <div className={styles.addressGrid}>
                      {commerce.addresses.map((address) => (
                        <label
                          className={
                            checkoutAddressId === address.id
                              ? styles.selectedBox
                              : ""
                          }
                          key={address.id}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={checkoutAddressId === address.id}
                            onChange={() => setCheckoutAddressId(address.id)}
                          />
                          <span>
                            <b>
                              {address.label}
                              {address.isDefault && <small>Default</small>}
                            </b>
                            <strong>{address.name}</strong>
                            <em>
                              {address.line1}
                              <br />
                              {address.city}
                              <br />
                              {address.phone}
                            </em>
                            <i>
                              <button
                                type="button"
                                onClick={() => beginAddress(address)}
                              >
                                Edit
                              </button>
                              {!address.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => setDefaultAddress(address.id)}
                                >
                                  Make default
                                </button>
                              )}
                            </i>
                          </span>
                        </label>
                      ))}
                    </div>
                    {addressEditor && (
                      <AddressEditor
                        draft={addressDraft}
                        setDraft={setAddressDraft}
                        isNew={addressEditor === "new"}
                        onSave={saveAddress}
                        onCancel={() => setAddressEditor(null)}
                      />
                    )}
                  </div>
                )}
                {checkoutStep === 1 && (
                  <div>
                    <div className={styles.checkoutTitle}>
                      <div>
                        <span>02</span>
                        <h2>Delivery speed</h2>
                      </div>
                    </div>
                    <div className={styles.deliveryOptions}>
                      {DELIVERY_OPTIONS.map((option) => (
                        <label
                          className={
                            deliveryId === option.id ? styles.selectedBox : ""
                          }
                          key={option.id}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            checked={deliveryId === option.id}
                            onChange={() => setDeliveryId(option.id)}
                          />
                          <Truck />
                          <span>
                            <b>{option.name}</b>
                            <small>{option.estimate}</small>
                          </span>
                          <strong>
                            {option.price ? formatMoney(option.price) : "FREE"}
                          </strong>
                        </label>
                      ))}
                    </div>
                    <p className={styles.demoNote}>
                      <Zap /> Delivery options and estimates are simulated.
                    </p>
                  </div>
                )}
                {checkoutStep === 2 && (
                  <div>
                    <div className={styles.checkoutTitle}>
                      <div>
                        <span>03</span>
                        <h2>Payment method</h2>
                      </div>
                    </div>
                    <div className={styles.paymentOptions}>
                      {(
                        [
                          "Card",
                          "Digital Wallet",
                          "Cash on Delivery",
                        ] as PaymentMethod[]
                      ).map((method) => (
                        <label
                          className={
                            paymentMethod === method ? styles.selectedBox : ""
                          }
                          key={method}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === method}
                            onChange={() => {
                              setPaymentMethod(method);
                              setPaymentError("");
                            }}
                          />
                          {method === "Card" ? (
                            <CreditCard />
                          ) : method === "Digital Wallet" ? (
                            <WalletCards />
                          ) : (
                            <PackageCheck />
                          )}
                          <span>
                            <b>
                              {method === "Card"
                                ? "Credit / Debit Card"
                                : method === "Digital Wallet"
                                  ? "Generic Digital Wallet"
                                  : method}
                            </b>
                            <small>
                              {method === "Card"
                                ? "Use the test card below"
                                : method === "Digital Wallet"
                                  ? "Simulated wallet approval"
                                  : "Pay when the order arrives"}
                            </small>
                          </span>
                        </label>
                      ))}
                    </div>
                    {paymentMethod === "Card" && (
                      <div className={styles.cardForm}>
                        <div className={styles.safeCard}>
                          <ShieldCheck />
                          <p>
                            <b>Test card</b>
                            <span>4242 4242 4242 4242</span>
                          </p>
                          <small>No payment is processed or stored.</small>
                        </div>
                        <label>
                          Card number
                          <input
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            onChange={(event) =>
                              setCard({ ...card, number: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          Cardholder name
                          <input
                            autoComplete="off"
                            placeholder="Alex Morgan"
                            value={card.name}
                            onChange={(event) =>
                              setCard({ ...card, name: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          Expiry
                          <input
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="12/29"
                            value={card.expiry}
                            onChange={(event) =>
                              setCard({ ...card, expiry: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          CVV
                          <input
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="123"
                            value={card.cvv}
                            onChange={(event) =>
                              setCard({ ...card, cvv: event.target.value })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
                {checkoutStep === 3 && (
                  <div>
                    <div className={styles.checkoutTitle}>
                      <div>
                        <span>04</span>
                        <h2>Review your order</h2>
                      </div>
                    </div>
                    <div className={styles.reviewOrderItems}>
                      {checkoutItems.map((item) => {
                        const product = productById(item.productId);
                        if (!product) return null;
                        return (
                          <article key={item.key}>
                            <Image
                              src={product.image}
                              alt=""
                              width={900}
                              height={675}
                              sizes="82px"
                            />
                            <div>
                              <b>{product.name}</b>
                              <small>
                                {Object.entries(item.selections)
                                  .map(([name, value]) => `${name}: ${value}`)
                                  .join(" · ")}{" "}
                                · Qty {item.quantity}
                              </small>
                              <span>{optionLabel(item, product)}</span>
                            </div>
                            <strong>
                              {formatMoney(
                                productUnitPrice(product, item.selections) *
                                  item.quantity,
                              )}
                            </strong>
                          </article>
                        );
                      })}
                    </div>
                    <div className={styles.reviewDetails}>
                      <article>
                        <MapPin />
                        <div>
                          <b>Deliver to {selectedAddress?.label}</b>
                          <span>
                            {selectedAddress?.line1}, {selectedAddress?.city}
                          </span>
                        </div>
                        <button onClick={() => setCheckoutStep(0)}>
                          Change
                        </button>
                      </article>
                      <article>
                        <Truck />
                        <div>
                          <b>{selectedDelivery.name}</b>
                          <span>{selectedDelivery.estimate}</span>
                        </div>
                        <button onClick={() => setCheckoutStep(1)}>
                          Change
                        </button>
                      </article>
                      <article>
                        <CreditCard />
                        <div>
                          <b>{paymentMethod}</b>
                          <span>
                            {paymentMethod === "Card"
                              ? "Test card ending 4242"
                              : "Simulated payment"}
                          </span>
                        </div>
                        <button onClick={() => setCheckoutStep(2)}>
                          Change
                        </button>
                      </article>
                    </div>
                    <div className={styles.placeOrderNotice}>
                      <ShieldCheck />
                      <p>
                        <b>This is a simulation.</b>
                        <span>
                          Placing the order saves it in this browser. No charge
                          or external request occurs.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                {paymentError && (
                  <p className={styles.formError} role="alert">
                    {paymentError}
                  </p>
                )}
                <div className={styles.checkoutNav}>
                  {checkoutStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStep((step) => step - 1)}
                    >
                      <ArrowLeft /> Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={checkoutStep === 3 ? placeOrder : continueCheckout}
                  >
                    {checkoutStep === 3 ? "Place simulated order" : "Continue"}{" "}
                    <ArrowRight />
                  </button>
                </div>
              </div>
              <aside className={styles.orderSummary}>
                <h2>Order summary</h2>
                <span>
                  {checkoutItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </span>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(checkoutTotals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Discount</dt>
                    <dd>
                      {checkoutTotals.discount
                        ? `−${formatMoney(checkoutTotals.discount)}`
                        : formatMoney(0)}
                    </dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>
                      {checkoutTotals.shipping
                        ? formatMoney(checkoutTotals.shipping)
                        : "FREE"}
                    </dd>
                  </div>
                  <div>
                    <dt>Estimated tax</dt>
                    <dd>{formatMoney(checkoutTotals.tax)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatMoney(checkoutTotals.total)}</dd>
                  </div>
                </dl>
                {commerce.promo && (
                  <p className={styles.promoSuccess}>
                    <Check /> {commerce.promo} applied
                  </p>
                )}
              </aside>
            </div>
          </section>
        )}

        {screen === "confirmation" && selectedOrder && (
          <section className={`${styles.shell} ${styles.confirmationPage}`}>
            <div className={styles.confirmIcon}>
              <Check />
            </div>
            <p className={styles.eyebrow}>Order confirmed</p>
            <h1>Thank you, Noura.</h1>
            <p>
              Order <b>{selectedOrder.id}</b> is ready to review. No payment
              was processed and nothing will be shipped.
            </p>
            <div className={styles.confirmMeta}>
              <span>
                <b>Estimated arrival</b>
                {selectedOrder.arrival}
              </span>
              <span>
                <b>Delivery to</b>
                {selectedOrder.address.label} · {selectedOrder.address.city}
              </span>
              <span>
                <b>Order total</b>
                {formatMoney(selectedOrder.totals.total)}
              </span>
            </div>
            <div className={styles.confirmItems}>
              {selectedOrder.items.map((item) => {
                const product = productById(item.productId);
                return product ? (
                  <Image
                    key={item.key}
                    src={product.image}
                    alt={product.imageAlt}
                    width={900}
                    height={675}
                    sizes="110px"
                  />
                ) : null;
              })}
            </div>
            <div className={styles.confirmActions}>
              <button type="button" onClick={() => go("tracking")}>
                Track order <Truck />
              </button>
              <button type="button" onClick={() => go("order-detail")}>
                View order
              </button>
              <button type="button" onClick={() => go("home")}>
                Continue shopping
              </button>
            </div>
          </section>
        )}

        {screen === "tracking" && selectedOrder && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            <button className={styles.backButton} onClick={() => go("orders")}>
              <ArrowLeft /> All orders
            </button>
            <div className={styles.trackingHeader}>
              <div>
                <p className={styles.eyebrow}>Package tracking</p>
                <h1>{selectedOrder.id}</h1>
                <span>{selectedOrder.trackingRef} · Delivery carrier</span>
              </div>
              <div>
                <b>
                  {selectedOrder.statusIndex >= 5
                    ? "Delivered"
                    : selectedOrder.arrival}
                </b>
                <small>Latest simulated estimate</small>
              </div>
            </div>
            <div className={styles.trackingCard}>
              <ol>
                {TRACKING_STAGES.map((stage, index) => (
                  <li
                    className={
                      index <= selectedOrder.statusIndex
                        ? styles.trackingDone
                        : ""
                    }
                    key={stage}
                  >
                    <span>
                      {index < selectedOrder.statusIndex ? (
                        <Check />
                      ) : index === selectedOrder.statusIndex ? (
                        <Package />
                      ) : null}
                    </span>
                    <div>
                      <b>{stage}</b>
                      <small>
                        {index <= selectedOrder.statusIndex
                          ? index === selectedOrder.statusIndex
                            ? "Current status · August 30, 2026"
                            : `Completed · ${9 + index}:2${index} AM`
                          : "Pending"}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className={styles.trackingMap}>
                <div>
                  <Truck />
                  <span />
                </div>
                <p>
                  <b>{TRACKING_STAGES[selectedOrder.statusIndex]}</b>
                  <small>
                    Use the status control to move this order through each
                    delivery stage.
                  </small>
                </p>
                {selectedOrder.statusIndex < 5 && (
                  <button
                    type="button"
                    onClick={() => advanceTracking(selectedOrder)}
                  >
                    Advance status <ArrowRight />
                  </button>
                )}
              </div>
            </div>
            <div className={styles.trackingActions}>
              <button onClick={() => go("order-detail")}>
                View order details
              </button>
              {selectedOrder.statusIndex >= 5 && (
                <button
                  onClick={() => {
                    setReturnDraft({
                      itemKey: selectedOrder.items[0]?.key ?? "",
                      quantity: 1,
                      reason: "",
                      method: "",
                    });
                    go("return");
                  }}
                >
                  Start a return
                </button>
              )}
            </div>
          </section>
        )}

        {screen === "orders" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            {sectionHeader("Account", "Orders & returns")}
            <div className={styles.orderFilters}>
              <button className={styles.activePill}>All orders</button>
              <button>In progress</button>
              <button>Delivered</button>
              <button>Returns</button>
            </div>
            <div className={styles.orderList}>
              {commerce.orders.map((order) => (
                <article className={styles.orderCard} key={order.id}>
                  <header>
                    <div>
                      <small>Order placed</small>
                      <b>{order.date}</b>
                    </div>
                    <div>
                      <small>Total</small>
                      <b>{formatMoney(order.totals.total)}</b>
                    </div>
                    <div>
                      <small>Order</small>
                      <b>{order.id}</b>
                    </div>
                    <span data-status={order.status}>{order.status}</span>
                  </header>
                  <div>
                    {order.items.map((item) => {
                      const product = productById(item.productId);
                      return product ? (
                        <div className={styles.orderProduct} key={item.key}>
                          <Image
                            src={product.image}
                            alt=""
                            width={900}
                            height={675}
                            sizes="96px"
                          />
                          <span>
                            <b>{product.name}</b>
                            <small>
                              {Object.values(item.selections).join(" · ")} · Qty{" "}
                              {item.quantity}
                            </small>
                          </span>
                        </div>
                      ) : null;
                    })}
                    <div className={styles.orderButtons}>
                      <button
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          go("order-detail");
                        }}
                      >
                        View order
                      </button>
                      {order.status !== "Cancelled" && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            go("tracking");
                          }}
                        >
                          Track package
                        </button>
                      )}
                      <button onClick={() => buyAgain(order)}>Buy again</button>
                      {canReturnOrder(order) && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setReturnDraft({
                              itemKey: order.items[0]?.key ?? "",
                              quantity: 1,
                              reason: "",
                              method: "",
                            });
                            go("return");
                          }}
                        >
                          Return item
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {screen === "order-detail" && selectedOrder && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            <button className={styles.backButton} onClick={() => go("orders")}>
              <ArrowLeft /> Orders
            </button>
            <div className={styles.orderDetailHeader}>
              <div>
                <p className={styles.eyebrow}>Order details</p>
                <h1>{selectedOrder.id}</h1>
                <span>Placed {selectedOrder.date}</span>
              </div>
              <span data-status={selectedOrder.status}>
                {selectedOrder.status}
              </span>
            </div>
            {selectedOrder.returnRequest && (
              <div className={styles.returnSuccess}>
                <CheckCircle2 />
                <div>
                  <b>Return requested</b>
                  <span>
                    Return {selectedOrder.returnRequest.id} ·{" "}
                    {selectedOrder.returnRequest.method} ·{" "}
                    {selectedOrder.returnRequest.reason}
                  </span>
                </div>
              </div>
            )}
            <div className={styles.orderDetailLayout}>
              <div>
                <div className={styles.orderDetailItems}>
                  {selectedOrder.items.map((item) => {
                    const product = productById(item.productId);
                    return product ? (
                      <article key={item.key}>
                        <Image
                          src={product.image}
                          alt={product.imageAlt}
                          width={900}
                          height={675}
                          sizes="130px"
                        />
                        <div>
                          <h2>{product.name}</h2>
                          <p>
                            {Object.entries(item.selections)
                              .map(([name, value]) => `${name}: ${value}`)
                              .join(" · ")}
                          </p>
                          <span>Quantity {item.quantity}</span>
                          <button onClick={() => openProduct(product)}>
                            View product
                          </button>
                        </div>
                        <strong>
                          {formatMoney(
                            productUnitPrice(product, item.selections) *
                              item.quantity,
                          )}
                        </strong>
                      </article>
                    ) : null;
                  })}
                </div>
                <div className={styles.orderDetailActions}>
                  <button onClick={() => buyAgain(selectedOrder)}>
                    Buy again
                  </button>
                  {canReturnOrder(selectedOrder) && (
                    <button
                      onClick={() => {
                        setReturnDraft({
                          itemKey: selectedOrder.items[0]?.key ?? "",
                          quantity: 1,
                          reason: "",
                          method: "",
                        });
                        go("return");
                      }}
                    >
                      Return item
                    </button>
                  )}
                  {canCancelOrder(selectedOrder) && (
                    <button onClick={() => cancelEligible(selectedOrder)}>
                      Cancel order
                    </button>
                  )}
                  {selectedOrder.status !== "Cancelled" && (
                    <button onClick={() => go("tracking")}>
                      Track package
                    </button>
                  )}
                </div>
              </div>
              <aside className={styles.orderFacts}>
                <h2>Order information</h2>
                <div>
                  <MapPin />
                  <span>
                    <b>Delivery address</b>
                    {selectedOrder.address.name}
                    <br />
                    {selectedOrder.address.line1}
                    <br />
                    {selectedOrder.address.city}
                  </span>
                </div>
                <div>
                  <Truck />
                  <span>
                    <b>Delivery method</b>
                    {selectedOrder.delivery.name}
                    <br />
                    {selectedOrder.delivery.estimate}
                  </span>
                </div>
                <div>
                  <CreditCard />
                  <span>
                    <b>Payment</b>
                    {selectedOrder.paymentMethod}
                    <br />
                    Simulated payment
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(selectedOrder.totals.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Discount</dt>
                    <dd>−{formatMoney(selectedOrder.totals.discount)}</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>
                      {selectedOrder.totals.shipping
                        ? formatMoney(selectedOrder.totals.shipping)
                        : "FREE"}
                    </dd>
                  </div>
                  <div>
                    <dt>Tax</dt>
                    <dd>{formatMoney(selectedOrder.totals.tax)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatMoney(selectedOrder.totals.total)}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </section>
        )}

        {screen === "return" && selectedOrder && (
          <section className={`${styles.shell} ${styles.narrowPage}`}>
            <button
              className={styles.backButton}
              onClick={() => go("order-detail")}
            >
              <ArrowLeft /> Order details
            </button>
            <p className={styles.eyebrow}>Return request</p>
            <h1>Return an item</h1>
            <p>
              Select an eligible item and how you would like to send it back.
              This does not create a shipping request.
            </p>
            <div className={styles.returnForm}>
              <label>
                Item
                <select
                  value={returnDraft.itemKey}
                  onChange={(event) =>
                    setReturnDraft({
                      ...returnDraft,
                      itemKey: event.target.value,
                    })
                  }
                >
                  {selectedOrder.items.map((item) => (
                    <option key={item.key} value={item.key}>
                      {productById(item.productId)?.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  max={
                    selectedOrder.items.find(
                      (item) => item.key === returnDraft.itemKey,
                    )?.quantity ?? 1
                  }
                  value={returnDraft.quantity}
                  onChange={(event) =>
                    setReturnDraft({
                      ...returnDraft,
                      quantity: Number(event.target.value),
                    })
                  }
                />
              </label>
              <fieldset>
                <legend>Reason for return</legend>
                {[
                  "Wrong item",
                  "Damaged",
                  "No longer needed",
                  "Not as expected",
                  "Other",
                ].map((reason) => (
                  <label key={reason}>
                    <input
                      type="radio"
                      name="reason"
                      checked={returnDraft.reason === reason}
                      onChange={() =>
                        setReturnDraft({ ...returnDraft, reason })
                      }
                    />
                    {reason}
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Return method</legend>
                {["Drop-off", "Pickup"].map((method) => (
                  <label
                    className={
                      returnDraft.method === method ? styles.selectedBox : ""
                    }
                    key={method}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={returnDraft.method === method}
                      onChange={() =>
                        setReturnDraft({ ...returnDraft, method })
                      }
                    />
                    <PackageCheck />
                    <span>
                      <b>{method}</b>
                      <small>
                        {method === "Drop-off"
                          ? "Leave at a nearby partner point"
                          : "Schedule a simulated home pickup"}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              <button type="button" onClick={submitReturn}>
                Request simulated return
              </button>
            </div>
          </section>
        )}

        {screen === "deals" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            <div className={styles.dealsHero}>
              <div>
                <p className={styles.eyebrow}>
                  <Zap /> Today&apos;s deals
                </p>
                <h1>
                  Useful things,
                  <br />
                  better prices.
                </h1>
                <p>
                  Limited-time offers across technology, home,
                  fashion, and more.
                </p>
                <span>
                  <Clock3 /> Ends tonight · 06h 42m
                </span>
              </div>
              <Image
                src="/images/commerce/kettle.webp"
                alt="Sage green pour-over kettle"
                width={900}
                height={675}
                sizes="(max-width: 760px) 100vw, 44vw"
              />
            </div>
            {sectionHeader(
              "Current offers",
              `${PRODUCTS.filter((product) => product.originalPrice).length} products on sale`,
            )}
            {renderCards(PRODUCTS.filter((product) => product.originalPrice))}
          </section>
        )}

        {screen === "compare" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            {sectionHeader(
              "Side by side",
              `Compare products (${compareIds.length}/3)`,
            )}
            {compareIds.length ? (
              <div className={styles.compareWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      {compareIds.map((id) => {
                        const product = productById(id)!;
                        return (
                          <th key={id}>
                            <button
                              aria-label={`Remove ${product.name} from compare`}
                              onClick={() =>
                                setCompareIds(
                                  compareIds.filter((entry) => entry !== id),
                                )
                              }
                            >
                              <X />
                            </button>
                            <Image
                              src={product.image}
                              alt=""
                              width={900}
                              height={675}
                              sizes="180px"
                            />
                            <b>{product.name}</b>
                            <span>{formatMoney(product.price)}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Rating</th>
                      {compareIds.map((id) => (
                        <td key={id}>
                          <StarRating
                            rating={productById(id)!.rating}
                            compact
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th>Delivery</th>
                      {compareIds.map((id) => (
                        <td key={id}>{productById(id)!.delivery}</td>
                      ))}
                    </tr>
                    <tr>
                      <th>Availability</th>
                      {compareIds.map((id) => (
                        <td key={id}>
                          {productById(id)!.stock ? "In stock" : "Out of stock"}
                        </td>
                      ))}
                    </tr>
                    {Array.from(
                      new Set(
                        compareIds.flatMap((id) =>
                          productById(id)!.specs.map(([name]) => name),
                        ),
                      ),
                    )
                      .slice(0, 8)
                      .map((spec) => (
                        <tr key={spec}>
                          <th>{spec}</th>
                          {compareIds.map((id) => (
                            <td key={id}>
                              {productById(id)!.specs.find(
                                ([name]) => name === spec,
                              )?.[1] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    <tr>
                      <th>Action</th>
                      {compareIds.map((id) => {
                        const product = productById(id)!;
                        return (
                          <td key={id}>
                            <button onClick={() => openProduct(product)}>
                              View product
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Scale />
                <h2>No products selected.</h2>
                <p>
                  Add up to three products from product cards or detail pages.
                </p>
                <button onClick={() => browseCategory("All")}>
                  Browse products
                </button>
              </div>
            )}
          </section>
        )}

        {screen === "notifications" && (
          <section className={`${styles.shell} ${styles.narrowPage}`}>
            <div className={styles.notificationHeader}>
              <div>
                <p className={styles.eyebrow}>Account</p>
                <h1>Notifications</h1>
              </div>
              <button
                onClick={() =>
                  patchCommerce({
                    notifications: commerce.notifications.map((notice) => ({
                      ...notice,
                      read: true,
                    })),
                  })
                }
              >
                Mark all as read
              </button>
            </div>
            <div className={styles.notificationList}>
              {commerce.notifications.map((notice) => (
                <button
                  key={notice.id}
                  className={!notice.read ? styles.unreadNotice : ""}
                  onClick={() =>
                    patchCommerce({
                      notifications: commerce.notifications.map((entry) =>
                        entry.id === notice.id
                          ? { ...entry, read: true }
                          : entry,
                      ),
                    })
                  }
                >
                  <span>
                    {notice.tone === "order" ? (
                      <Package />
                    ) : notice.tone === "deal" ? (
                      <Tag />
                    ) : (
                      <Heart />
                    )}
                  </span>
                  <div>
                    <b>{notice.title}</b>
                    <p>{notice.text}</p>
                    <small>{notice.time}</small>
                  </div>
                  {!notice.read && <i />}
                </button>
              ))}
            </div>
          </section>
        )}

        {screen === "account" && (
          <section className={`${styles.shell} ${styles.pageSection}`}>
            {sectionHeader("Welcome back", "Noura's account")}
            <div className={styles.accountGrid}>
              <aside>
                <button className={styles.activeAccount}>
                  <CircleUserRound /> Profile
                </button>
                <button onClick={() => go("orders")}>
                  <Package /> Orders
                </button>
                <button onClick={() => go("wishlist")}>
                  <Heart /> Wishlist
                </button>
                <button>
                  <CreditCard /> Payment methods
                </button>
                <button>
                  <Bell /> Preferences
                </button>
              </aside>
              <div className={styles.accountContent}>
                <article className={styles.profileCard}>
                  <span>NK</span>
                  <div>
                    <h2>Noura Karim</h2>
                    <p>noura@example.test</p>
                    <small>Saved customer profile</small>
                  </div>
                  <button>Edit profile</button>
                </article>
                <div className={styles.accountStats}>
                  <button onClick={() => go("orders")}>
                    <Package />
                    <b>{commerce.orders.length}</b>
                    <span>Orders</span>
                  </button>
                  <button onClick={() => go("wishlist")}>
                    <Heart />
                    <b>{commerce.wishlist.length}</b>
                    <span>Wishlist</span>
                  </button>
                  <button onClick={() => go("notifications")}>
                    <Bell />
                    <b>{unreadCount}</b>
                    <span>New notices</span>
                  </button>
                </div>
                <div className={styles.addressBook}>
                  <div>
                    <h2>Address book</h2>
                    <button onClick={() => beginAddress()}>
                      + Add address
                    </button>
                  </div>
                  {commerce.addresses.map((address) => (
                    <article key={address.id}>
                      <MapPin />
                      <div>
                        <b>
                          {address.label}
                          {address.isDefault && <small>Default</small>}
                        </b>
                        <span>
                          {address.name}
                          <br />
                          {address.line1}
                          <br />
                          {address.city} · {address.phone}
                        </span>
                      </div>
                      <button onClick={() => beginAddress(address)}>
                        Edit
                      </button>
                    </article>
                  ))}
                  {addressEditor && (
                    <AddressEditor
                      draft={addressDraft}
                      setDraft={setAddressDraft}
                      isNew={addressEditor === "new"}
                      onSave={saveAddress}
                      onCancel={() => setAddressEditor(null)}
                    />
                  )}
                </div>
                <div className={styles.preferences}>
                  <h2>Preferences</h2>
                  <label>
                    <input type="checkbox" defaultChecked /> Order updates
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Wishlist price
                    drops
                  </label>
                  <label>
                    <input type="checkbox" /> Weekly promotions
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className={styles.salesCta}>
        <div className={`${styles.shell} ${styles.ctaGrid}`}>
          <div>
            <p>ILBATECH · E-Commerce Store</p>
            <h2>Need an online store for your business?</h2>
          </div>
          <div>
            <p>
              Talk to us about product discovery, checkout, order management,
              and customer accounts.
            </p>
            <a href={getContactPath("E-Commerce")}>
              Discuss a similar project <ArrowRight />
            </a>
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={styles.shell}>
          <button className={styles.brand} onClick={() => go("home")}>
            <span>I</span>
            <strong>ILBATECH</strong>
          </button>
          <p>
            No payments are processed, and no orders or messages are sent.
          </p>
          <button
            className={styles.resetButton}
            type="button"
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw /> Reset Data
          </button>
        </div>
      </footer>
      <nav className={styles.mobileNav} aria-label="Mobile customer navigation">
        <button
          className={screen === "home" ? styles.mobileActive : ""}
          onClick={() => go("home")}
        >
          <Home />
          Home
        </button>
        <button
          className={screen === "catalog" ? styles.mobileActive : ""}
          onClick={() => browseCategory("All")}
        >
          <Search />
          Shop
        </button>
        <button
          className={screen === "wishlist" ? styles.mobileActive : ""}
          onClick={() => go("wishlist")}
        >
          <Heart />
          <i>{commerce.wishlist.length}</i>Saved
        </button>
        <button
          className={screen === "orders" ? styles.mobileActive : ""}
          onClick={() => go("orders")}
        >
          <Package />
          Orders
        </button>
        <button
          className={screen === "cart" ? styles.mobileActive : ""}
          onClick={() => go("cart")}
        >
          <ShoppingCart />
          <i>{cartCount}</i>Cart
        </button>
      </nav>
      {compareIds.length > 0 && screen !== "compare" && (
        <button
          className={styles.compareDock}
          type="button"
          onClick={() => go("compare")}
        >
          <Scale /> Compare {compareIds.length} <ArrowRight />
        </button>
      )}
      <button
        className={styles.noticeDock}
        type="button"
        onClick={() => go("notifications")}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell />
        {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>
      {resetOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setResetOpen(false);
          }}
        >
          <div
            className={styles.resetDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-demo-title"
          >
            <button
              className={styles.dialogClose}
              aria-label="Close reset confirmation"
              onClick={() => setResetOpen(false)}
            >
              <X />
            </button>
            <span>
              <RotateCcw />
            </span>
            <h2 id="reset-demo-title">
              Reset data to its original state?
            </h2>
            <p>
              This clears the cart, wishlist, recently viewed products, saved
              addresses, orders, and notifications.
            </p>
            <div>
              <button onClick={() => setResetOpen(false)}>
                Keep my data
              </button>
              <button onClick={resetDemo}>Reset data</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function AddressEditor({
  draft,
  setDraft,
  isNew,
  onSave,
  onCancel,
}: {
  draft: {
    label: string;
    name: string;
    line1: string;
    city: string;
    phone: string;
  };
  setDraft: (draft: {
    label: string;
    name: string;
    line1: string;
    city: string;
    phone: string;
  }) => void;
  isNew: boolean;
  onSave: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form className={styles.addressForm} onSubmit={onSave}>
      <h3>{isNew ? "Add an address" : "Edit address"}</h3>
      <div>
        {Object.entries({
          label: "Label",
          name: "Full name",
          line1: "Street address",
          city: "City",
          phone: "Phone",
        }).map(([field, label]) => (
          <label key={field}>
            {label}
            <input
              value={draft[field as keyof typeof draft]}
              onChange={(event) =>
                setDraft({ ...draft, [field]: event.target.value })
              }
            />
          </label>
        ))}
      </div>
      <p>
        Use non-sensitive contact details. Address data remains in this
        browser.
      </p>
      <button type="submit">Save address</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

function optionLabel(item: CartItem, product: Product) {
  return `${product.delivery} delivery · ${formatMoney(productUnitPrice(product, item.selections))} each`;
}
