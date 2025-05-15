-- Verificar las políticas RLS existentes para todas las tablas relevantes
SELECT tablename, policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Verificar si RLS está habilitado para estas tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Deshabilitar temporalmente RLS para estas tablas para verificar si ese es el problema
ALTER TABLE tribes DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- Verificar nuevamente si RLS está deshabilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Verificar si hay datos en estas tablas
SELECT 'tribes' as tabla, COUNT(*) as cantidad FROM tribes
UNION ALL
SELECT 'rooms' as tabla, COUNT(*) as cantidad FROM rooms
UNION ALL
SELECT 'suppliers' as tabla, COUNT(*) as cantidad FROM suppliers
UNION ALL
SELECT 'expense_categories' as tabla, COUNT(*) as cantidad FROM expense_categories;
