export const COMMERCE_STORAGE_KEY = "ilbatech-nestra-commerce-demo-v1";
export const COMMERCE_STATE_VERSION = 1;
export const DEMO_DATE = "August 30, 2026";

export const CATEGORIES = [
  "Electronics",
  "Computers",
  "Home & Kitchen",
  "Fashion",
  "Beauty",
  "Sports",
  "Office",
  "Accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";
export type DeliverySpeed = "Same-Day" | "Tomorrow" | "Standard";
export type PaymentMethod = "Card" | "Digital Wallet" | "Cash on Delivery";
export type AccountMode = "Account" | "Guest";
export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned"
  | "Return Requested";

export type VariantOption = {
  label: string;
  priceDelta: number;
  available: boolean;
};
export type VariantGroup = { name: string; options: VariantOption[] };
export type ProductReview = {
  name: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
};
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  subcategory: string;
  keywords: string[];
  image: string;
  images: string[];
  imageAlt: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  delivery: DeliverySpeed;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  release: number;
  description: string;
  details: string;
  variants: VariantGroup[];
  specs: Array<[string, string]>;
  seller: string;
  sellerRating: number;
  relatedIds: string[];
  bundleIds: string[];
  reviews: ProductReview[];
  questions: Array<[string, string]>;
};

