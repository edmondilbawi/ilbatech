"use client";

import { useState } from "react";
import { AlertTriangle, Boxes, ChartNoAxesCombined, PackageSearch, Truck } from "lucide-react";
import { getSitePath } from "@/config/site";
import styles from "./demo-v4.module.css";

type Product = { sku: string; name: string; quantity: number; purchase: number; selling: number; supplier: string; updated: string };
type Tab = "Products" | "Movements" | "Suppliers" | "Reports";

const initialProducts: Product[] = [
  { sku: "HOM-1042", name: "Linen Table Lamp", quantity: 18, purchase: 42, selling: 79, supplier: "North & Pine", updated: "22 Aug 2026" },
  { sku: "KIT-2081", name: "Stoneware Serving Set", quantity: 6, purchase: 31, selling: 64, supplier: "Terra Works", updated: "21 Aug 2026" },
  { sku: "OFF-3044", name: "Oak Desk Organizer", quantity: 3, purchase: 22, selling: 49, supplier: "North & Pine", updated: "20 Aug 2026" },
  { sku: "HOM-1170", name: "Woven Storage Basket", quantity: 24, purchase: 18, selling: 38, supplier: "Cedar Supply", updated: "19 Aug 2026" },
  { sku: "KIT-2145", name: "Glass Carafe", quantity: 4, purchase: 16, selling: 35, supplier: "Terra Works", updated: "18 Aug 2026" },
];

const originalMovements = [
  ["22 Aug 2026", "HOM-1042", "Stock IN", "+12", "Supplier delivery"],
  ["21 Aug 2026", "KIT-2081", "Stock OUT", "-2", "Order #2841"],
  ["20 Aug 2026", "OFF-3044", "Stock OUT", "-4", "Order #2836"],
] as const;

