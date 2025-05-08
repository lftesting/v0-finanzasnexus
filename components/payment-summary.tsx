import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentSummaryProps {
  total: number
  count: number
  efectivo: number
  transferencia: number
}

export function PaymentSummary({ total, count, efectivo, transferencia }: PaymentSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cobros</CardTitle>
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
          <CardTitle className="text-sm font-medium">Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(total / count || 0).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Por registro</p>
        </CardContent>
      </Card>
    </div>
  )
}