const option = (
  label: string,
  priceDelta = 0,
  available = true,
): VariantOption => ({ label, priceDelta, available });
const color = (...labels: string[]): VariantGroup => ({
  name: "Color",
  options: labels.map((label) => option(label)),
});
const standardReviews: ProductReview[] = [
  {
    name: "Maya R.",
    rating: 5,
    title: "Exactly what I expected",
    text: "The product feels considered, arrived well packed, and has been easy to use every day.",
    date: "August 24, 2026",
    verified: true,
  },
  {
    name: "Omar K.",
    rating: 4,
    title: "Strong everyday value",
    text: "Clear setup, good materials, and the practical details are thoughtfully handled.",
    date: "August 18, 2026",
    verified: true,
  },
  {
    name: "Lina A.",
    rating: 5,
    title: "Would recommend",
    text: "It matches the description and the finish looks even better in person.",
    date: "August 9, 2026",
    verified: true,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "aura-headphones",
    name: "Aura ANC Headphones",
    brand: "Brava Audio",
    category: "Electronics",
    subcategory: "Audio · Headphones",
    keywords: [
      "headphones",
      "wireless",
      "audio",
      "bluetooth",
      "noise cancelling",
      "usb-c",
    ],
    image: "/images/commerce/headphones.webp",
    images: [
      "/images/commerce/headphones.webp",
      "/images/commerce/headphones-detail.webp",
      "/images/commerce/earbuds.webp",
    ],
    imageAlt: "Matte black over-ear wireless headphones",
    price: 129.99,
    originalPrice: 169.99,
    rating: 4.7,
    reviewCount: 1842,
    stock: 3,
    delivery: "Same-Day",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 30,
    description:
      "Immersive wireless sound with adaptive noise control and 38-hour battery life.",
    details:
      "Aura balances focused listening with all-day comfort. Soft memory cushions, multipoint Bluetooth, USB-C fast charging, and a low-latency mode make it a versatile companion for work, travel, and downtime.",
    variants: [
      {
        name: "Color",
        options: [option("Black"), option("Stone"), option("Sand", 0, false)],
      },
    ],
    specs: [
      ["Connection", "Bluetooth 5.4 / USB-C"],
      ["Battery", "Up to 38 hours"],
      ["Noise cancellation", "Adaptive hybrid ANC"],
      ["Weight", "248 g"],
      ["Warranty", "2 years"],
    ],
    seller: "Brava Audio",
    sellerRating: 4.9,
    relatedIds: ["pulse-earbuds", "metro-watch", "travel-hub"],
    bundleIds: ["headphone-stand", "travel-hub"],
    reviews: standardReviews,
    questions: [
      [
        "Does this support USB-C charging?",
        "Yes. A 10-minute USB-C charge provides up to 5 hours of listening.",
      ],
      [
        "Can it connect to two devices?",
        "Yes, multipoint pairing supports two active devices.",
      ],
    ],
  },
  {
    id: "pulse-earbuds",
    name: "Pulse Wireless Earbuds",
    brand: "Brava Audio",
    category: "Electronics",
    subcategory: "Audio · Earbuds",
    keywords: ["earbuds", "headphones", "wireless", "audio", "charging case"],
    image: "/images/commerce/earbuds.webp",
    images: [
      "/images/commerce/earbuds.webp",
      "/images/commerce/headphones.webp",
    ],
    imageAlt: "White wireless earbuds with charging case",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.4,
    reviewCount: 963,
    stock: 18,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: false,
    newArrival: true,
    release: 35,
    description:
      "Pocket-ready earbuds with clear calls, balanced audio, and a 28-hour charging case.",
    details:
      "A compact everyday audio option with touch controls, clear voice pickup, and three tip sizes for a secure fit.",
    variants: [color("Cloud", "Graphite", "Sage")],
    specs: [
      ["Connection", "Bluetooth 5.3"],
      ["Battery", "7 + 21 hours"],
      ["Water resistance", "IPX4"],
      ["Charging", "USB-C"],
    ],
    seller: "Brava Audio",
    sellerRating: 4.9,
    relatedIds: ["aura-headphones", "metro-watch", "travel-hub"],
    bundleIds: ["travel-hub"],
    reviews: standardReviews,
    questions: [
      [
        "Are extra ear tips included?",
        "Yes, three silicone tip sizes are included in the demo specification.",
      ],
    ],
  },
  {
    id: "axis-phone",
    name: "Axis 6.4 Smartphone",
    brand: "Axiom Mobile",
    category: "Electronics",
    subcategory: "Mobile · Smartphones",
    keywords: ["phone", "smartphone", "mobile", "camera", "5g"],
    image: "/images/commerce/phone.webp",
    images: ["/images/commerce/phone.webp", "/images/commerce/smartwatch.webp"],
    imageAlt: "Graphite smartphone shown from front and back",
    price: 499,
    originalPrice: 549,
    rating: 4.5,
    reviewCount: 728,
    stock: 12,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: false,
    newArrival: true,
    release: 36,
    description:
      "A bright 6.4-inch display, dual camera system, and dependable two-day battery.",
    details:
      "Axis focuses on the essentials: responsive performance, a clear display, long battery life, and a clean, original industrial design.",
    variants: [
      { name: "Storage", options: [option("128GB"), option("256GB", 80)] },
      color("Graphite", "Mist"),
    ],
    specs: [
      ["Display", "6.4-inch OLED"],
      ["Storage", "128GB / 256GB"],
      ["Battery", "4,800 mAh"],
      ["Camera", "48MP dual system"],
      ["Warranty", "2 years"],
    ],
    seller: "Axiom Mobile",
    sellerRating: 4.7,
    relatedIds: ["metro-watch", "pulse-earbuds", "travel-hub"],
    bundleIds: ["pulse-earbuds", "travel-hub"],
    reviews: standardReviews,
    questions: [
      [
        "Does it support 5G?",
        "Yes, the fictional specification includes broad 5G support.",
      ],
    ],
  },
  {
    id: "metro-watch",
    name: "Metro Round Smartwatch",
    brand: "Axiom Mobile",
    category: "Electronics",
    subcategory: "Wearables · Smartwatches",
    keywords: ["watch", "smartwatch", "fitness", "wearable", "heart rate"],
    image: "/images/commerce/smartwatch.webp",
    images: ["/images/commerce/smartwatch.webp", "/images/commerce/phone.webp"],
    imageAlt: "Graphite round smartwatch with green woven strap",
    price: 149,
    rating: 4.3,
    reviewCount: 511,
    stock: 20,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 28,
    description:
      "Wellness tracking, message previews, and five-day battery in a refined round case.",
    details:
      "A comfortable everyday wearable with a bright display, guided activity modes, sleep summaries, and swappable straps.",
    variants: [color("Forest", "Black", "Clay")],
    specs: [
      ["Display", "1.35-inch AMOLED"],
      ["Battery", "Up to 5 days"],
      ["Sensors", "Heart rate / SpO2"],
      ["Water resistance", "5 ATM"],
    ],
    seller: "Axiom Mobile",
    sellerRating: 4.7,
    relatedIds: ["axis-phone", "aura-headphones", "fitness-set"],
    bundleIds: ["axis-phone"],
    reviews: standardReviews,
    questions: [
      [
        "Can the strap be replaced?",
        "Yes, it accepts standard 20 mm quick-release straps.",
      ],
    ],
  },
  {
    id: "frame-camera",
    name: "Frame C2 Mirrorless Camera",
    brand: "Northlight Optics",
    category: "Electronics",
    subcategory: "Cameras · Mirrorless",
    keywords: ["camera", "photo", "mirrorless", "lens", "video"],
    image: "/images/commerce/camera.webp",
    images: ["/images/commerce/camera.webp", "/images/commerce/backpack.webp"],
    imageAlt: "Compact black mirrorless camera with prime lens",
    price: 649,
    rating: 4.8,
    reviewCount: 284,
    stock: 7,
    delivery: "Standard",
    featured: false,
    bestSeller: false,
    newArrival: true,
    release: 34,
    description: "Compact 24MP camera with fast autofocus and crisp 4K video.",
    details:
      "Frame C2 is a fictional lightweight camera concept with tactile controls and a flexible everyday prime lens.",
    variants: [color("Black", "Silver")],
    specs: [
      ["Sensor", "24MP APS-C"],
      ["Video", "4K / 30 fps"],
      ["Lens", "32 mm f/2"],
      ["Weight", "412 g"],
    ],
    seller: "Northlight Optics",
    sellerRating: 4.8,
    relatedIds: ["camera-sling", "city-backpack", "arcbook-air"],
    bundleIds: ["camera-sling"],
    reviews: standardReviews,
    questions: [
      [
        "Is a lens included?",
        "Yes, the demo bundle includes the pictured compact prime lens.",
      ],
    ],
  },

  {
    id: "arcbook-air",
    name: "ArcBook Air 14",
    brand: "Aven Computing",
    category: "Computers",
    subcategory: "Laptops · Everyday",
    keywords: ["laptop", "computer", "notebook", "ultrabook", "work"],
    image: "/images/commerce/laptop.webp",
    images: [
      "/images/commerce/laptop.webp",
      "/images/commerce/laptop-detail.webp",
      "/images/commerce/keyboard-mouse.webp",
    ],
    imageAlt: "Slim silver laptop with blue abstract screen",
    price: 899,
    originalPrice: 999,
    rating: 4.6,
    reviewCount: 642,
    stock: 14,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 32,
    description:
      "A quiet, lightweight 14-inch laptop with all-day battery and vivid display.",
    details:
      "ArcBook Air is designed for portable productivity with a crisp display, comfortable keyboard, two USB-C ports, and a durable aluminum enclosure.",
    variants: [
      {
        name: "Storage",
        options: [
          option("256GB"),
          option("512GB", 150),
          option("1TB", 320, false),
        ],
      },
      color("Silver", "Graphite"),
    ],
    specs: [
      ["Processor", "Aven Core 8"],
      ["Memory", "16GB"],
      ["Storage", "256GB / 512GB"],
      ["Display", "14-inch 2.5K"],
      ["Battery", "Up to 16 hours"],
      ["Weight", "1.28 kg"],
    ],
    seller: "Aven Computing",
    sellerRating: 4.8,
    relatedIds: ["focus-keyboard", "drift-mouse", "laptop-sleeve"],
    bundleIds: ["laptop-sleeve", "drift-mouse"],
    reviews: standardReviews,
    questions: [
      [
        "Can the memory be upgraded?",
        "The demo specification uses fixed 16GB memory.",
      ],
      [
        "Does it charge over USB-C?",
        "Yes, either USB-C port can charge the laptop.",
      ],
    ],
  },
  {
    id: "arcbook-pro",
    name: "ArcBook Pro 16",
    brand: "Aven Computing",
    category: "Computers",
    subcategory: "Laptops · Performance",
    keywords: ["laptop", "computer", "creator", "performance", "video"],
    image: "/images/commerce/laptop-detail.webp",
    images: [
      "/images/commerce/laptop-detail.webp",
      "/images/commerce/laptop.webp",
    ],
    imageAlt: "Silver performance laptop at a low side angle",
    price: 1299,
    rating: 4.7,
    reviewCount: 318,
    stock: 6,
    delivery: "Standard",
    featured: true,
    bestSeller: false,
    newArrival: true,
    release: 37,
    description:
      "A larger performance laptop for demanding creative and analytical work.",
    details:
      "A fictional 16-inch creator system with expanded cooling, a high-resolution display, and strong multicore performance.",
    variants: [
      { name: "Storage", options: [option("512GB"), option("1TB", 220)] },
      color("Graphite", "Silver"),
    ],
    specs: [
      ["Processor", "Aven Core 12"],
      ["Memory", "32GB"],
      ["Storage", "512GB / 1TB"],
      ["Display", "16-inch 3K"],
      ["Battery", "Up to 12 hours"],
      ["Weight", "1.86 kg"],
    ],
    seller: "Aven Computing",
    sellerRating: 4.8,
    relatedIds: ["focus-keyboard", "forma-chair", "laptop-sleeve"],
    bundleIds: ["laptop-sleeve", "drift-mouse"],
    reviews: standardReviews,
    questions: [
      [
        "Is the display color calibrated?",
        "The fictional display is factory calibrated to a wide color gamut.",
      ],
    ],
  },
  {
    id: "focus-keyboard",
    name: "Focus Mechanical Keyboard",
    brand: "Grid Office",
    category: "Computers",
    subcategory: "Peripherals · Keyboards",
    keywords: ["keyboard", "mechanical", "computer", "office", "wireless"],
    image: "/images/commerce/keyboard-mouse.webp",
    images: [
      "/images/commerce/keyboard-mouse.webp",
      "/images/commerce/laptop.webp",
    ],
    imageAlt: "Warm gray compact keyboard and wireless mouse",
    price: 109,
    rating: 4.6,
    reviewCount: 433,
    stock: 22,
    delivery: "Same-Day",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 25,
    description:
      "A compact wireless keyboard with tactile switches and a useful control dial.",
    details:
      "Focus pairs a space-efficient layout with a familiar key feel, quiet tactile switches, and multi-device wireless switching.",
    variants: [
      {
        name: "Switch",
        options: [
          option("Quiet tactile"),
          option("Linear"),
          option("Clicky", 0, false),
        ],
      },
      color("Warm Gray", "Charcoal"),
    ],
    specs: [
      ["Layout", "75% compact"],
      ["Connection", "Bluetooth / 2.4GHz / USB-C"],
      ["Battery", "Up to 70 hours"],
      ["Switches", "Hot-swappable"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["drift-mouse", "arcbook-air", "grid-desk-set"],
    bundleIds: ["drift-mouse"],
    reviews: standardReviews,
    questions: [
      ["Does it work while charging?", "Yes, USB-C wired use is supported."],
    ],
  },
  {
    id: "drift-mouse",
    name: "Drift Wireless Mouse",
    brand: "Grid Office",
    category: "Computers",
    subcategory: "Peripherals · Mice",
    keywords: ["mouse", "wireless", "computer", "office", "bluetooth"],
    image: "/images/commerce/keyboard-mouse.webp",
    images: [
      "/images/commerce/keyboard-mouse.webp",
      "/images/commerce/laptop-detail.webp",
    ],
    imageAlt: "Low-profile wireless mouse beside a compact keyboard",
    price: 49,
    rating: 4.4,
    reviewCount: 786,
    stock: 28,
    delivery: "Same-Day",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 22,
    description:
      "A quiet, precise wireless mouse shaped for long work sessions.",
    details:
      "Drift includes silent switches, smooth tracking, and quick switching between three paired devices.",
    variants: [color("Warm Gray", "Black", "Sage")],
    specs: [
      ["Connection", "Bluetooth / 2.4GHz"],
      ["Battery", "Up to 4 months"],
      ["Sensor", "4,000 DPI"],
      ["Weight", "82 g"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["focus-keyboard", "arcbook-air", "grid-desk-set"],
    bundleIds: ["focus-keyboard"],
    reviews: standardReviews,
    questions: [
      [
        "Is it suitable for left-handed use?",
        "Its symmetrical shape works for either hand.",
      ],
    ],
  },
  {
    id: "laptop-sleeve",
    name: "Arc Padded Laptop Sleeve",
    brand: "Field Carry",
    category: "Computers",
    subcategory: "Laptop Accessories · Sleeves",
    keywords: ["laptop", "sleeve", "case", "computer", "bag"],
    image: "/images/commerce/backpack.webp",
    images: ["/images/commerce/backpack.webp", "/images/commerce/laptop.webp"],
    imageAlt: "Deep olive padded commuter bag",
    price: 39.99,
    rating: 4.3,
    reviewCount: 217,
    stock: 31,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 18,
    description:
      "A softly padded sleeve with a slim accessory pocket and weather-resistant shell.",
    details:
      "A protective everyday layer for 13- to 14-inch laptops, finished with a soft lining and low-profile zipper.",
    variants: [
      {
        name: "Size",
        options: [option("13–14 inch"), option("15–16 inch", 6)],
      },
      color("Olive", "Charcoal"),
    ],
    specs: [
      ["Material", "Recycled woven shell"],
      ["Fit", "13–14 / 15–16 inch"],
      ["Protection", "Padded lining"],
      ["Closure", "Water-resistant zip"],
    ],
    seller: "Field Carry",
    sellerRating: 4.7,
    relatedIds: ["arcbook-air", "city-backpack", "travel-hub"],
    bundleIds: ["arcbook-air"],
    reviews: standardReviews,
    questions: [
      [
        "Is the lining soft?",
        "Yes, the demo specification uses a brushed protective lining.",
      ],
    ],
  },

  {
    id: "crema-espresso",
    name: "Crema Compact Espresso Maker",
    brand: "Orra Home",
    category: "Home & Kitchen",
    subcategory: "Kitchen · Coffee",
    keywords: ["coffee", "espresso", "machine", "kitchen", "maker"],
    image: "/images/commerce/espresso.webp",
    images: [
      "/images/commerce/espresso.webp",
      "/images/commerce/espresso-detail.webp",
      "/images/commerce/kettle.webp",
    ],
    imageAlt: "Cream compact espresso maker with ceramic cup",
    price: 279,
    originalPrice: 329,
    rating: 4.6,
    reviewCount: 504,
    stock: 9,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 29,
    description:
      "A compact espresso maker with assisted pressure, steam wand, and quick heat-up.",
    details:
      "Crema brings café-style controls to a compact footprint, with a balanced portafilter, articulated steam wand, and removable water tank.",
    variants: [color("Cream", "Graphite")],
    specs: [
      ["Pressure", "15 bar"],
      ["Heat-up", "45 seconds"],
      ["Water tank", "1.4 L"],
      ["Included", "Portafilter / tamper"],
      ["Warranty", "2 years"],
    ],
    seller: "Orra Home",
    sellerRating: 4.8,
    relatedIds: ["sage-kettle", "task-lamp", "mineral-cleanser"],
    bundleIds: ["sage-kettle"],
    reviews: standardReviews,
    questions: [
      [
        "Can it steam milk?",
        "Yes, the adjustable wand is designed for milk texturing.",
      ],
      ["Does it use capsules?", "No, this demo model uses ground coffee."],
    ],
  },
  {
    id: "sage-kettle",
    name: "Sage Pour-Over Kettle",
    brand: "Orra Home",
    category: "Home & Kitchen",
    subcategory: "Kitchen · Kettles",
    keywords: ["kettle", "tea", "coffee", "kitchen", "electric"],
    image: "/images/commerce/kettle.webp",
    images: ["/images/commerce/kettle.webp", "/images/commerce/espresso.webp"],
    imageAlt: "Matte sage-green electric kettle with wood handle",
    price: 69,
    rating: 4.5,
    reviewCount: 672,
    stock: 24,
    delivery: "Same-Day",
    featured: true,
    bestSeller: false,
    newArrival: false,
    release: 26,
    description:
      "A temperature-control kettle with precise pouring and a comfortable wood-detail handle.",
    details:
      "Choose a temperature for coffee or tea, hold it for thirty minutes, and pour with control from the shaped spout.",
    variants: [color("Sage", "Cream", "Black")],
    specs: [
      ["Capacity", "1.2 L"],
      ["Temperature", "40–100°C"],
      ["Hold mode", "30 minutes"],
      ["Power", "1,200 W"],
    ],
    seller: "Orra Home",
    sellerRating: 4.8,
    relatedIds: ["crema-espresso", "glow-lamp", "amber-set"],
    bundleIds: ["crema-espresso"],
    reviews: standardReviews,
    questions: [
      [
        "Does it remember the last temperature?",
        "Yes, the fictional control remembers the previous setting.",
      ],
    ],
  },
  {
    id: "aero-vacuum",
    name: "Aero Cordless Vacuum",
    brand: "Hush Living",
    category: "Home & Kitchen",
    subcategory: "Home Care · Vacuums",
    keywords: ["vacuum", "cleaning", "cordless", "home", "stick"],
    image: "/images/commerce/vacuum.webp",
    images: ["/images/commerce/vacuum.webp", "/images/commerce/lamp.webp"],
    imageAlt: "Slim charcoal cordless stick vacuum cleaner",
    price: 229,
    originalPrice: 279,
    rating: 4.4,
    reviewCount: 391,
    stock: 11,
    delivery: "Standard",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 21,
    description:
      "A lightweight cordless vacuum with adaptable power and a low-profile floor head.",
    details:
      "Aero transitions from floor cleaning to handheld use with simple tools and an easy-empty dust cup.",
    variants: [color("Charcoal", "Warm Gray")],
    specs: [
      ["Runtime", "Up to 48 minutes"],
      ["Weight", "2.4 kg"],
      ["Filtration", "Five-stage"],
      ["Modes", "Eco / Auto / Boost"],
    ],
    seller: "Hush Living",
    sellerRating: 4.5,
    relatedIds: ["forma-chair", "glow-lamp", "grid-desk-set"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Is the filter washable?",
        "Yes, the fictional filter is washable and reusable.",
      ],
    ],
  },
  {
    id: "glow-lamp",
    name: "Glow Portable Table Lamp",
    brand: "Hush Living",
    category: "Home & Kitchen",
    subcategory: "Lighting · Portable",
    keywords: ["lamp", "light", "portable", "home", "rechargeable"],
    image: "/images/commerce/lamp.webp",
    images: ["/images/commerce/lamp.webp", "/images/commerce/chair.webp"],
    imageAlt: "Terracotta mushroom-shaped portable table lamp",
    price: 54,
    rating: 4.7,
    reviewCount: 328,
    stock: 19,
    delivery: "Same-Day",
    featured: true,
    bestSeller: false,
    newArrival: true,
    release: 33,
    description:
      "A rechargeable pool of warm light with touch dimming and twelve-hour battery.",
    details:
      "Glow is sized for a bedside, shelf, or outdoor table, with three brightness levels and a warm diffused glow.",
    variants: [color("Terracotta", "Cream", "Sage")],
    specs: [
      ["Battery", "Up to 12 hours"],
      ["Charging", "USB-C"],
      ["Light", "2700K warm white"],
      ["Dimming", "Three levels"],
    ],
    seller: "Hush Living",
    sellerRating: 4.5,
    relatedIds: ["task-lamp", "sage-kettle", "forma-chair"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Can it be used outdoors?",
        "It is suitable for covered outdoor use in the fictional specification.",
      ],
    ],
  },

  {
    id: "trail-sneakers",
    name: "Trail Everyday Sneakers",
    brand: "Morrow Wear",
    category: "Fashion",
    subcategory: "Shoes · Everyday",
    keywords: ["shoes", "sneakers", "fashion", "walking", "men", "women"],
    image: "/images/commerce/sneakers.webp",
    images: [
      "/images/commerce/sneakers.webp",
      "/images/commerce/sneakers-detail.webp",
      "/images/commerce/backpack.webp",
    ],
    imageAlt: "Ivory and muted-green low-top sneakers",
    price: 84,
    originalPrice: 109,
    rating: 4.6,
    reviewCount: 1198,
    stock: 17,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 27,
    description:
      "Comfortable everyday sneakers with breathable panels and a supportive outsole.",
    details:
      "Trail pairs a flexible textile upper with a cushioned footbed and durable rubber tread for daily walking.",
    variants: [
      {
        name: "Size",
        options: [
          option("39"),
          option("40"),
          option("41"),
          option("42"),
          option("43", 0, false),
        ],
      },
      color("Ivory / Sage", "Stone / Clay"),
    ],
    specs: [
      ["Upper", "Woven textile"],
      ["Midsole", "Cushioned foam"],
      ["Outsole", "Rubber tread"],
      ["Fit", "True to size"],
    ],
    seller: "Morrow Wear",
    sellerRating: 4.7,
    relatedIds: ["city-backpack", "fitness-set", "trail-bottle"],
    bundleIds: ["city-backpack"],
    reviews: standardReviews,
    questions: [
      [
        "Do these run true to size?",
        "Most demo reviews describe the fit as true to size.",
      ],
    ],
  },
  {
    id: "city-backpack",
    name: "City Commuter Backpack",
    brand: "Field Carry",
    category: "Fashion",
    subcategory: "Bags · Backpacks",
    keywords: ["backpack", "bag", "fashion", "laptop", "travel"],
    image: "/images/commerce/backpack.webp",
    images: ["/images/commerce/backpack.webp", "/images/commerce/laptop.webp"],
    imageAlt: "Deep olive structured commuter backpack",
    price: 72,
    rating: 4.5,
    reviewCount: 846,
    stock: 23,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 24,
    description:
      "A structured daily backpack with protected laptop space and organized pockets.",
    details:
      "Built around a padded 15-inch compartment, breathable straps, and useful pockets without unnecessary bulk.",
    variants: [color("Deep Olive", "Black", "Sand")],
    specs: [
      ["Capacity", "22 L"],
      ["Laptop fit", "Up to 15 inch"],
      ["Material", "Water-resistant woven shell"],
      ["Weight", "780 g"],
    ],
    seller: "Field Carry",
    sellerRating: 4.7,
    relatedIds: ["trail-sneakers", "laptop-sleeve", "camera-sling"],
    bundleIds: ["laptop-sleeve"],
    reviews: standardReviews,
    questions: [
      [
        "Does it fit under an airline seat?",
        "Its fictional dimensions suit most standard under-seat limits.",
      ],
    ],
  },
  {
    id: "transit-tote",
    name: "Transit Zip Tote",
    brand: "Field Carry",
    category: "Fashion",
    subcategory: "Bags · Totes",
    keywords: ["tote", "bag", "fashion", "travel", "work"],
    image: "/images/commerce/backpack.webp",
    images: [
      "/images/commerce/backpack.webp",
      "/images/commerce/sneakers.webp",
    ],
    imageAlt: "Structured olive commuter bag",
    price: 58,
    rating: 4.2,
    reviewCount: 206,
    stock: 0,
    delivery: "Standard",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 13,
    description:
      "A zip-top work tote with a wide opening and organized interior.",
    details:
      "This out-of-stock demo product illustrates customer-facing availability handling.",
    variants: [color("Olive", "Black")],
    specs: [
      ["Capacity", "18 L"],
      ["Closure", "Full zip"],
      ["Material", "Woven shell"],
      ["Laptop fit", "Up to 14 inch"],
    ],
    seller: "Field Carry",
    sellerRating: 4.7,
    relatedIds: ["city-backpack", "trail-sneakers"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "When will this return?",
        "Restock timing is not available in this public demo.",
      ],
    ],
  },
  {
    id: "studio-hoodie",
    name: "Studio Loop Hoodie",
    brand: "Morrow Wear",
    category: "Fashion",
    subcategory: "Clothing · Sweats",
    keywords: ["hoodie", "clothing", "fashion", "sweatshirt", "unisex"],
    image: "/images/commerce/sneakers-detail.webp",
    images: [
      "/images/commerce/sneakers-detail.webp",
      "/images/commerce/backpack.webp",
    ],
    imageAlt: "Neutral lifestyle product photography",
    price: 64,
    rating: 4.4,
    reviewCount: 374,
    stock: 26,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: true,
    release: 31,
    description:
      "A relaxed midweight hoodie with soft loopback texture and clean detailing.",
    details:
      "A fictional apparel listing used to demonstrate size and color variants across categories.",
    variants: [
      {
        name: "Size",
        options: [option("S"), option("M"), option("L"), option("XL")],
      },
      color("Stone", "Forest", "Clay"),
    ],
    specs: [
      ["Material", "Cotton blend"],
      ["Weight", "Midweight"],
      ["Fit", "Relaxed"],
      ["Care", "Machine wash cold"],
    ],
    seller: "Morrow Wear",
    sellerRating: 4.7,
    relatedIds: ["trail-sneakers", "city-backpack"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Is the fit oversized?",
        "The fictional cut is relaxed but not heavily oversized.",
      ],
    ],
  },

  {
    id: "dew-serum",
    name: "Dew Barrier Serum",
    brand: "Kindred Skin",
    category: "Beauty",
    subcategory: "Skin Care · Serums",
    keywords: ["serum", "beauty", "skin", "skincare", "hydrating"],
    image: "/images/commerce/skincare.webp",
    images: ["/images/commerce/skincare.webp", "/images/commerce/lamp.webp"],
    imageAlt: "Unlabelled amber skincare bottles on stone riser",
    price: 34,
    rating: 4.7,
    reviewCount: 892,
    stock: 35,
    delivery: "Same-Day",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 23,
    description:
      "A lightweight fictional hydration serum with barrier-supporting ingredients.",
    details:
      "A fragrance-free demo formulation concept presented in unbranded amber glass for a calm routine.",
    variants: [
      { name: "Size", options: [option("30 ml"), option("50 ml", 12)] },
    ],
    specs: [
      ["Skin type", "All skin types"],
      ["Texture", "Lightweight serum"],
      ["Fragrance", "None"],
      ["Use", "Morning / evening"],
    ],
    seller: "Kindred Skin",
    sellerRating: 4.9,
    relatedIds: ["cloud-moisturizer", "amber-set", "mineral-cleanser"],
    bundleIds: ["cloud-moisturizer"],
    reviews: standardReviews,
    questions: [
      [
        "Is this fragrance free?",
        "Yes, the fictional formulation is fragrance free.",
      ],
    ],
  },
  {
    id: "cloud-moisturizer",
    name: "Cloud Daily Moisturizer",
    brand: "Kindred Skin",
    category: "Beauty",
    subcategory: "Skin Care · Moisturizers",
    keywords: ["moisturizer", "beauty", "skin", "cream", "skincare"],
    image: "/images/commerce/skincare.webp",
    images: ["/images/commerce/skincare.webp", "/images/commerce/kettle.webp"],
    imageAlt: "Amber skincare jar with cream cap",
    price: 28,
    rating: 4.5,
    reviewCount: 635,
    stock: 42,
    delivery: "Same-Day",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 20,
    description:
      "A comfortable daily cream concept with a soft, non-greasy finish.",
    details:
      "Designed as a simple final layer for morning or evening routines, with fictional ceramide and oat ingredients.",
    variants: [
      { name: "Size", options: [option("50 ml"), option("80 ml", 9)] },
    ],
    specs: [
      ["Skin type", "Normal to dry"],
      ["Finish", "Soft natural"],
      ["Fragrance", "None"],
      ["Use", "Morning / evening"],
    ],
    seller: "Kindred Skin",
    sellerRating: 4.9,
    relatedIds: ["dew-serum", "amber-set", "mineral-cleanser"],
    bundleIds: ["dew-serum"],
    reviews: standardReviews,
    questions: [
      [
        "Can this be used under makeup?",
        "Yes, the fictional texture is designed to layer cleanly.",
      ],
    ],
  },
  {
    id: "amber-set",
    name: "Amber Essentials Set",
    brand: "Kindred Skin",
    category: "Beauty",
    subcategory: "Skin Care · Sets",
    keywords: ["skincare", "beauty", "set", "serum", "moisturizer", "gift"],
    image: "/images/commerce/skincare.webp",
    images: [
      "/images/commerce/skincare.webp",
      "/images/commerce/espresso.webp",
    ],
    imageAlt: "Three unlabelled amber skincare containers",
    price: 76,
    originalPrice: 92,
    rating: 4.8,
    reviewCount: 447,
    stock: 16,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: false,
    newArrival: true,
    release: 38,
    description:
      "A complete fictional three-step routine in minimal amber glass.",
    details:
      "The set combines a cleanser, hydrating serum, and daily moisturizer at a bundled demo price.",
    variants: [
      {
        name: "Set",
        options: [option("Full size"), option("Travel size", -28)],
      },
    ],
    specs: [
      ["Includes", "Cleanser / serum / cream"],
      ["Skin type", "All skin types"],
      ["Fragrance", "None"],
      ["Packaging", "Unbranded demo vessels"],
    ],
    seller: "Kindred Skin",
    sellerRating: 4.9,
    relatedIds: ["dew-serum", "cloud-moisturizer", "mineral-cleanser"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Are these full-size products?",
        "Choose Full size or Travel size before adding to cart.",
      ],
    ],
  },
  {
    id: "mineral-cleanser",
    name: "Mineral Cream Cleanser",
    brand: "Kindred Skin",
    category: "Beauty",
    subcategory: "Skin Care · Cleansers",
    keywords: ["cleanser", "beauty", "skin", "face wash", "skincare"],
    image: "/images/commerce/skincare.webp",
    images: ["/images/commerce/skincare.webp", "/images/commerce/lamp.webp"],
    imageAlt: "Unlabelled amber cleanser bottle",
    price: 22,
    rating: 4.3,
    reviewCount: 301,
    stock: 38,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 15,
    description:
      "A gentle cream-cleanser concept that rinses clean without a tight finish.",
    details:
      "A simple fictional cleanser for morning or evening use with a soft cream texture.",
    variants: [
      { name: "Size", options: [option("150 ml"), option("250 ml", 8)] },
    ],
    specs: [
      ["Skin type", "Normal to dry"],
      ["Texture", "Cream"],
      ["Fragrance", "None"],
      ["Use", "Morning / evening"],
    ],
    seller: "Kindred Skin",
    sellerRating: 4.9,
    relatedIds: ["dew-serum", "cloud-moisturizer", "amber-set"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      ["Does it foam?", "The fictional cream formula produces minimal foam."],
    ],
  },

  {
    id: "fitness-set",
    name: "Studio Fitness Starter Set",
    brand: "Arc Athletics",
    category: "Sports",
    subcategory: "Fitness · Sets",
    keywords: ["fitness", "sports", "yoga", "dumbbells", "workout", "gym"],
    image: "/images/commerce/fitness.webp",
    images: [
      "/images/commerce/fitness.webp",
      "/images/commerce/smartwatch.webp",
    ],
    imageAlt: "Terracotta yoga mat, dumbbells, and water bottle",
    price: 96,
    originalPrice: 118,
    rating: 4.6,
    reviewCount: 533,
    stock: 13,
    delivery: "Tomorrow",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 19,
    description:
      "A coordinated mat, dumbbell pair, and bottle for practical home sessions.",
    details:
      "A fictional starter bundle with textured grip surfaces and a restrained, coordinated finish.",
    variants: [color("Terracotta", "Forest", "Graphite")],
    specs: [
      ["Mat", "6 mm textured foam"],
      ["Weights", "2 × 3 kg"],
      ["Bottle", "750 ml"],
      ["Pieces", "4"],
    ],
    seller: "Arc Athletics",
    sellerRating: 4.6,
    relatedIds: ["flow-mat", "core-dumbbells", "trail-bottle"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "What weight are the dumbbells?",
        "The starter set includes two 3 kg dumbbells.",
      ],
    ],
  },
  {
    id: "flow-mat",
    name: "Flow Grip Yoga Mat",
    brand: "Arc Athletics",
    category: "Sports",
    subcategory: "Yoga · Mats",
    keywords: ["yoga", "mat", "fitness", "sports", "exercise"],
    image: "/images/commerce/fitness.webp",
    images: ["/images/commerce/fitness.webp", "/images/commerce/sneakers.webp"],
    imageAlt: "Rolled terracotta textured yoga mat",
    price: 38,
    rating: 4.5,
    reviewCount: 719,
    stock: 27,
    delivery: "Same-Day",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 16,
    description:
      "A supportive 6 mm mat with dry grip and a comfortable textured surface.",
    details:
      "Flow is a versatile fictional mat for mobility, yoga, or floor exercise with a carry strap included.",
    variants: [color("Terracotta", "Forest", "Graphite")],
    specs: [
      ["Thickness", "6 mm"],
      ["Length", "183 cm"],
      ["Material", "Textured foam"],
      ["Included", "Carry strap"],
    ],
    seller: "Arc Athletics",
    sellerRating: 4.6,
    relatedIds: ["fitness-set", "core-dumbbells", "metro-watch"],
    bundleIds: ["trail-bottle"],
    reviews: standardReviews,
    questions: [
      ["Is a carry strap included?", "Yes, a matching strap is included."],
    ],
  },
  {
    id: "core-dumbbells",
    name: "Core Hex Dumbbell Pair",
    brand: "Arc Athletics",
    category: "Sports",
    subcategory: "Strength · Dumbbells",
    keywords: ["dumbbells", "weights", "fitness", "sports", "strength"],
    image: "/images/commerce/fitness.webp",
    images: [
      "/images/commerce/fitness.webp",
      "/images/commerce/smartwatch.webp",
    ],
    imageAlt: "Pair of matte terracotta hex dumbbells",
    price: 52,
    rating: 4.7,
    reviewCount: 402,
    stock: 15,
    delivery: "Standard",
    featured: false,
    bestSeller: false,
    newArrival: true,
    release: 39,
    description: "Comfortable coated hex dumbbells sold as a matched pair.",
    details:
      "A stable flat-sided design with a lightly textured grip and protective coating.",
    variants: [
      {
        name: "Weight",
        options: [
          option("2 × 3 kg"),
          option("2 × 5 kg", 24),
          option("2 × 8 kg", 55),
        ],
      },
      color("Terracotta", "Graphite"),
    ],
    specs: [
      ["Pieces", "2"],
      ["Shape", "Hex"],
      ["Grip", "Textured"],
      ["Coating", "Protective matte finish"],
    ],
    seller: "Arc Athletics",
    sellerRating: 4.6,
    relatedIds: ["fitness-set", "flow-mat", "trail-bottle"],
    bundleIds: ["flow-mat"],
    reviews: standardReviews,
    questions: [
      [
        "Is the listed weight per dumbbell?",
        "The selector describes the pair, for example two 5 kg dumbbells.",
      ],
    ],
  },
  {
    id: "trail-bottle",
    name: "Trail Hydration Bottle",
    brand: "Arc Athletics",
    category: "Sports",
    subcategory: "Outdoor · Hydration",
    keywords: ["bottle", "water", "sports", "fitness", "outdoor"],
    image: "/images/commerce/fitness.webp",
    images: ["/images/commerce/fitness.webp", "/images/commerce/backpack.webp"],
    imageAlt: "Translucent sports water bottle",
    price: 24,
    rating: 4.2,
    reviewCount: 283,
    stock: 46,
    delivery: "Same-Day",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 12,
    description:
      "A one-hand hydration bottle with a locking lid and clear volume marks.",
    details:
      "A lightweight fictional everyday bottle designed for training, commuting, or short hikes.",
    variants: [
      { name: "Size", options: [option("750 ml"), option("1 L", 6)] },
      color("Clay", "Smoke"),
    ],
    specs: [
      ["Capacity", "750 ml / 1 L"],
      ["Lid", "Locking flip top"],
      ["Material", "BPA-free polymer"],
      ["Care", "Top-rack dishwasher"],
    ],
    seller: "Arc Athletics",
    sellerRating: 4.6,
    relatedIds: ["fitness-set", "flow-mat", "city-backpack"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Is it leak resistant?",
        "The fictional locking lid is designed to resist leaks.",
      ],
    ],
  },

  {
    id: "forma-chair",
    name: "Forma Ergonomic Chair",
    brand: "Grid Office",
    category: "Office",
    subcategory: "Furniture · Chairs",
    keywords: ["chair", "office", "ergonomic", "desk", "furniture"],
    image: "/images/commerce/chair.webp",
    images: [
      "/images/commerce/chair.webp",
      "/images/commerce/keyboard-mouse.webp",
    ],
    imageAlt: "Charcoal ergonomic office chair with gray frame",
    price: 329,
    originalPrice: 399,
    rating: 4.7,
    reviewCount: 607,
    stock: 8,
    delivery: "Standard",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 17,
    description:
      "An adjustable task chair with responsive back support and breathable upholstery.",
    details:
      "Forma supports long work sessions with seat-depth adjustment, flexible lumbar support, and adjustable armrests.",
    variants: [color("Charcoal", "Mist")],
    specs: [
      ["Adjustment", "Height / tilt / seat depth"],
      ["Lumbar", "Flexible support"],
      ["Armrests", "3D adjustable"],
      ["Capacity", "120 kg"],
      ["Warranty", "5 years"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["focus-keyboard", "task-lamp", "grid-desk-set"],
    bundleIds: ["grid-desk-set"],
    reviews: standardReviews,
    questions: [
      [
        "Does it require assembly?",
        "Light assembly is required in the fictional delivery experience.",
      ],
    ],
  },
  {
    id: "task-lamp",
    name: "Task Arc Desk Lamp",
    brand: "Grid Office",
    category: "Office",
    subcategory: "Lighting · Desk Lamps",
    keywords: ["lamp", "office", "desk", "light", "task"],
    image: "/images/commerce/lamp.webp",
    images: ["/images/commerce/lamp.webp", "/images/commerce/chair.webp"],
    imageAlt: "Warm terracotta task lamp",
    price: 59,
    rating: 4.5,
    reviewCount: 229,
    stock: 21,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: true,
    release: 40,
    description:
      "A compact dimmable work light with a warm, glare-controlled diffuser.",
    details:
      "A fictional desk-lighting product with simple touch controls and a USB-C charging port.",
    variants: [color("Terracotta", "Graphite", "Cream")],
    specs: [
      ["Light", "Adjustable warm to cool"],
      ["Dimming", "Four levels"],
      ["Charging", "USB-C"],
      ["Control", "Touch"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["forma-chair", "focus-keyboard", "grid-desk-set"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "Does it remember brightness?",
        "Yes, the fictional lamp recalls the previous brightness level.",
      ],
    ],
  },
  {
    id: "grid-desk-set",
    name: "Grid Desk Organization Set",
    brand: "Grid Office",
    category: "Office",
    subcategory: "Desk Accessories · Organization",
    keywords: ["desk", "office", "organizer", "accessories", "workspace"],
    image: "/images/commerce/keyboard-mouse.webp",
    images: [
      "/images/commerce/keyboard-mouse.webp",
      "/images/commerce/lamp.webp",
    ],
    imageAlt: "Warm gray keyboard and mouse on a clean studio surface",
    price: 42,
    rating: 4.3,
    reviewCount: 194,
    stock: 33,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 10,
    description:
      "A coordinated tray, pen cup, and cable keeper for a calmer workspace.",
    details:
      "A simple fictional accessory set that groups small desk objects without visual clutter.",
    variants: [color("Warm Gray", "Forest", "Black")],
    specs: [
      ["Pieces", "3"],
      ["Material", "Powder-coated metal"],
      ["Feet", "Non-slip"],
      ["Care", "Wipe clean"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["forma-chair", "focus-keyboard", "task-lamp"],
    bundleIds: [],
    reviews: standardReviews,
    questions: [
      [
        "What is included?",
        "The demo set includes a tray, pen cup, and cable keeper.",
      ],
    ],
  },
  {
    id: "headphone-stand",
    name: "Halo Headphone Stand",
    brand: "Grid Office",
    category: "Office",
    subcategory: "Desk Accessories · Stands",
    keywords: ["headphone", "stand", "office", "desk", "audio accessory"],
    image: "/images/commerce/headphones-detail.webp",
    images: [
      "/images/commerce/headphones-detail.webp",
      "/images/commerce/headphones.webp",
    ],
    imageAlt: "Close-up of matte black headphones",
    price: 29,
    rating: 4.4,
    reviewCount: 155,
    stock: 29,
    delivery: "Same-Day",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 9,
    description:
      "A stable, softly padded place to keep over-ear headphones within reach.",
    details:
      "A compact fictional desk stand with a weighted base and cable channel.",
    variants: [color("Graphite", "Warm Gray")],
    specs: [
      ["Height", "260 mm"],
      ["Base", "Weighted / non-slip"],
      ["Top", "Soft padded cradle"],
      ["Cable", "Integrated channel"],
    ],
    seller: "Grid Office",
    sellerRating: 4.6,
    relatedIds: ["aura-headphones", "focus-keyboard", "grid-desk-set"],
    bundleIds: ["aura-headphones"],
    reviews: standardReviews,
    questions: [
      [
        "Will it fit wide headbands?",
        "The fictional cradle supports headbands up to 55 mm wide.",
      ],
    ],
  },

  {
    id: "travel-hub",
    name: "Port 7-in-1 Travel Hub",
    brand: "Aven Computing",
    category: "Accessories",
    subcategory: "Tech Accessories · Hubs",
    keywords: ["usb-c", "hub", "adapter", "laptop", "accessory", "travel"],
    image: "/images/commerce/keyboard-mouse.webp",
    images: [
      "/images/commerce/keyboard-mouse.webp",
      "/images/commerce/laptop-detail.webp",
    ],
    imageAlt: "Warm gray computer accessories",
    price: 44,
    rating: 4.5,
    reviewCount: 908,
    stock: 37,
    delivery: "Same-Day",
    featured: true,
    bestSeller: true,
    newArrival: false,
    release: 14,
    description:
      "A compact USB-C hub with display, card, data, and pass-through charging ports.",
    details:
      "A fictional travel-ready accessory supporting one display, SD cards, USB devices, and USB-C charging.",
    variants: [color("Graphite", "Silver")],
    specs: [
      ["Ports", "7"],
      ["Display", "Up to 4K / 60Hz"],
      ["Data", "USB 3.2"],
      ["Charging", "100W pass-through"],
    ],
    seller: "Aven Computing",
    sellerRating: 4.8,
    relatedIds: ["arcbook-air", "focus-keyboard", "laptop-sleeve"],
    bundleIds: ["arcbook-air"],
    reviews: standardReviews,
    questions: [
      [
        "Can it charge the laptop?",
        "Yes, it supports up to 100W USB-C pass-through charging.",
      ],
    ],
  },
  {
    id: "camera-sling",
    name: "Frame Camera Sling",
    brand: "Field Carry",
    category: "Accessories",
    subcategory: "Camera Accessories · Bags",
    keywords: ["camera", "bag", "sling", "accessory", "travel"],
    image: "/images/commerce/backpack.webp",
    images: ["/images/commerce/backpack.webp", "/images/commerce/camera.webp"],
    imageAlt: "Deep olive structured camera bag",
    price: 49,
    rating: 4.4,
    reviewCount: 226,
    stock: 18,
    delivery: "Tomorrow",
    featured: false,
    bestSeller: false,
    newArrival: true,
    release: 41,
    description:
      "A compact padded sling for a small camera, lens, and daily essentials.",
    details:
      "Movable dividers and a weather-resistant shell protect a compact fictional camera kit.",
    variants: [color("Olive", "Black")],
    specs: [
      ["Capacity", "6 L"],
      ["Dividers", "Two movable"],
      ["Material", "Weather-resistant woven shell"],
      ["Strap", "Ambidextrous"],
    ],
    seller: "Field Carry",
    sellerRating: 4.7,
    relatedIds: ["frame-camera", "city-backpack", "travel-hub"],
    bundleIds: ["frame-camera"],
    reviews: standardReviews,
    questions: [
      [
        "Can the strap switch sides?",
        "Yes, the fictional attachment works on either side.",
      ],
    ],
  },
  {
    id: "watch-band",
    name: "Metro Woven Watch Band",
    brand: "Axiom Mobile",
    category: "Accessories",
    subcategory: "Wearable Accessories · Bands",
    keywords: ["watch", "band", "strap", "accessory", "smartwatch"],
    image: "/images/commerce/smartwatch.webp",
    images: ["/images/commerce/smartwatch.webp", "/images/commerce/phone.webp"],
    imageAlt: "Green woven smartwatch strap on graphite watch",
    price: 29,
    rating: 4.6,
    reviewCount: 343,
    stock: 40,
    delivery: "Same-Day",
    featured: false,
    bestSeller: true,
    newArrival: false,
    release: 11,
    description:
      "A breathable quick-release woven strap for the Metro watch and standard 20 mm cases.",
    details:
      "A comfortable fictional replacement band with a soft weave and secure metal hardware.",
    variants: [color("Forest", "Clay", "Black")],
    specs: [
      ["Width", "20 mm"],
      ["Closure", "Metal buckle"],
      ["Material", "Woven textile"],
      ["Fit", "145–210 mm wrist"],
    ],
    seller: "Axiom Mobile",
    sellerRating: 4.7,
    relatedIds: ["metro-watch", "axis-phone", "aura-headphones"],
    bundleIds: ["metro-watch"],
    reviews: standardReviews,
    questions: [
      [
        "Does it use quick-release pins?",
        "Yes, standard quick-release pins are built in.",
      ],
    ],
  },
  {
    id: "earbud-case",
    name: "Pulse Protective Earbud Case",
    brand: "Field Carry",
    category: "Accessories",
    subcategory: "Audio Accessories · Cases",
    keywords: ["earbuds", "case", "accessory", "audio", "protective"],
    image: "/images/commerce/earbuds.webp",
    images: [
      "/images/commerce/earbuds.webp",
      "/images/commerce/headphones.webp",
    ],
    imageAlt: "White wireless earbud charging case",
    price: 19,
    rating: 4.1,
    reviewCount: 187,
    stock: 44,
    delivery: "Same-Day",
    featured: false,
    bestSeller: false,
    newArrival: false,
    release: 8,
    description:
      "A slim protective shell with a small clip and clear access to charging.",
    details:
      "A fictional accessory designed around the Pulse charging case, with a matte protective finish.",
    variants: [color("Stone", "Forest", "Clay")],
    specs: [
      ["Material", "Soft-touch polymer"],
      ["Access", "USB-C cutout"],
      ["Included", "Small carry clip"],
      ["Fit", "Pulse Earbuds"],
    ],
    seller: "Field Carry",
    sellerRating: 4.7,
    relatedIds: ["pulse-earbuds", "aura-headphones", "travel-hub"],
    bundleIds: ["pulse-earbuds"],
    reviews: standardReviews,
    questions: [
      [
        "Can the case charge while covered?",
        "Yes, the USB-C port remains accessible.",
      ],
    ],
  },
];

export type VariantSelections = Record<string, string>;
export type CartItem = {
  key: string;
  productId: string;
  selections: VariantSelections;
  quantity: number;
};
export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  phone: string;
  isDefault: boolean;
};
export type DeliveryOption = {
  id: "standard" | "express" | "same-day";
  name: string;
  price: number;
  estimate: string;
};
export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};
export type ReturnRequest = {
  id: string;
  itemKey: string;
  quantity: number;
  reason: string;
  method: string;
};
export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  statusIndex: number;
  items: CartItem[];
  address: Address;
  delivery: DeliveryOption;
  paymentMethod: PaymentMethod;
  promo: string;
  totals: Totals;
  arrival: string;
  trackingRef: string;
  returnRequest?: ReturnRequest;
};
export type Notification = {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
  tone: "order" | "deal" | "wishlist";
};
export type CommerceState = {
  version: number;
  cart: CartItem[];
  savedForLater: CartItem[];
  wishlist: string[];
  recentSearches: string[];
  recentlyViewed: string[];
  selectedVariants: Record<string, VariantSelections>;
  addresses: Address[];
  accountMode: AccountMode;
  orders: Order[];
  notifications: Notification[];
  currentOrderId: string | null;
  promo: string;
};

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    price: 0,
    estimate: "3–5 business days",
  },
  {
    id: "express",
    name: "Express Delivery",
    price: 7.99,
    estimate: "Tomorrow",
  },
  { id: "same-day", name: "Same-Day", price: 12.99, estimate: "Today by 9 PM" },
];

