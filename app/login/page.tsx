import { NexusLogo } from "@/components/nexus-logo"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8">
        <NexusLogo size={100} />
      </div>
      <LoginForm />
    </div>
  )
}
