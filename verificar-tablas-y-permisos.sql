-- Verificar si las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Verificar si hay políticas de RLS activas en estas tablas
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Verificar si hay datos en estas tablas
SELECT 'tribes' as tabla, COUNT(*) as registros FROM tribes
UNION ALL
SELECT 'rooms' as tabla, COUNT(*) as registros FROM rooms
UNION ALL
SELECT 'suppliers' as tabla, COUNT(*) as registros FROM suppliers
UNION ALL
SELECT 'expense_categories' as tabla, COUNT(*) as registros FROM expense_categories;