export const productById = (id: string) =>
  PRODUCTS.find((product) => product.id === id);
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export const formatMoney = (value: number) => `$${value.toFixed(2)}`;

export function defaultSelections(product: Product): VariantSelections {
  return Object.fromEntries(
    product.variants.map((group) => [
      group.name,
      group.options.find((entry) => entry.available)?.label ??
        group.options[0]?.label ??
        "",
    ]),
  );
}

export function variantIsAvailable(
  product: Product,
  selections: VariantSelections,
): boolean {
  return (
    product.stock > 0 &&
    product.variants.every((group) =>
      group.options.some(
        (entry) => entry.label === selections[group.name] && entry.available,
      ),
    )
  );
}

export function productUnitPrice(
  product: Product,
  selections: VariantSelections,
): number {
  return roundMoney(
    product.price +
      product.variants.reduce(
        (sum, group) =>
          sum +
          (group.options.find((entry) => entry.label === selections[group.name])
            ?.priceDelta ?? 0),
        0,
      ),
  );
}

export function makeCartItem(
  productId: string,
  selections?: VariantSelections,
  quantity = 1,
  key?: string,
): CartItem {
  const product = productById(productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);
  const resolved = selections ?? defaultSelections(product);
  return {
    key:
      key ??
      `${productId}-${Object.values(resolved)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`,
    productId,
    selections: { ...resolved },
    quantity,
  };
}

