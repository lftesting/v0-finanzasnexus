import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseSummaryProps {
  total: number
  count: number
  efectivo: number
  tarjeta: number
  transferencia: number
  debito: number
  pendientes: number
  pagados: number
}

export function ExpenseSummary({
  total,
  count,
  efectivo,
  tarjeta,
  transferencia,
  debito,
  pendientes,
  pagados,
}: ExpenseSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${total.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "registro" : "registros"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">${pendientes.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((pendientes / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${pagados.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((pagados / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(total / count || 0).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Por registro</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${efectivo.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((efectivo / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${transferencia.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((transferencia / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarjeta Crédito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${tarjeta.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((tarjeta / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarjeta Débito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${debito.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{((debito / total) * 100 || 0).toFixed(1)}% del total</p>
        </CardContent>
      </Card>
    </div>
  )
}
