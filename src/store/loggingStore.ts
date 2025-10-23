import { LogEntry } from '../../data'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { getLogMonitoringApi } from '../api/log_monitoring'
import { LogMonitoring } from '../types/log_montoring'

export interface LoggingFilters {
  process: string
  user: string
  module: string
  function: string
  status: string
  startDate: string
  endDate: string
}

export type LogMonitoringQuery = {
  page?: number
  limit?: number
  status?: LogEntry['STATUS']
  module?: string
  userId?: string
  q?: string
  startDate?: string // format: dd-MM-yyyy HH:mm:ss
  endDate?: string   // format: dd-MM-yyyy HH:mm:ss
  sortBy?: 'NO' | 'START_DATE' | 'END_DATE'
  order?: 'asc' | 'desc'
}

type ApiMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LoggingState {
  // Data
  logs: LogEntry[]
  filteredLogs: LogEntry[]          // diset = logs untuk kompatibilitas komponen lama
  selectedLog: LogEntry | null

  // Meta dari server
  meta: ApiMeta | null

  // Filters
  filters: LoggingFilters

  // Pagination (kendali FE yang dikirim ke API)
  currentPage: number
  itemsPerPage: number

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  setLogs: (logs: LogEntry[]) => void
  setFilteredLogs: (logs: LogEntry[]) => void
  setSelectedLog: (log: LogEntry | null) => void
  setFilters: (filters: Partial<LoggingFilters>) => void
  resetFilters: () => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // CRUD (server-side)
  // getLogMonitoring: (params?: {
  //   page?: number
  //   limit?: number
  //   input?: string
  //   module?: string
  //   function?: string
  //   status?: string
  //   startDate?: string
  //   endDate?: string
  // }) => Promise<void>
  getLogMonitoring: (params?: LogMonitoringQuery) => Promise<void>


  // Computed
  getTotalPages: () => number
  getCurrentPageLogs: () => LogEntry[]
}

const initialFilters: LoggingFilters = {
  process: '',
  user: '',
  module: '',
  function: '',
  status: '',
  startDate: '',
  endDate: '',
}

export const useLoggingStore = create<LoggingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        logs: [],
        filteredLogs: [],
        selectedLog: null,

        meta: null,

        filters: initialFilters,
        currentPage: 1,
        itemsPerPage: 10,

        isLoading: false,
        error: null,

        // 🔥 Server-side fetch — semua dari API
        getLogMonitoring: async (params) => {
          const state = get();
          const page = params?.page ?? state.currentPage;
          const limit = params?.limit ?? state.itemsPerPage;

          // kirim apa adanya sesuai BE + set page/limit
          const query: LogMonitoringQuery = { ...params, page, limit };

          set({ isLoading: true, error: null });
          try {
            const res = await getLogMonitoringApi(query);
            const { data: raw, meta: metaFromApi } = res as { data: LogMonitoring[]; meta?: ApiMeta };

            const logs: LogEntry[] = (raw ?? []).map((item) => ({
              NO: item.NO,
              PROCESS_ID: item.PROCESS_ID,
              USER_ID: item.USER_ID,
              MODULE: item.MODULE,
              FUNCTION_NAME: item.FUNCTION_NAME,
              START_DATE: item.START_DATE,
              END_DATE: item.END_DATE,
              STATUS: item.STATUS,
              DETAILS: item.DETAILS,
            }));

            set({
              logs,
              filteredLogs: logs,
              meta: metaFromApi ?? { page, limit, total: logs.length, totalPages: 1 },
              isLoading: false,
              currentPage: metaFromApi?.page ?? page,
              itemsPerPage: metaFromApi?.limit ?? limit,
            });
          } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
          }
        },


        // Actions
        setLogs: (logs) => set({ logs, filteredLogs: logs }),
        setFilteredLogs: (filteredLogs) => set({ filteredLogs }),
        setSelectedLog: (selectedLog) => set({ selectedLog }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            currentPage: 1, // reset halaman saat filter berubah
          })),

        resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),

        setCurrentPage: (currentPage) => set({ currentPage }),
        setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),

        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // Computed ikut meta dari server
        getTotalPages: () => {
          const { meta } = get()
          return meta?.totalPages ?? 1
        },

        // Server-side paging → tidak slice
        getCurrentPageLogs: () => {
          const { logs } = get()
          return logs
        },
      }),
      {
        name: 'logging-store',
        // Persist hanya filter & pagination (jangan logs)
        partialize: (state) => ({
          filters: state.filters,
          currentPage: state.currentPage,
          itemsPerPage: state.itemsPerPage,
        }),
      }
    ),
    { name: 'LoggingStore' }
  )
)