export type ProductFilters = {
  category: Category | "All";
  maxPrice: number;
  minRating: number;
  availableOnly: boolean;
  brand: string;
  delivery: DeliverySpeed | "Any";
};
export function searchProducts(query: string, products = PRODUCTS): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...products];
  return products.filter((product) =>
    [
      product.name,
      product.brand,
      product.category,
      product.subcategory,
      product.description,
      ...product.keywords,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilters,
  sort: SortOption,
): Product[] {
  return [...products]
    .filter(
      (product) =>
        filters.category === "All" || product.category === filters.category,
    )
    .filter((product) => product.price <= filters.maxPrice)
    .filter((product) => product.rating >= filters.minRating)
    .filter((product) => !filters.availableOnly || product.stock > 0)
    .filter(
      (product) => filters.brand === "All" || product.brand === filters.brand,
    )
    .filter(
      (product) =>
        filters.delivery === "Any" || product.delivery === filters.delivery,
    )
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating")
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "newest") return b.release - a.release;
      return (
        Number(b.featured) - Number(a.featured) ||
        Number(b.bestSeller) - Number(a.bestSeller) ||
        b.rating - a.rating
      );
    });
}

export function toggleWishlist(
  wishlist: string[],
  productId: string,
): string[] {
  return wishlist.includes(productId)
    ? wishlist.filter((id) => id !== productId)
    : [...wishlist, productId];
}

