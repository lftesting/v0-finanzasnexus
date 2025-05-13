"use server"

import { createServerSupabaseClient, getCurrentUser } from "@/lib/server-utils"
import { revalidatePath } from "next/cache"

export type Supplier = {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
}

export type ExpenseCategory = {
  id: number
  name: string
  description?: string
}

export type Tribe = {
  id: number
  name: string
}

// Actualizar la definición del tipo Room para reflejar la estructura correcta
export type Room = {
  id: number
  room_number: string
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

export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name")

  if (error) {
    console.error("Error al obtener los proveedores:", error)
    return []
  }

  return data || []
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("expense_categories").select("*").order("name")

  if (error) {
    console.error("Error al obtener las categorías:", error)
    return []
  }

  return data || []
}

// Nueva función para obtener las tribus
export async function getTribes(): Promise<Tribe[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("tribes").select("*").order("name")

  if (error) {
    console.error("Error al obtener las tribus:", error)
    return []
  }

  return data || []
}

// Corregir la función getRooms para usar room_number en lugar de name
export async function getRooms(): Promise<Room[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("rooms").select("id, room_number").order("room_number")

  if (error) {
    console.error("Error al obtener las habitaciones:", error)
    return []
  }

  return data || []
}

// Modificar la función createExpense para incluir bank_account
export async function createExpense(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Obtener el usuario actual usando nuestra nueva función
  const currentUser = await getCurrentUser()
  const createdBy = currentUser?.username || "Sistema"

  console.log("Usuario para crear gasto:", createdBy)

  // Extraer datos del formulario
  const date = formData.get("date") as string
  const dueDate = formData.get("dueDate") as string
  const paymentDate = (formData.get("paymentDate") as string) || null
  const supplierId = Number.parseInt(formData.get("supplierId") as string)
  const categoryId = Number.parseInt(formData.get("categoryId") as string)
  const tribeId = formData.get("tribeId") ? Number.parseInt(formData.get("tribeId") as string) : null
  const roomId = formData.get("roomId") ? Number.parseInt(formData.get("roomId") as string) : null
  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentMethod = formData.get("paymentMethod") as string
  const status = formData.get("status") as string
  const invoiceNumber = (formData.get("invoiceNumber") as string) || null
  const description = (formData.get("description") as string) || null
  const bankAccount = (formData.get("bankAccount") as string) || null
  const documentCount = Number.parseInt((formData.get("documentCount") as string) || "0")

  // Manejar los archivos adjuntos si existen
  const documentUrls: string[] = []
  const documentIds: string[] = []

  if (documentCount > 0) {
    try {
      // Verificar si el bucket existe, si no, crearlo
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "expense-documents")

      if (!bucketExists) {
        await supabase.storage.createBucket("expense-documents", {
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
            .from("expense-documents")
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
          const { data: urlData } = supabase.storage.from("expense-documents").getPublicUrl(fileName)

          documentUrls.push(urlData.publicUrl)
        }
      }
    } catch (error) {
      console.error("Error en el proceso de carga de documentos:", error)
      return { success: false, error: `Error en el proceso de carga de documentos: ${error}` }
    }
  }

  // Insertar el gasto en la base de datos
  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        date,
        due_date: dueDate,
        payment_date: paymentDate,
        supplier_id: supplierId,
        category_id: categoryId,
        tribe_id: tribeId,
        room_id: roomId,
        amount,
        payment_method: paymentMethod,
        status,
        invoice_number: invoiceNumber,
        description,
        bank_account: bankAccount,
        document_urls: documentUrls.length > 0 ? documentUrls : null,
        document_ids: documentIds.length > 0 ? documentIds : null,
        created_by: createdBy,
      },
    ])
    .select()

  if (error) {
    console.error("Error al crear el gasto:", error)
    return { success: false, error: error.message }
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/expenses")
  revalidatePath("/expenses/list")

  return { success: true, data }
}

