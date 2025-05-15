-- Verificar si hay políticas de RLS activas en la tabla tribes
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

-- Verificar si RLS está habilitado para la tabla tribes
SELECT
  relname,
  relrowsecurity
FROM
  pg_class
WHERE
  relname = 'tribes';
