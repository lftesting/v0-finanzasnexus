"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Supplier {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface ExpenseCategory {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Tribe {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Room {
  id: number
  room_number: string
  tribe_id: number
  created_at?: string
  updated_at?: string
}

export type DateFilter = {
  startDate?: string
  endDate?: string
  filterField?: "date" | "due_date" | "payment_date"
}

export type Expense = {
  id: number
  date: string
  due_date: string
  payment_date: string | null
  supplier_id: number
  category_id: number
  tribe_id?: number | null
  room_id?: number | null
  amount: number
  payment_method: string
  status: string
  invoice_number?: string
  description?: string
  document_url?: string
  document_id?: string
  document_urls?: string[]
  document_ids?: string[]
  created_at: string
  created_by: string | null
  updated_by: string | null
}

// Función para obtener todos los proveedores
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error al obtener proveedores:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener proveedores:", error)
    return []
  }
}

// Función para obtener todas las categorías de gastos
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("expense_categories").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error al obtener categorías de gastos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener categorías de gastos:", error)
    return []
  }
}

// Función para obtener todas las tribus
export async function getTribes(): Promise<Tribe[]> {
  try {
    console.log("Iniciando getTribes() - Versión depuración")
    const supabase = createServerSupabaseClient()

    console.log("Ejecutando consulta directa a la tabla tribes")
    const { data, error } = await supabase.from("tribes").select("*")

    if (error) {
      console.error("Error al obtener tribus:", error)
      return []
    }

    if (!data) {
      console.log("No se recibieron datos de la consulta")
      return []
    }

    console.log(`Se encontraron ${data.length} tribus:`, JSON.stringify(data))
    return data
  } catch (error) {
    console.error("Error inesperado al obtener tribus:", error)
    return []
  }
}

export async function getRooms() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("rooms").select("id, room_number, tribe_id").order("room_number")

    if (error) {
      console.error("Error al obtener habitaciones:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener habitaciones:", error)
    return []
  }
}

export async function getRoomsByTribe(tribeId: number) {
  try {
    if (!tribeId) {
      console.log("No se proporcionó ID de tribu")
      return []
    }

    console.log(`Iniciando getRoomsByTribe(${tribeId})`)
    const supabase = createServerSupabaseClient()

    console.log(`Ejecutando consulta a la tabla rooms con tribe_id=${tribeId}`)
    const { data, error } = await supabase
      .from("rooms")
      .select("id, room_number")
      .eq("tribe_id", tribeId)
      .order("room_number")

    if (error) {
      console.error(`Error al obtener habitaciones para tribu ${tribeId}:`, error)
      return []
    }

    console.log(`Se encontraron ${data?.length || 0} habitaciones para tribu ${tribeId}`)
    return data || []
  } catch (error) {
    console.error(`Error inesperado al obtener habitaciones para tribu ${tribeId}:`, error)
    return []
  }
}

// Función para crear un nuevo proveedor
export async function createSupplier(formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name || name.trim() === "") {
      return { success: false, error: "El nombre del proveedor es obligatorio" }
    }

    const supabase = createServerSupabaseClient()

    // Verificar si ya existe un proveedor con el mismo nombre
    const { data: existingSupplier } = await supabase
      .from("suppliers")
      .select("id")
      .ilike("name", name.trim())
      .maybeSingle()

    if (existingSupplier) {
      return {
        success: false,
        error: "Ya existe un proveedor con este nombre",
        supplierId: existingSupplier.id,
      }
    }

    // Crear el nuevo proveedor
    const { data, error } = await supabase
      .from("suppliers")
      .insert([{ name: name.trim() }])
      .select()
      .single()

    if (error) {
      console.error("Error al crear proveedor:", error)
      return { success: false, error: "Error al crear el proveedor" }
    }

    return { success: true, supplierId: data.id, name: data.name }
  } catch (error) {
    console.error("Error inesperado al crear proveedor:", error)
    return { success: false, error: "Error inesperado al crear el proveedor" }
  }
}

