import { redirect } from "next/navigation"

export default function ExpensesRedirectPage() {
  redirect("/expenses/list")
  return null
}
