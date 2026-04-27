-- ============================================
-- ACTUALIZACIÓN: Agregar descuento a ventas
-- Ejecutar en Supabase → SQL Editor → New Query
-- (Solo si ya creaste las tablas antes)
-- ============================================

ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal_before_discount INTEGER DEFAULT 0;
