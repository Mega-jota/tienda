import { useState, useEffect, useCallback, useRef } from "react";

// ─── Datos iniciales ───
const INITIAL_CATEGORIES = [
  { id: 1, name: "Abarrotes" },
  { id: 2, name: "Bebidas" },
  { id: 3, name: "Lácteos" },
  { id: 4, name: "Limpieza" },
  { id: 5, name: "Snacks" },
];

const INITIAL_PROVIDERS = [
  { id: 1, name: "Distribuidora Central", rut: "76.543.210-K", phone: "+56 9 1234 5678", email: "ventas@distcentral.cl", address: "Av. Libertador 1234, Santiago" },
  { id: 2, name: "Alimentos del Sur", rut: "77.888.999-1", phone: "+56 9 8765 4321", email: "contacto@alimsur.cl", address: "Ruta 5 Sur Km 45, Rancagua" },
  { id: 3, name: "Bebidas Chile SpA", rut: "78.111.222-3", phone: "+56 2 2345 6789", email: "pedidos@bebidaschile.cl", address: "Parque Industrial Lo Boza, Pudahuel" },
];

const INITIAL_PRODUCTS = [
  { id: 1, code: "7801234001", name: "Arroz Grado 1 1kg", categoryId: 1, providerId: 1, cost: 890, price: 1290, stock: 45, minStock: 10 },
  { id: 2, code: "7801234002", name: "Azúcar Granulada 1kg", categoryId: 1, providerId: 1, cost: 750, price: 1090, stock: 38, minStock: 10 },
  { id: 3, code: "7801234003", name: "Aceite Vegetal 1L", categoryId: 1, providerId: 1, cost: 1200, price: 1890, stock: 22, minStock: 8 },
  { id: 4, code: "7801234004", name: "Coca-Cola 1.5L", categoryId: 2, providerId: 3, cost: 950, price: 1490, stock: 60, minStock: 15 },
  { id: 5, code: "7801234005", name: "Agua Mineral 1.5L", categoryId: 2, providerId: 3, cost: 350, price: 590, stock: 48, minStock: 12 },
  { id: 6, code: "7801234006", name: "Leche Entera 1L", categoryId: 3, providerId: 2, cost: 780, price: 1190, stock: 30, minStock: 10 },
  { id: 7, code: "7801234007", name: "Yogurt Natural 1kg", categoryId: 3, providerId: 2, cost: 1100, price: 1690, stock: 18, minStock: 8 },
  { id: 8, code: "7801234008", name: "Detergente 1kg", categoryId: 4, providerId: 1, cost: 1800, price: 2790, stock: 15, minStock: 5 },
  { id: 9, code: "7801234009", name: "Lavaloza 500ml", categoryId: 4, providerId: 1, cost: 650, price: 990, stock: 25, minStock: 8 },
  { id: 10, code: "7801234010", name: "Papas Fritas 150g", categoryId: 5, providerId: 2, cost: 450, price: 790, stock: 40, minStock: 10 },
];

const INITIAL_USERS = [
  { id: 1, name: "Administrador", username: "admin", password: "admin123", role: "admin" },
  { id: 2, name: "Vendedor 1", username: "vendedor", password: "venta123", role: "seller" },
];

// ─── Utilidades ───
const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
const fmtDate = (d) => new Date(d).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

