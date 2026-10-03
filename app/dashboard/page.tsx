"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp, ArrowRight, Bell, BookOpen, Check, ChevronDown, CircleHelp,
  ClipboardList, Coffee, CreditCard, Crown, Heart, Home, LayoutGrid, MapPin,
  Minus, Moon, Package, Plus, Search, Settings2, ShoppingBag, ShoppingCart,
  Sparkles, Sun, Truck, ShieldCheck, UsersRound, Star, Phone, MessageCircle, Utensils, X,
} from "lucide-react";
import styles from "./dashboard.module.css";

type Product = { id: number; name: string; detail: string; price: number; rating: string; category: string; image: string; tag?: string };

const products: Product[] = [
  { id: 1, name: "Chicken Biryani", detail: "Dum cooked · serves 1", price: 120, rating: "4.8", category: "Food & Beverages", image: "/dashboard/food-biryani.jpg", tag: "Bestseller" },
  { id: 2, name: "Masala Maggi", detail: "Hot, spicy & comforting", price: 40, rating: "4.6", category: "Food & Beverages", image: "/dashboard/food-maggi.jpg" },
  { id: 3, name: "Cold Coffee", detail: "Chilled · extra creamy", price: 60, rating: "4.7", category: "Food & Beverages", image: "/dashboard/coffee.jpg" },
  { id: 4, name: "Notebook (200 pages)", detail: "Classmate · single line", price: 60, rating: "4.8", category: "Stationery", image: "/dashboard/notebook.jpg", tag: "Campus pick" },
  { id: 5, name: "Pen Set (5 pcs)", detail: "Smooth blue ball pens", price: 50, rating: "4.6", category: "Stationery", image: "/dashboard/pens.jpg" },
  { id: 6, name: "Veg Thali", detail: "Fresh, homestyle meal", price: 60, rating: "4.5", category: "Food & Beverages", image: "/dashboard/veg-thali.jpg" },
  { id: 7, name: "Paneer Roll", detail: "Tandoori paneer · mint dip", price: 70, rating: "4.4", category: "Food & Beverages", image: "/dashboard/paneer-roll.jpg" },
  { id: 8, name: "French Fries", detail: "Crispy · peri peri", price: 50, rating: "4.3", category: "Food & Beverages", image: "/dashboard/fries.jpg" },
];

const categories = [
  { name: "Food & Beverages", short: "Food", icon: Utensils, color: "coral" },
  { name: "Stationery", short: "Stationery", icon: BookOpen, color: "blue" },
  { name: "Daily Essentials", short: "Essentials", icon: ShoppingBag, color: "green" },
  { name: "Electronics & Accessories", short: "Electronics", icon: Sparkles, color: "purple" },
  { name: "Print & Scan", short: "Print & Scan", icon: ClipboardList, color: "sky" },
  { name: "Hostel Needs", short: "Hostel Needs", icon: Package, color: "pink" },
  { name: "Health & Wellness", short: "Health", icon: Heart, color: "mint" },
  { name: "All Categories", short: "More", icon: LayoutGrid, color: "slate" },
];

const orders = [
  { name: "Chicken Biryani", meta: "Today · 12:45 PM", status: "On its way", image: products[0].image, color: "orange" },
  { name: "Notebook Set", meta: "Yesterday · 4:20 PM", status: "Delivered", image: products[3].image, color: "green" },
  { name: "Maggi + Cold Coffee", meta: "28 Sep · 8:15 PM", status: "Delivered", image: products[1].image, color: "green" },
];

