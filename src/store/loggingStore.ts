import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { LogEntry } from '../data'

export interface LoggingFilters {
  process: string
  user: string
  module: string
  function: string
  status: string
  startDate: string
  endDate: string
}

export interface LoggingState {
  // Data
  logs: LogEntry[]
  filteredLogs: LogEntry[]
  selectedLog: LogEntry | null
  
  // Filters
  filters: LoggingFilters
  
  // Pagination
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
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
  
  // Actions
  setLogs: (logs) => set({ logs, filteredLogs: logs }),
  
  setFilteredLogs: (filteredLogs) => set({ filteredLogs }),
  
  setSelectedLog: (selectedLog) => set({ selectedLog }),
  
  setFilters: (newFilters) => 
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),
  
  resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, currentPage: 1 }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Computed
  getTotalPages: () => {
    const { filteredLogs, itemsPerPage } = get()
    return Math.ceil(filteredLogs.length / itemsPerPage)
  },
  
  getCurrentPageLogs: () => {
    const { filteredLogs, currentPage, itemsPerPage } = get()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLogs.slice(startIndex, endIndex)
  },
}),
    {
      name: 'logging-store',
      // Only persist filters and pagination, not logs (too large)
      partialize: (state) => ({
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  ),
    {
      name: 'LoggingStore',
    }
  )
)
