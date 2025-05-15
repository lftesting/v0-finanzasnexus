"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AdvancedDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
    setResults(null)
  }

  const testDirectQuery = async () => {
    try {
      setLoading(true)
      addLog("Iniciando consulta directa a la tabla tribes...")

      // Crear cliente de Supabase del lado del cliente
      const supabase = createClientComponentClient()

      addLog("Cliente Supabase creado. Ejecutando consulta...")
      const { data, error } = await supabase.from("tribes").select("*")

      if (error) {
        addLog(`Error en la consulta: ${error.message}`)
        setResults({ error: error.message })
        return
      }

      addLog(`Consulta exitosa. Resultados: ${data?.length || 0} registros`)
      setResults({ data })

      // Intentar obtener información sobre la tabla
      addLog("Intentando obtener información sobre la tabla tribes...")
      const { data: tableInfo, error: tableError } = await supabase.rpc("get_table_info", { table_name: "tribes" })

      if (tableError) {
        addLog(`Error al obtener información de la tabla: ${tableError.message}`)
      } else {
        addLog(`Información de la tabla: ${JSON.stringify(tableInfo)}`)
      }
    } catch (err: any) {
      addLog(`Error inesperado: ${err.message}`)
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testRawSQL = async () => {
    try {
      setLoading(true)
      addLog("Ejecutando consulta SQL directa...")

      const supabase = createClientComponentClient()

      // Intentar con una consulta SQL directa
      const { data, error } = await supabase.rpc("execute_sql", {
        sql_query: "SELECT * FROM tribes ORDER BY id",
      })

      if (error) {
        addLog(`Error en la consulta SQL: ${error.message}`)
        setResults({ error: error.message })

        // Si falla, podría ser porque la función RPC no existe
        addLog("La función RPC 'execute_sql' podría no existir. Intentando con consulta estándar...")
        const { data: fallbackData, error: fallbackError } = await supabase.from("tribes").select("*").order("id")

        if (fallbackError) {
          addLog(`Error en consulta estándar: ${fallbackError.message}`)
        } else {
          addLog(`Consulta estándar exitosa. Resultados: ${fallbackData?.length || 0} registros`)
          setResults({ data: fallbackData })
        }

        return
      }

      addLog(`Consulta SQL exitosa. Resultados: ${data?.length || 0} registros`)
      setResults({ data })
    } catch (err: any) {
      addLog(`Error inesperado: ${err.message}`)
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = async () => {
    try {
      setLoading(true)
      addLog("Verificando permisos y políticas de seguridad...")

      const supabase = createClientComponentClient()

      // Verificar usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        addLog(`Error al obtener usuario: ${userError.message}`)
      } else {
        addLog(`Usuario actual: ${userData?.user?.email || "No autenticado"}`)
      }

      // Intentar listar tablas (esto podría no funcionar dependiendo de los permisos)
      addLog("Intentando listar tablas...")
      const { data: tablesData, error: tablesError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (tablesError) {
        addLog(`Error al listar tablas: ${tablesError.message}`)
      } else {
        const tables = tablesData.map((t) => t.table_name).join(", ")
        addLog(`Tablas disponibles: ${tables}`)
      }

      // Verificar si podemos leer de otras tablas
      const tablesToCheck = ["suppliers", "expense_categories", "rooms", "expenses"]
      const results: Record<string, any> = {}

      for (const table of tablesToCheck) {
        addLog(`Verificando acceso a tabla '${table}'...`)
        const { data, error } = await supabase.from(table).select("count").limit(1)

        if (error) {
          addLog(`Error al acceder a '${table}': ${error.message}`)
          results[table] = { error: error.message }
        } else {
          addLog(`Acceso exitoso a '${table}'`)
          results[table] = { success: true }
        }
      }

      setResults(results)
    } catch (err: any) {
      addLog(`Error inesperado: ${err.message}`)
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvironmentVariables = () => {
    try {
      setLoading(true)
      addLog("Verificando variables de entorno...")

      // No podemos acceder directamente a process.env en el cliente
      // pero podemos verificar si las variables públicas están definidas
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Definida" : "No definida"}`)
      addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "Definida" : "No definida"}`)

      setResults({
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? "Definida" : "No definida",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "Definida" : "No definida",
      })
    } catch (err: any) {
      addLog(`Error inesperado: ${err.message}`)
      setResults({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Depuración Avanzada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testDirectQuery} disabled={loading} variant="outline">
              Consulta Directa
            </Button>
            <Button onClick={testRawSQL} disabled={loading} variant="outline">
              Consulta SQL
            </Button>
            <Button onClick={checkPermissions} disabled={loading} variant="outline">
              Verificar Permisos
            </Button>
            <Button onClick={checkEnvironmentVariables} disabled={loading} variant="outline">
              Variables de Entorno
            </Button>
            <Button onClick={clearLogs} disabled={loading} variant="ghost" className="ml-auto">
              Limpiar Logs
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
              <span>Procesando...</span>
            </div>
          )}

          {results && (
            <div className="p-4 bg-gray-50 rounded-md overflow-x-auto">
              <h4 className="font-medium mb-2">Resultados:</h4>
              <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Logs</h4>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-md h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">No hay logs disponibles</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