const imageUrl = (path: string) => path;

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [notice, setNotice] = useState("");
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ck-dashboard-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        (window.matchMedia("(max-width: 700px)").matches ? mobileSearchRef.current : desktopSearchRef.current)?.focus();
      }
      if (event.key === "Escape") {
        setCartOpen(false);
        setNotice("");
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem("ck-dashboard-theme", next);
      return next;
    });
  }

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !activeCategory || activeCategory === "All Categories" || activeCategory === "Daily Essentials" || activeCategory === "Electronics & Accessories" || activeCategory === "Print & Scan" || activeCategory === "Hostel Needs" || activeCategory === "Health & Wellness" || product.category === activeCategory;
    return matchesQuery && matchesCategory;
  }), [query, activeCategory]);
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const itemSubtotal = products.reduce((total, product) => total + product.price * (cart[product.id] || 0), 0);
  const comboSavings = Math.min(cart[2] || 0, cart[3] || 0) * 11 + Math.min(cart[4] || 0, cart[5] || 0) * 21;
  const cartTotal = itemSubtotal - comboSavings;

  function updateCart(id: number, amount: number) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;
      if (quantity <= 0) delete next[id]; else next[id] = quantity;
      return next;
    });
    if (amount > 0) {
      const product = products.find((item) => item.id === id);
      setNotice(`${product?.name} added to your cart`);
      window.setTimeout(() => setNotice(""), 2200);
    }
  }

  return (
    <main className={styles.app} data-theme={theme}>
      <aside className={styles.sidebar}>
        <a className={styles.brand} href="#home" onClick={() => setActiveNav("Home")} aria-label="CampusKart home"><span className={styles.brandMark}><ShoppingBag size={19} strokeWidth={2.7} /></span><span>Campus<span className={styles.brandAccent}>Kart</span></span></a>
        <div className={styles.sideLabel}>YOUR CAMPUS</div>
        <nav className={styles.sideNav} aria-label="Main navigation">
          {[
            ["Home", Home], ["Food & Beverages", Utensils], ["Stationery", BookOpen], ["Daily Essentials", ShoppingBag], ["Electronics & Accessories", Sparkles], ["Print & Scan", ClipboardList], ["Hostel Needs", Package], ["Health & Wellness", Heart], ["Offers", Sparkles], ["Orders", ClipboardList], ["Saved", Heart], ["Help & Support", CircleHelp],
          ].map(([label, Icon]) => {
            const name = label as string; const Glyph = Icon as typeof Home;
            return <button key={name} className={`${styles.navLink} ${activeNav === name ? styles.navActive : ""}`} onClick={() => { setActiveNav(name); if (name === "Home") setActiveCategory(""); else if (categories.some((item) => item.name === name)) setActiveCategory(name); else if (name === "Orders") setNotice("Your recent orders are on the right"); else if (name !== "Home") setNotice(`${name} is coming soon`); }}><Glyph size={17} /><span>{name}</span>{name === "Offers" && <span className={styles.navNew}>2</span>}</button>;
          })}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.memberCard}><span className={styles.memberIcon}><Crown size={17} fill="currentColor" /></span><strong>CampusKart<span>+</span></strong><small>Your campus, upgraded</small><ul><li>Free delivery over ₹99</li><li>Exclusive student deals</li><li>Priority support</li></ul><button onClick={() => setNotice("CampusKart+ benefits are coming soon")}>Explore benefits <ArrowRight size={13} /></button></div>
          <div className={styles.locationCard}><span className={styles.pinBadge}><MapPin size={15} /></span><div><span className={styles.tinyMuted}>Delivering to</span><strong>Hostel Block A</strong></div><button className={styles.changeButton} onClick={() => setNotice("Delivery location: Hostel Block A")}>Change</button></div>
          <button className={styles.sidebarProfile} onClick={() => setNotice("Profile settings are coming soon")}><span className={styles.avatar}>A</span><span><strong>Ankan Das</strong><small>2nd Year · CSE</small></span><Settings2 size={17} /></button>
        </div>
      </aside>

      <section className={styles.mainColumn} id="home">
        <header className={styles.topbar}>
          <label className={styles.searchBox}><Search size={17} /><input ref={desktopSearchRef} aria-label="Search campus essentials" placeholder="Search food, stationery, essentials..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>Ctrl K</kbd></label>
          <div className={styles.topActions}><button className={styles.desktopLocation} onClick={() => setNotice("Delivering to Hostel Block A")}><MapPin size={16} /><span>Hostel Block A</span><ChevronDown size={14} /></button><button className={styles.iconButton} aria-label="Toggle color theme" onClick={toggleTheme}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button><button className={styles.iconButton} aria-label="Notifications" onClick={() => setNotice("You’re all caught up!")}><Bell size={18} /><i /></button><button className={styles.accountButton} onClick={() => setNotice("Welcome back, Ankan!")}><span className={styles.avatar}>A</span><span><strong>Ankan</strong><small>2nd Year, CSE</small></span><ChevronDown size={15} /></button></div>
        </header>

        <div className={styles.mobileHeader}>
          <a className={styles.brand} href="#home"><span className={styles.brandMark}><ShoppingBag size={18} strokeWidth={2.7} /></span><span>Campus<span className={styles.brandAccent}>Kart</span></span></a>
          <div className={styles.mobileActions}><button className={styles.iconButton} aria-label="Toggle color theme" onClick={toggleTheme}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button><button className={styles.iconButton} aria-label="Notifications" onClick={() => setNotice("You’re all caught up!")}><Bell size={18} /><i /></button><button className={styles.avatar} aria-label="Profile">A</button></div>
          <button className={styles.mobileLocation} onClick={() => setNotice("Delivering to Hostel Block A")}><MapPin size={15} fill="currentColor" /><span>Hostel Block A</span><ChevronDown size={14} /></button>
          <label className={`${styles.searchBox} ${styles.mobileSearch}`}><Search size={17} /><input ref={mobileSearchRef} aria-label="Search campus essentials" placeholder="Search for food, stationery..." value={query} onChange={(event) => setQuery(event.target.value)} /><span className={styles.searchSlash}>⌘ K</span></label>
        </div>

        <div className={styles.content}>
          <section className={styles.promiseStrip} aria-label="CampusKart benefits"><div><span className={styles.promiseIcon}><Truck size={18} /></span><span><strong>Fast delivery</strong><small>10–20 mins</small></span></div><div><span className={styles.promiseIcon}><ShieldCheck size={18} /></span><span><strong>Trusted vendors</strong><small>Verified for campus</small></span></div><div><span className={styles.promiseIcon}><UsersRound size={18} /></span><span><strong>Made for students</strong><small>By students, for students</small></span></div><div><span className={styles.promiseIcon}><Star size={18} /></span><span><strong>Best prices</strong><small>Exclusive campus deals</small></span></div></section>

          <div className={styles.topGrid}>
            <section className={styles.hero} aria-label="Featured campus offer"><div className={styles.heroPhoto} /><div className={styles.heroShade} /><div className={styles.heroContent}><span className={styles.heroEyebrow}><span /> YOUR CAMPUS, YOUR COMFORT FOOD</span><h2>Late-night cravings?<br /><em>We’ve got you.</em></h2><p>Hot meals, daily essentials, stationery and more — delivered right to your hostel.</p><div className={styles.heroButtons}><button onClick={() => { setActiveCategory("Food & Beverages"); document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" }); }}>Order now <ArrowRight size={16} /></button><button onClick={() => document.querySelector(`.${styles.categoriesSection}`)?.scrollIntoView({ behavior: "smooth" })}><LayoutGrid size={15} /> Explore categories</button></div></div><div className={styles.heroNote}><span>Chicken Biryani</span><small>from your hostel in 15 mins!</small></div><svg className={styles.heroArrow} viewBox="0 0 100 80" aria-hidden="true"><path d="M8 12 C58 0 72 26 61 54 C56 65 49 69 39 70 M39 70 l14 -2 M39 70 l6 -13" /></svg><span className={styles.heroBadge}><span>UP TO</span><strong>25%</strong><span>OFF TONIGHT</span></span><div className={styles.heroDots}><span /><i /><i /></div></section>
          </div>

          <section className={styles.categoriesSection}><div className={styles.sectionHeading}><div><h2>Shop your campus</h2><p>Everything you need, a few taps away</p></div><button className={styles.textLink} onClick={() => setActiveCategory("")}>View all <ArrowRight size={14} /></button></div><div className={styles.categories}>{categories.map((category, index) => { const Icon = category.icon; const selected = activeCategory === category.name; const art = ["food-biryani.jpg", "category-stationery.jpg", "category-essentials.jpg", "category-electronics.jpg", "category-print.jpg", "category-hostel.jpg", "category-health.jpg", ""][index]; return <button key={category.name} className={`${styles.category} ${selected ? styles.categorySelected : ""}`} onClick={() => setActiveCategory(category.name)}>{art ? <img className={styles.categoryArt} src={`/dashboard/${art}`} alt="" /> : <span className={`${styles.categoryIcon} ${styles[category.color]}`}><Icon size={19} strokeWidth={2.1} /></span>}<span className={styles.categoryCopy}><strong>{category.short}</strong><small>{["120+ items", "80+ items", "150+ items", "60+ items", "Services", "100+ items", "50+ items", "Explore all"][index]}</small></span><span className={`${styles.categoryArrow} ${styles[category.color]}`}><ArrowRight size={13} /></span></button>; })}</div></section>

          <div className={styles.lowerGrid}>
            <section className={styles.popularSection} id="popular"><div className={styles.sectionHeading}><div><div className={styles.headingWithDot}><h2>{query ? "Search results" : !activeCategory || activeCategory === "All Categories" ? "Picked for you, Ankan" : activeCategory}</h2><span className={styles.liveDot} /></div><p>{query ? `${visibleProducts.length} things found on campus` : "Student favourites from around your campus"}</p></div><button className={styles.textLink} onClick={() => { if (showAllProducts) setShowAllProducts(false); else { setActiveCategory(""); setQuery(""); setShowAllProducts(true); } }}>{showAllProducts ? "Show less" : "See all"} <ArrowRight size={14} /></button></div>
              {visibleProducts.length ? <div className={styles.productGrid}>{(query || activeCategory || showAllProducts ? visibleProducts : visibleProducts.slice(0, 5)).map((product) => { const store = product.id === 1 ? "Night Owl Kitchen" : product.id === 2 ? "Hostel Bites" : product.id === 3 ? "Cafe 24x7" : "Campus Store"; const reviews = ["", "1.2k", "980", "640", "1.1k", "980"][product.id]; const eta = product.category !== "Food & Beverages" ? "Same day" : product.id === 1 ? "15–20 min" : "10–15 min"; return <article className={styles.productCard} key={product.id}><div className={styles.productImage}><img src={imageUrl(product.image)} alt={product.name} loading="lazy" />{product.tag && <span className={styles.productTag}>{product.tag}</span>}<button className={styles.saveButton} aria-label={`Save ${product.name}`} onClick={() => setNotice(`${product.name} saved for later`)}><Heart size={15} /></button></div><div className={styles.productInfo}><div className={styles.productNameRow}><h3>{product.name}</h3></div><div className={styles.productStore}><span />{store}</div><div className={styles.productMeta}><span><b>★ {product.rating}</b> <i>({reviews})</i></span><span><small>◷</small>{eta}</span></div><div className={styles.productBottom}><strong>₹{product.price}</strong>{cart[product.id] ? <div className={styles.quantity}><button aria-label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, -1)}><Minus size={13} /></button><span>{cart[product.id]}</span><button aria-label={`Add one ${product.name}`} onClick={() => updateCart(product.id, 1)}><Plus size={13} /></button></div> : <button className={styles.addButton} aria-label={`Add ${product.name} to cart`} onClick={() => updateCart(product.id, 1)}><Plus size={15} /></button>}</div></div></article>; })}</div> : <div className={styles.emptyState}><Search size={24} /><strong>No matches just yet</strong><span>Try another search or browse all categories.</span></div>}
            </section>

            <aside className={styles.ordersCard} id="recent-orders"><div className={styles.ordersHeading}><div><h2>Your orders</h2><p>A little update on your day</p></div><button className={styles.iconButton} aria-label="View orders" onClick={() => setNotice("Showing your recent orders")}><ArrowRight size={17} /></button></div><div className={styles.orderList}>{orders.map((order) => <button className={styles.orderItem} key={order.name} onClick={() => setNotice(`${order.name} · ${order.status}`)}><img src={imageUrl(order.image)} alt="" /><span className={styles.orderText}><strong>{order.name}</strong><small>{order.meta}</small><em className={order.color === "orange" ? styles.statusOrange : styles.statusGreen}>{order.status}</em></span><ArrowRight size={14} /></button>)}</div><button className={styles.orderFooter} onClick={() => setNotice("Your order history is coming soon")}>All orders <ArrowRight size={14} /></button><div className={styles.loyalty}><span className={styles.loyaltyIcon}><Sparkles size={17} /></span><div><strong>₹40 campus cash</strong><small>Waiting in your wallet</small></div><ArrowRight size={14} /></div></aside>
          </div>

          <section className={styles.promoStrip}><div className={`${styles.promoCard} ${styles.promoOrange}`}><span className={styles.promoIcon}><Coffee size={18} /></span><div><small>THE STUDY SESSION</small><strong>Maggi + cold coffee</strong></div><span className={styles.promoPrice}><s>₹100</s> ₹79</span><button aria-label="Add study combo" onClick={() => { updateCart(2, 1); updateCart(3, 1); }}><Plus size={17} /></button></div><div className={`${styles.promoCard} ${styles.promoBlue}`}><span className={styles.promoIcon}><BookOpen size={18} /></span><div><small>BACK TO THE NOTES</small><strong>Notebook + pen pack</strong></div><span className={styles.promoPrice}><s>₹110</s> ₹89</span><button aria-label="Add stationery bundle" onClick={() => { updateCart(4, 1); updateCart(5, 1); }}><Plus size={17} /></button></div></section>
          <footer className={styles.footer}><span>Made for campus life <span>♥</span></span><span>Good things are closer than you think.</span></footer>
        </div>
      </section>

      <aside className={styles.rightRail}><div className={styles.railHead}><div><span className={styles.railEyebrow}>YOUR CAMPUS</span><h2>Good things nearby</h2><p className={styles.railSubtitle}>Live updates from your campus</p></div><button className={styles.iconButton} aria-label="More campus details" onClick={() => setNotice("Campus delivery details")}><ArrowDownUp size={17} /></button></div><div className={styles.railOpen}><span className={styles.liveDot} /><span><strong>12 spots are open now</strong><small>Food, stationery & essentials</small></span><b>LIVE</b></div><button className={styles.railPartner} onClick={() => { setActiveCategory("Food & Beverages"); document.getElementById("popular")?.scrollIntoView({ behavior: "smooth" }); }}><img src="/dashboard/food-maggi.jpg" alt="" /><span><small>OPEN UNTIL 1 AM</small><strong>Night Owl Kitchen</strong><em>★ 4.8 <i>·</i> 2 min from your hostel</em></span><ArrowRight size={15} /></button><div className={styles.railOrderHeading}><h3>Your Orders</h3><button onClick={() => setNotice("Showing your recent orders")}>See all <ArrowRight size={13} /></button></div><div className={styles.railTrack} role="group" aria-label="Live order tracking"><span className={styles.trackTitle}><span className={styles.trackPulse}><span /></span><span><small>LIVE ORDER TRACKING</small><strong>Your biryani is on its way</strong></span></span><span className={styles.trackSteps}><span className={styles.trackStepDone}><i>✓</i><strong>Confirmed</strong><small>12:05 PM</small></span><span className={styles.trackStepDone}><i>✓</i><strong>Preparing</strong><small>12:08 PM</small></span><span className={styles.trackStepActive}><i>✓</i><strong>Out for delivery</strong><small>12:15 PM</small></span><span><i>◷</i><strong>Arriving</strong><small>12:20 PM</small></span></span><span className={styles.riderRow}><span className={styles.riderAvatar}>R</span><span className={styles.riderInfo}><strong>Rider: Rahul</strong><small>Near the student centre · about 2 min</small></span><button aria-label="Call Rahul" onClick={(event) => { event.stopPropagation(); setNotice("Calling your CampusKart rider"); }}><Phone size={14} /></button><button aria-label="Message Rahul" onClick={(event) => { event.stopPropagation(); setNotice("Opening rider chat"); }}><MessageCircle size={14} /></button></span><span className={styles.trackMeta}><span>Chicken Biryani · CK-2841</span><button className={styles.trackAction} onClick={() => setNotice("Your biryani is on the way · about 2 min away")}>Track order <ArrowRight size={12} /></button></span></div><div className={styles.railOffer}><span className={styles.offerSpark}><Sparkles size={16} /></span><span className={styles.offerTicket}>%</span><small>A LITTLE CAMPUS PERK</small><strong>₹40 off your<br />next order</strong><span>Use code <b>CAMPUS40</b> at checkout</span><button onClick={() => { navigator.clipboard?.writeText("CAMPUS40"); setNotice("CAMPUS40 copied to clipboard"); }}>Copy code <ArrowRight size={14} /></button></div><div className={styles.railActions}><span className={styles.railSectionTitle}><h3>Quick campus moves</h3></span><button onClick={() => updateCart(1, 1)}><span><ShoppingBag size={16} /></span><div><strong>Reorder your usual</strong><small>Your favourite, one tap away</small></div><ArrowRight size={14} /></button><button onClick={() => setNotice("Campus delivery details")}><span><MapPin size={16} /></span><div><strong>Delivery to Block A</strong><small>Change your campus spot</small></div><ArrowRight size={14} /></button></div><button className={styles.railHelp} onClick={() => setNotice("Campus support is here for you")}><CircleHelp size={16} /> Need a hand? <ArrowRight size={14} /></button></aside>

      {cartCount > 0 && <button className={styles.floatingCart} onClick={() => setCartOpen(true)}><ShoppingCart size={19} /><span>{cartCount} {cartCount === 1 ? "item" : "items"} in your cart</span><strong>₹{cartTotal}</strong><i>{cartCount}</i></button>}
      <nav className={styles.mobileNav} aria-label="Mobile navigation">{[[Home, "Home"], [LayoutGrid, "Browse"], [ClipboardList, "Orders"], [ShoppingCart, "Cart"], [Settings2, "Profile"]].map(([Icon, label]) => { const Glyph = Icon as typeof Home; const name = label as string; return <button key={name} className={activeNav === name ? styles.mobileNavActive : ""} onClick={() => { setActiveNav(name); if (name === "Cart") setCartOpen(true); else if (name === "Browse") document.querySelector(`.${styles.categoriesSection}`)?.scrollIntoView({ behavior: "smooth" }); else if (name === "Orders") document.getElementById("recent-orders")?.scrollIntoView({ behavior: "smooth" }); else if (name === "Profile") setNotice("Profile settings are coming soon"); else window.scrollTo({ top: 0, behavior: "smooth" }); }}><Glyph size={19} /><span>{name}</span>{name === "Cart" && cartCount > 0 && <i>{cartCount}</i>}</button>; })}</nav>

      {cartOpen && <div className={styles.modalBackdrop} role="presentation" onClick={() => setCartOpen(false)}><section className={styles.cartModal} role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}><div className={styles.cartHeading}><div><span className={styles.railEyebrow}>READY WHEN YOU ARE</span><h2 id="cart-title">Your cart <span>({cartCount})</span></h2></div><button className={styles.iconButton} aria-label="Close cart" onClick={() => setCartOpen(false)}><X size={19} /></button></div>{cartCount ? <><div className={styles.cartItems}>{products.filter((product) => cart[product.id]).map((product) => <div className={styles.cartItem} key={product.id}><img src={imageUrl(product.image)} alt="" /><div><strong>{product.name}</strong><small>Hostel Block A · ₹{product.price} each</small><div className={styles.quantity}><button aria-label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, -1)}><Minus size={13} /></button><span>{cart[product.id]}</span><button aria-label={`Add one ${product.name}`} onClick={() => updateCart(product.id, 1)}><Plus size={13} /></button></div></div><b>₹{product.price * cart[product.id]}</b></div>)}</div><div className={styles.cartSavings}><Sparkles size={16} /> You’re earning ₹{Math.floor(cartTotal * 0.05)} campus cash with this order</div><div className={styles.cartTotal}><span>Item total</span><strong>₹{itemSubtotal}</strong></div>{comboSavings > 0 && <div className={styles.cartTotal}><span>Campus combo savings</span><strong className={styles.freeDelivery}>−₹{comboSavings}</strong></div>}<div className={styles.cartTotal}><span>Delivery fee</span><strong className={styles.freeDelivery}>{itemSubtotal >= 199 ? "FREE" : "₹10"}</strong></div><div className={styles.cartGrandTotal}><strong>Total to pay</strong><strong>₹{cartTotal + (itemSubtotal >= 199 ? 0 : 10)}</strong></div><button className={styles.checkoutButton} onClick={() => { setCartOpen(false); setNotice("Your order is ready for checkout!"); }}>Continue to checkout <ArrowRight size={17} /></button></> : <div className={styles.cartEmpty}><span><ShoppingCart size={24} /></span><strong>Your next campus favourite goes here</strong><small>Take a peek at what everyone’s ordering.</small><button onClick={() => setCartOpen(false)}>Browse the menu <ArrowRight size={15} /></button></div>}<div className={styles.cartSecure}><CreditCard size={14} /> Secure campus checkout <span>·</span> Student prices, always</div></section></div>}
      {notice && <div className={styles.toast} role="status"><span><Check size={15} /></span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button></div>}
    </main>
  );
}
