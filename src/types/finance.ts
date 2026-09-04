export type Transaction = {
  id: number
  firebase_uid: string
  transaction: string
  category: string
  amount: number
  date: string
  type: string
  method: string
  status: string
  created_at?: string
}

export type TransactionInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">
export type TransactionUpdateInput = Omit<Transaction, "id" | "firebase_uid" | "created_at">

export type Budget = {
  id: string
  firebase_uid: string
  category: string
  amount: number
  spent: number
  month: string
  duration: string
  created_at?: string
}

export type BudgetInput = {
  category: string
  amount: number
  duration: string
}

export type BudgetUpdateInput = {
  category: string
  amount: number
  duration: string
}
