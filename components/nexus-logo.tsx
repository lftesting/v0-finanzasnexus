"use client"

import Image from "next/image"

interface NexusLogoProps {
  size?: number
}

export function NexusLogo({ size = 50 }: NexusLogoProps) {
  return (
    <Image
      src="/images/nexus-logo.webp"
      alt="Nexus Logo"
      width={size}
      height={size}
      priority
      className="object-cover rounded-full"
    />
  )
}
