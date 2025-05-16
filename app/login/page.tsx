import { NexusLogoSVG } from "@/components/nexus-logo-svg"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-6">
        <NexusLogoSVG size={80} textSize="text-2xl" />
      </div>
      <LoginForm />
    </div>
  )
}
