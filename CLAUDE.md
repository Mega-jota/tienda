# CLAUDE.md — Sistema POS Multi-Empresa

## Identidad del Proyecto

- **Nombre**: Sistema Punto de Venta (POS)
- **Versión actual**: v5.0
- **Mercado objetivo**: Comercio minorista Chile (almacenes, minimarkets, bazares, ferias)
- **Idioma**: Español (Chile)
- **Moneda**: Peso chileno (CLP), sin decimales
- **IVA**: 19% incluido en precio de venta
- **Licencia**: Propietario

---

## Stack Tecnológico

| Capa | Tecnología | Detalle |
|------|-----------|---------|
| Frontend | React 18 + Vite 6 | SPA, un solo archivo App.jsx (~590 líneas) |
| UI | CSS-in-JS (inline styles) | Sin framework CSS. Paleta oscura profesional |
| Base de datos | Supabase (PostgreSQL) | Cloud, plan free. Realtime habilitado |
| Hosting | Vercel | Deploy automático desde GitHub |
| Auth | Interna (tabla users) | Login con username/password en texto plano |
| Realtime | Supabase Channels | Escucha cambios en `sales` y `products` |

---

## Estructura de Archivos Actual

```
/
├── src/
│   ├── App.jsx              # Componente único (toda la app)
│   ├── main.jsx             # Entry point React
│   └── supabaseClient.js    # Conexión Supabase (URL + anon key)
├── public/
│   ├── favicon.svg
│   └── manifest.json        # PWA manifest
├── index.html
├── package.json             # Deps: react, react-dom, @supabase/supabase-js
├── vite.config.js
├── vercel.json              # Config deploy Vercel
├── supabase-setup.sql       # Script creación de tablas + datos iniciales
├── supabase-update-descuento.sql  # Migración: columnas descuento
└── CLAUDE.md                # Este archivo
```

---

## Esquema de Base de Datos (Actual — Single Tenant)

```sql
categories (id, name, created_at)
providers (id, name, rut, phone, email, address, created_at)
products (id, code, name, category_id→categories, provider_id→providers, cost, price, stock, min_stock, created_at)
users (id, name, username, password, role[admin|seller], created_at)
sales (id, sale_number, user_id→users, user_name, subtotal, iva, total, payment, cash_given, change_amount, discount_percent, discount_amount, subtotal_bruto, created_at)
sale_items (id, sale_id→sales, product_id, product_name, price, qty)
config (key PK, value)
```

**Notas:**
- Todos los montos en INTEGER (pesos chilenos, sin decimales)
- `products.price` incluye IVA 19%
- `products.cost` es neto (sin IVA)
- `sales.subtotal` = neto, `sales.iva` = 19% de neto, `sales.total` = con IVA
- `discount_percent/amount/subtotal_bruto` se agregaron en v4.0 (migración)
- RLS habilitado en todas las tablas con policy permisiva (TODO: restringir)
- Passwords en texto plano (TODO: hashear con bcrypt)

---

## Funcionalidades por Módulo

### 💰 Caja (POS)
- Búsqueda de productos por código de barras o nombre
- Compatible con pistola de código de barras (lectura directa del DOM, no del state)
- Carrito con +/- cantidad, eliminar item
- Cálculo automático: subtotal → descuento % → neto → IVA 19% → total
- Descuento por venta: botones rápidos (5/10/15/20%) o manual
- Métodos de pago: efectivo (con cálculo de vuelto), débito, crédito, transferencia
- Botones rápidos con atajos de teclado: F2 buscar, F3 cobrar, F4 eliminar, F5 nueva venta, F6 cambiar cantidad
- Ticket de venta imprimible (formato boleta chilena)
- Re-impresión de último ticket

### 📦 Productos (admin)
- CRUD completo
- Buscador por código/nombre + filtro por categoría
- Vista de margen (%) y ganancia ($) por producto
- Alertas de stock bajo (stock ≤ min_stock)
- Campos: código, nombre, categoría, proveedor, costo, precio, stock, stock mínimo

### 🏷️ Categorías (admin)
- CRUD, muestra cantidad de productos por categoría
- Protección: no eliminar si tiene productos

