// Proposed contracts only. The Phase 1 backend does not implement these routes.
// No UI calls these endpoints or treats a health response as business API availability.
import { api } from './api'
import type {
  Business,
  ListParams,
  Paginated,
  Product,
  Profile,
  Transaction,
} from '@/types/business'
export interface Credentials {
  email: string
  password: string
}
export interface AuthResponse {
  accessToken: string
  profile: Profile
}

export interface VoiceDraft {
  request_id: string
  interaction_id: string
  draft_id: string
  draft_status: string
  language: string
  transcript: string
  extracted_intent: string
  extracted_fields: Record<string, unknown>
  matched_product_id: string | null
  clarification_questions: string[]
  warnings: string[]
  confirmation_required: boolean
  explanation: string
  expires_at?: string
}

export interface ConfirmVoiceTransactionInput {
  draft_id: string
  transaction_type?: 'sale' | 'expense'
  description?: string
  product_id?: string
  quantity?: number | string
  unit_price?: number | string
  total_amount?: number | string
}

export const plannedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, Credentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<AuthResponse, Credentials & { fullName: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    getBusiness: builder.query<Business, void>({ query: () => '/business' }),
    updateBusiness: builder.mutation<Business, Business>({
      query: (body) => ({ url: '/business', method: 'PUT', body }),
    }),
    getProfile: builder.query<Profile, void>({ query: () => '/auth/me' }),
    updateProfile: builder.mutation<Profile, Profile>({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
    }),
    getTransactions: builder.query<Paginated<Transaction>, ListParams>({
      query: (params) => ({ url: '/transactions', params }),
    }),
    createTransaction: builder.mutation<Transaction, Omit<Transaction, 'id'>>({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
    }),
    processVoice: builder.mutation<VoiceDraft, FormData>({
      query: (body) => ({
        url: '/voice/process',
        method: 'POST',
        body,
      }),
    }),
    confirmVoiceTransaction: builder.mutation<Transaction, ConfirmVoiceTransactionInput>({
      query: (body) => ({
        url: '/transactions/confirm',
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    }),
    getProducts: builder.query<Paginated<Product>, { search?: string }>({
      query: (params) => ({ url: '/inventory/products', params }),
    }),
    createProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: (body) => ({ url: '/inventory/products', method: 'POST', body }),
    }),
    updateProduct: builder.mutation<Product, Product>({
      query: ({ id, ...body }) => ({
        url: `/inventory/products/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
      }),
    }),
    getReport: builder.query<{ sales: number; expenses: number; count: number }, ListParams>({
      query: (params) => ({ url: '/reports/summary', params }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetBusinessQuery,
  useUpdateBusinessMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useProcessVoiceMutation,
  useConfirmVoiceTransactionMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetReportQuery,
} = plannedApi
