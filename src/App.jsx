import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
const fmtDate = (d) => new Date(d).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDateShort = (d) => new Date(d).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
const todayStr = () => new Date().toISOString().slice(0, 10);

const C = {
  bg: "#1a1a2e", card: "#16213e", accent: "#e94560", accentDark: "#c81e45", accentLight: "#ff6b81",
  success: "#0f9b58", successDark: "#0a7a44", warning: "#f5a623", danger: "#e74c3c",
  blue: "#0a84ff", blueDark: "#0066cc", blueLight: "#4da6ff",
  text: "#ffffff", textMuted: "#a0aec0", textDim: "#718096",
  surface: "#0f3460", surfaceLight: "#1a4a7a", border: "#2a4a7a", borderLight: "#3a5a8a",
  green: "#27ae60", greenDark: "#1e8449", teal: "#00b894",
  numpad: "#2d6a4f", numpadDark: "#1b4332",
};
const baseInput = { background: "#0d1b3e", border: `2px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Segoe UI',system-ui,sans-serif" };

const Btn = ({ children, bg, hover, color = "#fff", onClick, style, disabled, size = "md" }) => {
  const [h, setH] = useState(false);
  const pad = size === "sm" ? "6px 10px" : size === "lg" ? "16px 24px" : "10px 16px";
  const fs = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ background: disabled ? "#333" : h ? (hover || bg) : bg, color: disabled ? "#666" : color, border: "none", borderRadius: 6, padding: pad, fontSize: fs, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Segoe UI',system-ui,sans-serif", textTransform: "uppercase", letterSpacing: 0.5, ...style }}>{children}</button>;
};

const Modal = ({ open, onClose, title, children, wide }) => { if (!open) return null; return <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)" }} onClick={onClose}><div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 12, border: `2px solid ${C.border}`, padding: 24, width: wide ? "min(900px,95%)" : "min(500px,92%)", maxHeight: "90vh", overflowY: "auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ margin: 0, color: C.text, fontSize: 18 }}>{title}</h3><button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 22, cursor: "pointer" }}>✕</button></div>{children}</div></div>; };
const Badge = ({ children, bg }) => <span style={{ background: bg, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5 }}>{children}</span>;

// Ticket
const TicketPreview = ({ sale, storeName }) => {
  const ref = useRef(null);
  const print = () => { const c = ref.current.innerHTML; const w = window.open("","_blank","width=350,height=600"); w.document.write(`<html><head><title>Ticket</title><style>body{font-family:'Courier New',monospace;font-size:12px;padding:10px;margin:0;max-width:300px;color:#000}table{width:100%;border-collapse:collapse}td{padding:2px 0;vertical-align:top}</style></head><body>${c}<script>window.print();setTimeout(()=>window.close(),1000)<\/script></body></html>`); };
  const items = sale.sale_items || [];
  return <div><div ref={ref} style={{ background:"#fff",color:"#000",fontFamily:"'Courier New',monospace",fontSize:12,padding:20,borderRadius:8,maxWidth:320,margin:"0 auto" }}>
    <div style={{textAlign:"center",marginBottom:8}}><div style={{fontWeight:"bold",fontSize:16}}>{storeName}</div><div style={{fontSize:10}}>Santiago, Chile</div></div>
    <div style={{borderTop:"1px dashed #000",margin:"6px 0"}}/>
    <div style={{fontSize:10}}><div style={{display:"flex",justifyContent:"space-between"}}><span>Boleta N°: {sale.sale_number}</span><span>{fmtDate(sale.created_at)}</span></div><div>Cajero: {sale.user_name}</div></div>
    <div style={{borderTop:"1px dashed #000",margin:"6px 0"}}/>
    <table><thead><tr style={{fontSize:10,fontWeight:"bold"}}><td style={{width:25}}>Qty</td><td>Descripción</td><td style={{width:65,textAlign:"right"}}>Total</td></tr></thead><tbody>{items.map((it,i)=><tr key={i} style={{fontSize:11}}><td>{it.qty}</td><td>{it.product_name}</td><td style={{textAlign:"right"}}>{fmt(it.price*it.qty)}</td></tr>)}</tbody></table>
    <div style={{borderTop:"1px dashed #000",margin:"6px 0"}}/>
    <div style={{fontSize:11}}>
      {sale.discount_percent>0&&<><div style={{display:"flex",justifyContent:"space-between"}}><span>Subtotal:</span><span>{fmt(sale.subtotal_bruto)}</span></div><div style={{display:"flex",justifyContent:"space-between",color:"#c00"}}><span>Dcto ({sale.discount_percent}%):</span><span>-{fmt(sale.discount_amount)}</span></div></>}
      <div style={{display:"flex",justifyContent:"space-between"}}><span>Neto:</span><span>{fmt(sale.subtotal)}</span></div>
      <div style={{display:"flex",justifyContent:"space-between"}}><span>IVA 19%:</span><span>{fmt(sale.iva)}</span></div>
      <div style={{display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:14,marginTop:4}}><span>TOTAL:</span><span>{fmt(sale.total)}</span></div>
    </div>
    {sale.payment==="cash"&&<div style={{fontSize:11,marginTop:4}}><div style={{display:"flex",justifyContent:"space-between"}}><span>Efectivo:</span><span>{fmt(sale.cash_given)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontWeight:"bold"}}><span>Vuelto:</span><span>{fmt(sale.change_amount)}</span></div></div>}
    {sale.payment!=="cash"&&<div style={{fontSize:11,marginTop:4,textAlign:"center"}}>Pago: {sale.payment==="debit"?"Débito":sale.payment==="credit"?"Crédito":"Transferencia"}</div>}
    <div style={{borderTop:"1px dashed #000",margin:"6px 0"}}/><div style={{textAlign:"center",fontSize:10}}>¡Gracias por su compra!</div>
  </div><div style={{textAlign:"center",marginTop:16}}><Btn bg={C.blue} hover={C.blueDark} onClick={print}>🖨️ Imprimir</Btn></div></div>;
};

