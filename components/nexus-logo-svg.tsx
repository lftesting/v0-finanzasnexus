"use client"

interface NexusLogoSVGProps {
  size?: number
  className?: string
  showText?: boolean
  textSize?: string
}

export function NexusLogoSVG({ size = 50, className = "", showText = true, textSize = "text-xl" }: NexusLogoSVGProps) {
  return (
    <div className="flex flex-col items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-blue-600 ${className}`}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>

      {showText && <div className={`mt-2 font-semibold ${textSize} text-gray-800`}>Nexus Co-Living</div>}
    </div>
  )
}
