"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export type DateFilter = {
  startDate?: string
  endDate?: string
  filterField?: "entry_date" | "estimated_payment_date" | "actual_payment_date"
}

export type Tribe = {
  id: number
  name: string
}

export type Room = {
  id: number
  room_number: string
}

// Modificar la función createPayment para incluir los nuevos campos
export async function createPayment(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual usando nuestra nueva función
  const currentUser = await getCurrentUser()
  const createdBy = currentUser?.username || "Sistema"

  console.log("Usuario para crear pago:", createdBy)

  // Extraer datos del formulario
  const entryDate = formData.get("entryDate") as string
  const estimatedPaymentDate = formData.get("estimatedPaymentDate") as string
  const actualPaymentDate = (formData.get("actualPaymentDate") as string) || null
  const tribeId = Number.parseInt(formData.get("tribeId") as string)
  const roomId = Number.parseInt(formData.get("roomId") as string)
  const amount = Number.parseFloat(formData.get("amount") as string)
  const rentAmount = Number.parseFloat(formData.get("rentAmount") as string)
  const servicesAmount = Number.parseFloat((formData.get("servicesAmount") as string) || "0")
  const paymentMethod = formData.get("paymentMethod") as string
  const comments = (formData.get("comments") as string) || null
  const bankAccount = (formData.get("bankAccount") as string) || null
  const documentCount = Number.parseInt((formData.get("documentCount") as string) || "0")

  // Manejar los archivos adjuntos si existen
  const documentUrls: string[] = []
  const documentIds: string[] = []

  if (documentCount > 0) {
    try {
      // Verificar si el bucket existe, si no, crearlo
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "payment-documents")

      if (!bucketExists) {
        await supabase.storage.createBucket("payment-documents", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })
      }

      // Procesar cada archivo
      for (let i = 0; i < documentCount; i++) {
        const documentFile = formData.get(`document_${i}`) as File

        if (documentFile && documentFile.size > 0) {
          // Generar un nombre único para el archivo
          const fileExt = documentFile.name.split(".").pop()
          const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`

          // Subir el archivo
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("payment-documents")
            .upload(fileName, documentFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error(`Error al subir el documento ${i}:`, uploadError)
            continue
          }

          // Guardar el ID del documento (que es el path en el bucket)
          documentIds.push(fileName)

          // Obtener la URL pública
          const { data: urlData } = supabase.storage.from("payment-documents").getPublicUrl(fileName)

          documentUrls.push(urlData.publicUrl)
        }
      }
    } catch (error) {
      console.error("Error en el proceso de carga de documentos:", error)
      return { success: false, error: `Error en el proceso de carga de documentos: ${error}` }
    }
  }

  // Insertar el pago en la base de datos
  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        entry_date: entryDate,
        estimated_payment_date: estimatedPaymentDate,
        actual_payment_date: actualPaymentDate,
        tribe_id: tribeId,
        room_id: roomId,
        amount,
        rent_amount: rentAmount,
        services_amount: servicesAmount,
        payment_method: paymentMethod,
        comments,
        bank_account: bankAccount,
        document_urls: documentUrls.length > 0 ? documentUrls : null,
        document_ids: documentIds.length > 0 ? documentIds : null,
        created_by: createdBy,
      },
    ])
    .select()

  if (error) {
    console.error("Error al crear el pago:", error)
    return { success: false, error: error.message }
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/")
  revalidatePath("/payments")

  return { success: true, data }
}

export async function getTribes(): Promise<Tribe[]> {
  try {
    const supabase = createServerSupabaseClient()
    console.log("Obteniendo tribus...")

    const { data, error } = await supabase.from("tribes").select("*").order("name")

    if (error) {
      console.error("Error al obtener las tribus:", error)
      return []
    }

    console.log(`Se encontraron ${data?.length || 0} tribus`)
    return data || []
  } catch (error) {
    console.error("Error en getTribes:", error)
    return []
  }
}

export async function getRoomsByTribe(tribeId: number): Promise<Room[]> {
  try {
    const supabase = createServerSupabaseClient()
    console.log(`Obteniendo habitaciones para la tribu ${tribeId}...`)

    const { data, error } = await supabase.from("rooms").select("*").eq("tribe_id", tribeId).order("room_number")

    if (error) {
      console.error("Error al obtener las habitaciones:", error)
      return []
    }

    console.log(`Se encontraron ${data?.length || 0} habitaciones para la tribu ${tribeId}`)
    return data || []
  } catch (error) {
    console.error("Error en getRoomsByTribe:", error)
    return []
  }
}

export async function getPayments(filters?: DateFilter) {
  try {
    console.log("Iniciando getPayments con filtros:", filters)
    const supabase = createServerSupabaseClient()
    console.log("Cliente Supabase creado correctamente")

    let query = supabase.from("payments").select(`
      *,
      tribes (
        name
      ),
      rooms (
        room_number
      )
    `)

    if (filters) {
      const { startDate, endDate, filterField } = filters
      if (startDate) {
        query = query.gte(filterField || "entry_date", startDate)
      }
      if (endDate) {
        query = query.lte(filterField || "entry_date", endDate)
      }
    }

    query = query.order("entry_date", { ascending: false })

    console.log("Ejecutando consulta de pagos...")
    const { data, error } = await query

    if (error) {
      console.error("Error al obtener pagos:", error)
      return []
    }

    console.log(`Se encontraron ${data?.length || 0} pagos`)
    return data || []
  } catch (error) {
    console.error("Error en getPayments:", error)
    return []
  }
}

export async function getPaymentsSummary(filters?: DateFilter) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase.from("payments").select(`
      amount,
      payment_method
    `)

    if (filters) {
      const { startDate, endDate, filterField } = filters
      if (startDate) {
        query = query.gte(filterField || "entry_date", startDate)
      }
      if (endDate) {
        query = query.lte(filterField || "entry_date", endDate)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al obtener resumen de pagos:", error)
      return {
        total: 0,
        count: 0,
        efectivo: 0,
        transferencia: 0,
      }
    }

    let total = 0
    let efectivo = 0
    let transferencia = 0

    data.forEach((payment) => {
      total += payment.amount
      if (payment.payment_method === "efectivo") {
        efectivo += payment.amount
      } else {
        transferencia += payment.amount
      }
    })

    return {
      total,
      count: data.length,
      efectivo,
      transferencia,
    }
  } catch (error) {
    console.error("Error en getPaymentsSummary:", error)
    return {
      total: 0,
      count: 0,
      efectivo: 0,
      transferencia: 0,
    }
  }
}

export async function getPaymentById(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        tribes (
          name
        ),
        rooms (
          room_number
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error al obtener pago por ID:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error en getPaymentById:", error)
    return null
  }
}

// Modificar la función updatePayment para incluir los nuevos campos
export async function updatePayment(id: number, formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "No se ha encontrado un usuario autenticado" }
    }

    // Extraer datos del formulario
    const tribeId = formData.get("tribeId") as string
    const roomId = formData.get("roomId") as string
    const amount = formData.get("amount") as string
    const rentAmount = formData.get("rentAmount") as string
    const servicesAmount = (formData.get("servicesAmount") as string) || "0"
    const paymentMethod = formData.get("paymentMethod") as string
    const comments = formData.get("comments") as string
    const entryDate = formData.get("entryDate") as string
    const estimatedPaymentDate = formData.get("estimatedPaymentDate") as string
    const actualPaymentDate = (formData.get("actualPaymentDate") as string) || null
    const bankAccount = (formData.get("bankAccount") as string) || null

    // Obtener información sobre documentos a eliminar
    const documentsToRemoveStr = formData.get("documentsToRemove") as string
    const documentsToRemove = documentsToRemoveStr ? JSON.parse(documentsToRemoveStr) : []

    // Obtener el pago actual para acceder a sus documentos
    const { data: currentPayment } = await supabase
      .from("payments")
      .select("document_urls, document_ids")
      .eq("id", id)
      .single()

    // Inicializar arrays para documentos
    let documentUrls: string[] = []
    let documentIds: string[] = []

    // Mantener documentos existentes que no se van a eliminar
    if (currentPayment?.document_urls && currentPayment?.document_ids) {
      documentUrls = [...currentPayment.document_urls]
      documentIds = [...currentPayment.document_ids]

      // Eliminar documentos marcados para eliminación
      documentsToRemove.forEach((index: number) => {
        if (index >= 0 && index < documentUrls.length) {
          documentUrls.splice(index, 1)
          documentIds.splice(index, 1)
        }
      })
    }

    // Procesar nuevos documentos
    const documents = formData.getAll("documents") as File[]

    if (documents && documents.length > 0) {
      for (const document of documents) {
        if (document.size > 0) {
          const fileExt = document.name.split(".").pop()
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
          const filePath = `payments/${id}/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePath, document)

          if (uploadError) {
            console.error("Error al subir el documento:", uploadError)
            continue
          }

          // Obtener URL pública
          const { data: publicUrlData } = await supabase.storage.from("documents").getPublicUrl(filePath)

          if (publicUrlData) {
            documentUrls.push(publicUrlData.publicUrl)
            documentIds.push(filePath)
          }
        }
      }
    }

    // Actualizar el pago en la base de datos
    const { data, error } = await supabase
      .from("payments")
      .update({
        tribe_id: Number.parseInt(tribeId),
        room_id: Number.parseInt(roomId),
        amount: Number.parseFloat(amount),
        rent_amount: Number.parseFloat(rentAmount),
        services_amount: Number.parseFloat(servicesAmount),
        payment_method: paymentMethod,
        comments: comments,
        entry_date: entryDate,
        estimated_payment_date: estimatedPaymentDate,
        actual_payment_date: actualPaymentDate,
        bank_account: bankAccount,
        document_urls: documentUrls,
        document_ids: documentIds,
        updated_by: user.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar el pago:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/payments")
    return { success: true, data }
  } catch (error) {
    console.error("Error en updatePayment:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function deletePayment(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("payments").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar pago:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/payments")
    return { success: true }
  } catch (error) {
    console.error("Error en deletePayment:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}