export function calculateTotals(
  items: CartItem[],
  promo: string,
  delivery: DeliveryOption,
): Totals {
  const subtotal = roundMoney(
    items.reduce((sum, item) => {
      const product = productById(item.productId);
      return (
        sum +
        (product
          ? productUnitPrice(product, item.selections) * item.quantity
          : 0)
      );
    }, 0),
  );
  const code = promo.trim().toUpperCase();
  const discount =
    code === "WELCOME10"
      ? roundMoney(subtotal * 0.1)
      : code === "SAVE20" && subtotal >= 150
        ? 20
        : 0;
  const shipping = delivery.price;
  const tax = roundMoney((subtotal - discount) * 0.05);
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: roundMoney(subtotal - discount + shipping + tax),
  };
}

export const TRACKING_STAGES = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;
export function canCancelOrder(order: Order): boolean {
  return order.status === "Processing" && order.statusIndex < 3;
}
export function canReturnOrder(order: Order): boolean {
  return order.status === "Delivered" && !order.returnRequest;
}
export function reorderItems(order: Order): CartItem[] {
  return order.items.flatMap((item) => {
    const product = productById(item.productId);
    return product && variantIsAvailable(product, item.selections)
      ? [
          {
            ...item,
            key: `again-${item.key}`,
            selections: { ...item.selections },
          },
        ]
      : [];
  });
}

