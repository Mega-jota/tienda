-- ============================================
-- SISTEMA POS - SCRIPT DE BASE DE DATOS
-- Ejecutar en Supabase → SQL Editor → New Query
-- ============================================

-- 1. CATEGORÍAS
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROVEEDORES
CREATE TABLE providers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rut TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTOS
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
  cost INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USUARIOS
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VENTAS (cabecera)
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  sale_number TEXT NOT NULL,
  user_id BIGINT REFERENCES users(id),
  user_name TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  iva INTEGER NOT NULL,
  total INTEGER NOT NULL,
  payment TEXT NOT NULL,
  cash_given INTEGER DEFAULT 0,
  change_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DETALLE DE VENTAS (items de cada venta)
CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);

-- 7. CONFIGURACIÓN
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías
INSERT INTO categories (name) VALUES
  ('Abarrotes'), ('Bebidas'), ('Lácteos'), ('Limpieza'), ('Snacks');

-- Proveedores
INSERT INTO providers (name, rut, phone, email, address) VALUES
  ('Distribuidora Central', '76.543.210-K', '+56 9 1234 5678', 'ventas@distcentral.cl', 'Av. Libertador 1234, Santiago'),
  ('Alimentos del Sur', '77.888.999-1', '+56 9 8765 4321', 'contacto@alimsur.cl', 'Ruta 5 Sur Km 45, Rancagua'),
  ('Bebidas Chile SpA', '78.111.222-3', '+56 2 2345 6789', 'pedidos@bebidaschile.cl', 'Parque Industrial Lo Boza, Pudahuel');

-- Productos
INSERT INTO products (code, name, category_id, provider_id, cost, price, stock, min_stock) VALUES
  ('7801234001', 'Arroz Grado 1 1kg', 1, 1, 890, 1290, 45, 10),
  ('7801234002', 'Azúcar Granulada 1kg', 1, 1, 750, 1090, 38, 10),
  ('7801234003', 'Aceite Vegetal 1L', 1, 1, 1200, 1890, 22, 8),
  ('7801234004', 'Coca-Cola 1.5L', 2, 3, 950, 1490, 60, 15),
  ('7801234005', 'Agua Mineral 1.5L', 2, 3, 350, 590, 48, 12),
  ('7801234006', 'Leche Entera 1L', 3, 2, 780, 1190, 30, 10),
  ('7801234007', 'Yogurt Natural 1kg', 3, 2, 1100, 1690, 18, 8),
  ('7801234008', 'Detergente 1kg', 4, 1, 1800, 2790, 15, 5),
  ('7801234009', 'Lavaloza 500ml', 4, 1, 650, 990, 25, 8),
  ('7801234010', 'Papas Fritas 150g', 5, 2, 450, 790, 40, 10);

-- Usuarios
INSERT INTO users (name, username, password, role) VALUES
  ('Administrador', 'admin', 'admin123', 'admin'),
  ('Vendedor 1', 'vendedor', 'venta123', 'seller');

-- Config inicial
INSERT INTO config (key, value) VALUES ('store_name', 'MI NEGOCIO');

-- ============================================
-- PERMISOS (Row Level Security)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo al anon key (la app maneja auth internamente)
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on providers" ON providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sale_items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on config" ON config FOR ALL USING (true) WITH CHECK (true);
