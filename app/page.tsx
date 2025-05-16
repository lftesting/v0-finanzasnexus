import { HeaderWithLogout } from "@/components/header-with-logout"
import { BarChart4, CreditCard, Receipt } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <HeaderWithLogout title="Inicio" showBackButton={false} />

        <main>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-gray-100">
              <Image
                src="/images/nexus-logo.webp"
                alt="Nexus Logo"
                fill
                sizes="128px"
                priority
                className="object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold text-center">Bienvenido a Nexus Co-living</h2>
            <p className="text-gray-600 text-center mt-2">Sistema de gestión de cobros y gastos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Gestión de Cobros</h2>
              <div className="space-y-4">
                <Link
                  href="/payments/new"
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <CreditCard className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Registrar Nuevo Cobro</span>
                </Link>
                <Link
                  href="/payments/list"
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Receipt className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Ver Historial de Cobros</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Gestión de Gastos</h2>
              <div className="space-y-4">
                <Link
                  href="/expenses/new"
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <CreditCard className="h-5 w-5 mr-3 text-red-500" />
                  <span>Registrar Nuevo Gasto</span>
                </Link>
                <Link
                  href="/expenses/list"
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Receipt className="h-5 w-5 mr-3 text-red-500" />
                  <span>Ver Historial de Gastos</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Acceso Rápido a Reportes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Link
                href="/payments/list"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-blue-500"
              >
                <div className="flex flex-col items-center">
                  <Receipt className="h-10 w-10 mb-3 text-blue-500" />
                  <h3 className="font-medium text-lg">Ver Historial de Cobros</h3>
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Consulta todos los cobros registrados en el sistema
                  </p>
                </div>
              </Link>

              <Link
                href="/expenses/list"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-red-500"
              >
                <div className="flex flex-col items-center">
                  <Receipt className="h-10 w-10 mb-3 text-red-500" />
                  <h3 className="font-medium text-lg">Ver Historial de Gastos</h3>
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Consulta todos los gastos registrados en el sistema
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-blue-500"
              >
                <div className="flex flex-col items-center">
                  <BarChart4 className="h-10 w-10 mb-3 text-blue-500" />
                  <h3 className="font-medium text-lg">Dashboard Analítico</h3>
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Visualiza estadísticas y análisis de cobros y gastos
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
