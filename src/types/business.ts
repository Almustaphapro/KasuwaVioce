export type TransactionKind = 'sale' | 'expense'
export type ProductUnit = 'bag' | 'carton' | 'crate' | 'piece' | 'bottle' | 'kg'
export interface Product {
  id: string
  name: string
  unit: ProductUnit
  stock: number
  unitPrice: number
  lowStockAt: number
}
export interface Transaction {
  id: string
  type: TransactionKind
  description: string
  amount: number
  date: string
  productId?: string
  quantity?: number
  source: 'manual' | 'voice' | 'fixture'
}
export interface Profile {
  fullName: string
  email: string
}
export interface Business {
  name: string
  type: string
  language: 'ha'
}
export interface NotificationPreferences {
  lowStock: boolean
  dailySummary: boolean
}
export interface Paginated<T> {
  items: T[]
  total: number
}
export interface ListParams {
  search?: string
  from?: string
  to?: string
}
