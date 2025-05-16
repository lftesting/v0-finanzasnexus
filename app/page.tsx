import { FeatureBox } from "@/components/feature-box"
import { CreditCard, Receipt, Building2, BarChart4 } from "lucide-react"
import Link from "next/link"
import { UserProfileIcon } from "@/components/user-profile-icon"
import { AuthDebugPanel } from "@/components/auth-debug-panel"
import { UserInfoDebug } from "@/components/user-info-debug"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 mr-2 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Nexus <span className="text-green-600 dark:text-green-400">Co-living</span>
            </h1>
          </div>
          <UserProfileIcon />
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Sistema de Gestión Financiera</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Administra de manera eficiente los cobros y gastos de tu negocio con nuestro sistema integral
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Caja de Cobros */}
          <FeatureBox
            title="Gestión de Cobros"
            description="Registra y administra todos los cobros a clientes, con seguimiento de fechas y estados de pago."
            icon={CreditCard}
            href="/payments/new"
            buttonText="Registrar Cobros"
            className="bg-white dark:bg-gray-800 border-t-4 border-green-500 hover:border-green-600"
            buttonVariant="default"
          />

          {/* Caja de Gastos */}
          <FeatureBox
            title="Gestión de Gastos"
            description="Controla todos los gastos y pagos a proveedores, organizados por categorías y con seguimiento de facturas."
            icon={Receipt}
            href="/expenses/new"
            buttonText="Registrar Gastos"
            className="bg-white dark:bg-gray-800 border-t-4 border-orange-500 hover:border-orange-600"
            buttonVariant="outline"
          />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Acceso Rápido a Reportes</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link
              href="/payments"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-center space-x-3"
            >
              <CreditCard className="h-5 w-5 text-green-600" />
              <span>Ver Historial de Cobros</span>
            </Link>
            <Link
              href="/expenses/list"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-center space-x-3"
            >
              <Receipt className="h-5 w-5 text-orange-600" />
              <span>Ver Historial de Gastos</span>
            </Link>
            <Link
              href="/dashboard"
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-center space-x-3 border-t-4 border-blue-500"
            >
              <BarChart4 className="h-5 w-5 text-blue-600" />
              <span>Dashboard Analítico</span>
            </Link>
          </div>
        </div>

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Nexus Co-living</span>
          </div>
          <p>Sistema de Gestión Financiera © {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* Panel de depuración de autenticación mejorado */}
      <AuthDebugPanel />

      {/* Panel de depuración de información de usuario */}
      <UserInfoDebug />
    </main>
  )
}