// Función para crear un nuevo gasto
export async function createExpense(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userEmail = user?.email || "sistema"

    // Extraer datos del formulario
    const supplierId = formData.get("supplierId") as string
    const categoryId = formData.get("categoryId") as string
    const tribeId = formData.get("tribeId") as string
    const roomId = formData.get("roomId") as string
    const invoiceNumber = formData.get("invoiceNumber") as string
    const amount = formData.get("amount") as string
    const status = formData.get("status") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const bankAccount = formData.get("bankAccount") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const dueDate = formData.get("dueDate") as string
    const paymentDate = formData.get("paymentDate") as string
    const documentCount = Number.parseInt(formData.get("documentCount") as string) || 0

    // Validar datos obligatorios
    if (!supplierId || !categoryId || !amount || !status || !paymentMethod || !date || !dueDate) {
      return { success: false, error: "Faltan campos obligatorios" }
    }

    // Preparar datos para insertar
    const expenseData: any = {
      supplier_id: Number.parseInt(supplierId),
      category_id: Number.parseInt(categoryId),
      amount: Number.parseFloat(amount),
      status,
      payment_method: paymentMethod,
      date,
      due_date: dueDate,
      created_by: userEmail,
      updated_by: userEmail,
    }

    // Agregar campos opcionales si existen
    if (tribeId && tribeId !== "none") expenseData.tribe_id = Number.parseInt(tribeId)
    if (roomId) expenseData.room_id = Number.parseInt(roomId)
    if (invoiceNumber) expenseData.invoice_number = invoiceNumber
    if (bankAccount) expenseData.bank_account = bankAccount
    if (description) expenseData.description = description
    if (paymentDate) expenseData.payment_date = paymentDate

    // Insertar el gasto en la base de datos
    const { data, error } = await supabase.from("expenses").insert([expenseData]).select().single()

    if (error) {
      console.error("Error al crear gasto:", error)
      return { success: false, error: "Error al registrar el gasto" }
    }

    // Si hay documentos adjuntos, procesarlos
    if (documentCount > 0) {
      const expenseId = data.id
      const documentUrls = []

      for (let i = 0; i < documentCount; i++) {
        const file = formData.get(`document_${i}`) as File
        if (!file) continue

        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${i}.${fileExt}`
        const filePath = `expenses/${expenseId}/${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage.from("documents").upload(filePath, file)

        if (uploadError) {
          console.error("Error al subir documento:", uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath)
        documentUrls.push(urlData.publicUrl)
      }

      // Actualizar el gasto con las URLs de los documentos
      if (documentUrls.length > 0) {
        const { error: updateError } = await supabase
          .from("expenses")
          .update({ document_urls: documentUrls })
          .eq("id", expenseId)

        if (updateError) {
          console.error("Error al actualizar gasto con documentos:", updateError)
        }
      }
    }

    revalidatePath("/expenses/list")
    return { success: true }
  } catch (error) {
    console.error("Error inesperado al crear gasto:", error)
    return { success: false, error: "Error inesperado al procesar la solicitud" }
  }
}

// Función para actualizar un gasto existente
export async function updateExpense(expenseId: number, formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userEmail = user?.email || "sistema"

    // Extraer datos del formulario
    const supplierId = formData.get("supplierId") as string
    const categoryId = formData.get("categoryId") as string
    const tribeId = formData.get("tribeId") as string
    const roomId = formData.get("roomId") as string
    const invoiceNumber = formData.get("invoiceNumber") as string
    const amount = formData.get("amount") as string
    const status = formData.get("status") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const bankAccount = formData.get("bankAccount") as string
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const dueDate = formData.get("dueDate") as string
    const paymentDate = formData.get("paymentDate") as string
    const documentsToRemove = formData.get("documentsToRemove") as string

    // Validar datos obligatorios
    if (!supplierId || !categoryId || !amount || !status || !paymentMethod || !date || !dueDate) {
      return { success: false, error: "Faltan campos obligatorios" }
    }

    // Obtener el gasto actual para comparar cambios
    const { data: currentExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .single()

    if (fetchError) {
      console.error("Error al obtener gasto actual:", fetchError)
      return { success: false, error: "Error al obtener el gasto actual" }
    }

    // Preparar datos para actualizar
    const expenseData: any = {
      supplier_id: Number.parseInt(supplierId),
      category_id: Number.parseInt(categoryId),
      amount: Number.parseFloat(amount),
      status,
      payment_method: paymentMethod,
      date,
      due_date: dueDate,
      updated_by: userEmail,
    }

    // Agregar campos opcionales si existen
    if (tribeId && tribeId !== "none") {
      expenseData.tribe_id = Number.parseInt(tribeId)
    } else {
      expenseData.tribe_id = null
    }

    if (roomId) {
      expenseData.room_id = Number.parseInt(roomId)
    } else {
      expenseData.room_id = null
    }

    if (invoiceNumber) {
      expenseData.invoice_number = invoiceNumber
    } else {
      expenseData.invoice_number = null
    }

    if (bankAccount) {
      expenseData.bank_account = bankAccount
    } else {
      expenseData.bank_account = null
    }

    if (description) {
      expenseData.description = description
    } else {
      expenseData.description = null
    }

    if (paymentDate) {
      expenseData.payment_date = paymentDate
    } else {
      expenseData.payment_date = null
    }

    // Procesar documentos a eliminar
    let documentUrls = currentExpense.document_urls || []
    if (documentsToRemove) {
      const indexesToRemove = JSON.parse(documentsToRemove) as number[]
      documentUrls = documentUrls.filter((_, index) => !indexesToRemove.includes(index))
    }

    // Procesar nuevos documentos
    const files = formData.getAll("documents") as File[]
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.name) continue // Skip if not a valid file

        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `expenses/${expenseId}/${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage.from("documents").upload(filePath, file)

        if (uploadError) {
          console.error("Error al subir documento:", uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath)
        documentUrls.push(urlData.publicUrl)
      }
    }

    // Actualizar el campo document_urls
    expenseData.document_urls = documentUrls

    // Actualizar el gasto en la base de datos
    const { data, error } = await supabase.from("expenses").update(expenseData).eq("id", expenseId).select().single()

    if (error) {
      console.error("Error al actualizar gasto:", error)
      return { success: false, error: "Error al actualizar el gasto" }
    }

    revalidatePath("/expenses/list")
    revalidatePath(`/expenses/${expenseId}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Error inesperado al actualizar gasto:", error)
    return { success: false, error: "Error inesperado al procesar la solicitud" }
  }
}

