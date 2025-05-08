import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FeatureBoxProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  buttonText: string
  className?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function FeatureBox({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
  className = "",
  buttonVariant = "default",
}: FeatureBoxProps) {
  return (
    <div
      className={`flex flex-col items-center justify-between p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-4 rounded-full mb-4">
          <Icon className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      <Link href={href} className="w-full">
        <Button variant={buttonVariant} className="w-full">
          {buttonText}
        </Button>
      </Link>
    </div>
  )
}
