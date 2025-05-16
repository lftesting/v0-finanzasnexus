"use client"

import { useState } from "react"
import Image from "next/image"
import { NexusLogoSVG } from "./nexus-logo-svg"

interface NexusLogoProps {
  size?: number
}

export function NexusLogo({ size = 50 }: NexusLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [format, setFormat] = useState("webp")

  // Intentar diferentes formatos si uno falla
  const handleError = () => {
    if (format === "webp") {
      console.log("WebP format failed, trying PNG")
      setFormat("png")
    } else if (format === "png") {
      console.log("PNG format failed, trying JPG")
      setFormat("jpg")
    } else {
      console.log("All image formats failed, using SVG fallback")
      setImageError(true)
    }
  }

  if (imageError) {
    return <NexusLogoSVG size={size} />
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={`/images/nexus-logo.${format}`}
        alt="Nexus Logo"
        fill
        priority
        sizes={`${size}px`}
        className="object-cover rounded-full"
        onError={handleError}
      />
    </div>
  )
}