export function InventoryShowcase() {
  const [tab, setTab] = useState<Tab>("Products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [movements, setMovements] = useState<string[][]>(originalMovements.map((row) => [...row]));
  const [notice, setNotice] = useState("");

  const totals = {
    units: products.reduce((sum, product) => sum + product.quantity, 0),
    value: products.reduce((sum, product) => sum + product.quantity * product.purchase, 0),
    retail: products.reduce((sum, product) => sum + product.quantity * product.selling, 0),
    low: products.filter((product) => product.quantity <= 6).length,
  };
  const visible = products.filter((product) => `${product.sku} ${product.name}`.toLowerCase().includes(query.toLowerCase()));

  function moveStock(sku: string, direction: "IN" | "OUT") {
    const amount = direction === "IN" ? 5 : -1;
    const product = products.find((item) => item.sku === sku);
    if (!product || (direction === "OUT" && product.quantity === 0)) return;
    setProducts((current) => current.map((item) => item.sku === sku ? { ...item, quantity: Math.max(0, item.quantity + amount), updated: "22 Aug 2026" } : item));
    setMovements((current) => [["22 Aug 2026", sku, `Stock ${direction}`, `${amount > 0 ? "+" : ""}${amount}`, "Manual demo adjustment"], ...current]);
    setNotice(`${product.name}: ${direction === "IN" ? "5 units added" : "1 unit removed"} in local demo state.`);
  }

  return <div className={styles.demoShell}>
    <header className={styles.demoTop}>
      <a className={styles.demoBrand} href="#inventory-main"><i>V</i> VERDANT INVENTORY</a>
      <span className={styles.demoBadge}>Interactive concept · sample data</span>
      <a className={styles.backLink} href={getSitePath("/work")}>← Return to ILBATECH</a>
    </header>
    <div className={styles.appLayout}>
      <aside className={styles.sidebar}>
        <h1>Stock workspace</h1>
        <nav className={styles.sideNav} aria-label="Inventory sections">
          {(["Products", "Movements", "Suppliers", "Reports"] as Tab[]).map((item, index) => {
            const Icon = [PackageSearch, Boxes, Truck, ChartNoAxesCombined][index];
            return <button key={item} data-active={tab === item} onClick={() => setTab(item)}><Icon aria-hidden="true" size={17} />{item}</button>;
          })}
        </nav>
      </aside>
      <main id="inventory-main" className={styles.appMain}>
        <div className={styles.appHead}><div><span>Inventory management</span><h2>{tab}</h2><p>Track products, costs, suppliers and every stock movement in one clear system.</p></div>{totals.low > 0 && <span className={`${styles.pill} ${styles.pillWarn}`}><AlertTriangle size={13} /> {totals.low} low-stock alerts</span>}</div>
        <p aria-live="polite" className={notice ? styles.success : ""}>{notice}</p>

        {tab === "Products" && <>
          <div className={styles.statGrid}>
            <div className={styles.stat}><small>Total units</small><strong>{totals.units}</strong></div>
            <div className={styles.stat}><small>Inventory cost</small><strong>${totals.value.toLocaleString()}</strong></div>
            <div className={styles.stat}><small>Retail value</small><strong>${totals.retail.toLocaleString()}</strong></div>
            <div className={styles.stat}><small>Low stock</small><strong>{totals.low}</strong></div>
          </div>
          <section className={styles.panel}>
            <div className={styles.panelHead}><h3>Product inventory</h3><input aria-label="Search by SKU or product name" placeholder="Search SKU or product" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th>SKU / Product</th><th>Qty</th><th>Purchase</th><th>Selling</th><th>Supplier</th><th>Updated</th><th>Stock</th></tr></thead><tbody>
              {visible.map((product) => <tr key={product.sku}><td><strong>{product.name}</strong><br /><small>{product.sku}</small></td><td><span className={`${styles.pill} ${product.quantity <= 6 ? styles.pillWarn : ""}`}>{product.quantity}</span></td><td>${product.purchase.toFixed(2)}</td><td>${product.selling.toFixed(2)}</td><td>{product.supplier}</td><td>{product.updated}</td><td><button className={styles.action} onClick={() => moveStock(product.sku, "IN")}>+ IN</button> <button className={`${styles.action} ${styles.actionSecondary}`} onClick={() => moveStock(product.sku, "OUT")}>− OUT</button></td></tr>)}
            </tbody></table></div>
          </section>
        </>}

        {tab === "Movements" && <section className={styles.panel}><div className={styles.panelHead}><h3>Stock movement history</h3><span className={styles.pill}>Newest first</span></div><div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th>Date</th><th>SKU</th><th>Movement</th><th>Quantity</th><th>Reference</th></tr></thead><tbody>{movements.map((row, index) => <tr key={`${row[0]}-${row[1]}-${index}`}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>}

        {tab === "Suppliers" && <div className={styles.customerGrid}>
          <article className={styles.customerCard}><Truck size={21} /><strong>North &amp; Pine</strong><small>Home and office goods</small><div><span>2 products</span><span>Last: 22 Aug</span></div></article>
          <article className={styles.customerCard}><Truck size={21} /><strong>Terra Works</strong><small>Kitchen and glassware</small><div><span>2 products</span><span>Last: 21 Aug</span></div></article>
          <article className={styles.customerCard}><Truck size={21} /><strong>Cedar Supply</strong><small>Natural storage products</small><div><span>1 product</span><span>Last: 19 Aug</span></div></article>
        </div>}

        {tab === "Reports" && <>
          <div className={styles.statGrid}><div className={styles.stat}><small>Inventory valuation</small><strong>${totals.value.toLocaleString()}</strong></div><div className={styles.stat}><small>Potential margin</small><strong>${(totals.retail - totals.value).toLocaleString()}</strong></div><div className={styles.stat}><small>Active SKUs</small><strong>{products.length}</strong></div><div className={styles.stat}><small>Suppliers</small><strong>3</strong></div></div>
          <div className={styles.twoCol}><section className={styles.panel}><div className={styles.panelHead}><h3>Value by product</h3></div><div className={styles.barList}>{products.map((product) => <div key={product.sku}><span>{product.name}</span><i><b style={{width: `${Math.min(100, product.quantity * product.purchase / 12)}%`}} /></i><strong>${product.quantity * product.purchase}</strong></div>)}</div></section><section className={styles.panel}><div className={styles.panelHead}><h3>Attention needed</h3></div><div className={styles.barList}>{products.filter((product) => product.quantity <= 6).map((product) => <div key={product.sku}><span>{product.name}</span><i><b style={{width: `${product.quantity * 10}%`}} /></i><strong>{product.quantity}</strong></div>)}</div></section></div>
        </>}
      </main>
    </div>
  </div>;
}
