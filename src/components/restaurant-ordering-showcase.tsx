"use client";

import { useState } from "react";
import { BarChart3, History, Users } from "lucide-react";
import { getSitePath } from "@/config/site";
import styles from "./demo-v4.module.css";

const menu = [
  { id: 1, name: "Garden Mezze", category: "Starters", price: 9, icon: "🥗", description: "Seasonal greens, labneh, herbs and toasted seeds." },
  { id: 2, name: "Charred Chicken", category: "Mains", price: 16, icon: "🍗", description: "Fire-roasted chicken, lemon potatoes and garden salad." },
  { id: 3, name: "Truffle Flatbread", category: "Mains", price: 14, icon: "🍕", description: "Wild mushrooms, soft cheese and fresh thyme." },
  { id: 4, name: "Citrus Cheesecake", category: "Desserts", price: 8, icon: "🍰", description: "Creamy cheesecake with orange and pistachio." },
  { id: 5, name: "Mint Lemonade", category: "Drinks", price: 5, icon: "🍋", description: "Fresh lemon, mint and a touch of orange blossom." },
  { id: 6, name: "Espresso Tonic", category: "Drinks", price: 6, icon: "☕", description: "Double espresso, tonic and a citrus peel." },
] as const;

const customers = [
  ["Maya Haddad", "12 orders", "840 points"],
  ["Karim Nasser", "8 orders", "510 points"],
  ["Rita Elias", "6 orders", "360 points"],
] as const;

type Tab = "Menu" | "Orders" | "Customers" | "Analytics";

