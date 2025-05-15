-- Verificar las políticas RLS actuales para la tabla tribes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'tribes';

-- Verificar las políticas RLS actuales para la tabla rooms
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'rooms';

-- Verificar si RLS está habilitado para las tablas
SELECT
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');

-- Crear o reemplazar políticas RLS para permitir SELECT en tribes
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tribes_select_policy ON tribes;
CREATE POLICY tribes_select_policy ON tribes
    FOR SELECT
    USING (true);

-- Crear o reemplazar políticas RLS para permitir SELECT en rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rooms_select_policy ON rooms;
CREATE POLICY rooms_select_policy ON rooms
    FOR SELECT
    USING (true);

-- Crear o reemplazar políticas RLS para permitir SELECT en suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS suppliers_select_policy ON suppliers;
CREATE POLICY suppliers_select_policy ON suppliers
    FOR SELECT
    USING (true);

-- Crear o reemplazar políticas RLS para permitir SELECT en expense_categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expense_categories_select_policy ON expense_categories;
CREATE POLICY expense_categories_select_policy ON expense_categories
    FOR SELECT
    USING (true);

-- Verificar que las tablas tienen datos
SELECT 'tribes' as tabla, COUNT(*) as registros FROM tribes
UNION ALL
SELECT 'rooms' as tabla, COUNT(*) as registros FROM rooms
UNION ALL
SELECT 'suppliers' as tabla, COUNT(*) as registros FROM suppliers
UNION ALL
SELECT 'expense_categories' as tabla, COUNT(*) as registros FROM expense_categories;

-- Verificar las políticas RLS después de los cambios
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('tribes', 'rooms', 'suppliers', 'expense_categories');
