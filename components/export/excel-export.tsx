"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ExcelExportProps {
  data: any[]
  filename: string
  sheetName?: string
  buttonText?: string
  customMapping?: (item: any) => any
}

export default function ExcelExport({
  data,
  filename,
  sheetName = "Datos",
  buttonText = "Exportar a Excel",
  customMapping,
}: ExcelExportProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!data || data.length === 0) return

    setExporting(true)
    try {
      // Aplicar mapeo personalizado si se proporciona
      const processedData = customMapping ? data.map(customMapping) : data

      // Crear libro y hoja
      const worksheet = XLSX.utils.json_to_sheet(processedData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // Generar archivo con fecha actual
      const currentDate = format(new Date(), "yyyy-MM-dd", { locale: es })
      const fullFilename = `${filename}_${currentDate}.xlsx`

      // Exportar
      XLSX.writeFile(workbook, fullFilename)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting || !data || data.length === 0}>
      {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {buttonText}
    </Button>
  )
}
