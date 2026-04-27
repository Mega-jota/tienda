-- ============================================
-- ACTUALIZACIÓN: Agregar descuento a ventas
-- Ejecutar en Supabase → SQL Editor → New Query
-- ============================================

ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal_bruto INTEGER DEFAULT 0;