const HOME_ADDRESS: Address = {
  id: "home",
  label: "Home",
  name: "Noura Karim",
  line1: "18 Cedar Lane, Apt 4B",
  city: "Beirut",
  phone: "+961 70 555 014",
  isDefault: true,
};
const OFFICE_ADDRESS: Address = {
  id: "office",
  label: "Office",
  name: "Noura Karim",
  line1: "42 Harbor Avenue, Floor 6",
  city: "Beirut",
  phone: "+961 70 555 014",
  isDefault: false,
};

const seededOrders = (): Order[] => [
  {
    id: "#EC-10476",
    date: "August 21, 2026",
    status: "Delivered",
    statusIndex: 5,
    items: [
      makeCartItem(
        "aura-headphones",
        { Color: "Black" },
        1,
        "10476-headphones",
      ),
    ],
    address: HOME_ADDRESS,
    delivery: DELIVERY_OPTIONS[0],
    paymentMethod: "Card",
    promo: "WELCOME10",
    totals: {
      subtotal: 129.99,
      discount: 13,
      shipping: 0,
      tax: 5.85,
      total: 122.84,
    },
    arrival: "Delivered August 24",
    trackingRef: "NEST-410476",
  },
  {
    id: "#EC-10612",
    date: "August 24, 2026",
    status: "Shipped",
    statusIndex: 3,
    items: [
      makeCartItem(
        "arcbook-air",
        { Storage: "256GB", Color: "Silver" },
        1,
        "10612-laptop",
      ),
    ],
    address: OFFICE_ADDRESS,
    delivery: DELIVERY_OPTIONS[1],
    paymentMethod: "Digital Wallet",
    promo: "",
    totals: {
      subtotal: 899,
      discount: 0,
      shipping: 7.99,
      tax: 44.95,
      total: 951.94,
    },
    arrival: "Expected August 31",
    trackingRef: "NEST-410612",
  },
  {
    id: "#EC-10731",
    date: "August 28, 2026",
    status: "Processing",
    statusIndex: 2,
    items: [
      makeCartItem("crema-espresso", { Color: "Cream" }, 1, "10731-espresso"),
    ],
    address: HOME_ADDRESS,
    delivery: DELIVERY_OPTIONS[0],
    paymentMethod: "Card",
    promo: "SAVE20",
    totals: {
      subtotal: 279,
      discount: 20,
      shipping: 0,
      tax: 12.95,
      total: 271.95,
    },
    arrival: "Expected September 2",
    trackingRef: "NEST-410731",
  },
  {
    id: "#EC-10128",
    date: "August 4, 2026",
    status: "Returned",
    statusIndex: 5,
    items: [makeCartItem("amber-set", { Set: "Full size" }, 1, "10128-beauty")],
    address: HOME_ADDRESS,
    delivery: DELIVERY_OPTIONS[0],
    paymentMethod: "Card",
    promo: "",
    totals: { subtotal: 76, discount: 0, shipping: 0, tax: 3.8, total: 79.8 },
    arrival: "Returned August 15",
    trackingRef: "NEST-410128",
    returnRequest: {
      id: "#RET-6812",
      itemKey: "10128-beauty",
      quantity: 1,
      reason: "Not as expected",
      method: "Drop-off",
    },
  },
  {
    id: "#EC-10042",
    date: "July 29, 2026",
    status: "Cancelled",
    statusIndex: 1,
    items: [makeCartItem("metro-watch", { Color: "Forest" }, 1, "10042-watch")],
    address: HOME_ADDRESS,
    delivery: DELIVERY_OPTIONS[1],
    paymentMethod: "Card",
    promo: "",
    totals: {
      subtotal: 149,
      discount: 0,
      shipping: 7.99,
      tax: 7.45,
      total: 164.44,
    },
    arrival: "Cancelled July 29",
    trackingRef: "NEST-410042",
  },
];

