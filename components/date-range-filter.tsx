"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FilterX, Search } from "lucide-react"
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { DateFilter } from "@/app/actions"

interface DateRangeFilterProps {
  onFilter: (filter: DateFilter) => void
}

export function DateRangeFilter({ onFilter }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [filterField, setFilterField] = useState<"entry_date" | "estimated_payment_date" | "actual_payment_date">(
    "entry_date",
  )

  const applyFilter = () => {
    onFilter({
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      filterField,
    })
  }

  const clearFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    onFilter({})
  }

  const applyPresetFilter = (preset: string) => {
    const today = new Date()
    let start: Date | undefined
    let end: Date | undefined = today

    switch (preset) {
      case "last7days":
        start = subDays(today, 7)
        break
      case "last30days":
        start = subDays(today, 30)
        break
      case "thisMonth":
        start = startOfMonth(today)
        end = endOfMonth(today)
        break
      case "lastMonth":
        const lastMonth = subMonths(today, 1)
        start = startOfMonth(lastMonth)
        end = endOfMonth(lastMonth)
        break
      case "last3months":
        start = subMonths(today, 3)
        break
      case "last6months":
        start = subMonths(today, 6)
        break
      default:
        break
    }

    setStartDate(start)
    setEndDate(end)

    if (start && end) {
      onFilter({
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        filterField,
      })
    }
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
      <div className="space-y-2">
        <div className="text-sm font-medium">Campo de fecha</div>
        <Select value={filterField} onValueChange={(value: any) => setFilterField(value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Seleccionar campo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry_date">Fecha de ingreso</SelectItem>
            <SelectItem value="estimated_payment_date">Fecha estimada</SelectItem>
            <SelectItem value="actual_payment_date">Fecha efectuada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Fecha inicial</div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left md:w-[200px]", !startDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Fecha final</div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left md:w-[200px]", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex space-x-2">
        <Button onClick={applyFilter} className="flex-1 md:flex-none">
          <Search className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
        <Button variant="outline" onClick={clearFilter} className="flex-1 md:flex-none">
          <FilterX className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  )
}

export function DateRangePresets({ onSelectPreset }: { onSelectPreset: (preset: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("last7days")}>
        Últimos 7 días
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("last30days")}>
        Últimos 30 días
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("thisMonth")}>
        Este mes
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("lastMonth")}>
        Mes anterior
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("last3months")}>
        Últimos 3 meses
      </Button>
      <Button variant="outline" size="sm" onClick={() => onSelectPreset("last6months")}>
        Últimos 6 meses
      </Button>
    </div>
  )
}
