import LoginForm from "@/components/login-form"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Building2 className="h-10 w-10 text-primary mr-2" />
          <h1 className="text-3xl font-bold">Nexus Co-living</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Sistema de Gestión Financiera</p>
      </div>
      <LoginForm />
    </main>
  )
}
