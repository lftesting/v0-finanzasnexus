"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns"

interface DateRangePickerProps {
  onChange: (range: { from: Date; to: Date } | null) => void
}

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [date, setDate] = useState<{ from: Date; to: Date } | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handleSelect = (range: { from: Date; to: Date } | null) => {
    setDate(range)
    onChange(range)
    if (range?.from && range?.to) {
      setIsCalendarOpen(false)
    }
  }

  const handlePresetChange = (value: string) => {
    const today = new Date()
    let from: Date
    let to: Date

    switch (value) {
      case "last-month":
        from = startOfMonth(subMonths(today, 1))
        to = endOfMonth(subMonths(today, 1))
        break
      case "this-month":
        from = startOfMonth(today)
        to = endOfMonth(today)
        break
      case "last-3-months":
        from = startOfMonth(subMonths(today, 3))
        to = endOfMonth(today)
        break
      case "last-6-months":
        from = startOfMonth(subMonths(today, 6))
        to = endOfMonth(today)
        break
      case "this-year":
        from = startOfYear(today)
        to = endOfYear(today)
        break
      default:
        return
    }

    const newRange = { from, to }
    setDate(newRange)
    onChange(newRange)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-[300px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} - {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date || undefined}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>

      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Período predefinido" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-month">Este mes</SelectItem>
          <SelectItem value="last-month">Mes anterior</SelectItem>
          <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
          <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
          <SelectItem value="this-year">Este año</SelectItem>
        </SelectContent>
      </Select>

      {date && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setDate(null)
            onChange(null)
          }}
        >
          Limpiar
        </Button>
      )}
    </div>
  )
}
