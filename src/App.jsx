import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
const fmtDate = (d) => new Date(d).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const colors = {
  bg: "#0f1117", card: "#1a1d27", cardHover: "#222633", border: "#2a2e3d",
  accent: "#3b82f6", accentHover: "#2563eb", success: "#10b981", warning: "#f59e0b",
  danger: "#ef4444", text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#64748b", surface: "#161922",
};
const baseInput = { background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "10px 14px", color: colors.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter',system-ui,sans-serif" };

const Btn = ({ children, variant = "primary", size = "md", onClick, style, disabled }) => {
  const v = { primary: { bg: colors.accent, hover: colors.accentHover, text: "#fff" }, success: { bg: colors.success, hover: "#059669", text: "#fff" }, danger: { bg: colors.danger, hover: "#dc2626", text: "#fff" }, warning: { bg: colors.warning, hover: "#d97706", text: "#000" }, ghost: { bg: "transparent", hover: colors.cardHover, text: colors.text } }[variant];
  const s = { sm: { px: 10, py: 6, fs: 12 }, md: { px: 16, py: 10, fs: 14 }, lg: { px: 24, py: 14, fs: 16 } }[size];
  const [hov, setHov] = useState(false);
  return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: disabled ? colors.border : hov ? v.hover : v.bg, color: disabled ? colors.textDim : v.text, border: "none", borderRadius: 8, padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter',system-ui,sans-serif", ...style }}>{children}</button>;
};
const Modal = ({ open, onClose, title, children }) => { if (!open) return null; return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 28, width: "min(500px,92%)", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, color: colors.text, fontSize: 18 }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 22, cursor: "pointer" }}>✕</button></div>{children}</div></div>; };
const Badge = ({ children, color }) => <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{children}</span>;
const StatCard = ({ icon, label, value, sub, color }) => <div style={{ background: colors.card, borderRadius: 12, padding: "18px 20px", border: `1px solid ${colors.border}`, flex: 1, minWidth: 150 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 20 }}>{icon}</span><span style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, textTransform: "uppercase" }}>{label}</span></div><div style={{ fontSize: 24, fontWeight: 800, color: color || colors.text }}>{value}</div>{sub && <div style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>{sub}</div>}</div>;