### 🚚 Proveedores (admin)
- CRUD con RUT, teléfono, email, dirección

### 📊 Reportes de Ventas
- Filtros por período: hoy, semana (7d), mes (30d), todo
- Buscador en historial (por boleta, cajero, producto)
- Tarjetas resumen: boletas, total ventas, neto, ticket promedio, costo, ganancia neta, margen %
- Desglose por medio de pago (con barras visuales)
- Ventas por cajero
- Top 10 productos vendidos
- Gráfico de barras: ventas por día

### 📋 Cierre de Caja
- Reporte diario imprimible
- Total boletas, desglose por medio de pago
- Neto, IVA, descuentos, total
- Rentabilidad: costo, ganancia neta, margen %
- Top productos del día

### 👥 Usuarios (admin)
- CRUD con roles: admin (acceso total) y seller (solo caja + historial)

### ⚙️ Configuración (admin)
- Nombre del negocio
- Versión del sistema visible

### 🔄 Realtime
- Supabase Channels escucha `sales` y `products`
- Cuando una caja vende, las otras ven stock actualizado sin refrescar

---

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v1.0 | — | Sistema inicial con localStorage |
| v2.0 | — | Migración a Supabase, descuento en venta |
| v3.0 | — | Rediseño interfaz POS profesional, realtime, cierre de caja |
| v4.0 | — | Reportes diarios/semanales/mensuales, buscador en inventario, versionamiento |
| v4.1 | — | Ganancia neta y margen % en reportes y cierre de caja |
| v4.2 | — | Fix pistola código de barras (lectura DOM directa en Enter) |
| v5.0 | — | Alertas de stock con campanita, módulo cotizaciones, datos de tienda en config |

---

## Convenciones de Código

- **Un solo archivo** `App.jsx` contiene toda la app (componentes, lógica, estilos)
- **CSS-in-JS**: estilos inline con objeto `C` para paleta de colores
- **Componentes reutilizables**: `Btn`, `Modal`, `Badge`, `StatCard`, `TicketPreview`, `CierreCaja`
- **Formularios**: `ProductForm`, `CategoryForm`, `ProviderForm`, `UserForm` — componentes separados al final del archivo
- **Estado**: todo con `useState` en el componente raíz, sin state management externo
- **Supabase**: import directo, llamadas con `.from().select()` etc. No hay capa de abstracción API
- **Montos**: siempre INTEGER en pesos chilenos. Formateo con `fmt()` que agrega "$" y separador de miles
- **Versión**: constante `APP_VERSION` dentro de `POSApp`, visible en header y config

---

## Roadmap Multi-Empresa (Multi-Tenant)

### Fase 1: Arquitectura Multi-Tenant en Base de Datos

Agregar tabla `tenants` y columna `tenant_id` a todas las tablas:

```sql
-- Nueva tabla
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,               -- "Minimarket Don Pepe"
  rut TEXT,                         -- RUT empresa
  address TEXT,
  phone TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free',         -- free | basic | pro
  max_users INTEGER DEFAULT 3,
  max_products INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar tenant_id a todas las tablas existentes
ALTER TABLE categories ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE providers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE products ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE sales ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE config ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Índices
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_sales_tenant ON sales(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
```

### Fase 2: Row Level Security por Tenant

