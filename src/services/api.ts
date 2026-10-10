import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/lib/env'
import type { HealthResponse } from '@/types/api'
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: env.apiBaseUrl, timeout: 10000 }),
  endpoints: (builder) => ({
    health: builder.query<HealthResponse, void>({ query: () => '/health' }),
  }),
})
export const { useHealthQuery } = api