const TicketPreview = ({ sale, storeName }) => {
  const ticketRef = useRef(null);
  const printTicket = () => { const c = ticketRef.current.innerHTML; const w = window.open("","_blank","width=350,height=600"); w.document.write(`<html><head><title>Ticket</title><style>body{font-family:'Courier New',monospace;font-size:12px;padding:10px;margin:0;max-width:300px;color:#000}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}</style></head><body>${c}<script>window.print();setTimeout(()=>window.close(),1000)<\/script></body></html>`); };
  const items = sale.sale_items || [];
  return <div><div ref={ticketRef} style={{ background: "#fff", color: "#000", fontFamily: "'Courier New',monospace", fontSize: 12, padding: 20, borderRadius: 8, maxWidth: 320, margin: "0 auto" }}>
    <div style={{ textAlign: "center", marginBottom: 8 }}><div style={{ fontWeight: "bold", fontSize: 16 }}>{storeName || "MI NEGOCIO"}</div><div style={{ fontSize: 10 }}>RUT: 12.345.678-9</div><div style={{ fontSize: 10 }}>Santiago, Chile</div></div>
    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
    <div style={{ fontSize: 10 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>Boleta N°: {sale.sale_number}</span><span>{fmtDate(sale.created_at)}</span></div><div>Cajero: {sale.user_name}</div></div>
    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
    <table><thead><tr style={{ fontSize: 10, fontWeight: "bold" }}><td style={{ width: 25 }}>Qty</td><td>Descripción</td><td style={{ width: 65, textAlign: "right" }}>Total</td></tr></thead><tbody>{items.map((it, i) => <tr key={i} style={{ fontSize: 11 }}><td>{it.qty}</td><td>{it.product_name}</td><td style={{ textAlign: "right" }}>{fmt(it.price * it.qty)}</td></tr>)}</tbody></table>
    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
    <div style={{ fontSize: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal:</span><span>{fmt(sale.subtotal_bruto || sale.total + (sale.discount_amount || 0))}</span></div>
      {sale.discount_percent > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#c00" }}><span>Descuento ({sale.discount_percent}%):</span><span>-{fmt(sale.discount_amount)}</span></div>}
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Neto:</span><span>{fmt(sale.subtotal)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>IVA (19%):</span><span>{fmt(sale.iva)}</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 14, marginTop: 4 }}><span>TOTAL:</span><span>{fmt(sale.total)}</span></div>
    </div>
    {sale.payment === "cash" && <div style={{ fontSize: 11, marginTop: 4 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span>Efectivo:</span><span>{fmt(sale.cash_given)}</span></div><div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>Vuelto:</span><span>{fmt(sale.change_amount)}</span></div></div>}
    {sale.payment !== "cash" && <div style={{ fontSize: 11, marginTop: 4, textAlign: "center" }}>Pago: {sale.payment === "debit" ? "Débito" : sale.payment === "credit" ? "Crédito" : "Transferencia"}</div>}
    <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} /><div style={{ textAlign: "center", fontSize: 10 }}><div>¡Gracias por su compra!</div></div>
  </div><div style={{ textAlign: "center", marginTop: 16 }}><Btn variant="primary" onClick={printTicket}>🖨️ Imprimir Ticket</Btn></div></div>;
};

export default function POSApp() {
  const [products,setProducts]=useState([]);const [categories,setCategories]=useState([]);const [providers,setProviders]=useState([]);const [users,setUsers]=useState([]);const [sales,setSales]=useState([]);const [storeName,setStoreName]=useState("MI NEGOCIO");const [loading,setLoading]=useState(true);const [dbError,setDbError]=useState(null);
  const [currentUser,setCurrentUser]=useState(null);const [loginForm,setLoginForm]=useState({username:"",password:""});const [loginError,setLoginError]=useState("");const [activeTab,setActiveTab]=useState("pos");
  const [cart,setCart]=useState([]);const [searchTerm,setSearchTerm]=useState("");const [selectedCategory,setSelectedCategory]=useState(null);
  const [paymentModal,setPaymentModal]=useState(false);const [paymentMethod,setPaymentMethod]=useState("cash");const [cashGiven,setCashGiven]=useState("");const [lastSale,setLastSale]=useState(null);const [ticketModal,setTicketModal]=useState(false);
  const [discountPercent,setDiscountPercent]=useState(0);
  const [productModal,setProductModal]=useState(false);const [editProduct,setEditProduct]=useState(null);const [providerModal,setProviderModal]=useState(false);const [editProvider,setEditProvider]=useState(null);
  const [userModal,setUserModal]=useState(false);const [editUser,setEditUser]=useState(null);const [categoryModal,setCategoryModal]=useState(false);const [editCategory,setEditCategory]=useState(null);
  const [configModal,setConfigModal]=useState(false);const [saleDetailModal,setSaleDetailModal]=useState(null);const [saving,setSaving]=useState(false);

  useEffect(()=>{loadAllData();},[]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [catRes,provRes,prodRes,userRes,salesRes,configRes] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase.from("providers").select("*").order("id"),
        supabase.from("products").select("*").order("id"),
        supabase.from("users").select("*").order("id"),
        supabase.from("sales").select("*, sale_items(*)").order("id",{ascending:false}).limit(500),
        supabase.from("config").select("*"),
      ]);
      if(catRes.error) throw catRes.error;
      setCategories(catRes.data||[]);setProviders(provRes.data||[]);setProducts(prodRes.data||[]);setUsers(userRes.data||[]);setSales(salesRes.data||[]);
      const sc=(configRes.data||[]).find(c=>c.key==="store_name");if(sc)setStoreName(sc.value);
      setDbError(null);
    } catch(err){console.error(err);setDbError("No se pudo conectar con Supabase. Revisa la URL y la Key en supabaseClient.js");}
    setLoading(false);
  };

  // CRUD Productos
  const saveProduct = async(fd)=>{setSaving(true);try{if(editProduct){const{error}=await supabase.from("products").update({code:fd.code,name:fd.name,category_id:fd.category_id,provider_id:fd.provider_id,cost:fd.cost,price:fd.price,stock:fd.stock,min_stock:fd.min_stock}).eq("id",editProduct.id);if(error)throw error;setProducts(p=>p.map(x=>x.id===editProduct.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("products").insert({code:fd.code,name:fd.name,category_id:fd.category_id,provider_id:fd.provider_id,cost:fd.cost,price:fd.price,stock:fd.stock,min_stock:fd.min_stock}).select().single();if(error)throw error;setProducts(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setProductModal(false);setEditProduct(null);setSaving(false);};
  const deleteProduct = async(id)=>{if(!confirm("¿Eliminar producto?"))return;const{error}=await supabase.from("products").delete().eq("id",id);if(!error)setProducts(p=>p.filter(x=>x.id!==id));};
  // CRUD Categorías
  const saveCategory = async(fd)=>{setSaving(true);try{if(editCategory){const{error}=await supabase.from("categories").update({name:fd.name}).eq("id",editCategory.id);if(error)throw error;setCategories(p=>p.map(x=>x.id===editCategory.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("categories").insert({name:fd.name}).select().single();if(error)throw error;setCategories(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setCategoryModal(false);setEditCategory(null);setSaving(false);};
  const deleteCategory = async(id)=>{if(products.some(p=>p.category_id===id)){alert("No se puede eliminar: tiene productos asignados.");return;}if(!confirm("¿Eliminar categoría?"))return;const{error}=await supabase.from("categories").delete().eq("id",id);if(!error)setCategories(p=>p.filter(x=>x.id!==id));};
  // CRUD Proveedores
  const saveProvider = async(fd)=>{setSaving(true);try{if(editProvider){const{error}=await supabase.from("providers").update(fd).eq("id",editProvider.id);if(error)throw error;setProviders(p=>p.map(x=>x.id===editProvider.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("providers").insert(fd).select().single();if(error)throw error;setProviders(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setProviderModal(false);setEditProvider(null);setSaving(false);};
  const deleteProvider = async(id)=>{if(!confirm("¿Eliminar proveedor?"))return;const{error}=await supabase.from("providers").delete().eq("id",id);if(!error)setProviders(p=>p.filter(x=>x.id!==id));};
  // CRUD Usuarios
  const saveUser = async(fd)=>{setSaving(true);try{if(editUser){const{error}=await supabase.from("users").update(fd).eq("id",editUser.id);if(error)throw error;setUsers(p=>p.map(x=>x.id===editUser.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("users").insert(fd).select().single();if(error)throw error;setUsers(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setUserModal(false);setEditUser(null);setSaving(false);};
  const deleteUser = async(id)=>{if(id===currentUser.id)return;if(!confirm("¿Eliminar usuario?"))return;const{error}=await supabase.from("users").delete().eq("id",id);if(!error)setUsers(p=>p.filter(x=>x.id!==id));};
  const updateStoreName = async(name)=>{setStoreName(name);await supabase.from("config").upsert({key:"store_name",value:name});};

  // POS
  const filteredProducts = products.filter(p=>{const ms=!searchTerm||p.name.toLowerCase().includes(searchTerm.toLowerCase())||p.code.includes(searchTerm);const mc=!selectedCategory||p.category_id===selectedCategory;return ms&&mc;});
  const addToCart=(product)=>{if(product.stock<=0)return;setCart(prev=>{const ex=prev.find(c=>c.product_id===product.id);if(ex){if(ex.qty>=product.stock)return prev;return prev.map(c=>c.product_id===product.id?{...c,qty:c.qty+1}:c);}return[...prev,{product_id:product.id,product_name:product.name,price:product.price,qty:1,maxStock:product.stock}];});};
  const updateCartQty=(pid,qty)=>{if(qty<=0)setCart(p=>p.filter(c=>c.product_id!==pid));else setCart(p=>p.map(c=>c.product_id===pid?{...c,qty:Math.min(qty,c.maxStock)}:c));};
  const removeFromCart=(pid)=>setCart(p=>p.filter(c=>c.product_id!==pid));

  // Cálculos con descuento
  const cartBruto = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const discountAmount = Math.round(cartBruto * discountPercent / 100);
  const cartAfterDiscount = cartBruto - discountAmount;
  const cartNeto = Math.round(cartAfterDiscount / 1.19);
  const cartIVA = cartAfterDiscount - cartNeto;
  const cartTotal = cartAfterDiscount;

  const completeSale = async()=>{
    if(paymentMethod==="cash"&&(!cashGiven||parseInt(cashGiven)<cartTotal))return;
    setSaving(true);
    try{
      const countRes = await supabase.from("sales").select("id",{count:"exact",head:true});
      const sn=String((countRes.count||0)+1).padStart(6,"0");
      const{data:sd,error:se}=await supabase.from("sales").insert({
        sale_number:sn,user_id:currentUser.id,user_name:currentUser.name,
        subtotal:cartNeto,iva:cartIVA,total:cartTotal,payment:paymentMethod,
        cash_given:paymentMethod==="cash"?parseInt(cashGiven):cartTotal,
        change_amount:paymentMethod==="cash"?parseInt(cashGiven)-cartTotal:0,
        discount_percent:discountPercent,discount_amount:discountAmount,subtotal_bruto:cartBruto,
      }).select().single();
      if(se)throw se;
      const items=cart.map(c=>({sale_id:sd.id,product_id:c.product_id,product_name:c.product_name,price:c.price,qty:c.qty}));
      const{error:ie}=await supabase.from("sale_items").insert(items);if(ie)throw ie;
      for(const item of cart){const p=products.find(x=>x.id===item.product_id);if(p)await supabase.from("products").update({stock:p.stock-item.qty}).eq("id",item.product_id);}
      setProducts(p=>p.map(x=>{const it=cart.find(c=>c.product_id===x.id);return it?{...x,stock:x.stock-it.qty}:x;}));
      const cs={...sd,sale_items:items};setSales(p=>[cs,...p]);setLastSale(cs);setCart([]);setPaymentModal(false);setCashGiven("");setDiscountPercent(0);setTicketModal(true);
    }catch(e){alert("Error procesando venta: "+e.message);}
    setSaving(false);
  };

  const handleLogin=()=>{const u=users.find(x=>x.username===loginForm.username&&x.password===loginForm.password);if(u){setCurrentUser(u);setLoginError("");setLoginForm({username:"",password:""});}else setLoginError("Usuario o contraseña incorrectos");};

  if(loading)return <div style={{minHeight:"100vh",background:colors.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🏪</div><div style={{color:colors.text,fontSize:18,fontWeight:600}}>Cargando sistema...</div><div style={{color:colors.textDim,fontSize:13,marginTop:8}}>Conectando con la base de datos</div></div></div>;
  if(dbError)return <div style={{minHeight:"100vh",background:colors.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}><div style={{background:colors.card,borderRadius:16,padding:32,maxWidth:500,textAlign:"center",border:`1px solid ${colors.border}`}}><div style={{fontSize:48,marginBottom:16}}>⚠️</div><h2 style={{color:colors.danger,margin:"0 0 12px"}}>Error de Conexión</h2><p style={{color:colors.textMuted,fontSize:14,lineHeight:1.6}}>{dbError}</p><Btn variant="primary" onClick={loadAllData} style={{marginTop:16}}>🔄 Reintentar</Btn></div></div>;
  if(!currentUser)return <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${colors.bg} 0%,#1a1040 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}><div style={{background:colors.card,borderRadius:20,padding:40,width:"min(400px,90%)",border:`1px solid ${colors.border}`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:48,marginBottom:12}}>🏪</div><h1 style={{color:colors.text,margin:0,fontSize:24,fontWeight:800}}>{storeName}</h1><p style={{color:colors.textMuted,margin:"8px 0 0",fontSize:14}}>Sistema Punto de Venta</p><div style={{marginTop:8}}><Badge color={colors.success}>☁️ Conectado a la nube</Badge></div></div>{loginError&&<div style={{background:colors.danger+"22",color:colors.danger,padding:"10px 14px",borderRadius:8,marginBottom:16,fontSize:13}}>{loginError}</div>}<div style={{marginBottom:16}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:6}}>Usuario</label><input style={baseInput} value={loginForm.username} onChange={e=>setLoginForm(p=>({...p,username:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="admin"/></div><div style={{marginBottom:24}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:6}}>Contraseña</label><input type="password" style={baseInput} value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••"/></div><Btn variant="primary" size="lg" onClick={handleLogin} style={{width:"100%",justifyContent:"center"}}>Iniciar Sesión</Btn><div style={{marginTop:20,padding:14,background:colors.surface,borderRadius:8,fontSize:11,color:colors.textDim}}><div style={{fontWeight:600,marginBottom:4}}>Credenciales:</div><div>Admin: admin / admin123</div><div>Vendedor: vendedor / venta123</div></div></div></div>;

  const isAdmin=currentUser.role==="admin";
  const tabs=[{id:"pos",label:"💰 Venta",show:true},{id:"products",label:"📦 Productos",show:isAdmin},{id:"categories",label:"🏷️ Categorías",show:isAdmin},{id:"providers",label:"🚚 Proveedores",show:isAdmin},{id:"sales",label:"📊 Ventas",show:true},{id:"users",label:"👥 Usuarios",show:isAdmin}].filter(t=>t.show);
  const todaySales=sales.filter(s=>new Date(s.created_at).toDateString()===new Date().toDateString());
  const todayTotal=todaySales.reduce((s,sale)=>s+sale.total,0);
  const lowStockCount=products.filter(p=>p.stock<=p.min_stock).length;

  return (
    <div style={{minHeight:"100vh",background:colors.bg,fontFamily:"'Inter',system-ui,sans-serif",color:colors.text}}>
      <div style={{background:colors.card,borderBottom:`1px solid ${colors.border}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:16,overflow:"auto"}}>
          <span style={{fontSize:22}}>🏪</span><span style={{fontWeight:800,fontSize:17,whiteSpace:"nowrap"}}>{storeName}</span>
          <div style={{display:"flex",gap:2,marginLeft:8}}>{tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?colors.accent+"22":"transparent",color:activeTab===t.id?colors.accent:colors.textMuted,border:"none",borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:activeTab===t.id?700:500,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Inter',system-ui,sans-serif"}}>{t.label}</button>)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {saving&&<Badge color={colors.warning}>Guardando...</Badge>}
          <Badge color={colors.success}>☁️</Badge>
          {isAdmin&&<button onClick={()=>setConfigModal(true)} style={{background:"none",border:"none",color:colors.textMuted,cursor:"pointer",fontSize:18}}>⚙️</button>}
          <Badge color={isAdmin?colors.accent:colors.success}>{isAdmin?"ADMIN":"VENDEDOR"}</Badge>
          <Btn variant="ghost" size="sm" onClick={()=>{setCurrentUser(null);setActiveTab("pos");setCart([]);setDiscountPercent(0);}}>Salir</Btn>
        </div>
      </div>
      <div style={{padding:20,maxWidth:1400,margin:"0 auto"}}>

        {activeTab==="pos"&&<div style={{display:"flex",gap:20,minHeight:"calc(100vh - 116px)",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:280}}>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              <StatCard icon="📈" label="Ventas Hoy" value={fmt(todayTotal)} sub={`${todaySales.length} boletas`} color={colors.success}/>
              <StatCard icon="📦" label="Productos" value={products.length} sub={`${lowStockCount} bajo stock`} color={lowStockCount>0?colors.warning:colors.text}/>
              <StatCard icon="🛒" label="En Carro" value={cart.length} sub={`${cart.reduce((s,c)=>s+c.qty,0)} unidades`} color={colors.accent}/>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:180}}><input style={{...baseInput,paddingLeft:36}} placeholder="Buscar producto o código..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} autoFocus/><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:colors.textDim}}>🔍</span></div>
              <button onClick={()=>setSelectedCategory(null)} style={{background:!selectedCategory?colors.accent:colors.surface,color:!selectedCategory?"#fff":colors.textMuted,border:`1px solid ${colors.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',system-ui,sans-serif"}}>Todos</button>
              {categories.map(c=><button key={c.id} onClick={()=>setSelectedCategory(c.id===selectedCategory?null:c.id)} style={{background:selectedCategory===c.id?colors.accent:colors.surface,color:selectedCategory===c.id?"#fff":colors.textMuted,border:`1px solid ${colors.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',system-ui,sans-serif"}}>{c.name}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {filteredProducts.map(p=><div key={p.id} onClick={()=>addToCart(p)} style={{background:colors.card,border:`1px solid ${p.stock<=p.min_stock?colors.warning+"44":colors.border}`,borderRadius:12,padding:14,cursor:p.stock>0?"pointer":"not-allowed",opacity:p.stock<=0?0.4:1}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:6,lineHeight:1.3}}>{p.name}</div>
                <div style={{fontSize:10,color:colors.textDim,marginBottom:8}}>{p.code}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:16,fontWeight:800,color:colors.accent}}>{fmt(p.price)}</span><Badge color={p.stock<=p.min_stock?colors.warning:colors.success}>{p.stock}u</Badge></div>
              </div>)}
            </div>
          </div>

          {/* CARRITO CON DESCUENTO */}
          <div style={{width:360,minWidth:310,background:colors.card,borderRadius:16,border:`1px solid ${colors.border}`,display:"flex",flexDirection:"column",overflow:"hidden",maxHeight:"calc(100vh - 116px)",position:"sticky",top:76}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${colors.border}`}}><h3 style={{margin:0,fontSize:16,fontWeight:700}}>🧾 Boleta de Venta</h3></div>
            <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
              {cart.length===0?<div style={{textAlign:"center",padding:40,color:colors.textDim}}><div style={{fontSize:36,marginBottom:8}}>🛒</div><div>Agrega productos al carro</div></div>
              :cart.map(item=><div key={item.product_id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:`1px solid ${colors.border}22`}}>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{item.product_name}</div><div style={{fontSize:12,color:colors.textMuted}}>{fmt(item.price)} c/u</div></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <button onClick={()=>updateCartQty(item.product_id,item.qty-1)} style={{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:6,width:28,height:28,color:colors.text,cursor:"pointer",fontSize:14}}>−</button>
                  <span style={{width:24,textAlign:"center",fontSize:14,fontWeight:700}}>{item.qty}</span>
                  <button onClick={()=>updateCartQty(item.product_id,item.qty+1)} style={{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:6,width:28,height:28,color:colors.text,cursor:"pointer",fontSize:14}}>+</button>
                </div>
                <div style={{width:65,textAlign:"right",fontWeight:700,fontSize:13}}>{fmt(item.price*item.qty)}</div>
                <button onClick={()=>removeFromCart(item.product_id)} style={{background:"none",border:"none",color:colors.danger,cursor:"pointer",fontSize:14}}>✕</button>
              </div>)}
            </div>
            {cart.length>0&&<div style={{borderTop:`1px solid ${colors.border}`,padding:"14px 18px"}}>
              {/* DESCUENTO */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"10px 12px",background:colors.surface,borderRadius:8,border:`1px solid ${discountPercent>0?colors.warning+"66":colors.border}`}}>
                <span style={{fontSize:14}}>🏷️</span>
                <span style={{color:colors.textMuted,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>Dcto %</span>
                <input type="number" min="0" max="100" value={discountPercent||""} onChange={e=>{const v=Math.min(100,Math.max(0,parseInt(e.target.value)||0));setDiscountPercent(v);}} placeholder="0" style={{...baseInput,width:55,padding:"6px 8px",fontSize:14,fontWeight:700,textAlign:"center"}}/>
                <div style={{display:"flex",gap:4}}>
                  {[5,10,15,20].map(v=><button key={v} onClick={()=>setDiscountPercent(discountPercent===v?0:v)} style={{background:discountPercent===v?colors.warning+"33":colors.surface,border:`1px solid ${discountPercent===v?colors.warning:colors.border}`,borderRadius:6,padding:"4px 8px",color:discountPercent===v?colors.warning:colors.textDim,fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"'Inter',system-ui,sans-serif"}}>{v}%</button>)}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:colors.textMuted,marginBottom:2}}><span>Subtotal:</span><span>{fmt(cartBruto)}</span></div>
              {discountPercent>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:colors.warning,marginBottom:2}}><span>Descuento ({discountPercent}%):</span><span>-{fmt(discountAmount)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:colors.textDim,marginBottom:2}}><span>Neto:</span><span>{fmt(cartNeto)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:colors.textDim,marginBottom:8}}><span>IVA (19%):</span><span>{fmt(cartIVA)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:22,fontWeight:800,marginBottom:14}}><span>TOTAL:</span><span style={{color:colors.accent}}>{fmt(cartTotal)}</span></div>
              <div style={{display:"flex",gap:8}}><Btn variant="danger" size="sm" onClick={()=>{setCart([]);setDiscountPercent(0);}}>Limpiar</Btn><Btn variant="success" size="lg" onClick={()=>setPaymentModal(true)} style={{flex:1,justifyContent:"center"}}>💳 Cobrar</Btn></div>
            </div>}
          </div>
        </div>}

        {activeTab==="products"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><h2 style={{margin:0,fontSize:20}}>📦 Inventario</h2><Btn variant="primary" onClick={()=>{setEditProduct(null);setProductModal(true);}}>+ Nuevo Producto</Btn></div>
          <div style={{background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}><thead><tr style={{background:colors.surface}}>{["Código","Producto","Categoría","Proveedor","Costo","Precio","Margen","Stock",""].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,color:colors.textMuted,fontWeight:600,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>
          {products.map(p=>{const cat=categories.find(c=>c.id===p.category_id);const prov=providers.find(pr=>pr.id===p.provider_id);const margin=p.price>0?((p.price-p.cost)/p.price*100).toFixed(0):0;return <tr key={p.id} style={{borderTop:`1px solid ${colors.border}22`}}><td style={{padding:"10px 14px",fontSize:12,fontFamily:"monospace",color:colors.textDim}}>{p.code}</td><td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{p.name}</td><td style={{padding:"10px 14px"}}><Badge color={colors.accent}>{cat?.name||"—"}</Badge></td><td style={{padding:"10px 14px",fontSize:12,color:colors.textMuted}}>{prov?.name||"—"}</td><td style={{padding:"10px 14px",fontSize:13}}>{fmt(p.cost)}</td><td style={{padding:"10px 14px",fontSize:13,fontWeight:700}}>{fmt(p.price)}</td><td style={{padding:"10px 14px"}}><Badge color={parseInt(margin)>=30?colors.success:colors.warning}>{margin}%</Badge></td><td style={{padding:"10px 14px"}}><Badge color={p.stock<=0?colors.danger:p.stock<=p.min_stock?colors.warning:colors.success}>{p.stock}/{p.min_stock}</Badge></td><td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:4}}><Btn variant="ghost" size="sm" onClick={()=>{setEditProduct(p);setProductModal(true);}}>✏️</Btn><Btn variant="ghost" size="sm" onClick={()=>deleteProduct(p.id)}>🗑️</Btn></div></td></tr>;})}
          </tbody></table></div></div>}

        {activeTab==="categories"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><h2 style={{margin:0,fontSize:20}}>🏷️ Categorías</h2><Btn variant="primary" onClick={()=>{setEditCategory(null);setCategoryModal(true);}}>+ Nueva Categoría</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>{categories.map(c=>{const pc=products.filter(p=>p.category_id===c.id).length;return <div key={c.id} style={{background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`,padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:18,fontWeight:700}}>🏷️ {c.name}</div><Badge color={colors.accent}>{pc} productos</Badge></div>{pc>0&&<div style={{fontSize:12,color:colors.textDim,marginBottom:12}}>{products.filter(p=>p.category_id===c.id).map(p=>p.name).join(", ")}</div>}<div style={{display:"flex",gap:8}}><Btn variant="ghost" size="sm" onClick={()=>{setEditCategory(c);setCategoryModal(true);}}>✏️ Editar</Btn><Btn variant="ghost" size="sm" onClick={()=>deleteCategory(c.id)}>🗑️ Eliminar</Btn></div></div>;})}</div></div>}

        {activeTab==="providers"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><h2 style={{margin:0,fontSize:20}}>🚚 Proveedores</h2><Btn variant="primary" onClick={()=>{setEditProvider(null);setProviderModal(true);}}>+ Nuevo Proveedor</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>{providers.map(p=>{const pc=products.filter(pr=>pr.provider_id===p.id).length;return <div key={p.id} style={{background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`,padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontSize:16,fontWeight:700}}>{p.name}</div><div style={{fontSize:12,color:colors.textDim,fontFamily:"monospace",marginTop:2}}>RUT: {p.rut}</div></div><Badge color={colors.accent}>{pc} prod.</Badge></div><div style={{fontSize:13,color:colors.textMuted,lineHeight:1.8}}><div>📞 {p.phone}</div><div>📧 {p.email}</div><div>📍 {p.address}</div></div><div style={{display:"flex",gap:8,marginTop:14}}><Btn variant="ghost" size="sm" onClick={()=>{setEditProvider(p);setProviderModal(true);}}>✏️ Editar</Btn><Btn variant="ghost" size="sm" onClick={()=>deleteProvider(p.id)}>🗑️ Eliminar</Btn></div></div>;})}</div></div>}

        {activeTab==="sales"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{margin:0,fontSize:20}}>📊 Ventas</h2><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:colors.textMuted,fontSize:13}}>{sales.length} ventas</span><Btn variant="ghost" size="sm" onClick={loadAllData}>🔄</Btn></div></div>
          {sales.length===0?<div style={{textAlign:"center",padding:60,background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`}}><div style={{fontSize:48,marginBottom:12}}>📋</div><div style={{color:colors.textMuted}}>Sin ventas</div></div>
          :<div style={{background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}><thead><tr style={{background:colors.surface}}>{["N°","Fecha","Cajero","Items","Dcto","Total","Pago",""].map(h=><th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,color:colors.textMuted,fontWeight:600,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>
          {sales.map(s=><tr key={s.id} style={{borderTop:`1px solid ${colors.border}22`}}><td style={{padding:"10px 14px",fontSize:13,fontFamily:"monospace",fontWeight:700}}>#{s.sale_number}</td><td style={{padding:"10px 14px",fontSize:12,color:colors.textMuted}}>{fmtDate(s.created_at)}</td><td style={{padding:"10px 14px",fontSize:13}}>{s.user_name}</td><td style={{padding:"10px 14px",fontSize:13}}>{(s.sale_items||[]).length}</td><td style={{padding:"10px 14px"}}>{s.discount_percent>0?<Badge color={colors.warning}>{s.discount_percent}%</Badge>:<span style={{color:colors.textDim}}>—</span>}</td><td style={{padding:"10px 14px",fontSize:15,fontWeight:800,color:colors.success}}>{fmt(s.total)}</td><td style={{padding:"10px 14px"}}><Badge color={s.payment==="cash"?colors.success:s.payment==="debit"?colors.accent:colors.warning}>{s.payment==="cash"?"Efectivo":s.payment==="debit"?"Débito":s.payment==="credit"?"Crédito":"Transfer."}</Badge></td><td style={{padding:"10px 14px"}}><Btn variant="ghost" size="sm" onClick={()=>setSaleDetailModal(s)}>🧾</Btn></td></tr>)}
          </tbody></table></div>}</div>}

        {activeTab==="users"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><h2 style={{margin:0,fontSize:20}}>👥 Usuarios</h2><Btn variant="primary" onClick={()=>{setEditUser(null);setUserModal(true);}}>+ Nuevo Usuario</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>{users.map(u=>{const us=sales.filter(s=>s.user_id===u.id);const ut=us.reduce((s,sale)=>s+sale.total,0);return <div key={u.id} style={{background:colors.card,borderRadius:12,border:`1px solid ${colors.border}`,padding:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:16,fontWeight:700}}>{u.name}</div><Badge color={u.role==="admin"?colors.accent:colors.success}>{u.role==="admin"?"Admin":"Vendedor"}</Badge></div><div style={{fontSize:13,color:colors.textMuted,marginBottom:4}}>Usuario: <span style={{fontFamily:"monospace"}}>{u.username}</span></div><div style={{fontSize:13,color:colors.textMuted,marginBottom:12}}>Ventas: {us.length} ({fmt(ut)})</div><div style={{display:"flex",gap:8}}><Btn variant="ghost" size="sm" onClick={()=>{setEditUser(u);setUserModal(true);}}>✏️</Btn>{u.id!==currentUser.id&&<Btn variant="ghost" size="sm" onClick={()=>deleteUser(u.id)}>🗑️</Btn>}</div></div>;})}</div></div>}
      </div>

      {/* MODALS */}
      <Modal open={paymentModal} onClose={()=>setPaymentModal(false)} title="💳 Procesar Pago">
        <div style={{display:"flex",justifyContent:"space-between",fontSize:22,fontWeight:800,marginBottom:4,padding:"12px 16px",background:colors.surface,borderRadius:10}}><span>Total:</span><span style={{color:colors.accent}}>{fmt(cartTotal)}</span></div>
        {discountPercent>0&&<div style={{textAlign:"center",marginBottom:12}}><Badge color={colors.warning}>Descuento {discountPercent}% aplicado (-{fmt(discountAmount)})</Badge></div>}
        <div style={{marginBottom:20}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:8}}>Método de Pago</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[["cash","💵 Efectivo"],["debit","💳 Débito"],["credit","💳 Crédito"],["transfer","📱 Transferencia"]].map(([val,label])=><button key={val} onClick={()=>setPaymentMethod(val)} style={{background:paymentMethod===val?colors.accent+"22":colors.surface,border:`2px solid ${paymentMethod===val?colors.accent:colors.border}`,borderRadius:10,padding:"12px",color:colors.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',system-ui,sans-serif"}}>{label}</button>)}</div></div>
        {paymentMethod==="cash"&&<div style={{marginBottom:20}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:6}}>Efectivo Recibido</label><input type="number" style={{...baseInput,fontSize:20,fontWeight:700,textAlign:"center"}} value={cashGiven} onChange={e=>setCashGiven(e.target.value)} placeholder="0" autoFocus/>{cashGiven&&parseInt(cashGiven)>=cartTotal&&<div style={{textAlign:"center",marginTop:10,fontSize:18,fontWeight:700,color:colors.success}}>Vuelto: {fmt(parseInt(cashGiven)-cartTotal)}</div>}<div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{[500,1000,2000,5000,10000,20000].map(v=><button key={v} onClick={()=>setCashGiven(String(v))} style={{background:colors.surface,border:`1px solid ${colors.border}`,borderRadius:6,padding:"6px 12px",color:colors.textMuted,fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"'Inter',system-ui,sans-serif"}}>{fmt(v)}</button>)}</div></div>}
        <Btn variant="success" size="lg" onClick={completeSale} disabled={saving||(paymentMethod==="cash"&&(!cashGiven||parseInt(cashGiven)<cartTotal))} style={{width:"100%",justifyContent:"center"}}>{saving?"⏳ Procesando...":"✅ Confirmar Venta"}</Btn>
      </Modal>

      <Modal open={ticketModal} onClose={()=>setTicketModal(false)} title="🧾 Ticket">{lastSale&&<TicketPreview sale={lastSale} storeName={storeName}/>}</Modal>
      <Modal open={!!saleDetailModal} onClose={()=>setSaleDetailModal(null)} title="🧾 Detalle">{saleDetailModal&&<TicketPreview sale={saleDetailModal} storeName={storeName}/>}</Modal>
      <Modal open={productModal} onClose={()=>{setProductModal(false);setEditProduct(null);}} title={editProduct?"✏️ Editar Producto":"📦 Nuevo Producto"}><ProductForm product={editProduct} categories={categories} providers={providers} onSave={saveProduct} onCancel={()=>{setProductModal(false);setEditProduct(null);}} saving={saving}/></Modal>
      <Modal open={categoryModal} onClose={()=>{setCategoryModal(false);setEditCategory(null);}} title={editCategory?"✏️ Editar Categoría":"🏷️ Nueva Categoría"}><CategoryForm category={editCategory} onSave={saveCategory} onCancel={()=>{setCategoryModal(false);setEditCategory(null);}} saving={saving}/></Modal>
      <Modal open={providerModal} onClose={()=>{setProviderModal(false);setEditProvider(null);}} title={editProvider?"✏️ Editar Proveedor":"🚚 Nuevo Proveedor"}><ProviderForm provider={editProvider} onSave={saveProvider} onCancel={()=>{setProviderModal(false);setEditProvider(null);}} saving={saving}/></Modal>
      <Modal open={userModal} onClose={()=>{setUserModal(false);setEditUser(null);}} title={editUser?"✏️ Editar Usuario":"👤 Nuevo Usuario"}><UserForm user={editUser} onSave={saveUser} onCancel={()=>{setUserModal(false);setEditUser(null);}} saving={saving}/></Modal>
      <Modal open={configModal} onClose={()=>setConfigModal(false)} title="⚙️ Configuración">
        <div style={{marginBottom:16}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:6}}>Nombre del Negocio</label><input style={baseInput} value={storeName} onChange={e=>updateStoreName(e.target.value)}/></div>
        <div style={{padding:14,background:colors.surface,borderRadius:8,fontSize:12,color:colors.textMuted,lineHeight:1.6}}><div style={{fontWeight:600,marginBottom:6,color:colors.text}}>ℹ️ Información</div><div>☁️ Datos en <strong style={{color:colors.success}}>Supabase (nube)</strong> — permanentes y seguros.</div><div>IVA: 19% (Chile). Descuento aplicable por venta.</div></div>
      </Modal>
    </div>
  );
}

function ProductForm({product,categories,providers,onSave,onCancel,saving}){
  const[form,setForm]=useState(product?{code:product.code,name:product.name,category_id:product.category_id,provider_id:product.provider_id,cost:product.cost,price:product.price,stock:product.stock,min_stock:product.min_stock}:{code:"",name:"",category_id:categories[0]?.id||1,provider_id:providers[0]?.id||1,cost:"",price:"",stock:"",min_stock:"5"});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));const valid=form.code&&form.name&&form.cost&&form.price&&form.stock;
  return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Código</label><input style={baseInput} value={form.code} onChange={e=>set("code",e.target.value)} placeholder="7801234..."/></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Nombre</label><input style={baseInput} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nombre"/></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Categoría</label><select style={baseInput} value={form.category_id} onChange={e=>set("category_id",parseInt(e.target.value))}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Proveedor</label><select style={baseInput} value={form.provider_id} onChange={e=>set("provider_id",parseInt(e.target.value))}>{providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Costo (Neto)</label><input type="number" style={baseInput} value={form.cost} onChange={e=>set("cost",e.target.value)} placeholder="0"/></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Precio (IVA incl.)</label><input type="number" style={baseInput} value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0"/></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Stock</label><input type="number" style={baseInput} value={form.stock} onChange={e=>set("stock",e.target.value)} placeholder="0"/></div>
    <div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Stock Mín.</label><input type="number" style={baseInput} value={form.min_stock} onChange={e=>set("min_stock",e.target.value)} placeholder="5"/></div>
  </div>
  {form.cost&&form.price&&<div style={{marginTop:12,padding:10,background:colors.surface,borderRadius:8,fontSize:12,color:colors.textMuted,display:"flex",gap:16}}><span>Margen: <strong style={{color:colors.success}}>{((form.price-form.cost)/form.price*100).toFixed(0)}%</strong></span><span>Ganancia: <strong style={{color:colors.success}}>{fmt(form.price-form.cost)}</strong></span></div>}
  <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn variant="primary" disabled={!valid||saving} onClick={()=>onSave({...form,cost:parseInt(form.cost),price:parseInt(form.price),stock:parseInt(form.stock),min_stock:parseInt(form.min_stock)})}>{saving?"Guardando...":product?"Guardar":"Crear Producto"}</Btn></div></div>;
}
function CategoryForm({category,onSave,onCancel,saving}){
  const[form,setForm]=useState(category||{name:""});const valid=form.name.trim().length>0;
  return <div><div style={{marginBottom:16}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:6}}>Nombre</label><input style={baseInput} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej: Abarrotes..." autoFocus/></div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn variant="primary" disabled={!valid||saving} onClick={()=>onSave(form)}>{saving?"Guardando...":category?"Guardar":"Crear"}</Btn></div></div>;
}
function ProviderForm({provider,onSave,onCancel,saving}){
  const[form,setForm]=useState(provider||{name:"",rut:"",phone:"",email:"",address:""});const set=(k,v)=>setForm(p=>({...p,[k]:v}));const valid=form.name&&form.rut&&form.phone;
  return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div style={{gridColumn:"span 2"}}><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Razón Social</label><input style={baseInput} value={form.name} onChange={e=>set("name",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>RUT</label><input style={baseInput} value={form.rut} onChange={e=>set("rut",e.target.value)} placeholder="76.543.210-K"/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Teléfono</label><input style={baseInput} value={form.phone} onChange={e=>set("phone",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Email</label><input style={baseInput} value={form.email} onChange={e=>set("email",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Dirección</label><input style={baseInput} value={form.address} onChange={e=>set("address",e.target.value)}/></div></div><div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn variant="primary" disabled={!valid||saving} onClick={()=>onSave(form)}>{saving?"Guardando...":provider?"Guardar":"Crear"}</Btn></div></div>;
}
function UserForm({user,onSave,onCancel,saving}){
  const[form,setForm]=useState(user||{name:"",username:"",password:"",role:"seller"});const set=(k,v)=>setForm(p=>({...p,[k]:v}));const valid=form.name&&form.username&&form.password;
  return <div><div style={{display:"grid",gap:12}}><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Nombre</label><input style={baseInput} value={form.name} onChange={e=>set("name",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Usuario</label><input style={baseInput} value={form.username} onChange={e=>set("username",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Contraseña</label><input style={baseInput} value={form.password} onChange={e=>set("password",e.target.value)}/></div><div><label style={{color:colors.textMuted,fontSize:12,fontWeight:500,display:"block",marginBottom:4}}>Rol</label><div style={{display:"flex",gap:8}}>{[["admin","🔑 Admin"],["seller","💰 Vendedor"]].map(([val,label])=><button key={val} onClick={()=>set("role",val)} style={{flex:1,background:form.role===val?colors.accent+"22":colors.surface,border:`2px solid ${form.role===val?colors.accent:colors.border}`,borderRadius:10,padding:12,color:colors.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',system-ui,sans-serif"}}>{label}</button>)}</div></div></div><div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn variant="primary" disabled={!valid||saving} onClick={()=>onSave(form)}>{saving?"Guardando...":user?"Guardar":"Crear"}</Btn></div></div>;
}
