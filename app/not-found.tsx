// Crear un archivo not-found.tsx personalizado que no use Supabase

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
      <p className="text-lg mb-6">Lo sentimos, la página que estás buscando no existe.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Volver al inicio
      </a>
    </div>
  )
}
