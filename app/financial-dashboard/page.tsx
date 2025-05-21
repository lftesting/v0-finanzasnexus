"use client"

import { useState } from "react"
import { HeaderWithLogout } from "@/components/header-with-logout"
import DateRangePicker from "@/components/dashboard/date-range-picker"
import ExpenseSummaryCards from "@/components/dashboard/expense-summary-cards"
import ExpenseCategoryChart from "@/components/dashboard/expense-category-chart"
import MonthlyExpensesChart from "@/components/dashboard/monthly-expenses-chart"
import SupplierExpensesChart from "@/components/dashboard/supplier-expenses-chart"
import { AuthGuard } from "@/components/auth-guard"

export default function FinancialDashboardPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const currentYear = new Date().getFullYear()

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <HeaderWithLogout title="Dashboard Financiero" showBackButton>
          <DateRangePicker onChange={setDateRange} />
        </HeaderWithLogout>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <ExpenseSummaryCards dateRange={dateRange || undefined} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExpenseCategoryChart dateRange={dateRange || undefined} />
          <SupplierExpensesChart dateRange={dateRange || undefined} />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <MonthlyExpensesChart year={currentYear} />
        </div>
      </div>
    </AuthGuard>
  )
}
