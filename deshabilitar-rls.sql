-- Deshabilitar RLS para la tabla tribes
ALTER TABLE tribes DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla rooms
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla suppliers
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla expense_categories
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');
