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

-- Eliminar todas las políticas RLS existentes para la tabla tribes
DROP POLICY IF EXISTS "Enable read access for all users" ON tribes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tribes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tribes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tribes;

-- Habilitar RLS en la tabla tribes (si no está habilitado)
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;

-- Crear una política que permita a todos los usuarios leer todos los registros
CREATE POLICY "Allow read access for all users" ON tribes
    FOR SELECT
    USING (true);

-- Crear una política que permita a los usuarios autenticados insertar registros
CREATE POLICY "Allow insert for authenticated users" ON tribes
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Crear una política que permita a los usuarios autenticados actualizar registros
CREATE POLICY "Allow update for authenticated users" ON tribes
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Crear una política que permita a los usuarios autenticados eliminar registros
CREATE POLICY "Allow delete for authenticated users" ON tribes
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Verificar las nuevas políticas RLS
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

-- Verificar si hay datos en la tabla tribes
SELECT * FROM tribes ORDER BY id;
