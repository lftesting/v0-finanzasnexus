import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface BackToHomeButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function BackToHomeButton({ className, variant = "outline" }: BackToHomeButtonProps) {
  return (
    <Link href="/">
      <Button variant={variant} className={className}>
        <Home className="mr-2 h-4 w-4" />
        Volver a Inicio
      </Button>
    </Link>
  )
}