// Función para eliminar un gasto
export async function deleteExpense(expenseId: number) {
  try {
    const supabase = createServerSupabaseClient()

    // Eliminar el gasto
    const { error } = await supabase.from("expenses").delete().eq("id", expenseId)

    if (error) {
      console.error("Error al eliminar gasto:", error)
      return { success: false, error: "Error al eliminar el gasto" }
    }

    // También podríamos eliminar los archivos asociados en el storage
    // pero los mantendremos por ahora para tener un historial

    revalidatePath("/expenses/list")
    return { success: true }
  } catch (error) {
    console.error("Error inesperado al eliminar gasto:", error)
    return { success: false, error: "Error inesperado al procesar la solicitud" }
  }
}

export async function getExpenses(filters?: DateFilter) {
  try {
    const supabase = createServerSupabaseClient()

    // Iniciar la consulta base
    let query = supabase.from("expenses").select(`
        *,
        suppliers(name),
        expense_categories(name),
        tribes(name),
        rooms(room_number)
      `)

    // Aplicar filtros de fecha si existen
    if (filters) {
      const { startDate, endDate, filterField = "date" } = filters

      if (startDate) {
        query = query.gte(filterField, startDate)
      }

      if (endDate) {
        query = query.lte(filterField, endDate)
      }
    }

    // Ordenar por fecha de creación descendente
    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener los gastos:", error)
      throw new Error(`Error al obtener los gastos: ${error.message}`)
    }

    // Validate the data before returning it
    if (!data) {
      console.warn("No se encontraron datos de gastos")
      return []
    }

    // Log the first record for debugging (only in development)
    if (process.env.NODE_ENV === "development" && data.length > 0) {
      console.log("Primer registro de gastos:", JSON.stringify(data[0]).substring(0, 200) + "...")
    }

    return data
  } catch (error) {
    console.error("Error inesperado al obtener los gastos:", error)
    throw error
  }
}

export async function getExpensesSummary(filters?: DateFilter) {
  try {
    const supabase = createServerSupabaseClient()

    // Iniciar la consulta base
    let query = supabase.from("expenses").select(`
        amount,
        payment_method,
        status
      `)

    // Aplicar filtros de fecha si existen
    if (filters) {
      const { startDate, endDate, filterField = "date" } = filters

      if (startDate) {
        query = query.gte(filterField, startDate)
      }

      if (endDate) {
        query = query.lte(filterField, endDate)
      }
    }

    // Ejecutar la consulta
    const { data, error } = await query

    if (error) {
      console.error("Error al obtener el resumen de gastos:", error)
      throw new Error(`Error al obtener el resumen de gastos: ${error.message}`)
    }

    // Validate the data before processing
    if (!data) {
      console.warn("No se encontraron datos para el resumen de gastos")
      return {
        total: 0,
        count: 0,
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0,
        debito: 0,
        pendientes: 0,
        pagados: 0,
      }
    }

    // Calcular totales
    const total = data.reduce((sum, expense) => {
      const amount = Number(expense?.amount || 0)
      return isNaN(amount) ? sum : sum + amount
    }, 0)

    const efectivo = data
      .filter((expense) => expense?.payment_method === "efectivo")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    const tarjeta = data
      .filter((expense) => expense?.payment_method === "tarjeta_credito")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    const transferencia = data
      .filter((expense) => expense?.payment_method === "transferencia")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    const debito = data
      .filter((expense) => expense?.payment_method === "tarjeta_debito")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    // Calcular totales por estado
    const pendientes = data
      .filter((expense) => expense?.status === "pendiente")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    const pagados = data
      .filter((expense) => expense?.status === "pagado")
      .reduce((sum, expense) => {
        const amount = Number(expense?.amount || 0)
        return isNaN(amount) ? sum : sum + amount
      }, 0)

    return {
      total,
      count: data.length,
      efectivo,
      tarjeta,
      transferencia,
      debito,
      pendientes,
      pagados,
    }
  } catch (error) {
    console.error("Error inesperado al obtener el resumen de gastos:", error)
    // Return default values instead of throwing
    return {
      total: 0,
      count: 0,
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      debito: 0,
      pendientes: 0,
      pagados: 0,
    }
  }
}

export async function getExpenseById(id: number) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        suppliers(id, name),
        expense_categories(id, name),
        tribes(id, name),
        rooms(id, room_number)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error al obtener el gasto:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error inesperado al obtener el gasto:", error)
    return null
  }
}