```sql
-- Ejemplo para products (aplicar a todas las tablas)
DROP POLICY IF EXISTS "Allow all on products" ON products;
CREATE POLICY "Tenant isolation" ON products
  FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### Fase 3: Autenticación Real

- Migrar de auth interna a **Supabase Auth**
- Hashear passwords con bcrypt
- JWT con `tenant_id` en claims
- Tabla `user_profiles` vinculada a `auth.users` con `tenant_id` y `role`

### Fase 4: Refactorización del Frontend

- Separar `App.jsx` en módulos:
  ```
  src/
  ├── components/
  │   ├── POS/          # Caja, carrito, búsqueda, ticket
  │   ├── Products/     # CRUD productos
  │   ├── Reports/      # Reportes, cierre
  │   ├── Admin/        # Categorías, proveedores, usuarios
  │   └── UI/           # Btn, Modal, Badge, etc.
  ├── hooks/
  │   ├── useAuth.js
  │   ├── useTenant.js
  │   └── useRealtime.js
  ├── lib/
  │   ├── supabase.js
  │   ├── api.js        # Capa de abstracción para queries
  │   └── format.js     # fmt, fmtDate, etc.
  ├── context/
  │   ├── AuthContext.jsx
  │   └── TenantContext.jsx
  └── App.jsx           # Router + layout
  ```

### Fase 5: Panel Super-Admin

- Dashboard para gestionar tenants
- Ver uso por empresa (ventas, productos, usuarios)
- Activar/desactivar empresas
- Gestión de planes y límites

### Fase 6: Onboarding Self-Service

- Landing page pública
- Registro de nueva empresa → crea tenant + admin user
- Wizard de configuración inicial (nombre, RUT, categorías)
- Datos demo opcionales

### Fase 7: Funcionalidades SaaS

- Planes con límites (free: 3 users/500 products, pro: ilimitado)
- Billing con Stripe o Flow (Chile)
- Subdominio por empresa: `donpepe.pos.cl`
- Logo y personalización por tenant
- Exportación de datos (CSV, Excel)
- Backup/restore por empresa

---

## Deuda Técnica (resolver antes de multi-tenant)

| Prioridad | Item | Estado |
|-----------|------|--------|
| 🔴 CRÍTICA | Passwords en texto plano → migrar a Supabase Auth o bcrypt | Pendiente |
| 🔴 CRÍTICA | RLS permisiva (allow all) → restringir por tenant_id | Pendiente |
| 🟡 ALTA | App en un solo archivo (590 líneas) → separar en módulos | Pendiente |
| 🟡 ALTA | Supabase credentials hardcodeadas → variables de entorno (.env) | Pendiente |
| 🟡 ALTA | Sin manejo de errores robusto → try/catch + toasts | Pendiente |
| 🟢 MEDIA | Sin tests → agregar Vitest + Testing Library | Pendiente |
| 🟢 MEDIA | Sin validación de RUT chileno en frontend | Pendiente |
| 🟢 MEDIA | Sin paginación en historial de ventas (limit 500) | Pendiente |
| 🟢 MEDIA | Sin responsive completo para móvil en módulo POS | Pendiente |

---

## Variables de Entorno (migrar a esto)

```env
# .env.local (no commitear)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

```javascript
// supabaseClient.js (después de migrar)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## Deployment

- **Frontend**: Vercel (auto-deploy desde branch `main` de GitHub)
- **Base de datos**: Supabase proyecto `mkkwbytjateachszpebp` (región São Paulo)
- **Dominio actual**: URL de Vercel (personalizable)

### Deploy de una actualización
1. Modificar solo `src/App.jsx`
2. Push a GitHub → Vercel redeploya automáticamente (~30 seg)
3. La base de datos NO se toca al actualizar frontend
4. Para cambios de esquema: ejecutar SQL en Supabase → SQL Editor

### Rollback
1. Descargar ZIP de la versión anterior
2. Subir `src/App.jsx` de esa versión a GitHub
3. Vercel redeploya la versión anterior

---

## Reglas para Claude

1. **Nunca borrar datos de producción.** Los cambios son solo en `src/App.jsx`.
2. **Mantener versionamiento.** Incrementar `APP_VERSION` en cada cambio. Formato: `vMAJOR.MINOR`.
3. **Verificar build** antes de entregar (`npm run build` debe compilar sin errores).
4. **Empaquetar como ZIP** con nombre `pos-online-vX.Y.zip`.
5. **No cambiar `supabaseClient.js`** a menos que el usuario lo pida explícitamente.
6. **Migraciones SQL separadas.** Si se cambia el esquema, entregar un `.sql` aparte, nunca modificar el setup original.
7. **Compatibilidad con pistola de código de barras.** Al modificar búsqueda POS, siempre leer valor del DOM en Enter, no del React state.
8. **IVA 19% fijo.** Fórmula: `neto = round(total / 1.19)`, `iva = total - neto`.
9. **Montos siempre INTEGER** en pesos chilenos. Nunca float ni decimales.
10. **Mantener registro de versiones** en cada entrega con tabla comparativa.