export function RestaurantOrderingShowcase() {
  const [tab, setTab] = useState<Tab>("Menu");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<number[]>([1]);
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [message, setMessage] = useState("");

  const cartItems = cart.map((id) => menu.find((item) => item.id === id)!);
  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const total = voucherApplied ? subtotal * .9 : subtotal;
  const filteredMenu = category === "All" ? menu : menu.filter((item) => item.category === category);
  const counts = { orders: 28 + (message ? 1 : 0), revenue: 684 + (message ? total : 0) };

  function placeOrder() {
    if (!cart.length) return;
    setMessage("Demo order #1049 has been added locally. No payment was processed.");
    setCart([]);
    setVoucherApplied(false);
  }

  function reorder() {
    setCart([2, 5]);
    setTab("Menu");
    setMessage("Order #1042 was added to the demo cart.");
  }

  return <div className={`${styles.demoShell} ${styles.restaurant}`}>
    <header className={styles.demoTop}>
      <a className={styles.demoBrand} href="#demo-main"><i>O</i> OLIVE &amp; EMBER</a>
      <span className={styles.demoBadge}>Interactive concept · sample data</span>
      <a className={styles.backLink} href={getSitePath("/work")}>← Return to ILBATECH</a>
    </header>
    <div className={styles.appLayout}>
      <nav className={styles.restaurantNav} aria-label="Restaurant demo">
        {(["Menu", "Orders", "Customers", "Analytics"] as Tab[]).map((item) => <button key={item} data-active={tab === item} onClick={() => setTab(item)}>{item}</button>)}
      </nav>
      <main id="demo-main" className={styles.appMain}>
        <div className={styles.appHead}>
          <div><span>Restaurant ordering</span><h2>{tab}</h2><p>Explore a connected ordering experience from customer choice to restaurant insight.</p></div>
          <span>{cart.length} item{cart.length === 1 ? "" : "s"} in demo cart</span>
        </div>
        <p aria-live="polite" className={message ? styles.success : ""}>{message}</p>

        {tab === "Menu" && <>
          <div className={styles.menuFilters} aria-label="Menu categories">
            {["All", "Starters", "Mains", "Desserts", "Drinks"].map((item) => <button key={item} data-active={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <div className={styles.menuLayout}>
            <div className={styles.menuGrid}>
              {filteredMenu.map((item) => <article className={styles.menuCard} key={item.id}>
                <div className={styles.foodArt} aria-hidden="true">{item.icon}</div>
                <div><h3>{item.name}</h3><p>{item.description}</p><footer><strong>${item.price.toFixed(2)}</strong><button onClick={() => setCart((current) => [...current, item.id])}>Add to order</button></footer></div>
              </article>)}
            </div>
            <aside className={styles.cart} aria-label="Demo order">
              <h3>Your order</h3>
              <div className={styles.cartList}>
                {cartItems.length ? cartItems.map((item, index) => <div className={styles.cartLine} key={`${item.id}-${index}`}><span>{item.name}</span><strong>${item.price.toFixed(2)}</strong></div>) : <p>No items yet.</p>}
              </div>
              <label htmlFor="voucher">Voucher code</label>
              <div className={styles.voucher}><input id="voucher" value={voucher} onChange={(event) => setVoucher(event.target.value)} placeholder="Try WELCOME10" /><button className={`${styles.action} ${styles.actionSecondary}`} onClick={() => setVoucherApplied(voucher.toUpperCase() === "WELCOME10")}>Apply</button></div>
              {voucherApplied && <p className={styles.voucherNote}>10% demo voucher applied.</p>}
              <div className={styles.cartTotal}><span>Total</span><strong>${total.toFixed(2)}</strong></div>
              <button className={styles.action} disabled={!cart.length} onClick={placeOrder}>Place demo order</button>
            </aside>
          </div>
        </>}

        {tab === "Orders" && <section className={styles.panel}>
          <div className={styles.panelHead}><h3>Recent order history</h3><span className={styles.pill}>Live sample</span></div>
          <div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>
            <tr><td>#1048</td><td>Maya Haddad</td><td>3</td><td>$38.00</td><td><span className={styles.pill}>Preparing</span></td><td>View</td></tr>
            <tr><td>#1047</td><td>Karim Nasser</td><td>2</td><td>$21.00</td><td><span className={styles.pill}>Ready</span></td><td>View</td></tr>
            <tr><td>#1042</td><td>Rita Elias</td><td>2</td><td>$21.00</td><td><span className={styles.pill}>Completed</span></td><td><button className={`${styles.action} ${styles.actionSecondary}`} onClick={reorder}>Reorder</button></td></tr>
          </tbody></table></div>
        </section>}

        {tab === "Customers" && <div className={styles.customerGrid}>
          {customers.map(([name, orders, points]) => <article className={styles.customerCard} key={name}><Users aria-hidden="true" size={21} /><strong>{name}</strong><small>Returning customer</small><div><span>{orders}</span><span>{points}</span></div></article>)}
        </div>}

        {tab === "Analytics" && <>
          <div className={styles.statGrid}>
            <div className={styles.stat}><small>Today&apos;s orders</small><strong>{counts.orders}</strong></div>
            <div className={styles.stat}><small>Demo revenue</small><strong>${counts.revenue.toFixed(0)}</strong></div>
            <div className={styles.stat}><small>Repeat purchases</small><strong>42%</strong></div>
            <div className={styles.stat}><small>Loyalty members</small><strong>318</strong></div>
          </div>
          <div className={styles.twoCol}><section className={styles.panel}><div className={styles.panelHead}><h3>Popular menu items</h3><BarChart3 size={18} /></div><div className={styles.barList}><div><span>Charred Chicken</span><i><b style={{width:"88%"}} /></i><strong>88</strong></div><div><span>Garden Mezze</span><i><b style={{width:"71%"}} /></i><strong>71</strong></div><div><span>Mint Lemonade</span><i><b style={{width:"64%"}} /></i><strong>64</strong></div></div></section><section className={styles.panel}><div className={styles.panelHead}><h3>Order channels</h3><History size={18} /></div><div className={styles.barList}><div><span>Delivery</span><i><b style={{width:"52%"}} /></i><strong>52%</strong></div><div><span>Pickup</span><i><b style={{width:"31%"}} /></i><strong>31%</strong></div><div><span>Dine-in</span><i><b style={{width:"17%"}} /></i><strong>17%</strong></div></div></section></div>
        </>}
      </main>
    </div>
  </div>;
}