export function createInitialCommerceState(): CommerceState {
  return {
    version: COMMERCE_STATE_VERSION,
    cart: [],
    savedForLater: [],
    wishlist: [],
    recentSearches: ["headphones", "coffee maker"],
    recentlyViewed: [],
    selectedVariants: {},
    addresses: [{ ...HOME_ADDRESS }, { ...OFFICE_ADDRESS }],
    accountMode: "Account",
    orders: seededOrders(),
    notifications: [
      {
        id: "notice-shipped",
        title: "Order shipped",
        text: "#EC-10612 is moving with Nestra Parcel.",
        time: "2 hours ago",
        read: false,
        tone: "order",
      },
      {
        id: "notice-price",
        title: "Wishlist price drop",
        text: "Aura ANC Headphones are now $129.99.",
        time: "Yesterday",
        read: false,
        tone: "wishlist",
      },
      {
        id: "notice-deal",
        title: "Weekend offers",
        text: "Selected home and tech offers end tonight.",
        time: "2 days ago",
        read: true,
        tone: "deal",
      },
    ],
    currentOrderId: null,
    promo: "",
  };
}

export function loadCommerceState(raw: string | null): CommerceState {
  if (!raw) return createInitialCommerceState();
  try {
    const parsed = JSON.parse(raw) as CommerceState;
    if (
      parsed.version !== COMMERCE_STATE_VERSION ||
      !Array.isArray(parsed.cart) ||
      !Array.isArray(parsed.orders) ||
      !Array.isArray(parsed.addresses) ||
      !Array.isArray(parsed.recentSearches)
    )
      return createInitialCommerceState();
    return parsed;
  } catch {
    return createInitialCommerceState();
  }
}

