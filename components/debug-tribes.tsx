"use client"

import { useEffect, useState } from "react"
import { getTribes } from "@/app/expense-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DebugTribes() {
  const [tribes, setTribes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs((prev) => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`])
  }

  const loadTribes = async () => {
    try {
      setLoading(true)
      addLog("Iniciando carga de tribus...")

      const data = await getTribes()

      addLog(`Respuesta recibida: ${JSON.stringify(data)}`)

      if (!data) {
        addLog("Error: La respuesta es null o undefined")
        setError("La respuesta es null o undefined")
        setTribes([])
      } else if (!Array.isArray(data)) {
        addLog(`Error: La respuesta no es un array: ${typeof data}`)
        setError(`La respuesta no es un array: ${typeof data}`)
        setTribes([])
      } else if (data.length === 0) {
        addLog("No se encontraron tribus en la respuesta")
        setTribes([])
      } else {
        addLog(`Se encontraron ${data.length} tribus`)
        setTribes(data)
        setError(null)
      }
    } catch (err) {
      addLog(`Error al cargar tribus: ${err.message || "Error desconocido"}`)
      console.error("Error al cargar tribus:", err)
      setError(err.message || "Error desconocido")
      setTribes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTribes()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Depuración de Tribus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Estado</h3>
            <Button onClick={loadTribes} disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Recargar"
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Tribus ({tribes.length})</h4>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : tribes.length === 0 ? (
              <p className="text-amber-600">No se encontraron tribus.</p>
            ) : (
              <ul className="space-y-1">
                {tribes.map((tribe) => (
                  <li key={tribe.id} className="p-2 bg-gray-50 rounded-md">
                    ID: {tribe.id}, Nombre: {tribe.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Logs</h4>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-md h-48 overflow-y-auto font-mono text-xs">
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