// LocalStorage helpers
const loadData = (key, fallback) => {
  try {
    const stored = localStorage.getItem(`pos_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};
const saveData = (key, data) => {
  try { localStorage.setItem(`pos_${key}`, JSON.stringify(data)); } catch {}
};

// ─── Componentes base ───
const colors = {
  bg: "#0f1117",
  card: "#1a1d27",
  cardHover: "#222633",
  border: "#2a2e3d",
  accent: "#3b82f6",
  accentHover: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  surface: "#161922",
};

const baseInput = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: "10px 14px",
  color: colors.text,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const Btn = ({ children, variant = "primary", size = "md", onClick, style, disabled }) => {
  const variants = {
    primary: { bg: colors.accent, hover: colors.accentHover, text: "#fff" },
    success: { bg: colors.success, hover: "#059669", text: "#fff" },
    danger: { bg: colors.danger, hover: "#dc2626", text: "#fff" },
    warning: { bg: colors.warning, hover: "#d97706", text: "#000" },
    ghost: { bg: "transparent", hover: colors.cardHover, text: colors.text },
  };
  const v = variants[variant];
  const sizes = { sm: { px: 10, py: 6, fs: 12 }, md: { px: 16, py: 10, fs: 14 }, lg: { px: 24, py: 14, fs: 16 } };
  const s = sizes[size];
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: disabled ? colors.border : hov ? v.hover : v.bg, color: disabled ? colors.textDim : v.text, border: "none", borderRadius: 8, padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter', system-ui, sans-serif", ...style }}>
      {children}
    </button>
  );
};

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 28, width: wide ? "90%" : "min(480px, 90%)", maxWidth: wide ? 900 : 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: colors.text, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 22, cursor: "pointer", padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Badge = ({ children, color }) => (
  <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 }}>{children}</span>
);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background: colors.card, borderRadius: 12, padding: "18px 20px", border: `1px solid ${colors.border}`, flex: 1, minWidth: 160 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: color || colors.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

// ─── TICKET DE VENTA ───
const TicketPreview = ({ sale, storeName }) => {
  const ticketRef = useRef(null);
  const printTicket = () => {
    const content = ticketRef.current.innerHTML;
    const win = window.open("", "_blank", "width=350,height=600");
    win.document.write(`<html><head><title>Ticket</title><style>
      body{font-family:'Courier New',monospace;font-size:12px;padding:10px;margin:0;max-width:300px;color:#000}
      .center{text-align:center}.line{border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}
    </style></head><body>${content}<script>window.print();setTimeout(()=>window.close(),1000)</script></body></html>`);
  };

  return (
    <div>
      <div ref={ticketRef} style={{ background: "#fff", color: "#000", fontFamily: "'Courier New', monospace", fontSize: 12, padding: 20, borderRadius: 8, maxWidth: 320, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: "bold", fontSize: 16 }}>{storeName || "MI NEGOCIO"}</div>
          <div style={{ fontSize: 10 }}>RUT: 12.345.678-9</div>
          <div style={{ fontSize: 10 }}>Dirección del Local</div>
          <div style={{ fontSize: 10 }}>Santiago, Chile</div>
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <div style={{ fontSize: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Boleta N°: {sale.id}</span><span>{fmtDate(sale.date)}</span></div>
          <div>Cajero: {sale.userName}</div>
        </div>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 10, fontWeight: "bold" }}>
              <td style={{ width: 25 }}>Qty</td><td>Descripción</td><td style={{ width: 65, textAlign: "right" }}>Total</td>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((it, i) => (
              <tr key={i} style={{ fontSize: 11 }}>
                <td>{it.qty}</td><td>{it.name}</td><td style={{ textAlign: "right" }}>{fmt(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <div style={{ fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Neto:</span><span>{fmt(sale.subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>IVA (19%):</span><span>{fmt(sale.iva)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 14, marginTop: 4 }}><span>TOTAL:</span><span>{fmt(sale.total)}</span></div>
        </div>
        {sale.payment === "cash" && (
          <div style={{ fontSize: 11, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Efectivo:</span><span>{fmt(sale.cashGiven)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>Vuelto:</span><span>{fmt(sale.change)}</span></div>
          </div>
        )}
        {sale.payment !== "cash" && <div style={{ fontSize: 11, marginTop: 4, textAlign: "center" }}>Pago: {sale.payment === "debit" ? "Débito" : sale.payment === "credit" ? "Crédito" : "Transferencia"}</div>}
        <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
        <div style={{ textAlign: "center", fontSize: 10 }}>
          <div>¡Gracias por su compra!</div>
          <div style={{ marginTop: 4 }}>Conserve su boleta</div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Btn variant="primary" onClick={printTicket}>🖨️ Imprimir Ticket</Btn>
      </div>
    </div>
  );
};

// ─── APP PRINCIPAL ───
export default function POSApp() {
  const [products, setProducts] = useState(() => loadData("products", INITIAL_PRODUCTS));
  const [categories, setCategories] = useState(() => loadData("categories", INITIAL_CATEGORIES));
  const [providers, setProviders] = useState(() => loadData("providers", INITIAL_PROVIDERS));
  const [users, setUsers] = useState(() => loadData("users", INITIAL_USERS));
  const [sales, setSales] = useState(() => loadData("sales", []));
  const [storeName, setStoreName] = useState(() => loadData("storeName", "MI NEGOCIO"));

  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("pos");

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [lastSale, setLastSale] = useState(null);
  const [ticketModal, setTicketModal] = useState(false);

  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [providerModal, setProviderModal] = useState(false);
  const [editProvider, setEditProvider] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [configModal, setConfigModal] = useState(false);
  const [saleDetailModal, setSaleDetailModal] = useState(null);

  // Guardar en localStorage cada vez que cambia
  useEffect(() => { saveData("products", products); }, [products]);
  useEffect(() => { saveData("categories", categories); }, [categories]);
  useEffect(() => { saveData("providers", providers); }, [providers]);
  useEffect(() => { saveData("users", users); }, [users]);
  useEffect(() => { saveData("sales", sales); }, [sales]);
  useEffect(() => { saveData("storeName", storeName); }, [storeName]);

  // ─── LOGIN ───
  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) { setCurrentUser(user); setLoginError(""); setLoginForm({ username: "", password: "" }); }
    else setLoginError("Usuario o contraseña incorrectos");
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.bg} 0%, #1a1040 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ background: colors.card, borderRadius: 20, padding: 40, width: "min(400px, 90%)", border: `1px solid ${colors.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <h1 style={{ color: colors.text, margin: 0, fontSize: 24, fontWeight: 800 }}>{storeName}</h1>
            <p style={{ color: colors.textMuted, margin: "8px 0 0", fontSize: 14 }}>Sistema Punto de Venta</p>
          </div>
          {loginError && <div style={{ background: colors.danger + "22", color: colors.danger, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{loginError}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Usuario</label>
            <input style={baseInput} value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="admin" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Contraseña</label>
            <input type="password" style={baseInput} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••" />
          </div>
          <Btn variant="primary" size="lg" onClick={handleLogin} style={{ width: "100%", justifyContent: "center" }}>Iniciar Sesión</Btn>
          <div style={{ marginTop: 20, padding: 14, background: colors.surface, borderRadius: 8, fontSize: 11, color: colors.textDim }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Credenciales de prueba:</div>
            <div>Admin: admin / admin123</div>
            <div>Vendedor: vendedor / venta123</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── POS: Funciones ───
  const filteredProducts = products.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm);
    const matchCat = !selectedCategory || p.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, maxStock: product.stock }];
    });
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(c => c.productId !== productId));
    else setCart(prev => prev.map(c => c.productId === productId ? { ...c, qty: Math.min(qty, c.maxStock) } : c));
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(c => c.productId !== productId));

  const cartSubtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartNeto = Math.round(cartSubtotal / 1.19);
  const cartIVA = cartSubtotal - cartNeto;
  const cartTotal = cartSubtotal;

  const completeSale = () => {
    if (paymentMethod === "cash" && (!cashGiven || parseInt(cashGiven) < cartTotal)) return;
    const saleId = String(sales.length + 1).padStart(6, "0");
    const sale = {
      id: saleId, date: new Date().toISOString(), userId: currentUser.id, userName: currentUser.name,
      items: cart.map(c => ({ ...c })), subtotal: cartNeto, iva: cartIVA, total: cartTotal,
      payment: paymentMethod,
      cashGiven: paymentMethod === "cash" ? parseInt(cashGiven) : cartTotal,
      change: paymentMethod === "cash" ? parseInt(cashGiven) - cartTotal : 0,
    };
    setProducts(prev => prev.map(p => { const item = cart.find(c => c.productId === p.id); return item ? { ...p, stock: p.stock - item.qty } : p; }));
    setSales(prev => [...prev, sale]);
    setLastSale(sale);
    setCart([]);
    setPaymentModal(false);
    setCashGiven("");
    setTicketModal(true);
  };

  const saveProduct = (formData) => {
    if (editProduct) setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...formData } : p));
    else setProducts(prev => [...prev, { ...formData, id: Date.now() }]);
    setProductModal(false); setEditProduct(null);
  };
  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));
  const saveProvider = (formData) => {
    if (editProvider) setProviders(prev => prev.map(p => p.id === editProvider.id ? { ...p, ...formData } : p));
    else setProviders(prev => [...prev, { ...formData, id: Date.now() }]);
    setProviderModal(false); setEditProvider(null);
  };
  const deleteProvider = (id) => setProviders(prev => prev.filter(p => p.id !== id));
  const saveUser = (formData) => {
    if (editUser) setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...formData } : u));
    else setUsers(prev => [...prev, { ...formData, id: Date.now() }]);
    setUserModal(false); setEditUser(null);
  };
  const deleteUser = (id) => { if (id !== currentUser.id) setUsers(prev => prev.filter(u => u.id !== id)); };

  const isAdmin = currentUser.role === "admin";
  const tabs = [
    { id: "pos", label: "💰 Venta", show: true },
    { id: "products", label: "📦 Productos", show: isAdmin },
    { id: "providers", label: "🚚 Proveedores", show: isAdmin },
    { id: "sales", label: "📊 Ventas", show: true },
    { id: "users", label: "👥 Usuarios", show: isAdmin },
  ].filter(t => t.show);

  const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const todayTotal = todaySales.reduce((s, sale) => s + sale.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', system-ui, sans-serif", color: colors.text }}>
      {/* Header */}
      <div style={{ background: colors.card, borderBottom: `1px solid ${colors.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, overflow: "auto" }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: colors.text, whiteSpace: "nowrap" }}>{storeName}</span>
          <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                background: activeTab === t.id ? colors.accent + "22" : "transparent",
                color: activeTab === t.id ? colors.accent : colors.textMuted,
                border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13,
                fontWeight: activeTab === t.id ? 700 : 500, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {isAdmin && <button onClick={() => setConfigModal(true)} style={{ background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 18 }}>⚙️</button>}
          <Badge color={isAdmin ? colors.accent : colors.success}>{isAdmin ? "ADMIN" : "VENDEDOR"}</Badge>
          <span style={{ color: colors.textMuted, fontSize: 13, display: "none" }} className="username-desktop">{currentUser.name}</span>
          <Btn variant="ghost" size="sm" onClick={() => { setCurrentUser(null); setActiveTab("pos"); setCart([]); }}>Salir</Btn>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 1400, margin: "0 auto" }}>
        {/* ═══ PUNTO DE VENTA ═══ */}
        {activeTab === "pos" && (
          <div style={{ display: "flex", gap: 20, minHeight: "calc(100vh - 116px)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <StatCard icon="📈" label="Ventas Hoy" value={fmt(todayTotal)} sub={`${todaySales.length} boletas`} color={colors.success} />
                <StatCard icon="📦" label="Productos" value={products.length} sub={`${lowStockCount} bajo stock`} color={lowStockCount > 0 ? colors.warning : colors.text} />
                <StatCard icon="🛒" label="En Carro" value={cart.length} sub={`${cart.reduce((s, c) => s + c.qty, 0)} unidades`} color={colors.accent} />
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                  <input style={{ ...baseInput, paddingLeft: 36 }} placeholder="Buscar producto o código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textDim }}>🔍</span>
                </div>
                <button onClick={() => setSelectedCategory(null)} style={{ background: !selectedCategory ? colors.accent : colors.surface, color: !selectedCategory ? "#fff" : colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif" }}>Todos</button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)} style={{
                    background: selectedCategory === c.id ? colors.accent : colors.surface,
                    color: selectedCategory === c.id ? "#fff" : colors.textMuted,
                    border: `1px solid ${colors.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>{c.name}</button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
                {filteredProducts.map(p => (
                  <div key={p.id} onClick={() => addToCart(p)} style={{
                    background: colors.card, border: `1px solid ${p.stock <= p.minStock ? colors.warning + "44" : colors.border}`,
                    borderRadius: 12, padding: 14, cursor: p.stock > 0 ? "pointer" : "not-allowed", opacity: p.stock <= 0 ? 0.4 : 1, transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: colors.textDim, marginBottom: 8 }}>{p.code}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: colors.accent }}>{fmt(p.price)}</span>
                      <Badge color={p.stock <= p.minStock ? colors.warning : p.stock <= 0 ? colors.danger : colors.success}>{p.stock}u</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrito */}
            <div style={{ width: 360, minWidth: 320, background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "calc(100vh - 116px)", position: "sticky", top: 76 }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}` }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🧾 Boleta de Venta</h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: colors.textDim }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                    <div>Agrega productos al carro</div>
                  </div>
                ) : cart.map(item => (
                  <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${colors.border}22` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: colors.textMuted }}>{fmt(item.price)} c/u</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateCartQty(item.productId, item.qty - 1)} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 6, width: 28, height: 28, color: colors.text, cursor: "pointer", fontSize: 14 }}>−</button>
                      <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, item.qty + 1)} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 6, width: 28, height: 28, color: colors.text, cursor: "pointer", fontSize: 14 }}>+</button>
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(item.price * item.qty)}</div>
                    <button onClick={() => removeFromCart(item.productId)} style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ borderTop: `1px solid ${colors.border}`, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.textMuted, marginBottom: 4 }}><span>Neto:</span><span>{fmt(cartNeto)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.textMuted, marginBottom: 8 }}><span>IVA (19%):</span><span>{fmt(cartIVA)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 800, marginBottom: 16 }}><span>TOTAL:</span><span style={{ color: colors.accent }}>{fmt(cartTotal)}</span></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="danger" size="sm" onClick={() => setCart([])}>Limpiar</Btn>
                    <Btn variant="success" size="lg" onClick={() => setPaymentModal(true)} style={{ flex: 1, justifyContent: "center" }}>💳 Cobrar</Btn>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PRODUCTOS ═══ */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>📦 Inventario de Productos</h2>
              <Btn variant="primary" onClick={() => { setEditProduct(null); setProductModal(true); }}>+ Nuevo Producto</Btn>
            </div>
            <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: colors.surface }}>
                    {["Código", "Producto", "Categoría", "Proveedor", "Costo", "Precio", "Margen", "Stock", "Acciones"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const cat = categories.find(c => c.id === p.categoryId);
                    const prov = providers.find(pr => pr.id === p.providerId);
                    const margin = ((p.price - p.cost) / p.price * 100).toFixed(0);
                    return (
                      <tr key={p.id} style={{ borderTop: `1px solid ${colors.border}22` }}>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: colors.textDim }}>{p.code}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: "10px 14px" }}><Badge color={colors.accent}>{cat?.name || "—"}</Badge></td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: colors.textMuted }}>{prov?.name || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{fmt(p.cost)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>{fmt(p.price)}</td>
                        <td style={{ padding: "10px 14px" }}><Badge color={parseInt(margin) >= 30 ? colors.success : colors.warning}>{margin}%</Badge></td>
                        <td style={{ padding: "10px 14px" }}><Badge color={p.stock <= 0 ? colors.danger : p.stock <= p.minStock ? colors.warning : colors.success}>{p.stock} / {p.minStock}</Badge></td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Btn variant="ghost" size="sm" onClick={() => { setEditProduct(p); setProductModal(true); }}>✏️</Btn>
                            <Btn variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}>🗑️</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PROVEEDORES ═══ */}
        {activeTab === "providers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>🚚 Proveedores</h2>
              <Btn variant="primary" onClick={() => { setEditProvider(null); setProviderModal(true); }}>+ Nuevo Proveedor</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {providers.map(p => {
                const productCount = products.filter(pr => pr.providerId === p.id).length;
                return (
                  <div key={p.id} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: colors.textDim, fontFamily: "monospace", marginTop: 2 }}>RUT: {p.rut}</div>
                      </div>
                      <Badge color={colors.accent}>{productCount} productos</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.8 }}>
                      <div>📞 {p.phone}</div>
                      <div>📧 {p.email}</div>
                      <div>📍 {p.address}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <Btn variant="ghost" size="sm" onClick={() => { setEditProvider(p); setProviderModal(true); }}>✏️ Editar</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => deleteProvider(p.id)}>🗑️ Eliminar</Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ HISTORIAL DE VENTAS ═══ */}
        {activeTab === "sales" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>📊 Historial de Ventas</h2>
              <div style={{ color: colors.textMuted, fontSize: 13 }}>{sales.length} ventas registradas</div>
            </div>
            {sales.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div style={{ color: colors.textMuted }}>Aún no hay ventas registradas</div>
              </div>
            ) : (
              <div style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: colors.surface }}>
                      {["N° Boleta", "Fecha", "Cajero", "Items", "Neto", "IVA", "Total", "Pago", ""].map(h => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...sales].reverse().map(s => (
                      <tr key={s.id} style={{ borderTop: `1px solid ${colors.border}22` }}>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>#{s.id}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: colors.textMuted }}>{fmtDate(s.date)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{s.userName}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{s.items.length}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{fmt(s.subtotal)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13 }}>{fmt(s.iva)}</td>
                        <td style={{ padding: "10px 14px", fontSize: 15, fontWeight: 800, color: colors.success }}>{fmt(s.total)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <Badge color={s.payment === "cash" ? colors.success : s.payment === "debit" ? colors.accent : colors.warning}>
                            {s.payment === "cash" ? "Efectivo" : s.payment === "debit" ? "Débito" : s.payment === "credit" ? "Crédito" : "Transfer."}
                          </Badge>
                        </td>
                        <td style={{ padding: "10px 14px" }}><Btn variant="ghost" size="sm" onClick={() => setSaleDetailModal(s)}>🧾 Ver</Btn></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ USUARIOS ═══ */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>👥 Gestión de Usuarios</h2>
              <Btn variant="primary" onClick={() => { setEditUser(null); setUserModal(true); }}>+ Nuevo Usuario</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {users.map(u => {
                const userSales = sales.filter(s => s.userId === u.id);
                const userTotal = userSales.reduce((s, sale) => s + sale.total, 0);
                return (
                  <div key={u.id} style={{ background: colors.card, borderRadius: 12, border: `1px solid ${colors.border}`, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{u.name}</div>
                      <Badge color={u.role === "admin" ? colors.accent : colors.success}>{u.role === "admin" ? "Admin" : "Vendedor"}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>Usuario: <span style={{ fontFamily: "monospace" }}>{u.username}</span></div>
                    <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>Ventas: {userSales.length} ({fmt(userTotal)})</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="ghost" size="sm" onClick={() => { setEditUser(u); setUserModal(true); }}>✏️ Editar</Btn>
                      {u.id !== currentUser.id && <Btn variant="ghost" size="sm" onClick={() => deleteUser(u.id)}>🗑️ Eliminar</Btn>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="💳 Procesar Pago">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 800, marginBottom: 20, padding: "12px 16px", background: colors.surface, borderRadius: 10 }}>
          <span>Total:</span><span style={{ color: colors.accent }}>{fmt(cartTotal)}</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 8 }}>Método de Pago</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["cash", "💵 Efectivo"], ["debit", "💳 Débito"], ["credit", "💳 Crédito"], ["transfer", "📱 Transferencia"]].map(([val, label]) => (
              <button key={val} onClick={() => setPaymentMethod(val)} style={{
                background: paymentMethod === val ? colors.accent + "22" : colors.surface,
                border: `2px solid ${paymentMethod === val ? colors.accent : colors.border}`,
                borderRadius: 10, padding: "12px", color: colors.text, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>{label}</button>
            ))}
          </div>
        </div>
        {paymentMethod === "cash" && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Efectivo Recibido</label>
            <input type="number" style={{ ...baseInput, fontSize: 20, fontWeight: 700, textAlign: "center" }} value={cashGiven} onChange={e => setCashGiven(e.target.value)} placeholder="0" autoFocus />
            {cashGiven && parseInt(cashGiven) >= cartTotal && (
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 18, fontWeight: 700, color: colors.success }}>Vuelto: {fmt(parseInt(cashGiven) - cartTotal)}</div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {[500, 1000, 2000, 5000, 10000, 20000].map(v => (
                <button key={v} onClick={() => setCashGiven(String(v))} style={{
                  background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 6, padding: "6px 12px",
                  color: colors.textMuted, fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif",
                }}>{fmt(v)}</button>
              ))}
            </div>
          </div>
        )}
        <Btn variant="success" size="lg" onClick={completeSale} disabled={paymentMethod === "cash" && (!cashGiven || parseInt(cashGiven) < cartTotal)} style={{ width: "100%", justifyContent: "center" }}>✅ Confirmar Venta</Btn>
      </Modal>

      <Modal open={ticketModal} onClose={() => setTicketModal(false)} title="🧾 Ticket de Venta">
        {lastSale && <TicketPreview sale={lastSale} storeName={storeName} />}
      </Modal>

      <Modal open={!!saleDetailModal} onClose={() => setSaleDetailModal(null)} title="🧾 Detalle de Venta">
        {saleDetailModal && <TicketPreview sale={saleDetailModal} storeName={storeName} />}
      </Modal>

      <Modal open={productModal} onClose={() => { setProductModal(false); setEditProduct(null); }} title={editProduct ? "✏️ Editar Producto" : "📦 Nuevo Producto"}>
        <ProductForm product={editProduct} categories={categories} providers={providers} onSave={saveProduct} onCancel={() => { setProductModal(false); setEditProduct(null); }} />
      </Modal>

      <Modal open={providerModal} onClose={() => { setProviderModal(false); setEditProvider(null); }} title={editProvider ? "✏️ Editar Proveedor" : "🚚 Nuevo Proveedor"}>
        <ProviderForm provider={editProvider} onSave={saveProvider} onCancel={() => { setProviderModal(false); setEditProvider(null); }} />
      </Modal>

      <Modal open={userModal} onClose={() => { setUserModal(false); setEditUser(null); }} title={editUser ? "✏️ Editar Usuario" : "👤 Nuevo Usuario"}>
        <UserForm user={editUser} onSave={saveUser} onCancel={() => { setUserModal(false); setEditUser(null); }} />
      </Modal>

      <Modal open={configModal} onClose={() => setConfigModal(false)} title="⚙️ Configuración">
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Nombre del Negocio</label>
          <input style={baseInput} value={storeName} onChange={e => setStoreName(e.target.value)} />
        </div>
        <div style={{ padding: 14, background: colors.surface, borderRadius: 8, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: colors.text }}>ℹ️ Información</div>
          <div>Los datos se guardan automáticamente en el navegador (localStorage).</div>
          <div>Compatible con Mac y Windows.</div>
          <div>IVA configurado al 19% (estándar Chile).</div>
          <div style={{ marginTop: 8 }}>
            <Btn variant="danger" size="sm" onClick={() => {
              if (confirm("¿Seguro que deseas borrar TODOS los datos? Esta acción no se puede deshacer.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}>🗑️ Resetear Todo</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── FORMULARIOS ───
function ProductForm({ product, categories, providers, onSave, onCancel }) {
  const [form, setForm] = useState(product || { code: "", name: "", categoryId: 1, providerId: 1, cost: "", price: "", stock: "", minStock: "5" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.code && form.name && form.cost && form.price && form.stock;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Código de Barras</label>
          <input style={baseInput} value={form.code} onChange={e => set("code", e.target.value)} placeholder="7801234..." />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Nombre</label>
          <input style={baseInput} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nombre del producto" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Categoría</label>
          <select style={baseInput} value={form.categoryId} onChange={e => set("categoryId", parseInt(e.target.value))}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Proveedor</label>
          <select style={baseInput} value={form.providerId} onChange={e => set("providerId", parseInt(e.target.value))}>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Costo (Neto)</label>
          <input type="number" style={baseInput} value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Precio Venta (IVA incl.)</label>
          <input type="number" style={baseInput} value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Stock Actual</label>
          <input type="number" style={baseInput} value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Stock Mínimo</label>
          <input type="number" style={baseInput} value={form.minStock} onChange={e => set("minStock", e.target.value)} placeholder="5" />
        </div>
      </div>
      {form.cost && form.price && (
        <div style={{ marginTop: 12, padding: 10, background: colors.surface, borderRadius: 8, fontSize: 12, color: colors.textMuted, display: "flex", gap: 16 }}>
          <span>Margen: <strong style={{ color: colors.success }}>{((form.price - form.cost) / form.price * 100).toFixed(0)}%</strong></span>
          <span>Ganancia: <strong style={{ color: colors.success }}>{fmt(form.price - form.cost)}</strong></span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" disabled={!valid} onClick={() => onSave({ ...form, cost: parseInt(form.cost), price: parseInt(form.price), stock: parseInt(form.stock), minStock: parseInt(form.minStock) })}>
          {product ? "Guardar Cambios" : "Crear Producto"}
        </Btn>
      </div>
    </div>
  );
}

function ProviderForm({ provider, onSave, onCancel }) {
  const [form, setForm] = useState(provider || { name: "", rut: "", phone: "", email: "", address: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name && form.rut && form.phone;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Razón Social</label>
          <input style={baseInput} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nombre empresa" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>RUT</label>
          <input style={baseInput} value={form.rut} onChange={e => set("rut", e.target.value)} placeholder="76.543.210-K" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Teléfono</label>
          <input style={baseInput} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+56 9 ..." />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Email</label>
          <input style={baseInput} value={form.email} onChange={e => set("email", e.target.value)} placeholder="contacto@empresa.cl" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Dirección</label>
          <input style={baseInput} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Dirección completa" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" disabled={!valid} onClick={() => onSave(form)}>{provider ? "Guardar" : "Crear Proveedor"}</Btn>
      </div>
    </div>
  );
}

function UserForm({ user, onSave, onCancel }) {
  const [form, setForm] = useState(user || { name: "", username: "", password: "", role: "seller" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name && form.username && form.password;
  return (
    <div>
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Nombre Completo</label>
          <input style={baseInput} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Juan Pérez" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Usuario</label>
          <input style={baseInput} value={form.username} onChange={e => set("username", e.target.value)} placeholder="usuario123" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Contraseña</label>
          <input style={baseInput} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••" />
        </div>
        <div>
          <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Rol</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["admin", "🔑 Administrador"], ["seller", "💰 Vendedor"]].map(([val, label]) => (
              <button key={val} onClick={() => set("role", val)} style={{
                flex: 1, background: form.role === val ? colors.accent + "22" : colors.surface,
                border: `2px solid ${form.role === val ? colors.accent : colors.border}`,
                borderRadius: 10, padding: 12, color: colors.text, fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" disabled={!valid} onClick={() => onSave(form)}>{user ? "Guardar" : "Crear Usuario"}</Btn>
      </div>
    </div>
  );
}
