import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { Schedule } from '../../data'
import { initialSchedules } from '../../data'

export interface ScheduleFilters {
  applicationId: string
  applicationName: string
  status: string
}

export interface ScheduleState {
  // Data
  schedules: Schedule[]
  filteredSchedules: Schedule[]
  selectedSchedule: Schedule | null
  
  // Filters
  filters: ScheduleFilters
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Actions
  setSchedules: (schedules: Schedule[]) => void
  setFilteredSchedules: (schedules: Schedule[]) => void
  setSelectedSchedule: (schedule: Schedule | null) => void
  setFilters: (filters: Partial<ScheduleFilters>) => void
  resetFilters: () => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // CRUD Operations
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void
  updateSchedule: (id: number, updates: Partial<Schedule>) => void
  deleteSchedule: (id: number) => void
  
  // Computed
  getTotalPages: () => number
  getCurrentPageSchedules: () => Schedule[]
}

const initialFilters: ScheduleFilters = {
  applicationId: '',
  applicationName: '',
  status: '',
}

export const useScheduleStore = create<ScheduleState>()(
  devtools(
    persist(
      (set, get) => ({
  // Initial state
  schedules: initialSchedules,
  filteredSchedules: initialSchedules,
  selectedSchedule: null,
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
  
  // Actions
  setSchedules: (schedules) => set({ schedules, filteredSchedules: schedules }),
  
  setFilteredSchedules: (filteredSchedules) => set({ filteredSchedules }),
  
  setSelectedSchedule: (selectedSchedule) => set({ selectedSchedule }),
  
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
  addSchedule: (newSchedule) => {
    const { schedules } = get()
    const id = Math.max(...schedules.map(s => s.id), 0) + 1
    const schedule: Schedule = { ...newSchedule, id }
    set((state) => ({
      schedules: [schedule, ...state.schedules],
      filteredSchedules: [schedule, ...state.filteredSchedules],
    }))
  },
  
  updateSchedule: (id, updates) => {
    set((state) => ({
      schedules: state.schedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
      filteredSchedules: state.filteredSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    }))
  },
  
  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter(schedule => schedule.id !== id),
      filteredSchedules: state.filteredSchedules.filter(schedule => schedule.id !== id),
    }))
  },
  
  // Computed
  getTotalPages: () => {
    const { filteredSchedules, itemsPerPage } = get()
    return Math.ceil(filteredSchedules.length / itemsPerPage)
  },
  
  getCurrentPageSchedules: () => {
    const { filteredSchedules, currentPage, itemsPerPage } = get()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSchedules.slice(startIndex, endIndex)
  },
}),
    {
      name: 'schedule-store',
      // Only persist data, not UI state
      partialize: (state) => ({
        schedules: state.schedules,
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  ),
    {
      name: 'ScheduleStore',
    }
  )
)