// Cierre de Caja
const CierreCaja = ({ sales, products, storeName, currentUser, onClose }) => {
  const ref = useRef(null);
  const today = todayStr();
  const todaySales = sales.filter(s => s.created_at && s.created_at.startsWith(today));
  const totalVentas = todaySales.reduce((s, v) => s + v.total, 0);
  const totalNeto = todaySales.reduce((s, v) => s + v.subtotal, 0);
  const totalIVA = todaySales.reduce((s, v) => s + v.iva, 0);
  const totalDcto = todaySales.reduce((s, v) => s + (v.discount_amount || 0), 0);
  const byPayment = { cash: 0, debit: 0, credit: 0, transfer: 0 };
  todaySales.forEach(s => { byPayment[s.payment] = (byPayment[s.payment] || 0) + s.total; });
  let totalCosto = 0;
  todaySales.forEach(s => (s.sale_items || []).forEach(it => { const prod = products.find(p => p.id === it.product_id); totalCosto += (prod ? prod.cost : 0) * it.qty; }));
  const ganancia = totalNeto - totalCosto;
  const margenPct = totalNeto > 0 ? (ganancia / totalNeto * 100).toFixed(1) : 0;
  const topProducts = {};
  todaySales.forEach(s => (s.sale_items || []).forEach(it => { topProducts[it.product_name] = (topProducts[it.product_name] || 0) + it.qty; }));
  const topList = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const printCierre = () => { const c = ref.current.innerHTML; const w = window.open("","_blank","width=400,height=700"); w.document.write(`<html><head><title>Cierre</title><style>body{font-family:'Courier New',monospace;font-size:12px;padding:15px;margin:0;max-width:380px;color:#000}table{width:100%;border-collapse:collapse}td,th{padding:3px 0;text-align:left}th{border-bottom:1px solid #000}.r{text-align:right}.b{font-weight:bold}.line{border-top:1px dashed #000;margin:8px 0}</style></head><body>${c}<script>window.print();setTimeout(()=>window.close(),1000)<\/script></body></html>`); };

  return <div>
    <div ref={ref} style={{ background: "#fff", color: "#000", fontFamily: "'Courier New',monospace", fontSize: 12, padding: 24, borderRadius: 8, maxWidth: 400, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}><div style={{ fontWeight: "bold", fontSize: 18 }}>{storeName}</div><div style={{ fontSize: 11 }}>CIERRE DE CAJA</div><div style={{ fontSize: 11, marginTop: 4 }}>{fmtDateShort(new Date())}</div><div style={{ fontSize: 10 }}>Cajero: {currentUser.name}</div></div>
      <div style={{ borderTop: "2px solid #000", margin: "10px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>Total Boletas:</span><strong>{todaySales.length}</strong></div>
      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>RESUMEN POR MEDIO DE PAGO:</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Efectivo:</span><span>{fmt(byPayment.cash)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Débito:</span><span>{fmt(byPayment.debit)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Crédito:</span><span>{fmt(byPayment.credit)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Transferencia:</span><span>{fmt(byPayment.transfer)}</span></div>
      </div>
      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
      <div style={{ fontSize: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Neto:</span><span>{fmt(totalNeto)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>IVA 19%:</span><span>{fmt(totalIVA)}</span></div>
        {totalDcto > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Descuentos:</span><span>-{fmt(totalDcto)}</span></div>}
      </div>
      <div style={{ borderTop: "2px solid #000", margin: "8px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: "bold" }}><span>TOTAL:</span><span>{fmt(totalVentas)}</span></div>
      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
      <div style={{ fontSize: 11 }}>
        <div style={{ fontWeight: "bold", marginBottom: 4 }}>RENTABILIDAD:</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Costo productos:</span><span>{fmt(totalCosto)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>Ganancia neta:</span><span>{fmt(ganancia)}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Margen:</span><span>{margenPct}%</span></div>
      </div>
      {topList.length > 0 && <>
        <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
        <div style={{ fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>TOP PRODUCTOS VENDIDOS:</div>
        {topList.map(([name, qty], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span>{i + 1}. {name}</span><span>{qty} und.</span></div>)}
      </>}
      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />
      <div style={{ textAlign: "center", fontSize: 10 }}>Cierre generado: {fmtDate(new Date())}</div>
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
      <Btn bg={C.blue} hover={C.blueDark} onClick={printCierre}>🖨️ Imprimir Cierre</Btn>
      <Btn bg={C.surface} hover={C.surfaceLight} onClick={onClose}>Cerrar</Btn>
    </div>
  </div>;
};

export default function POSApp() {
  const [products,setProducts]=useState([]);const [categories,setCategories]=useState([]);const [providers,setProviders]=useState([]);const [users,setUsers]=useState([]);const [sales,setSales]=useState([]);const [storeName,setStoreName]=useState("MI NEGOCIO");const [loading,setLoading]=useState(true);const [dbError,setDbError]=useState(null);
  const [currentUser,setCurrentUser]=useState(null);const [loginForm,setLoginForm]=useState({username:"",password:""});const [loginError,setLoginError]=useState("");const [activeTab,setActiveTab]=useState("pos");
  const [cart,setCart]=useState([]);const [searchTerm,setSearchTerm]=useState("");const [searchResults,setSearchResults]=useState([]);const [showResults,setShowResults]=useState(false);
  const [paymentModal,setPaymentModal]=useState(false);const [paymentMethod,setPaymentMethod]=useState("cash");const [cashGiven,setCashGiven]=useState("");const [lastSale,setLastSale]=useState(null);const [ticketModal,setTicketModal]=useState(false);
  const [discountPercent,setDiscountPercent]=useState(0);const [qtyInput,setQtyInput]=useState("1");
  const [productModal,setProductModal]=useState(false);const [editProduct,setEditProduct]=useState(null);const [providerModal,setProviderModal]=useState(false);const [editProvider,setEditProvider]=useState(null);
  const [userModal,setUserModal]=useState(false);const [editUser,setEditUser]=useState(null);const [categoryModal,setCategoryModal]=useState(false);const [editCategory,setEditCategory]=useState(null);
  const [configModal,setConfigModal]=useState(false);const [saleDetailModal,setSaleDetailModal]=useState(null);const [saving,setSaving]=useState(false);
  const [cierreModal,setCierreModal]=useState(false);
  const [prodSearch,setProdSearch]=useState("");
  const [prodCatFilter,setProdCatFilter]=useState(null);
  const [reportPeriod,setReportPeriod]=useState("today");
  const [salesSearch,setSalesSearch]=useState("");
  const [stockAlertModal,setStockAlertModal]=useState(false);
  const [quoteModal,setQuoteModal]=useState(false);
  const [quoteCart,setQuoteCart]=useState([]);
  const [quoteSearch,setQuoteSearch]=useState("");
  const [quoteResults,setQuoteResults]=useState([]);
  const [quoteClient,setQuoteClient]=useState({name:"",rut:"",phone:""});
  const [quoteDiscount,setQuoteDiscount]=useState(0);
  const [quotePreview,setQuotePreview]=useState(null);
  const [savedQuotes,setSavedQuotes]=useState([]);
  const [quoteView,setQuoteView]=useState("new");// new | history
  const [viewingQuote,setViewingQuote]=useState(null);
  const [storeRut,setStoreRut]=useState("");
  const [storeAddress,setStoreAddress]=useState("");
  const [storePhone,setStorePhone]=useState("");
  const APP_VERSION = "v5.4";
  const searchRef=useRef(null);

  useEffect(()=>{loadAllData();},[]);

  // REALTIME: escuchar cambios en ventas y productos
  useEffect(()=>{
    const salesSub=supabase.channel("sales_changes").on("postgres_changes",{event:"*",schema:"public",table:"sales"},()=>{
      supabase.from("sales").select("*, sale_items(*)").order("id",{ascending:false}).limit(500).then(({data})=>{if(data)setSales(data);});
    }).subscribe();
    const prodSub=supabase.channel("products_changes").on("postgres_changes",{event:"*",schema:"public",table:"products"},()=>{
      supabase.from("products").select("*").order("id").then(({data})=>{if(data)setProducts(data);});
    }).subscribe();
    return()=>{supabase.removeChannel(salesSub);supabase.removeChannel(prodSub);};
  },[]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [catRes,provRes,prodRes,userRes,salesRes,configRes,quotesRes] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase.from("providers").select("*").order("id"),
        supabase.from("products").select("*").order("id"),
        supabase.from("users").select("*").order("id"),
        supabase.from("sales").select("*, sale_items(*)").order("id",{ascending:false}).limit(500),
        supabase.from("config").select("*"),
        supabase.from("quotes").select("*, quote_items(*)").order("id",{ascending:false}).limit(200),
      ]);
      if(catRes.error) throw catRes.error;
      setCategories(catRes.data||[]);setProviders(provRes.data||[]);setProducts(prodRes.data||[]);setUsers(userRes.data||[]);setSales(salesRes.data||[]);setSavedQuotes(quotesRes.data||[]);
      const sc=(configRes.data||[]).find(c=>c.key==="store_name");if(sc)setStoreName(sc.value);
      const sr=(configRes.data||[]).find(c=>c.key==="store_rut");if(sr)setStoreRut(sr.value);
      const sa=(configRes.data||[]).find(c=>c.key==="store_address");if(sa)setStoreAddress(sa.value);
      const sp=(configRes.data||[]).find(c=>c.key==="store_phone");if(sp)setStorePhone(sp.value);
      setDbError(null);
    } catch(err){console.error(err);setDbError("No se pudo conectar con Supabase.");}
    setLoading(false);
  };

  // CRUD
  const saveProduct=async(fd)=>{setSaving(true);try{if(editProduct){await supabase.from("products").update(fd).eq("id",editProduct.id);setProducts(p=>p.map(x=>x.id===editProduct.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("products").insert(fd).select().single();if(error)throw error;setProducts(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setProductModal(false);setEditProduct(null);setSaving(false);};
  const deleteProduct=async(id)=>{if(!confirm("¿Eliminar?"))return;await supabase.from("products").delete().eq("id",id);setProducts(p=>p.filter(x=>x.id!==id));};
  const saveCategory=async(fd)=>{setSaving(true);try{if(editCategory){await supabase.from("categories").update({name:fd.name}).eq("id",editCategory.id);setCategories(p=>p.map(x=>x.id===editCategory.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("categories").insert({name:fd.name}).select().single();if(error)throw error;setCategories(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setCategoryModal(false);setEditCategory(null);setSaving(false);};
  const deleteCategory=async(id)=>{if(products.some(p=>p.category_id===id)){alert("Tiene productos asignados.");return;}if(!confirm("¿Eliminar?"))return;await supabase.from("categories").delete().eq("id",id);setCategories(p=>p.filter(x=>x.id!==id));};
  const saveProvider=async(fd)=>{setSaving(true);try{if(editProvider){await supabase.from("providers").update(fd).eq("id",editProvider.id);setProviders(p=>p.map(x=>x.id===editProvider.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("providers").insert(fd).select().single();if(error)throw error;setProviders(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setProviderModal(false);setEditProvider(null);setSaving(false);};
  const deleteProvider=async(id)=>{if(!confirm("¿Eliminar?"))return;await supabase.from("providers").delete().eq("id",id);setProviders(p=>p.filter(x=>x.id!==id));};
  const saveUser=async(fd)=>{setSaving(true);try{if(editUser){await supabase.from("users").update(fd).eq("id",editUser.id);setUsers(p=>p.map(x=>x.id===editUser.id?{...x,...fd}:x));}else{const{data,error}=await supabase.from("users").insert(fd).select().single();if(error)throw error;setUsers(p=>[...p,data]);}}catch(e){alert("Error: "+e.message);}setUserModal(false);setEditUser(null);setSaving(false);};
  const deleteUser=async(id)=>{if(id===currentUser.id)return;if(!confirm("¿Eliminar?"))return;await supabase.from("users").delete().eq("id",id);setUsers(p=>p.filter(x=>x.id!==id));};
  const updateStoreName=async(n)=>{setStoreName(n);await supabase.from("config").upsert({key:"store_name",value:n});};
  const updateStoreConfig=async(key,val,setter)=>{setter(val);await supabase.from("config").upsert({key,value:val});};

  // COTIZACIONES
  useEffect(()=>{
    if(!quoteSearch.trim()){setQuoteResults([]);return;}
    const q=quoteSearch.toLowerCase();
    setQuoteResults(products.filter(p=>p.name.toLowerCase().includes(q)||p.code.includes(q)).slice(0,6));
  },[quoteSearch,products]);
  const addToQuote=(p)=>{setQuoteCart(prev=>{const ex=prev.find(c=>c.product_id===p.id);if(ex)return prev.map(c=>c.product_id===p.id?{...c,qty:c.qty+1}:c);return[...prev,{product_id:p.id,product_name:p.name,price:p.price,qty:1}];});setQuoteSearch("");};
  const lowStockProducts=products.filter(p=>p.stock<=p.min_stock);

  // Guardar cotización en Supabase
  const saveQuote=async(quoteData)=>{
    setSaving(true);
    try{
      const countRes=await supabase.from("quotes").select("id",{count:"exact",head:true});
      const qn="COT-"+String((countRes.count||0)+1).padStart(5,"0");
      const{data:qd,error:qe}=await supabase.from("quotes").insert({
        quote_number:qn,user_id:currentUser.id,user_name:currentUser.name,
        client_name:quoteData.client.name,client_rut:quoteData.client.rut,client_phone:quoteData.client.phone,
        subtotal_bruto:quoteData.bruto,discount_percent:quoteData.discount,discount_amount:quoteData.dcto,
        subtotal:quoteData.neto,iva:quoteData.iva,total:quoteData.total,status:"pending",
      }).select().single();
      if(qe)throw qe;
      const items=quoteData.items.map(it=>({quote_id:qd.id,product_id:it.product_id,product_name:it.product_name,price:it.price,qty:it.qty}));
      await supabase.from("quote_items").insert(items);
      const saved={...qd,quote_items:items};
      setSavedQuotes(p=>[saved,...p]);
      return saved;
    }catch(e){alert("Error guardando cotización: "+e.message);return null;}
    finally{setSaving(false);}
  };

  // Cambiar estado de cotización
  const updateQuoteStatus=async(id,status)=>{
    await supabase.from("quotes").update({status}).eq("id",id);
    setSavedQuotes(p=>p.map(q=>q.id===id?{...q,status}:q));
  };

  // Cargar cotización aceptada al carro de venta
  const loadQuoteToSale=(quote)=>{
    const items=(quote.quote_items||[]).map(it=>{
      const prod=products.find(p=>p.id===it.product_id);
      return {product_id:it.product_id,product_name:it.product_name,price:it.price,qty:it.qty,maxStock:prod?prod.stock:9999};
    });
    setCart(items);
    if(quote.discount_percent>0)setDiscountPercent(quote.discount_percent);
    setActiveTab("pos");
  };

  // BÚSQUEDA tipo POS - compatible con pistola de código de barras
  // La pistola escribe muy rápido y envía Enter al final.
  // React state puede no estar sincronizado, así que al presionar Enter
  // leemos el valor directo del DOM y buscamos coincidencia exacta por código.
  const barcodeBuffer = useRef("");
  const barcodeTimer = useRef(null);

  useEffect(()=>{
    if(!searchTerm.trim()){setSearchResults([]);setShowResults(false);return;}
    const q=searchTerm.toLowerCase();
    // Priorizar coincidencia exacta de código
    const exact=products.filter(p=>p.code===searchTerm);
    if(exact.length>0){setSearchResults(exact);setShowResults(true);return;}
    // Luego códigos que empiecen con el texto, luego nombres
    const byCode=products.filter(p=>p.code.startsWith(searchTerm));
    const byName=products.filter(p=>p.name.toLowerCase().includes(q)&&!byCode.includes(p));
    const res=[...byCode,...byName].slice(0,8);
    setSearchResults(res);setShowResults(res.length>0);
  },[searchTerm,products]);

  const handleSearchKeyDown = (e) => {
    if(e.key==="Enter"){
      e.preventDefault();
      // Leer valor directo del input (no del state, que puede estar atrasado)
      const rawValue = searchRef.current ? searchRef.current.value.trim() : searchTerm.trim();
      if(!rawValue)return;
      // 1. Buscar coincidencia EXACTA por código de barras
      const exactMatch = products.find(p => p.code === rawValue);
      if(exactMatch){
        addToCart(exactMatch, parseInt(qtyInput)||1);
        return;
      }
      // 2. Buscar código que empiece con el valor
      const startMatch = products.find(p => p.code.startsWith(rawValue));
      if(startMatch){
        addToCart(startMatch, parseInt(qtyInput)||1);
        return;
      }
      // 3. Fallback: primer resultado de búsqueda
      if(searchResults.length>0){
        addToCart(searchResults[0], parseInt(qtyInput)||1);
      }
    }
    if(e.key==="Escape"){setSearchTerm("");setShowResults(false);}
  };

  const addToCart=(product,qty)=>{
    if(product.stock<=0)return;
    const amount=Math.min(qty||1,product.stock);
    setCart(prev=>{const ex=prev.find(c=>c.product_id===product.id);if(ex){const newQty=Math.min(ex.qty+amount,product.stock);return prev.map(c=>c.product_id===product.id?{...c,qty:newQty}:c);}return[...prev,{product_id:product.id,product_name:product.name,price:product.price,qty:amount,maxStock:product.stock}];});
    setSearchTerm("");setShowResults(false);setQtyInput("1");
    if(searchRef.current)searchRef.current.focus();
  };
  const updateCartQty=(pid,qty)=>{if(qty<=0)setCart(p=>p.filter(c=>c.product_id!==pid));else setCart(p=>p.map(c=>c.product_id===pid?{...c,qty:Math.min(qty,c.maxStock)}:c));};
  const removeFromCart=(pid)=>setCart(p=>p.filter(c=>c.product_id!==pid));

  const cartBruto=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const discountAmount=Math.round(cartBruto*discountPercent/100);
  const cartAfterDiscount=cartBruto-discountAmount;
  const cartNeto=Math.round(cartAfterDiscount/1.19);
  const cartIVA=cartAfterDiscount-cartNeto;
  const cartTotal=cartAfterDiscount;
  const cartItems=cart.reduce((s,c)=>s+c.qty,0);

  const completeSale=async()=>{
    if(paymentMethod==="cash"&&(!cashGiven||parseInt(cashGiven)<cartTotal))return;
    setSaving(true);
    try{
      const countRes=await supabase.from("sales").select("id",{count:"exact",head:true});
      const sn=String((countRes.count||0)+1).padStart(6,"0");
      const{data:sd,error:se}=await supabase.from("sales").insert({sale_number:sn,user_id:currentUser.id,user_name:currentUser.name,subtotal:cartNeto,iva:cartIVA,total:cartTotal,payment:paymentMethod,cash_given:paymentMethod==="cash"?parseInt(cashGiven):cartTotal,change_amount:paymentMethod==="cash"?parseInt(cashGiven)-cartTotal:0,discount_percent:discountPercent,discount_amount:discountAmount,subtotal_bruto:cartBruto}).select().single();
      if(se)throw se;
      const items=cart.map(c=>({sale_id:sd.id,product_id:c.product_id,product_name:c.product_name,price:c.price,qty:c.qty}));
      await supabase.from("sale_items").insert(items);
      for(const item of cart){const p=products.find(x=>x.id===item.product_id);if(p)await supabase.from("products").update({stock:p.stock-item.qty}).eq("id",item.product_id);}
      setProducts(p=>p.map(x=>{const it=cart.find(c=>c.product_id===x.id);return it?{...x,stock:x.stock-it.qty}:x;}));
      const cs={...sd,sale_items:items};setSales(p=>[cs,...p]);setLastSale(cs);setCart([]);setPaymentModal(false);setCashGiven("");setDiscountPercent(0);setTicketModal(true);
    }catch(e){alert("Error: "+e.message);}
    setSaving(false);
  };

  // Keyboard shortcuts
  useEffect(()=>{
    const handler=(e)=>{
      if(!currentUser)return;
      if(e.key==="F2"){e.preventDefault();if(searchRef.current)searchRef.current.focus();}
      if(e.key==="F3"&&cart.length>0){e.preventDefault();setPaymentModal(true);}
      if(e.key==="F5"){e.preventDefault();setCart([]);setDiscountPercent(0);}
      if(e.key==="Escape"){setShowResults(false);setPaymentModal(false);}
    };
    window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);
  },[currentUser,cart]);

  const handleLogin=()=>{const u=users.find(x=>x.username===loginForm.username&&x.password===loginForm.password);if(u){setCurrentUser(u);setLoginError("");setLoginForm({username:"",password:""});}else setLoginError("Usuario o contraseña incorrectos");};

  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🏪</div><div style={{color:C.text,fontSize:20,fontWeight:700}}>Cargando...</div></div></div>;
  if(dbError)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><div style={{background:C.card,borderRadius:12,padding:32,maxWidth:500,textAlign:"center",border:`2px solid ${C.border}`}}><div style={{fontSize:48,marginBottom:16}}>⚠️</div><h2 style={{color:C.danger,margin:"0 0 12px"}}>Error de Conexión</h2><p style={{color:C.textMuted,fontSize:14}}>{dbError}</p><Btn bg={C.blue} onClick={loadAllData} style={{marginTop:16}}>🔄 Reintentar</Btn></div></div>;
  if(!currentUser)return <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.bg},#0f3460)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><div style={{background:C.card,borderRadius:16,padding:40,width:"min(400px,90%)",border:`2px solid ${C.border}`}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:48,marginBottom:12}}>🏪</div><h1 style={{color:C.text,margin:0,fontSize:26,fontWeight:800}}>{storeName}</h1><p style={{color:C.textMuted,margin:"8px 0 0",fontSize:14}}>Punto de Venta</p></div>{loginError&&<div style={{background:C.danger+"33",color:C.accentLight,padding:"10px 14px",borderRadius:8,marginBottom:16,fontSize:13}}>{loginError}</div>}<div style={{marginBottom:16}}><label style={{color:C.textMuted,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>USUARIO</label><input style={baseInput} value={loginForm.username} onChange={e=>setLoginForm(p=>({...p,username:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="admin"/></div><div style={{marginBottom:24}}><label style={{color:C.textMuted,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>CONTRASEÑA</label><input type="password" style={baseInput} value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••"/></div><Btn bg={C.accent} hover={C.accentDark} size="lg" onClick={handleLogin} style={{width:"100%",justifyContent:"center"}}>INGRESAR</Btn><div style={{marginTop:16,padding:12,background:C.surface,borderRadius:8,fontSize:11,color:C.textDim}}><div>admin / admin123 | vendedor / venta123</div></div></div></div>;

  const isAdmin=currentUser.role==="admin";
  const tabs=[{id:"pos",label:"💰 CAJA",show:true},{id:"products",label:"📦 PRODUCTOS",show:isAdmin},{id:"categories",label:"🏷️ CATEGORÍAS",show:isAdmin},{id:"providers",label:"🚚 PROVEEDORES",show:isAdmin},{id:"stock",label:`🔔 STOCK${lowStockProducts.length>0?" ("+lowStockProducts.length+")":""}`,show:true},{id:"quotes",label:"📄 COTIZAR",show:isAdmin},{id:"sales",label:"📊 VENTAS",show:true},{id:"users",label:"👥 USUARIOS",show:isAdmin}].filter(t=>t.show);
  const todaySales=sales.filter(s=>s.created_at&&s.created_at.startsWith(todayStr()));
  const todayTotal=todaySales.reduce((s,sale)=>s+sale.total,0);
  const lastSaleData=sales[0];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text}}>
      {/* HEADER */}
      <div style={{background:C.card,borderBottom:`2px solid ${C.border}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12,overflow:"auto"}}>
          <span style={{fontWeight:800,fontSize:18,color:C.accent}}>{storeName}</span>
          <div style={{display:"flex",gap:2,marginLeft:8}}>{tabs.map(t=><button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?C.accent:C.surface,color:"#fff",border:"none",borderRadius:4,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Segoe UI',system-ui,sans-serif",letterSpacing:0.5}}>{t.label}</button>)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {saving&&<Badge bg={C.warning}>GUARDANDO</Badge>}
          <Badge bg={C.success}>● ONLINE</Badge>
          <Badge bg={C.surface}>{APP_VERSION}</Badge>
          {/* Campanita stock bajo */}
          <button onClick={()=>setActiveTab("stock")} style={{position:"relative",background:"none",border:"none",fontSize:20,cursor:"pointer",padding:"4px 6px"}}>
            🔔
            {lowStockProducts.length>0&&<span style={{position:"absolute",top:-2,right:-2,background:C.danger,color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{lowStockProducts.length}</span>}
          </button>
          {isAdmin&&<button onClick={()=>setConfigModal(true)} style={{background:"none",border:"none",color:C.textMuted,fontSize:18,cursor:"pointer",padding:"2px 4px"}}>⚙️</button>}
          <span style={{color:C.textMuted,fontSize:12}}>{currentUser.name}</span>
          <Btn bg={C.danger} size="sm" onClick={()=>{setCurrentUser(null);setCart([]);setDiscountPercent(0);}}>SALIR</Btn>
        </div>
      </div>

      <div style={{padding:16,maxWidth:1500,margin:"0 auto"}}>

        {/* ═══ CAJA POS ═══ */}
        {activeTab==="pos"&&<div>
          {/* BARRA SUPERIOR: Info caja */}
          <div style={{display:"flex",gap:2,marginBottom:12,background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderRight:`1px solid ${C.border}`}}><div style={{fontSize:10,color:C.textDim}}>CAJA</div><div style={{fontSize:14,fontWeight:700}}>{currentUser.name}</div></div>
            <div style={{padding:"10px 16px",borderRight:`1px solid ${C.border}`}}><div style={{fontSize:10,color:C.textDim}}>ITEMS</div><div style={{fontSize:14,fontWeight:700}}>{cartItems}</div></div>
            <div style={{padding:"10px 16px",borderRight:`1px solid ${C.border}`}}><div style={{fontSize:10,color:C.textDim}}>ÚLT. VENTA</div><div style={{fontSize:14,fontWeight:700}}>{lastSaleData?`T${lastSaleData.sale_number}`:"-"}</div></div>
            <div style={{padding:"10px 16px",flex:1,borderRight:`1px solid ${C.border}`}}><div style={{fontSize:10,color:C.textDim}}>VENTAS HOY</div><div style={{fontSize:14,fontWeight:700}}>{todaySales.length} ({fmt(todayTotal)})</div></div>
            <div style={{padding:"10px 16px",background:C.accent,display:"flex",alignItems:"center"}}><div style={{fontSize:10,color:"#fff",opacity:0.8}}>PAGADO</div></div>
            <div style={{padding:"10px 16px",background:C.accent,display:"flex",alignItems:"center"}}><div style={{fontSize:10,color:"#fff",opacity:0.8}}>VUELTO</div></div>
          </div>

          {/* TOTAL GRANDE */}
          <div style={{background:C.accent,borderRadius:8,padding:"16px 24px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:600,opacity:0.9}}>TOTAL A PAGAR</div>
            <div style={{fontSize:48,fontWeight:900,letterSpacing:2,fontVariantNumeric:"tabular-nums"}}>{Math.round(cartTotal).toLocaleString("es-CL")}</div>
          </div>

          <div style={{display:"flex",gap:12}}>
            {/* TABLA DE VENTA */}
            <div style={{flex:1}}>
              {/* Tabla items */}
              <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:12,minHeight:300,maxHeight:"calc(100vh - 380px)",overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:C.surface}}>{["Código","Descripción","Precio","Cantidad","$ Dcto","Total",""].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700,borderBottom:`2px solid ${C.border}`}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {cart.length===0?<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:C.textDim,fontSize:14}}>Busca un producto por código o nombre para agregarlo</td></tr>
                    :cart.map((item,i)=><tr key={item.product_id} style={{background:i%2===0?"transparent":C.surface+"44",borderBottom:`1px solid ${C.border}22`}}>
                      <td style={{padding:"8px 10px",fontSize:12,fontFamily:"monospace"}}>{products.find(p=>p.id===item.product_id)?.code||""}</td>
                      <td style={{padding:"8px 10px",fontSize:13,fontWeight:600}}>{item.product_name}</td>
                      <td style={{padding:"8px 10px",fontSize:13}}>{fmt(item.price)}</td>
                      <td style={{padding:"8px 10px"}}><div style={{display:"flex",alignItems:"center",gap:4}}>
                        <button onClick={()=>updateCartQty(item.product_id,item.qty-1)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,width:24,height:24,color:C.text,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                        <span style={{width:30,textAlign:"center",fontWeight:700}}>{item.qty}</span>
                        <button onClick={()=>updateCartQty(item.product_id,item.qty+1)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,width:24,height:24,color:C.text,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div></td>
                      <td style={{padding:"8px 10px",fontSize:13,color:C.textDim}}>$0</td>
                      <td style={{padding:"8px 10px",fontSize:14,fontWeight:800}}>{fmt(item.price*item.qty)}</td>
                      <td style={{padding:"8px 10px"}}><button onClick={()=>removeFromCart(item.product_id)} style={{background:C.danger,border:"none",borderRadius:4,width:24,height:24,color:"#fff",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>

              {/* Barra de búsqueda + producto seleccionado */}
              <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:12}}>
                <div style={{display:"flex",gap:8,alignItems:"center",position:"relative"}}>
                  <div style={{flex:1,position:"relative"}}>
                    <input ref={searchRef} style={{...baseInput,fontSize:18,padding:"12px 16px",fontWeight:600}} placeholder="[F2] Código o nombre del producto..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}/>
                    {showResults&&<div style={{position:"absolute",bottom:"100%",left:0,right:0,background:C.card,border:`2px solid ${C.accent}`,borderRadius:8,marginBottom:4,maxHeight:250,overflowY:"auto",zIndex:50}}>
                      {searchResults.map(p=><div key={p.id} onClick={()=>addToCart(p,parseInt(qtyInput)||1)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div><span style={{fontFamily:"monospace",fontSize:12,color:C.textDim,marginRight:12}}>{p.code}</span><span style={{fontWeight:600}}>{p.name}</span></div>
                        <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontWeight:800,color:C.accent}}>{fmt(p.price)}</span><Badge bg={p.stock<=p.min_stock?C.warning:C.success}>{p.stock}u</Badge></div>
                      </div>)}
                    </div>}
                  </div>
                  <div style={{width:60}}><input type="number" min="1" value={qtyInput} onChange={e=>setQtyInput(e.target.value)} style={{...baseInput,textAlign:"center",fontSize:16,fontWeight:700,padding:"12px 8px"}} placeholder="Qty"/></div>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO: Botones POS */}
            <div style={{width:280,display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                <Btn bg={C.blue} hover={C.blueDark} style={{height:50}} onClick={()=>{if(searchRef.current)searchRef.current.focus();}}>[F2] BUSCAR</Btn>
                <Btn bg={C.accent} hover={C.accentDark} style={{height:50,gridColumn:"span 2"}} disabled={cart.length===0} onClick={()=>setPaymentModal(true)}>[F3] TERMINAR VENTA</Btn>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                <Btn bg={C.danger} hover="#b71c1c" style={{height:50}} onClick={()=>{if(cart.length>0)removeFromCart(cart[cart.length-1].product_id);}}>[F4] ELIMINAR</Btn>
                <Btn bg={C.green} hover={C.greenDark} style={{height:50}} onClick={()=>{setCart([]);setDiscountPercent(0);}}>[F5] NUEVA VENTA</Btn>
                <Btn bg={C.surface} hover={C.surfaceLight} style={{height:50}} onClick={()=>{const pid=cart[cart.length-1]?.product_id;if(pid){const nq=prompt("Nueva cantidad:");if(nq&&parseInt(nq)>0)updateCartQty(pid,parseInt(nq));}}}>[F6] CANTIDAD</Btn>
              </div>
              {/* Descuento */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:8}}>
                <div style={{fontSize:10,color:C.textDim,marginBottom:4,fontWeight:700}}>DESCUENTO %</div>
                <div style={{display:"flex",gap:4}}>
                  {[0,5,10,15,20].map(v=><button key={v} onClick={()=>setDiscountPercent(v)} style={{flex:1,background:discountPercent===v?C.warning:C.surface,color:discountPercent===v?"#000":"#fff",border:"none",borderRadius:4,padding:"8px 4px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{v}%</button>)}
                  <input type="number" min="0" max="100" value={discountPercent||""} onChange={e=>setDiscountPercent(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))} style={{...baseInput,width:50,padding:"6px",textAlign:"center",fontSize:13,fontWeight:700}} placeholder="%"/>
                </div>
              </div>
              {/* Resumen */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:10,flex:1}}>
                <div style={{fontSize:10,color:C.textDim,fontWeight:700,marginBottom:6}}>TOTALES</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span>Subtotal:</span><span style={{fontWeight:600}}>{fmt(cartBruto)}</span></div>
                {discountPercent>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.warning,marginBottom:2}}><span>Dcto {discountPercent}%:</span><span>-{fmt(discountAmount)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textDim}}><span>Neto:</span><span>{fmt(cartNeto)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textDim,marginBottom:4}}><span>IVA 19%:</span><span>{fmt(cartIVA)}</span></div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900}}><span>TOTAL:</span><span style={{color:C.accent}}>{fmt(cartTotal)}</span></div>
              </div>
              {/* Cierre */}
              <Btn bg={C.surface} hover={C.surfaceLight} style={{height:44}} onClick={()=>setCierreModal(true)}>📋 CIERRE DE CAJA</Btn>
              {lastSale&&<Btn bg={C.surface} hover={C.surfaceLight} style={{height:44}} onClick={()=>setTicketModal(true)}>🧾 RE-IMPRIMIR</Btn>}
            </div>
          </div>
        </div>}

        {activeTab==="products"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 style={{margin:0,fontSize:20}}>📦 Inventario ({products.length} productos)</h2><Btn bg={C.blue} hover={C.blueDark} onClick={()=>{setEditProduct(null);setProductModal(true);}}>+ NUEVO</Btn></div>
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:12,marginBottom:12,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{position:"relative",flex:1,minWidth:220}}>
              <input style={{...baseInput,paddingLeft:36,fontSize:14}} placeholder="🔍 Buscar por código o nombre..." value={prodSearch} onChange={e=>setProdSearch(e.target.value)}/>
              {prodSearch&&<button onClick={()=>setProdSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.textMuted,fontSize:16,cursor:"pointer"}}>✕</button>}
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <button onClick={()=>setProdCatFilter(null)} style={{background:!prodCatFilter?C.accent:C.surface,color:"#fff",border:`1px solid ${!prodCatFilter?C.accent:C.border}`,borderRadius:4,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>TODOS</button>
              {categories.map(c=><button key={c.id} onClick={()=>setProdCatFilter(prodCatFilter===c.id?null:c.id)} style={{background:prodCatFilter===c.id?C.accent:C.surface,color:"#fff",border:`1px solid ${prodCatFilter===c.id?C.accent:C.border}`,borderRadius:4,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>{c.name} ({products.filter(p=>p.category_id===c.id).length})</button>)}
            </div>
          </div>
          {(()=>{const filtered=products.filter(p=>{const matchSearch=!prodSearch||p.name.toLowerCase().includes(prodSearch.toLowerCase())||p.code.includes(prodSearch);const matchCat=!prodCatFilter||p.category_id===prodCatFilter;return matchSearch&&matchCat;});return <>
          {prodSearch||prodCatFilter?<div style={{color:C.textMuted,fontSize:12,marginBottom:8}}>{filtered.length} producto{filtered.length!==1?"s":""} encontrado{filtered.length!==1?"s":""}{prodCatFilter?` en ${categories.find(c=>c.id===prodCatFilter)?.name||""}`:""}{prodSearch?` para "${prodSearch}"`:""}</div>:null}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}><thead><tr style={{background:C.surface}}>{["Código","Producto","Categoría","Proveedor","Costo","Precio","Margen","Stock",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700}}>{h}</th>)}</tr></thead><tbody>
          {filtered.length===0?<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:C.textDim}}>No se encontraron productos</td></tr>
          :filtered.map(p=>{const cat=categories.find(c=>c.id===p.category_id);const prov=providers.find(pr=>pr.id===p.provider_id);const margin=p.price>0?((p.price-p.cost)/p.price*100).toFixed(0):0;return <tr key={p.id} style={{borderBottom:`1px solid ${C.border}22`}}><td style={{padding:"8px 12px",fontSize:12,fontFamily:"monospace"}}>{p.code}</td><td style={{padding:"8px 12px",fontSize:13,fontWeight:600}}>{p.name}</td><td style={{padding:"8px 12px"}}><Badge bg={C.blue}>{cat?.name||"—"}</Badge></td><td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{prov?.name||"—"}</td><td style={{padding:"8px 12px"}}>{fmt(p.cost)}</td><td style={{padding:"8px 12px",fontWeight:700}}>{fmt(p.price)}</td><td style={{padding:"8px 12px"}}><Badge bg={parseInt(margin)>=30?C.success:C.warning}>{margin}%</Badge></td><td style={{padding:"8px 12px"}}><Badge bg={p.stock<=0?C.danger:p.stock<=p.min_stock?C.warning:C.success}>{p.stock}/{p.min_stock}</Badge></td><td style={{padding:"8px 12px"}}><div style={{display:"flex",gap:4}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>{setEditProduct(p);setProductModal(true);}}>✏️</Btn><Btn bg={C.danger} size="sm" onClick={()=>deleteProduct(p.id)}>🗑️</Btn></div></td></tr>;})}
          </tbody></table></div></>})()}
        </div>}

        {activeTab==="categories"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:20}}>🏷️ Categorías</h2><Btn bg={C.blue} hover={C.blueDark} onClick={()=>{setEditCategory(null);setCategoryModal(true);}}>+ NUEVA</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>{categories.map(c=>{const pc=products.filter(p=>p.category_id===c.id).length;return <div key={c.id} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:16,fontWeight:700}}>{c.name}</div><Badge bg={C.blue}>{pc}</Badge></div><div style={{display:"flex",gap:6}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>{setEditCategory(c);setCategoryModal(true);}}>✏️</Btn><Btn bg={C.danger} size="sm" onClick={()=>deleteCategory(c.id)}>🗑️</Btn></div></div>;})}</div></div>}

        {activeTab==="providers"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:20}}>🚚 Proveedores</h2><Btn bg={C.blue} hover={C.blueDark} onClick={()=>{setEditProvider(null);setProviderModal(true);}}>+ NUEVO</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>{providers.map(p=>{const pc=products.filter(pr=>pr.provider_id===p.id).length;return <div key={p.id} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div><div style={{fontSize:15,fontWeight:700}}>{p.name}</div><div style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>RUT: {p.rut}</div></div><Badge bg={C.blue}>{pc}</Badge></div><div style={{fontSize:12,color:C.textMuted,lineHeight:1.6}}>📞 {p.phone} | 📧 {p.email}<br/>📍 {p.address}</div><div style={{display:"flex",gap:6,marginTop:10}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>{setEditProvider(p);setProviderModal(true);}}>✏️</Btn><Btn bg={C.danger} size="sm" onClick={()=>deleteProvider(p.id)}>🗑️</Btn></div></div>;})}</div></div>}

        {/* ═══ STOCK ═══ */}
        {activeTab==="stock"&&<StockPage products={products} categories={categories} storeName={storeName} onEditProduct={(p)=>{setEditProduct(p);setProductModal(true);}}/>}

        {/* ═══ COTIZACIONES ═══ */}
        {activeTab==="quotes"&&<div>
          {viewingQuote?<QuotePreview quote={viewingQuote} storeName={storeName} storeRut={storeRut} storeAddress={storeAddress} storePhone={storePhone} onBack={()=>setViewingQuote(null)} onClose={()=>setViewingQuote(null)}/>
          :quotePreview?<QuotePreview quote={quotePreview} storeName={storeName} storeRut={storeRut} storeAddress={storeAddress} storePhone={storePhone} onBack={()=>setQuotePreview(null)} onClose={()=>{setQuotePreview(null);setQuoteCart([]);setQuoteClient({name:"",rut:"",phone:""});setQuoteDiscount(0);}} onSave={async()=>{const saved=await saveQuote(quotePreview);if(saved){setQuotePreview(null);setQuoteCart([]);setQuoteClient({name:"",rut:"",phone:""});setQuoteDiscount(0);setQuoteView("history");}}} saving={saving}/>
          :<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <h2 style={{margin:0,fontSize:20}}>📄 Cotizaciones</h2>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setQuoteView("new")} style={{background:quoteView==="new"?C.teal:C.surface,color:"#fff",border:"none",borderRadius:4,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ NUEVA</button>
                <button onClick={()=>setQuoteView("history")} style={{background:quoteView==="history"?C.teal:C.surface,color:"#fff",border:"none",borderRadius:4,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>📋 HISTORIAL ({savedQuotes.length})</button>
              </div>
            </div>

            {quoteView==="new"&&<div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:400}}>
                  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,marginBottom:12}}>
                    <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:8}}>DATOS DEL CLIENTE (opcional)</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[["name","NOMBRE","Nombre cliente"],["rut","RUT","12.345.678-9"],["phone","TELÉFONO","+56 9 ..."]].map(([k,l,ph])=><div key={k}><label style={{color:C.textMuted,fontSize:10,fontWeight:700,display:"block",marginBottom:3}}>{l}</label><input style={baseInput} value={quoteClient[k]} onChange={e=>setQuoteClient(p=>({...p,[k]:e.target.value}))} placeholder={ph}/></div>)}
                    </div>
                  </div>
                  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,marginBottom:12}}>
                    <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:8}}>AGREGAR PRODUCTOS</div>
                    <div style={{position:"relative"}}>
                      <input style={{...baseInput,fontSize:15,padding:"12px 16px"}} placeholder="🔍 Buscar por código o nombre..." value={quoteSearch} onChange={e=>setQuoteSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&quoteResults.length>0)addToQuote(quoteResults[0]);if(e.key==="Escape")setQuoteSearch("");}}/>
                      {quoteResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:C.card,border:`2px solid ${C.accent}`,borderRadius:8,marginTop:4,maxHeight:250,overflowY:"auto",zIndex:50}}>
                        {quoteResults.map(p=><div key={p.id} onClick={()=>addToQuote(p)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}} onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span><span style={{fontFamily:"monospace",fontSize:11,color:C.textDim,marginRight:10}}>{p.code}</span><span style={{fontWeight:600}}>{p.name}</span></span>
                          <span style={{fontWeight:800,color:C.accent}}>{fmt(p.price)}</span>
                        </div>)}
                      </div>}
                    </div>
                  </div>
                  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"auto",minHeight:200}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr style={{background:C.surface}}>{["Código","Producto","P. Unit.","Cantidad","Total",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700}}>{h}</th>)}</tr></thead>
                      <tbody>{quoteCart.length===0?<tr><td colSpan={6} style={{padding:40,textAlign:"center",color:C.textDim}}>Busca productos para agregarlos</td></tr>
                      :quoteCart.map(it=>{const prod=products.find(p=>p.id===it.product_id);return <tr key={it.product_id} style={{borderBottom:`1px solid ${C.border}22`}}>
                        <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:12,color:C.textDim}}>{prod?.code||""}</td>
                        <td style={{padding:"8px 12px",fontSize:13,fontWeight:600}}>{it.product_name}</td>
                        <td style={{padding:"8px 12px",fontSize:13}}>{fmt(it.price)}</td>
                        <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:4}}>
                          <button onClick={()=>setQuoteCart(p=>{const nq=it.qty-1;return nq<=0?p.filter(x=>x.product_id!==it.product_id):p.map(x=>x.product_id===it.product_id?{...x,qty:nq}:x);})} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,width:28,height:28,color:C.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <input type="number" min="1" value={it.qty} onChange={e=>{const v=parseInt(e.target.value)||1;setQuoteCart(p=>p.map(x=>x.product_id===it.product_id?{...x,qty:Math.max(1,v)}:x));}} style={{...baseInput,width:70,textAlign:"center",fontSize:15,fontWeight:700,padding:"4px 6px"}}/>
                          <button onClick={()=>setQuoteCart(p=>p.map(x=>x.product_id===it.product_id?{...x,qty:x.qty+1}:x))} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,width:28,height:28,color:C.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div></td>
                        <td style={{padding:"8px 12px",fontSize:14,fontWeight:800}}>{fmt(it.price*it.qty)}</td>
                        <td style={{padding:"8px 12px"}}><button onClick={()=>setQuoteCart(p=>p.filter(x=>x.product_id!==it.product_id))} style={{background:C.danger,border:"none",borderRadius:4,width:28,height:28,color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></td>
                      </tr>;})}</tbody>
                    </table>
                  </div>
                </div>
                <div style={{width:280,minWidth:260}}>
                  <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:16,position:"sticky",top:76}}>
                    <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:12}}>RESUMEN</div>
                    <div style={{fontSize:13,color:C.textMuted,marginBottom:4}}>Productos: <strong style={{color:C.text}}>{quoteCart.length}</strong></div>
                    <div style={{fontSize:13,color:C.textMuted,marginBottom:12}}>Unidades: <strong style={{color:C.text}}>{quoteCart.reduce((s,c)=>s+c.qty,0)}</strong></div>
                    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12}}>
                      <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:8}}>DESCUENTO %</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {[0,5,10,15,20,25,30].map(v=><button key={v} onClick={()=>setQuoteDiscount(v)} style={{background:quoteDiscount===v?C.warning:C.surface,color:quoteDiscount===v?"#000":"#fff",border:"none",borderRadius:4,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{v}%</button>)}
                        <input type="number" min="0" max="100" value={quoteDiscount||""} onChange={e=>setQuoteDiscount(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))} style={{...baseInput,width:55,padding:"6px",textAlign:"center",fontSize:13,fontWeight:700}} placeholder="%"/>
                      </div>
                    </div>
                    {(()=>{const bruto=quoteCart.reduce((s,c)=>s+c.price*c.qty,0);const dcto=Math.round(bruto*quoteDiscount/100);const total=bruto-dcto;const neto=Math.round(total/1.19);const iva=total-neto;return <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:C.textMuted}}>Subtotal:</span><span style={{fontWeight:600}}>{fmt(bruto)}</span></div>
                      {quoteDiscount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4,color:C.warning}}><span>Dcto {quoteDiscount}%:</span><span>-{fmt(dcto)}</span></div>}
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2,color:C.textDim}}><span>Neto:</span><span>{fmt(neto)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8,color:C.textDim}}><span>IVA 19%:</span><span>{fmt(iva)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:22,fontWeight:900,borderTop:`1px solid ${C.border}`,paddingTop:8}}><span>TOTAL:</span><span style={{color:C.accent}}>{fmt(total)}</span></div>
                    </div>;})()}
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
                      {quoteCart.length>0&&<Btn bg={C.teal} hover="#009b7d" size="lg" style={{width:"100%",justifyContent:"center"}} onClick={()=>{const bruto=quoteCart.reduce((s,c)=>s+c.price*c.qty,0);const dcto=Math.round(bruto*quoteDiscount/100);const total=bruto-dcto;const neto=Math.round(total/1.19);const iva=total-neto;setQuotePreview({items:quoteCart,client:quoteClient,bruto,dcto,total,neto,iva,discount:quoteDiscount,date:new Date().toISOString()});}}>📄 GENERAR</Btn>}
                      <Btn bg={C.danger} hover="#b71c1c" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setQuoteCart([]);setQuoteDiscount(0);setQuoteClient({name:"",rut:"",phone:""});}}>🗑️ LIMPIAR</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {quoteView==="history"&&<div>
              {savedQuotes.length===0?<div style={{textAlign:"center",padding:60,background:C.card,borderRadius:8}}><div style={{fontSize:40,marginBottom:8}}>📄</div><div style={{color:C.textMuted}}>No hay cotizaciones guardadas</div></div>
              :<div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
                  <thead><tr style={{background:C.surface}}>{["N°","Fecha","Cajero","Cliente","Items","Dcto","Total","Estado","Acciones"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700}}>{h}</th>)}</tr></thead>
                  <tbody>{savedQuotes.map(q=><tr key={q.id} style={{borderBottom:`1px solid ${C.border}22`}}>
                    <td style={{padding:"8px 12px",fontFamily:"monospace",fontWeight:700}}>{q.quote_number}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{fmtDate(q.created_at)}</td>
                    <td style={{padding:"8px 12px",fontSize:13}}>{q.user_name}</td>
                    <td style={{padding:"8px 12px",fontSize:13}}>{q.client_name||"—"}</td>
                    <td style={{padding:"8px 12px"}}>{(q.quote_items||[]).length}</td>
                    <td style={{padding:"8px 12px"}}>{q.discount_percent>0?<Badge bg={C.warning}>{q.discount_percent}%</Badge>:"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:15,fontWeight:800,color:C.success}}>{fmt(q.total)}</td>
                    <td style={{padding:"8px 12px"}}><Badge bg={q.status==="pending"?C.warning:q.status==="accepted"?C.success:C.danger}>{q.status==="pending"?"⏳ PENDIENTE":q.status==="accepted"?"✅ ACEPTADA":"❌ RECHAZADA"}</Badge></td>
                    <td style={{padding:"8px 12px"}}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>setViewingQuote({...q,sale_number:q.quote_number,sale_items:(q.quote_items||[]).map(it=>({...it}))})}>🧾</Btn>
                      {q.status==="pending"&&<>
                        <Btn bg={C.success} hover={C.successDark} size="sm" onClick={()=>updateQuoteStatus(q.id,"accepted")}>✅</Btn>
                        <Btn bg={C.danger} hover="#b71c1c" size="sm" onClick={()=>updateQuoteStatus(q.id,"rejected")}>❌</Btn>
                      </>}
                      {q.status==="accepted"&&<Btn bg={C.blue} hover={C.blueDark} size="sm" onClick={()=>loadQuoteToSale(q)}>🛒 VENDER</Btn>}
                    </div></td>
                  </tr>)}</tbody>
                </table>
              </div>}
            </div>}
          </div>}
        </div>}

        {activeTab==="sales"&&(()=>{
          // Calcular períodos
          const now=new Date();const todayS=todayStr();
          const weekAgo=new Date(now);weekAgo.setDate(weekAgo.getDate()-7);
          const monthAgo=new Date(now);monthAgo.setMonth(monthAgo.getMonth()-1);
          const periodLabel={today:"Hoy",week:"Últimos 7 días",month:"Último mes",all:"Todo"};
          const filteredSales=sales.filter(s=>{
            if(!s.created_at)return false;
            const d=new Date(s.created_at);
            if(reportPeriod==="today")return s.created_at.startsWith(todayS);
            if(reportPeriod==="week")return d>=weekAgo;
            if(reportPeriod==="month")return d>=monthAgo;
            return true;
          }).filter(s=>{
            if(!salesSearch)return true;
            const q=salesSearch.toLowerCase();
            return s.sale_number.includes(q)||s.user_name.toLowerCase().includes(q)||(s.sale_items||[]).some(it=>it.product_name.toLowerCase().includes(q));
          });
          const rTotal=filteredSales.reduce((s,v)=>s+v.total,0);
          const rNeto=filteredSales.reduce((s,v)=>s+v.subtotal,0);
          const rIVA=filteredSales.reduce((s,v)=>s+v.iva,0);
          const rDcto=filteredSales.reduce((s,v)=>s+(v.discount_amount||0),0);
          const rByPay={cash:0,debit:0,credit:0,transfer:0};
          filteredSales.forEach(s=>{rByPay[s.payment]=(rByPay[s.payment]||0)+s.total;});
          const rByUser={};filteredSales.forEach(s=>{rByUser[s.user_name]=(rByUser[s.user_name]||0)+s.total;});
          const rTopProd={};filteredSales.forEach(s=>(s.sale_items||[]).forEach(it=>{rTopProd[it.product_name]=(rTopProd[it.product_name]||0)+it.qty;}));
          const rTopList=Object.entries(rTopProd).sort((a,b)=>b[1]-a[1]).slice(0,10);
          // Cálculo de ganancia: comparar precio neto con costo de cada item
          let rCostoTotal=0;
          filteredSales.forEach(s=>(s.sale_items||[]).forEach(it=>{
            const prod=products.find(p=>p.id===it.product_id);
            rCostoTotal+=(prod?prod.cost:0)*it.qty;
          }));
          const rGananciaNeta=rNeto-rCostoTotal;
          const rMargenPct=rNeto>0?(rGananciaNeta/rNeto*100).toFixed(1):0;
          // Ventas por día para gráfico simple
          const rByDay={};filteredSales.forEach(s=>{const day=s.created_at.slice(0,10);rByDay[day]=(rByDay[day]||0)+s.total;});
          const dayList=Object.entries(rByDay).sort((a,b)=>a[0].localeCompare(b[0]));
          const maxDay=Math.max(...dayList.map(d=>d[1]),1);

          return <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <h2 style={{margin:0,fontSize:20}}>📊 Reportes de Ventas</h2>
            <div style={{display:"flex",gap:6}}>
              <Btn bg={C.green} hover={C.greenDark} onClick={()=>setCierreModal(true)}>📋 CIERRE DE CAJA</Btn>
              <Btn bg={C.surface} hover={C.surfaceLight} onClick={loadAllData}>🔄</Btn>
            </div>
          </div>

          {/* Filtros de período */}
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            {[["today","📅 HOY"],["week","📆 SEMANA"],["month","🗓️ MES"],["all","📚 TODO"]].map(([v,l])=><button key={v} onClick={()=>setReportPeriod(v)} style={{background:reportPeriod===v?C.accent:C.surface,color:"#fff",border:`2px solid ${reportPeriod===v?C.accent:C.border}`,borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>{l}</button>)}
            <div style={{flex:1,minWidth:180}}><input style={{...baseInput,fontSize:13}} placeholder="🔍 Buscar boleta, cajero o producto..." value={salesSearch} onChange={e=>setSalesSearch(e.target.value)}/></div>
          </div>

          {/* Tarjetas resumen */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:12}}>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>BOLETAS ({periodLabel[reportPeriod]})</div><div style={{fontSize:28,fontWeight:900,color:C.text}}>{filteredSales.length}</div></div>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>TOTAL VENTAS</div><div style={{fontSize:28,fontWeight:900,color:C.success}}>{fmt(rTotal)}</div></div>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>NETO</div><div style={{fontSize:22,fontWeight:800,color:C.text}}>{fmt(rNeto)}</div><div style={{fontSize:11,color:C.textDim}}>IVA: {fmt(rIVA)}</div></div>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>TICKET PROMEDIO</div><div style={{fontSize:22,fontWeight:800,color:C.blueLight}}>{filteredSales.length>0?fmt(Math.round(rTotal/filteredSales.length)):"$0"}</div></div>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>COSTO PRODUCTOS</div><div style={{fontSize:22,fontWeight:800,color:C.danger}}>{fmt(rCostoTotal)}</div></div>
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.accent}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>GANANCIA NETA</div><div style={{fontSize:28,fontWeight:900,color:rGananciaNeta>=0?C.success:C.danger}}>{fmt(rGananciaNeta)}</div><div style={{fontSize:12,color:C.textMuted,marginTop:2}}>Margen: <strong style={{color:C.accent}}>{rMargenPct}%</strong></div></div>
            {rDcto>0&&<div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>DESCUENTOS</div><div style={{fontSize:22,fontWeight:800,color:C.warning}}>-{fmt(rDcto)}</div></div>}
          </div>

          <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            {/* Desglose por medio de pago */}
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,minWidth:200,flex:1}}>
              <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:10}}>POR MEDIO DE PAGO</div>
              {[["cash","Efectivo",C.success],["debit","Débito",C.blue],["credit","Crédito",C.warning],["transfer","Transferencia",C.teal]].map(([k,l,c])=><div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:2,background:c}}/><span style={{fontSize:13}}>{l}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{height:6,borderRadius:3,background:c,width:Math.max(4,rByPay[k]/Math.max(rTotal,1)*120),transition:"width 0.3s"}}/><span style={{fontSize:13,fontWeight:700,minWidth:80,textAlign:"right"}}>{fmt(rByPay[k])}</span></div>
              </div>)}
            </div>
            {/* Por cajero */}
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,minWidth:200,flex:1}}>
              <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:10}}>POR CAJERO</div>
              {Object.entries(rByUser).sort((a,b)=>b[1]-a[1]).map(([name,total])=><div key={name} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13}}>{name}</span><span style={{fontSize:13,fontWeight:700}}>{fmt(total)}</span></div>)}
              {Object.keys(rByUser).length===0&&<div style={{color:C.textDim,fontSize:12}}>Sin datos</div>}
            </div>
            {/* Top productos */}
            <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,minWidth:240,flex:1}}>
              <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:10}}>TOP PRODUCTOS</div>
              {rTopList.map(([name,qty],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:12,color:i<3?C.text:C.textMuted}}><strong style={{color:C.accent,marginRight:6}}>#{i+1}</strong>{name}</span><Badge bg={i<3?C.accent:C.surface}>{qty} und</Badge>
              </div>)}
              {rTopList.length===0&&<div style={{color:C.textDim,fontSize:12}}>Sin datos</div>}
            </div>
          </div>

          {/* Gráfico de ventas por día */}
          {dayList.length>1&&<div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,marginBottom:12}}>
            <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:10}}>VENTAS POR DÍA</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:100}}>
              {dayList.map(([day,total])=><div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:9,color:C.textMuted}}>{fmt(total)}</span>
                <div style={{width:"100%",background:C.accent,borderRadius:"3px 3px 0 0",height:Math.max(4,total/maxDay*80),transition:"height 0.3s"}}/>
                <span style={{fontSize:9,color:C.textDim,transform:"rotate(-45deg)",transformOrigin:"top left",whiteSpace:"nowrap"}}>{day.slice(5)}</span>
              </div>)}
            </div>
          </div>}

          {/* Tabla de ventas */}
          <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}><thead><tr style={{background:C.surface}}>{["N°","Fecha","Cajero","Items","Dcto","Total","Pago",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700}}>{h}</th>)}</tr></thead><tbody>
            {filteredSales.length===0?<tr><td colSpan={8} style={{padding:30,textAlign:"center",color:C.textDim}}>Sin ventas en este período</td></tr>
            :filteredSales.map(s=><tr key={s.id} style={{borderBottom:`1px solid ${C.border}22`}}><td style={{padding:"8px 12px",fontFamily:"monospace",fontWeight:700}}>#{s.sale_number}</td><td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{fmtDate(s.created_at)}</td><td style={{padding:"8px 12px",fontSize:13}}>{s.user_name}</td><td style={{padding:"8px 12px"}}>{(s.sale_items||[]).length}</td><td style={{padding:"8px 12px"}}>{s.discount_percent>0?<Badge bg={C.warning}>{s.discount_percent}%</Badge>:"—"}</td><td style={{padding:"8px 12px",fontSize:15,fontWeight:800,color:C.success}}>{fmt(s.total)}</td><td style={{padding:"8px 12px"}}><Badge bg={s.payment==="cash"?C.success:s.payment==="debit"?C.blue:C.warning}>{s.payment==="cash"?"Efectivo":s.payment==="debit"?"Débito":s.payment==="credit"?"Crédito":"Transfer."}</Badge></td><td style={{padding:"8px 12px"}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>setSaleDetailModal(s)}>🧾</Btn></td></tr>)}
            </tbody></table>
          </div>
        </div>})()}

        {activeTab==="users"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:20}}>👥 Usuarios</h2><Btn bg={C.blue} hover={C.blueDark} onClick={()=>{setEditUser(null);setUserModal(true);}}>+ NUEVO</Btn></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>{users.map(u=>{const us=sales.filter(s=>s.user_id===u.id);return <div key={u.id} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:15,fontWeight:700}}>{u.name}</div><Badge bg={u.role==="admin"?C.accent:C.success}>{u.role==="admin"?"ADMIN":"VENDEDOR"}</Badge></div><div style={{fontSize:12,color:C.textMuted}}>@{u.username} · {us.length} ventas ({fmt(us.reduce((s,v)=>s+v.total,0))})</div><div style={{display:"flex",gap:6,marginTop:10}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>{setEditUser(u);setUserModal(true);}}>✏️</Btn>{u.id!==currentUser.id&&<Btn bg={C.danger} size="sm" onClick={()=>deleteUser(u.id)}>🗑️</Btn>}</div></div>;})}</div></div>}
      </div>

      {/* MODALS */}
      <Modal open={paymentModal} onClose={()=>setPaymentModal(false)} title="💳 COBRAR">
        <div style={{background:C.accent,borderRadius:8,padding:"12px 20px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:16,fontWeight:600}}>TOTAL:</span><span style={{fontSize:32,fontWeight:900}}>{fmt(cartTotal)}</span></div>
        {discountPercent>0&&<div style={{textAlign:"center",marginBottom:12}}><Badge bg={C.warning}>DESCUENTO {discountPercent}% (-{fmt(discountAmount)})</Badge></div>}
        <div style={{marginBottom:16}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[["cash","💵 EFECTIVO"],["debit","💳 DÉBITO"],["credit","💳 CRÉDITO"],["transfer","📱 TRANSFER."]].map(([v,l])=><button key={v} onClick={()=>setPaymentMethod(v)} style={{background:paymentMethod===v?C.accent:C.surface,border:`2px solid ${paymentMethod===v?C.accent:C.border}`,borderRadius:8,padding:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{l}</button>)}</div></div>
        {paymentMethod==="cash"&&<div style={{marginBottom:16}}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:6}}>EFECTIVO RECIBIDO</label><input type="number" style={{...baseInput,fontSize:24,fontWeight:800,textAlign:"center"}} value={cashGiven} onChange={e=>setCashGiven(e.target.value)} autoFocus/>{cashGiven&&parseInt(cashGiven)>=cartTotal&&<div style={{textAlign:"center",marginTop:8,fontSize:20,fontWeight:800,color:C.success}}>VUELTO: {fmt(parseInt(cashGiven)-cartTotal)}</div>}<div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>{[1000,2000,5000,10000,20000,50000].map(v=><button key={v} onClick={()=>setCashGiven(String(v))} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,padding:"6px 10px",color:C.textMuted,fontSize:12,cursor:"pointer",fontWeight:700}}>{fmt(v)}</button>)}</div></div>}
        <Btn bg={C.success} hover={C.successDark} size="lg" onClick={completeSale} disabled={saving||(paymentMethod==="cash"&&(!cashGiven||parseInt(cashGiven)<cartTotal))} style={{width:"100%",justifyContent:"center"}}>{saving?"⏳ PROCESANDO...":"✅ CONFIRMAR VENTA"}</Btn>
      </Modal>

      <Modal open={ticketModal} onClose={()=>setTicketModal(false)} title="🧾 TICKET">{lastSale&&<TicketPreview sale={lastSale} storeName={storeName}/>}</Modal>
      <Modal open={!!saleDetailModal} onClose={()=>setSaleDetailModal(null)} title="🧾 DETALLE">{saleDetailModal&&<TicketPreview sale={saleDetailModal} storeName={storeName}/>}</Modal>
      <Modal open={cierreModal} onClose={()=>setCierreModal(false)} title="📋 CIERRE DE CAJA" wide><CierreCaja sales={sales} products={products} storeName={storeName} currentUser={currentUser} onClose={()=>setCierreModal(false)}/></Modal>
      <Modal open={productModal} onClose={()=>{setProductModal(false);setEditProduct(null);}} title={editProduct?"EDITAR PRODUCTO":"NUEVO PRODUCTO"}><ProductForm product={editProduct} categories={categories} providers={providers} onSave={saveProduct} onCancel={()=>{setProductModal(false);setEditProduct(null);}} saving={saving}/></Modal>
      <Modal open={categoryModal} onClose={()=>{setCategoryModal(false);setEditCategory(null);}} title={editCategory?"EDITAR CATEGORÍA":"NUEVA CATEGORÍA"}><CategoryForm category={editCategory} onSave={saveCategory} onCancel={()=>{setCategoryModal(false);setEditCategory(null);}} saving={saving}/></Modal>
      <Modal open={providerModal} onClose={()=>{setProviderModal(false);setEditProvider(null);}} title={editProvider?"EDITAR PROVEEDOR":"NUEVO PROVEEDOR"}><ProviderForm provider={editProvider} onSave={saveProvider} onCancel={()=>{setProviderModal(false);setEditProvider(null);}} saving={saving}/></Modal>
      <Modal open={userModal} onClose={()=>{setUserModal(false);setEditUser(null);}} title={editUser?"EDITAR USUARIO":"NUEVO USUARIO"}><UserForm user={editUser} onSave={saveUser} onCancel={()=>{setUserModal(false);setEditUser(null);}} saving={saving}/></Modal>
      <Modal open={configModal} onClose={()=>setConfigModal(false)} title="⚙️ CONFIGURACIÓN">
        <div style={{fontSize:11,color:C.textDim,fontWeight:700,marginBottom:12}}>DATOS DEL NEGOCIO (aparecen en tickets y cotizaciones)</div>
        {[["NOMBRE",storeName,e=>updateStoreName(e.target.value)],["RUT",storeRut,e=>updateStoreConfig("store_rut",e.target.value,setStoreRut)],["DIRECCIÓN",storeAddress,e=>updateStoreConfig("store_address",e.target.value,setStoreAddress)],["TELÉFONO",storePhone,e=>updateStoreConfig("store_phone",e.target.value,setStorePhone)]].map(([l,v,fn])=><div key={l} style={{marginBottom:10}}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>{l}</label><input style={baseInput} value={v} onChange={fn}/></div>)}
        <div style={{padding:14,background:C.surface,borderRadius:8,fontSize:12,color:C.textMuted,lineHeight:1.8,marginTop:8}}><div style={{fontWeight:700,color:C.text,marginBottom:4}}>ℹ️ SISTEMA POS</div><div>Versión: <strong style={{color:C.accent}}>{APP_VERSION}</strong></div><div>☁️ Supabase (nube) · IVA 19% Chile</div></div>
      </Modal>

      {/* MODAL COTIZACIÓN eliminado - ahora es pestaña */}
    </div>
  );
}

function StockPage({products,categories,storeName,onEditProduct}){
  const ref=useRef(null);
  const [filter,setFilter]=useState("low");// low | all
  const [catFilter,setCatFilter]=useState(null);
  const [search,setSearch]=useState("");

  const lowStock=products.filter(p=>p.stock<=p.min_stock);
  const zeroStock=products.filter(p=>p.stock<=0);
  const displayed=(filter==="low"?lowStock:products).filter(p=>{
    const matchCat=!catFilter||p.category_id===catFilter;
    const matchSearch=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.code.includes(search);
    return matchCat&&matchSearch;
  }).sort((a,b)=>a.stock-b.stock);

  const printReport=()=>{
    const rows=displayed.map(p=>{const cat=categories.find(c=>c.id===p.category_id);const isZero=p.stock<=0;return `<tr style="border-bottom:1px solid #ddd;${isZero?'background:#fff0f0':''}"><td style="padding:6px 8px;font-family:monospace;font-size:11px">${p.code}</td><td style="padding:6px 8px;font-size:12px;font-weight:600">${p.name}</td><td style="padding:6px 8px;font-size:11px">${cat?.name||'—'}</td><td style="padding:6px 8px;font-size:14px;font-weight:800;color:${isZero?'#e74c3c':'#f5a623'};text-align:center">${p.stock}</td><td style="padding:6px 8px;text-align:center">${p.min_stock}</td><td style="padding:6px 8px;text-align:center;font-weight:600">${Math.max(0,p.min_stock-p.stock)}</td><td style="padding:6px 8px;font-size:11px;color:${isZero?'#e74c3c':'#f5a623'};font-weight:700">${isZero?'SIN STOCK':'BAJO'}</td></tr>`;}).join("");
    const w=window.open("","_blank","width=800,height=900");
    w.document.write(`<html><head><title>Reporte Stock</title><style>body{font-family:Arial,sans-serif;font-size:13px;padding:25px;color:#000}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;border-bottom:2px solid #333}h1{font-size:20px;margin:0}h2{font-size:14px;color:#666;margin:4px 0 0}.info{display:flex;gap:30px;margin:15px 0;font-size:12px;color:#444}.info strong{color:#000}.badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;color:#fff}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px"><div><h1>${storeName}</h1><h2>REPORTE DE STOCK — ${new Date().toLocaleDateString("es-CL")}</h2></div><div style="text-align:right;font-size:11px;color:#999">Generado: ${new Date().toLocaleString("es-CL")}</div></div>
    <div class="info"><div><strong>${products.length}</strong> productos totales</div><div><span class="badge" style="background:#e74c3c">${zeroStock.length} sin stock</span></div><div><span class="badge" style="background:#f5a623;color:#000">${lowStock.length-zeroStock.length} stock bajo</span></div><div><strong>${displayed.length}</strong> en este reporte</div></div>
    <table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th style="text-align:center">Stock</th><th style="text-align:center">Mínimo</th><th style="text-align:center">Faltan</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>
    <div style="margin-top:20px;font-size:10px;color:#999;border-top:1px solid #ddd;padding-top:8px">Reporte generado automáticamente por Sistema POS · ${storeName}</div>
    <script>window.print();setTimeout(()=>window.close(),1500)<\/script></body></html>`);
  };

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <h2 style={{margin:0,fontSize:20}}>🔔 Control de Stock</h2>
      <Btn bg={C.blue} hover={C.blueDark} onClick={printReport}>🖨️ IMPRIMIR REPORTE</Btn>
    </div>

    {/* Resumen cards */}
    <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
      <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:14,flex:1,minWidth:140}}><div style={{fontSize:10,color:C.textDim,fontWeight:700}}>TOTAL PRODUCTOS</div><div style={{fontSize:26,fontWeight:900}}>{products.length}</div></div>
      <div style={{background:C.card,borderRadius:8,border:`2px solid ${C.danger}`,padding:14,flex:1,minWidth:140,cursor:"pointer"}} onClick={()=>{setFilter("low");setCatFilter(null);setSearch("");}}><div style={{fontSize:10,color:C.danger,fontWeight:700}}>⛔ SIN STOCK</div><div style={{fontSize:26,fontWeight:900,color:C.danger}}>{zeroStock.length}</div></div>
      <div style={{background:C.card,borderRadius:8,border:`2px solid ${C.warning}`,padding:14,flex:1,minWidth:140,cursor:"pointer"}} onClick={()=>{setFilter("low");setCatFilter(null);setSearch("");}}><div style={{fontSize:10,color:C.warning,fontWeight:700}}>⚠️ STOCK BAJO</div><div style={{fontSize:26,fontWeight:900,color:C.warning}}>{lowStock.length-zeroStock.length}</div></div>
      <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.success}`,padding:14,flex:1,minWidth:140,cursor:"pointer"}} onClick={()=>{setFilter("all");setCatFilter(null);setSearch("");}}><div style={{fontSize:10,color:C.success,fontWeight:700}}>✅ OK</div><div style={{fontSize:26,fontWeight:900,color:C.success}}>{products.length-lowStock.length}</div></div>
    </div>

    {/* Filtros */}
    <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:12,marginBottom:12,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:4}}>
        <button onClick={()=>setFilter("low")} style={{background:filter==="low"?C.danger:C.surface,color:"#fff",border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔔 BAJO MÍNIMO ({lowStock.length})</button>
        <button onClick={()=>setFilter("all")} style={{background:filter==="all"?C.blue:C.surface,color:"#fff",border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>📦 TODOS ({products.length})</button>
      </div>
      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
        <button onClick={()=>setCatFilter(null)} style={{background:!catFilter?C.accent:C.surface,color:"#fff",border:`1px solid ${!catFilter?C.accent:C.border}`,borderRadius:4,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>TODOS</button>
        {categories.map(c=><button key={c.id} onClick={()=>setCatFilter(catFilter===c.id?null:c.id)} style={{background:catFilter===c.id?C.accent:C.surface,color:"#fff",border:`1px solid ${catFilter===c.id?C.accent:C.border}`,borderRadius:4,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{c.name}</button>)}
      </div>
      <div style={{flex:1,minWidth:160}}><input style={{...baseInput,fontSize:13}} placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    </div>

    {/* Tabla */}
    <div style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"auto"}} ref={ref}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
        <thead><tr style={{background:C.surface}}>{["Código","Producto","Categoría","Proveedor","Stock","Mínimo","Faltan","Estado",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:C.textMuted,fontWeight:700}}>{h}</th>)}</tr></thead>
        <tbody>
          {displayed.length===0?<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:C.textDim}}>{filter==="low"?"✅ Todos los productos están sobre el mínimo":"No se encontraron productos"}</td></tr>
          :displayed.map(p=>{
            const cat=categories.find(c=>c.id===p.category_id);
            const prov=(products._provs||[]).find(pr=>pr.id===p.provider_id);
            const isZero=p.stock<=0;
            const faltan=Math.max(0,p.min_stock-p.stock);
            return <tr key={p.id} style={{borderBottom:`1px solid ${C.border}22`,background:isZero?C.danger+"12":"transparent"}}>
              <td style={{padding:"8px 12px",fontFamily:"monospace",fontSize:12}}>{p.code}</td>
              <td style={{padding:"8px 12px",fontSize:13,fontWeight:600}}>{p.name}</td>
              <td style={{padding:"8px 12px"}}><Badge bg={C.blue}>{cat?.name||"—"}</Badge></td>
              <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{prov?.name||""}</td>
              <td style={{padding:"8px 12px",fontSize:16,fontWeight:800,color:isZero?C.danger:p.stock<=p.min_stock?C.warning:C.success}}>{p.stock}</td>
              <td style={{padding:"8px 12px",fontSize:13,textAlign:"center"}}>{p.min_stock}</td>
              <td style={{padding:"8px 12px",fontSize:14,fontWeight:700,color:faltan>0?C.danger:C.textDim,textAlign:"center"}}>{faltan>0?faltan:"—"}</td>
              <td style={{padding:"8px 12px"}}><Badge bg={isZero?C.danger:p.stock<=p.min_stock?C.warning:C.success}>{isZero?"⛔ SIN STOCK":p.stock<=p.min_stock?"⚠️ BAJO":"✅ OK"}</Badge></td>
              <td style={{padding:"8px 12px"}}><Btn bg={C.surface} hover={C.surfaceLight} size="sm" onClick={()=>onEditProduct(p)}>✏️</Btn></td>
            </tr>;})}
        </tbody>
      </table>
    </div>
  </div>;
}

function QuotePreview({quote,storeName,storeRut,storeAddress,storePhone,onBack,onClose,onSave,saving}){
  const ref=useRef(null);
  const quoteNum="COT-"+Date.now().toString().slice(-6);
  const print=()=>{const c=ref.current.innerHTML;const w=window.open("","_blank","width=700,height=900");w.document.write(`<html><head><title>Cotización</title><style>body{font-family:Arial,sans-serif;font-size:13px;padding:30px;margin:0;color:#000;max-width:650px}table{width:100%;border-collapse:collapse}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5;font-size:11px;text-transform:uppercase}.r{text-align:right}.b{font-weight:bold}.header{display:flex;justify-content:space-between;margin-bottom:20px}.line{border-top:2px solid #333;margin:15px 0}</style></head><body>${c}<script>window.print();setTimeout(()=>window.close(),1000)<\/script></body></html>`);};
  return <div>
    <div ref={ref} style={{background:"#fff",color:"#000",fontFamily:"Arial,sans-serif",fontSize:13,padding:30,borderRadius:8,maxWidth:650,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
        <div><div style={{fontSize:22,fontWeight:800}}>{storeName}</div>{storeRut&&<div style={{fontSize:11,color:"#666"}}>RUT: {storeRut}</div>}{storeAddress&&<div style={{fontSize:11,color:"#666"}}>{storeAddress}</div>}{storePhone&&<div style={{fontSize:11,color:"#666"}}>Tel: {storePhone}</div>}</div>
        <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,color:"#e94560"}}>COTIZACIÓN</div><div style={{fontSize:11,color:"#666"}}>N°: {quoteNum}</div><div style={{fontSize:11,color:"#666"}}>Fecha: {fmtDate(quote.date)}</div><div style={{fontSize:10,color:"#999",marginTop:4}}>Válida por 15 días</div></div>
      </div>
      {(quote.client.name||quote.client.rut)&&<div style={{background:"#f9f9f9",borderRadius:6,padding:12,marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"#666",marginBottom:4}}>CLIENTE</div>
        {quote.client.name&&<div>{quote.client.name}</div>}
        {quote.client.rut&&<div style={{fontSize:12,color:"#666"}}>RUT: {quote.client.rut}</div>}
        {quote.client.phone&&<div style={{fontSize:12,color:"#666"}}>Tel: {quote.client.phone}</div>}
      </div>}
      <table><thead><tr style={{background:"#f5f5f5"}}><th style={{fontSize:11}}>CANT.</th><th style={{fontSize:11}}>DESCRIPCIÓN</th><th style={{fontSize:11,textAlign:"right"}}>P. UNIT.</th><th style={{fontSize:11,textAlign:"right"}}>TOTAL</th></tr></thead>
      <tbody>{quote.items.map((it,i)=><tr key={i}><td>{it.qty}</td><td>{it.product_name}</td><td style={{textAlign:"right"}}>{fmt(it.price)}</td><td style={{textAlign:"right",fontWeight:600}}>{fmt(it.price*it.qty)}</td></tr>)}</tbody></table>
      <div style={{borderTop:"2px solid #333",marginTop:12,paddingTop:12}}>
        <div style={{display:"flex",justifyContent:"flex-end"}}><div style={{width:250}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span>Subtotal:</span><span>{fmt(quote.bruto)}</span></div>
          {quote.discount>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"#c00"}}><span>Descuento ({quote.discount}%):</span><span>-{fmt(quote.dcto)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12,color:"#666"}}><span>Neto:</span><span>{fmt(quote.neto)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12,color:"#666"}}><span>IVA 19%:</span><span>{fmt(quote.iva)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:800,borderTop:"1px solid #333",paddingTop:6}}><span>TOTAL:</span><span>{fmt(quote.total)}</span></div>
        </div></div>
      </div>
      <div style={{marginTop:20,fontSize:10,color:"#999",textAlign:"center"}}>Esta cotización no constituye venta. Precios sujetos a cambio sin previo aviso.</div>
    </div>
    <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16}}><Btn bg={C.surface} hover={C.surfaceLight} onClick={onBack}>← VOLVER</Btn><Btn bg={C.blue} hover={C.blueDark} onClick={print}>🖨️ IMPRIMIR</Btn>{onSave&&<Btn bg={C.success} hover={C.successDark} onClick={onSave} disabled={saving}>{saving?"⏳ GUARDANDO...":"💾 GUARDAR COTIZACIÓN"}</Btn>}<Btn bg={C.teal} hover="#009b7d" onClick={onClose}>✅ LISTO</Btn></div>
  </div>;
}

function ProductForm({product,categories,providers,onSave,onCancel,saving}){
  const[form,setForm]=useState(product?{code:product.code,name:product.name,category_id:product.category_id,provider_id:product.provider_id,cost:product.cost,price:product.price,stock:product.stock,min_stock:product.min_stock}:{code:"",name:"",category_id:categories[0]?.id||1,provider_id:providers[0]?.id||1,cost:"",price:"",stock:"",min_stock:"5"});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));const valid=form.code&&form.name&&form.cost&&form.price&&form.stock;
  return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
    {[["code","Código","7801234..."],["name","Nombre","Nombre producto"]].map(([k,l,p])=><div key={k}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>{l}</label><input style={baseInput} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p}/></div>)}
    <div><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>Categoría</label><select style={baseInput} value={form.category_id} onChange={e=>set("category_id",parseInt(e.target.value))}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    <div><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>Proveedor</label><select style={baseInput} value={form.provider_id} onChange={e=>set("provider_id",parseInt(e.target.value))}>{providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
    {[["cost","Costo Neto"],["price","Precio (IVA)"],["stock","Stock"],["min_stock","Stock Mín."]].map(([k,l])=><div key={k}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>{l}</label><input type="number" style={baseInput} value={form[k]} onChange={e=>set(k,e.target.value)}/></div>)}
  </div>
  {form.cost&&form.price&&<div style={{marginTop:10,padding:8,background:C.surface,borderRadius:6,fontSize:12,color:C.textMuted,display:"flex",gap:16}}><span>Margen: <strong style={{color:C.success}}>{((form.price-form.cost)/form.price*100).toFixed(0)}%</strong></span><span>Ganancia: <strong style={{color:C.success}}>{fmt(form.price-form.cost)}</strong></span></div>}
  <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}><Btn bg={C.surface} hover={C.surfaceLight} onClick={onCancel}>CANCELAR</Btn><Btn bg={C.success} hover={C.successDark} disabled={!valid||saving} onClick={()=>onSave({...form,cost:parseInt(form.cost),price:parseInt(form.price),stock:parseInt(form.stock),min_stock:parseInt(form.min_stock)})}>{saving?"...":product?"GUARDAR":"CREAR"}</Btn></div></div>;
}
function CategoryForm({category,onSave,onCancel,saving}){
  const[form,setForm]=useState(category||{name:""});
  return <div><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:6}}>NOMBRE</label><input style={baseInput} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoFocus/><div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}><Btn bg={C.surface} hover={C.surfaceLight} onClick={onCancel}>CANCELAR</Btn><Btn bg={C.success} hover={C.successDark} disabled={!form.name.trim()||saving} onClick={()=>onSave(form)}>{saving?"...":category?"GUARDAR":"CREAR"}</Btn></div></div>;
}
function ProviderForm({provider,onSave,onCancel,saving}){
  const[form,setForm]=useState(provider||{name:"",rut:"",phone:"",email:"",address:""});const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return <div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["name","Razón Social",true],["rut","RUT"],["phone","Teléfono"],["email","Email"],["address","Dirección"]].map(([k,l,wide])=><div key={k} style={wide?{gridColumn:"span 2"}:{}}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>{l}</label><input style={baseInput} value={form[k]} onChange={e=>set(k,e.target.value)}/></div>)}</div><div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}><Btn bg={C.surface} hover={C.surfaceLight} onClick={onCancel}>CANCELAR</Btn><Btn bg={C.success} hover={C.successDark} disabled={!form.name||!form.rut||saving} onClick={()=>onSave(form)}>{saving?"...":"GUARDAR"}</Btn></div></div>;
}
function UserForm({user,onSave,onCancel,saving}){
  const[form,setForm]=useState(user||{name:"",username:"",password:"",role:"seller"});const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return <div><div style={{display:"grid",gap:10}}>{[["name","Nombre"],["username","Usuario"],["password","Contraseña"]].map(([k,l])=><div key={k}><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>{l}</label><input style={baseInput} value={form[k]} onChange={e=>set(k,e.target.value)}/></div>)}<div><label style={{color:C.textMuted,fontSize:11,fontWeight:700,display:"block",marginBottom:4}}>ROL</label><div style={{display:"flex",gap:6}}>{[["admin","🔑 ADMIN"],["seller","💰 VENDEDOR"]].map(([v,l])=><button key={v} onClick={()=>set("role",v)} style={{flex:1,background:form.role===v?C.accent:C.surface,border:`2px solid ${form.role===v?C.accent:C.border}`,borderRadius:6,padding:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>)}</div></div></div><div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}><Btn bg={C.surface} hover={C.surfaceLight} onClick={onCancel}>CANCELAR</Btn><Btn bg={C.success} hover={C.successDark} disabled={!form.name||!form.username||!form.password||saving} onClick={()=>onSave(form)}>{saving?"...":"GUARDAR"}</Btn></div></div>;
}
