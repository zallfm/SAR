import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { SystemMasterRecord } from '../../data'
import { initialSystemMasterData } from '../../data'

export interface SystemMasterFilters {
  systemType: string
  systemCode: string
}

export interface SystemMasterState {
  // Data
  systemMasterRecords: SystemMasterRecord[]
  filteredRecords: SystemMasterRecord[]
  selectedRecord: SystemMasterRecord | null
  
  // Filters
  filters: SystemMasterFilters
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Actions
  setSystemMasterRecords: (records: SystemMasterRecord[]) => void
  setFilteredRecords: (records: SystemMasterRecord[]) => void
  setSelectedRecord: (record: SystemMasterRecord | null) => void
  setFilters: (filters: Partial<SystemMasterFilters>) => void
  resetFilters: () => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // CRUD Operations
  addSystemMasterRecord: (record: Omit<SystemMasterRecord, 'id'>) => void
  updateSystemMasterRecord: (id: number, updates: Partial<SystemMasterRecord>) => void
  deleteSystemMasterRecord: (id: number) => void
  
  // Computed
  getTotalPages: () => number
  getCurrentPageRecords: () => SystemMasterRecord[]
}

const initialFilters: SystemMasterFilters = {
  systemType: '',
  systemCode: '',
}

export const useSystemMasterStore = create<SystemMasterState>()(
  devtools(
    persist(
      (set, get) => ({
  // Initial state
  systemMasterRecords: initialSystemMasterData,
  filteredRecords: initialSystemMasterData,
  selectedRecord: null,
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
  
  // Actions
  setSystemMasterRecords: (systemMasterRecords) => set({ systemMasterRecords, filteredRecords: systemMasterRecords }),
  
  setFilteredRecords: (filteredRecords) => set({ filteredRecords }),
  
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
  
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
  
  // CRUD Operations
  addSystemMasterRecord: (newRecord) => {
    const { systemMasterRecords } = get()
    const id = Math.max(...systemMasterRecords.map(r => r.id), 0) + 1
    const record: SystemMasterRecord = { ...newRecord, id }
    set((state) => ({
      systemMasterRecords: [record, ...state.systemMasterRecords],
      filteredRecords: [record, ...state.filteredRecords],
    }))
  },
  
  updateSystemMasterRecord: (id, updates) => {
    set((state) => ({
      systemMasterRecords: state.systemMasterRecords.map(record =>
        record.id === id ? { ...record, ...updates } : record
      ),
      filteredRecords: state.filteredRecords.map(record =>
        record.id === id ? { ...record, ...updates } : record
      ),
    }))
  },
  
  deleteSystemMasterRecord: (id) => {
    set((state) => ({
      systemMasterRecords: state.systemMasterRecords.filter(record => record.id !== id),
      filteredRecords: state.filteredRecords.filter(record => record.id !== id),
    }))
  },
  
  // Computed
  getTotalPages: () => {
    const { filteredRecords, itemsPerPage } = get()
    return Math.ceil(filteredRecords.length / itemsPerPage)
  },
  
  getCurrentPageRecords: () => {
    const { filteredRecords, currentPage, itemsPerPage } = get()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredRecords.slice(startIndex, endIndex)
  },
}),
    {
      name: 'system-master-store',
      // Only persist data, not UI state
      partialize: (state) => ({
        systemMasterRecords: state.systemMasterRecords,
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  ),
    {
      name: 'SystemMasterStore',
    }
  )
)
