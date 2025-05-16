"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format, isToday, isYesterday, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"

interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  created_at: string
  read: boolean
  link?: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchNotifications()

    // Suscribirse a nuevas notificaciones
    const channel = supabase
      .channel("notifications_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
          setUnreadCount((count) => count + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // En un entorno real, esto obtendría notificaciones de la base de datos
      // Aquí simulamos algunas notificaciones para demostración
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Pago pendiente",
          message: "Hay un pago pendiente para la habitación R3 que vence mañana",
          type: "warning",
          created_at: new Date().toISOString(),
          read: false,
          link: "/payments/list",
        },
        {
          id: 2,
          title: "Nuevo gasto registrado",
          message: "Se ha registrado un nuevo gasto de servicios por $1,500",
          type: "info",
          created_at: new Date(Date.now() - 86400000).toISOString(), // Ayer
          read: true,
          link: "/expenses/list",
        },
        {
          id: 3,
          title: "Habitación disponible",
          message: "La habitación H2 estará disponible a partir de mañana",
          type: "success",
          created_at: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          read: false,
          link: "/rooms",
        },
      ]

      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    // En un entorno real, esto actualizaría la base de datos
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    // En un entorno real, esto actualizaría la base de datos
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return `Hoy, ${format(date, "HH:mm", { locale: es })}`
    } else if (isYesterday(date)) {
      return `Ayer, ${format(date, "HH:mm", { locale: es })}`
    } else if (differenceInDays(new Date(), date) < 7) {
      return format(date, "EEEE, HH:mm", { locale: es })
    } else {
      return format(date, "dd/MM/yyyy, HH:mm", { locale: es })
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-100 border-amber-300 text-amber-800"
      case "success":
        return "bg-green-100 border-green-300 text-green-800"
      case "error":
        return "bg-red-100 border-red-300 text-red-800"
      default:
        return "bg-blue-100 border-blue-300 text-blue-800"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Cargando notificaciones...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No hay notificaciones</div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`m-2 border ${notification.read ? "bg-white" : "bg-gray-50"} ${getTypeStyles(notification.type)}`}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <span className="sr-only">Marcar como leída</span>
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      </Button>
                    )}
                  </div>
                  {notification.link && (
                    <div className="mt-2">
                      <a
                        href={notification.link}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Ver detalles
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