export async function getExpenses(filters?: DateFilter) {
  const supabase = createServerSupabaseClient()
  console.log("Obteniendo gastos con filtros:", filters)

  try {
    // Primero, obtener todos los gastos sin joins para asegurarnos de tener todos los registros
    let baseQuery = supabase.from("expenses").select("*")

    // Aplicar filtros de fecha si existen
    if (filters) {
      const { startDate, endDate, filterField = "date" } = filters

      if (startDate) {
        baseQuery = baseQuery.gte(filterField, startDate)
      }

      if (endDate) {
        baseQuery = baseQuery.lte(filterField, endDate)
      }
    }

    // Ordenar por fecha de creación descendente
    const { data: expensesData, error: expensesError } = await baseQuery.order("created_at", { ascending: false })

    if (expensesError) {
      console.error("Error al obtener los gastos:", expensesError)
      return []
    }

    if (!expensesData || expensesData.length === 0) {
      console.log("No se encontraron gastos con los filtros aplicados")
      return []
    }

    console.log(`Se encontraron ${expensesData.length} gastos en la consulta base`)

    // Obtener datos relacionados por separado
    const [suppliersData, categoriesData, tribesData, roomsData] = await Promise.all([
      supabase.from("suppliers").select("id, name"),
      supabase.from("expense_categories").select("id, name"),
      supabase.from("tribes").select("id, name"),
      supabase.from("rooms").select("id, room_number"),
    ])

    // Crear mapas para búsqueda rápida
    const suppliersMap = new Map(suppliersData.data?.map((s) => [s.id, s]) || [])
    const categoriesMap = new Map(categoriesData.data?.map((c) => [c.id, c]) || [])
    const tribesMap = new Map(tribesData.data?.map((t) => [t.id, t]) || [])
    const roomsMap = new Map(roomsData.data?.map((r) => [r.id, r]) || [])

    // Enriquecer los datos de gastos con la información relacionada
    const enrichedExpenses = expensesData.map((expense) => {
      const supplier = suppliersMap.get(expense.supplier_id)
      const category = categoriesMap.get(expense.category_id)
      const tribe = expense.tribe_id ? tribesMap.get(expense.tribe_id) : null
      const room = expense.room_id ? roomsMap.get(expense.room_id) : null

      return {
        ...expense,
        suppliers: supplier || { name: "Proveedor no encontrado" },
        expense_categories: category || { name: "Categoría no encontrada" },
        tribes: tribe || null,
        rooms: room || null,
      }
    })

    console.log(`Se procesaron ${enrichedExpenses.length} gastos con datos relacionados`)
    return enrichedExpenses
  } catch (error) {
    console.error("Error inesperado al obtener gastos:", error)
    return []
  }
}

export async function getExpensesSummary(filters?: DateFilter) {
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
  const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const efectivo = data
    .filter((expense) => expense.payment_method === "efectivo")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
  const tarjeta = data
    .filter((expense) => expense.payment_method === "tarjeta_credito")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
  const transferencia = data
    .filter((expense) => expense.payment_method === "transferencia")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
  const debito = data
    .filter((expense) => expense.payment_method === "tarjeta_debito")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

  // Calcular totales por estado
  const pendientes = data
    .filter((expense) => expense.status === "pendiente")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)
  const pagados = data
    .filter((expense) => expense.status === "pagado")
    .reduce((sum, expense) => sum + Number(expense.amount), 0)

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
}

export async function getExpenseById(id: number) {
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
}

