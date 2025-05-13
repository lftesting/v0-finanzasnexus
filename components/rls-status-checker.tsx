"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function RLSStatusChecker() {
  const [loading, setLoading] = useState(true)
  const [rlsEnabled, setRlsEnabled] = useState<boolean | null>(null)
  const [policies, setPolicies] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const supabase = getSupabaseClient()

  useEffect(() => {
    async function checkRLSStatus() {
      try {
        setLoading(true)

        // Verificar si el usuario está autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUserRole(user ? "authenticated" : "anon")

        // Intentar obtener información sobre RLS
        const { data: rlsData, error: rlsError } = await supabase.rpc("check_rls_status", { table_name: "expenses" })

        if (rlsError) {
          console.warn("No se pudo verificar el estado de RLS:", rlsError.message)
          // Intentar inferir basado en la capacidad de leer datos
          const { data: testData, error: testError } = await supabase.from("expenses").select("id").limit(1)

          setRlsEnabled(testError ? true : null) // Si hay error, probablemente RLS está bloqueando
        } else {
          setRlsEnabled(rlsData?.rls_enabled || false)
          setPolicies(rlsData?.policies || [])
        }
      } catch (err) {
        console.error("Error al verificar RLS:", err)
      } finally {
        setLoading(false)
      }
    }

    checkRLSStatus()
  }, [])

  const testRLSAccess = async () => {
    try {
      setTestResult(null)

      // Intentar leer datos
      const { data, error } = await supabase.from("expenses").select("id").limit(1)

      if (error) {
        setTestResult({
          success: false,
          message: `Error al acceder a los datos: ${error.message}`,
        })
      } else {
        setTestResult({
          success: true,
          message: `Acceso exitoso. Se encontraron ${data.length} registros.`,
        })
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Error inesperado: ${err.message}`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de seguridad RLS</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando estado de RLS...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Estado de RLS</h3>
                {rlsEnabled === null ? (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-5 w-5" />
                    No se pudo determinar
                  </div>
                ) : rlsEnabled ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    Habilitado
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="h-5 w-5" />
                    Deshabilitado
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Rol de usuario</h3>
                <div className="flex items-center gap-2">
                  {userRole === "authenticated" ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      Autenticado
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertTriangle className="h-5 w-5" />
                      Anónimo
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Políticas RLS</h3>
              {policies.length > 0 ? (
                <ul className="list-disc pl-5">
                  {policies.map((policy, index) => (
                    <li key={index}>{policy.policyname}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-yellow-500">No se encontraron políticas o no se pudo acceder a esta información.</p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Prueba de acceso</h3>
              <Button onClick={testRLSAccess} variant="outline" size="sm">
                Probar acceso a datos
              </Button>

              {testResult && (
                <div
                  className={`mt-2 p-2 rounded ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 mt-4 border-t pt-4">
              <p>Si tienes problemas para acceder a los datos, verifica que:</p>
              <ol className="list-decimal pl-5 mt-2">
                <li>Estás autenticado correctamente</li>
                <li>Las políticas RLS permiten el acceso a los datos para tu rol</li>
                <li>La tabla expenses tiene los permisos adecuados</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
