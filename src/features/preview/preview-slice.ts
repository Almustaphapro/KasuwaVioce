import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Business,
  NotificationPreferences,
  Product,
  Profile,
  Transaction,
} from '@/types/business'
import { createFixtures } from './fixtures'
interface PreviewState {
  enabled: boolean
  profile: Profile
  business: Business
  notifications: NotificationPreferences
  products: Product[]
  transactions: Transaction[]
}
const initialState: PreviewState = {
  enabled: false,
  profile: { fullName: '', email: '' },
  business: { name: '', type: '', language: 'ha' },
  notifications: { lowStock: false, dailySummary: false },
  products: [],
  transactions: [],
}
const slice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    startPreview: (_state, action: PayloadAction<{ sampleData: boolean; profile?: Profile }>) => ({
      ...initialState,
      enabled: true,
      profile: action.payload.profile ?? { fullName: 'Amina Yusuf', email: 'amina@example.com' },
      business: {
        name: action.payload.sampleData ? 'Amina General Store' : '',
        type: 'General retail',
        language: 'ha' as const,
      },
      ...(action.payload.sampleData ? createFixtures() : {}),
    }),
    exitPreview: () => initialState,
    saveProfile: (state, action: PayloadAction<Profile>) => {
      if (state.enabled) state.profile = action.payload
    },
    saveBusiness: (state, action: PayloadAction<Business>) => {
      if (state.enabled) state.business = action.payload
    },
    saveNotifications: (state, action: PayloadAction<NotificationPreferences>) => {
      if (state.enabled) state.notifications = action.payload
    },
    saveProduct: (state, action: PayloadAction<Product>) => {
      if (!state.enabled) return
      const index = state.products.findIndex((product) => product.id === action.payload.id)
      if (index < 0) state.products.push(action.payload)
      else state.products[index] = action.payload
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      if (state.enabled && !state.transactions.some((item) => item.id === action.payload.id))
        state.transactions.unshift(action.payload)
    },
  },
})
export const {
  startPreview,
  exitPreview,
  saveProfile,
  saveBusiness,
  saveNotifications,
  saveProduct,
  addTransaction,
} = slice.actions
export const previewReducer = slice.reducer