// Modificar la función updateExpense para incluir bank_account
export async function updateExpense(id: number, formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "No se ha encontrado un usuario autenticado" }
    }

    // Extraer datos del formulario
    const supplierId = formData.get("supplierId") as string
    const categoryId = formData.get("categoryId") as string
    const tribeId = (formData.get("tribeId") as string) || null
    const roomId = (formData.get("roomId") as string) || null
    const amount = formData.get("amount") as string
    const status = formData.get("status") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const description = formData.get("description") as string
    const invoiceNumber = formData.get("invoiceNumber") as string
    const date = formData.get("date") as string
    const dueDate = formData.get("dueDate") as string
    const paymentDate = (formData.get("paymentDate") as string) || null
    const bankAccount = (formData.get("bankAccount") as string) || null

    // Obtener información sobre documentos a eliminar
    const documentsToRemoveStr = formData.get("documentsToRemove") as string
    const documentsToRemove = documentsToRemoveStr ? JSON.parse(documentsToRemoveStr) : []

    // Obtener el gasto actual para acceder a sus documentos
    const { data: currentExpense } = await supabase
      .from("expenses")
      .select("document_urls, document_ids")
      .eq("id", id)
      .single()

    // Inicializar arrays para documentos
    let documentUrls: string[] = []
    let documentIds: string[] = []

    // Mantener documentos existentes que no se van a eliminar
    if (currentExpense?.document_urls && currentExpense?.document_ids) {
      documentUrls = [...currentExpense.document_urls]
      documentIds = [...currentExpense.document_ids]

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
          const filePath = `expenses/${id}/${fileName}`

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

    // Actualizar el gasto en la base de datos
    const { data, error } = await supabase
      .from("expenses")
      .update({
        supplier_id: Number.parseInt(supplierId),
        category_id: Number.parseInt(categoryId),
        tribe_id: tribeId ? Number.parseInt(tribeId) : null,
        room_id: roomId ? Number.parseInt(roomId) : null,
        amount: Number.parseFloat(amount),
        status: status,
        payment_method: paymentMethod,
        description: description,
        invoice_number: invoiceNumber,
        date: date,
        due_date: dueDate,
        payment_date: paymentDate,
        bank_account: bankAccount,
        document_urls: documentUrls,
        document_ids: documentIds,
        updated_by: user.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar el gasto:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/expenses/list")
    return { success: true, data }
  } catch (error) {
    console.error("Error en updateExpense:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function createSupplier(supplierData: {
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
}) {
  try {
    console.log("Iniciando createSupplier con datos:", supplierData)

    const supabase = createServerSupabaseClient()

    // Validar que el nombre no esté vacío
    if (!supplierData.name || supplierData.name.trim() === "") {
      console.error("Error: El nombre del proveedor es obligatorio")
      return { success: false, error: "El nombre del proveedor es obligatorio" }
    }

    // Validar formato de email si se proporciona
    if (supplierData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
      console.error("Error: El formato del email no es válido")
      return { success: false, error: "El formato del email no es válido" }
    }

    // Verificar si ya existe un proveedor con el mismo nombre
    const { data: existingSupplier, error: checkError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("name", supplierData.name)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar proveedor existente:", checkError)
      return { success: false, error: "Error al verificar si el proveedor ya existe" }
    }

    if (existingSupplier) {
      console.error("Error: Ya existe un proveedor con este nombre")
      return { success: false, error: "Ya existe un proveedor con este nombre" }
    }

    // Preparar los datos para insertar - CORREGIDO: eliminado el campo created_by que no existe en la tabla
    const supplierToInsert = {
      name: supplierData.name,
      contact_person: supplierData.contact_person,
      phone: supplierData.phone,
      email: supplierData.email,
      created_at: new Date().toISOString(),
    }

    console.log("Datos a insertar:", supplierToInsert)

    // Insertar el proveedor en la base de datos
    const { data, error } = await supabase.from("suppliers").insert([supplierToInsert]).select()

    if (error) {
      console.error("Error al crear el proveedor:", error)
      return { success: false, error: error.message }
    }

    // Verificar que se hayan devuelto datos
    if (!data || data.length === 0) {
      console.error("No se recibieron datos después de insertar el proveedor")
      return { success: false, error: "Error al crear el proveedor: no se recibieron datos" }
    }

    console.log("Proveedor creado exitosamente:", data[0])

    // Revalidar rutas para actualizar los datos en la UI
    revalidatePath("/expenses/new")
    revalidatePath("/expenses/[id]/edit")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Error inesperado en createSupplier:", error)
    return { success: false, error: `Error inesperado: ${error}` }
  }
}

export async function deleteExpense(id: number) {
  const supabase = createServerSupabaseClient()

  // Primero, obtener el gasto para verificar si tiene un documento adjunto
  const { data: expense, error: fetchError } = await supabase
    .from("expenses")
    .select("document_url, document_id, document_urls, document_ids")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error al obtener el gasto para eliminar:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // Eliminar documentos múltiples si existen
  if (expense?.document_ids && Array.isArray(expense.document_ids) && expense.document_ids.length > 0) {
    try {
      const { error: deleteFilesError } = await supabase.storage.from("expense-documents").remove(expense.document_ids)

      if (deleteFilesError) {
        console.error("Error al eliminar los documentos adjuntos:", deleteFilesError)
      }
    } catch (error) {
      console.error("Error al procesar la eliminación de los documentos:", error)
    }
  }
  // Si hay un documento adjunto individual, intentar eliminarlo del storage
  else if (expense?.document_id) {
    try {
      // Eliminar el archivo del bucket usando el document_id
      const { error: deleteFileError } = await supabase.storage.from("expense-documents").remove([expense.document_id])

      if (deleteFileError) {
        console.error("Error al eliminar el documento adjunto:", deleteFileError)
      }
    } catch (error) {
      console.error("Error al procesar la eliminación del documento:", error)
    }
  }

  // Eliminar el gasto de la base de datos
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    console.error("Error al eliminar el gasto:", error)
    return { success: false, error: error.message }
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/expenses")
  revalidatePath("/expenses/list")

  return { success: true }
}