export function createPlacedOrder(
  items: CartItem[],
  address: Address,
  delivery: DeliveryOption,
  paymentMethod: PaymentMethod,
  promo: string,
): Order {
  return {
    id: "#EC-10842",
    date: `${DEMO_DATE} · 3:15 PM`,
    status: "Processing",
    statusIndex: 0,
    items: items.map((item) => ({
      ...item,
      selections: { ...item.selections },
    })),
    address: { ...address },
    delivery: { ...delivery },
    paymentMethod,
    promo,
    totals: calculateTotals(items, promo, delivery),
    arrival:
      delivery.id === "same-day"
        ? "Today by 9 PM"
        : delivery.id === "express"
          ? "Tomorrow by 8 PM"
          : "September 3–5, 2026",
    trackingRef: "NEST-410842",
  };
}

export function cancelOrder(order: Order): Order {
  return canCancelOrder(order)
    ? { ...order, status: "Cancelled", arrival: `Cancelled ${DEMO_DATE}` }
    : order;
}

export function requestReturn(
  order: Order,
  itemKey: string,
  quantity: number,
  reason: string,
  method: string,
): Order {
  if (
    !canReturnOrder(order) ||
    !order.items.some((item) => item.key === itemKey) ||
    quantity < 1 ||
    !reason ||
    !method
  )
    return order;
  return {
    ...order,
    status: "Return Requested",
    returnRequest: { id: "#RET-6842", itemKey, quantity, reason, method },
  };
}
