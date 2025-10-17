import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UarProgressData, UarProgressFilters, UarProgressResponse } from '../services/uarProgressService'
import { uarDivisionProgress, uarDepartmentProgress, uarSystemProgressData } from '../../data'

interface UarProgressState {
  // Data
  progressData: UarProgressResponse | null
  filteredData: UarProgressResponse | null
  
  // Filters
  filters: UarProgressFilters
  
  // UI State
  selectedPeriod: string
  selectedDivisionFilter: string
  selectedDepartmentFilter: string
  selectedSystemFilter: string
  drilldownDivision: string | null
  
  // Loading & Error States
  loading: boolean
  error: string | null
  isRefreshing: boolean
  
  // Actions
  setProgressData: (data: UarProgressResponse | null) => void
  setFilteredData: (data: UarProgressResponse | null) => void
  setFilters: (filters: UarProgressFilters) => void
  resetFilters: () => void
  setSelectedPeriod: (period: string) => void
  setSelectedDivisionFilter: (division: string) => void
  setSelectedDepartmentFilter: (department: string) => void
  setSelectedSystemFilter: (system: string) => void
  setDrilldownDivision: (division: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setIsRefreshing: (refreshing: boolean) => void
  
  // Computed getters
  getDivisionOptions: () => string[]
  getDepartmentOptions: () => string[]
  getSystemOptions: () => string[]
  getDepartmentChartData: () => UarProgressData[]
  getSystemChartData: () => UarProgressData[]
  getGrandTotal: () => { review: number; approved: number; soApproved: number; completed: number }
}

const initialFilters: UarProgressFilters = {
  period: '07-2025',
}

export const useUarProgressStore = create<UarProgressState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        progressData: null,
        filteredData: null,
        filters: initialFilters,
        selectedPeriod: '07-2025',
        selectedDivisionFilter: '',
        selectedDepartmentFilter: '',
        selectedSystemFilter: '',
        drilldownDivision: null,
        loading: false,
        error: null,
        isRefreshing: false,

        // Actions
        setProgressData: (data) => set({ progressData: data }, false, 'setProgressData'),
        setFilteredData: (data) => set({ filteredData: data }, false, 'setFilteredData'),
        setFilters: (filters) => set({ filters }, false, 'setFilters'),
        resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),
        setSelectedPeriod: (period) => set({ selectedPeriod: period }, false, 'setSelectedPeriod'),
        setSelectedDivisionFilter: (division) => set({ selectedDivisionFilter: division }, false, 'setSelectedDivisionFilter'),
        setSelectedDepartmentFilter: (department) => set({ selectedDepartmentFilter: department }, false, 'setSelectedDepartmentFilter'),
        setSelectedSystemFilter: (system) => set({ selectedSystemFilter: system }, false, 'setSelectedSystemFilter'),
        setDrilldownDivision: (division) => set({ drilldownDivision: division }, false, 'setDrilldownDivision'),
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }, false, 'setIsRefreshing'),

        // Computed getters
        getDivisionOptions: () => {
          const { progressData } = get()
          if (!progressData?.divisions) {
            // Fallback to static data - memoize this result
            return [...new Set(uarDivisionProgress.map(d => d.label))]
          }
          return [...new Set(progressData.divisions.map(d => d.label))]
        },

        getDivisionChartData: () => {
          const { progressData } = get()
          if (!progressData?.divisions) {
            // Fallback to static data - return reference to avoid recreation
            return uarDivisionProgress
          }
          return progressData.divisions
        },

        getDepartmentOptions: () => {
          const { progressData, selectedDivisionFilter } = get()
          if (!progressData?.departments) {
            // Fallback to static data
            const relevantDepartments = selectedDivisionFilter 
              ? uarDepartmentProgress.filter(d => d.division === selectedDivisionFilter)
              : uarDepartmentProgress
            return [...new Set(relevantDepartments.map(d => d.label))]
          }
          
          const relevantDepartments = selectedDivisionFilter 
            ? progressData.departments[selectedDivisionFilter] || []
            : Object.values(progressData.departments).flat()
          
          return [...new Set(relevantDepartments.map(d => d.label))]
        },

        getSystemOptions: () => {
          const { progressData, selectedDivisionFilter, selectedDepartmentFilter } = get()
          if (!progressData?.systemApps) {
            // Fallback to static data
            let relevantSystems = uarSystemProgressData
            if (selectedDivisionFilter) {
              relevantSystems = relevantSystems.filter(d => d.division === selectedDivisionFilter)
            }
            if (selectedDepartmentFilter) {
              relevantSystems = relevantSystems.filter(d => d.department === selectedDepartmentFilter)
            }
            return [...new Set(relevantSystems.map(d => d.label))]
          }
          
          let relevantSystems = progressData.systemApps
          if (selectedDivisionFilter) {
            relevantSystems = relevantSystems.filter(d => d.label.includes(selectedDivisionFilter))
          }
          if (selectedDepartmentFilter) {
            relevantSystems = relevantSystems.filter(d => d.label.includes(selectedDepartmentFilter))
          }
          
          return [...new Set(relevantSystems.map(d => d.label))]
        },

        getDepartmentChartData: () => {
          const { progressData, drilldownDivision } = get()
          if (!drilldownDivision) return []
          
          if (!progressData?.departments) {
            // Fallback to static data
            return uarDepartmentProgress.filter(d => d.division === drilldownDivision)
          }
          
          return progressData.departments[drilldownDivision] || []
        },

        getSystemChartData: () => {
          const { progressData, selectedDivisionFilter, selectedDepartmentFilter } = get()
          if (!progressData?.systemApps) {
            // Fallback to static data
            let relevantSystems = uarSystemProgressData
            if (selectedDivisionFilter) {
              relevantSystems = relevantSystems.filter(d => d.division === selectedDivisionFilter)
            }
            if (selectedDepartmentFilter) {
              relevantSystems = relevantSystems.filter(d => d.department === selectedDepartmentFilter)
            }
            return relevantSystems
          }
          
          let relevantSystems = progressData.systemApps
          if (selectedDivisionFilter) {
            relevantSystems = relevantSystems.filter(d => d.label.includes(selectedDivisionFilter))
          }
          if (selectedDepartmentFilter) {
            relevantSystems = relevantSystems.filter(d => d.label.includes(selectedDepartmentFilter))
          }
          
          return relevantSystems
        },

        getGrandTotal: () => {
          const { progressData } = get()
          if (!progressData?.grandTotal) {
            // Fallback to static data calculation
            const allDivisionData = uarDivisionProgress
            const allDepartmentData = Object.values(uarDepartmentProgress).flat()
            const allSystemData = uarSystemProgressData
            
            const totalReview = [...allDivisionData, ...allDepartmentData, ...allSystemData]
              .reduce((sum, item) => sum + item.review, 0)
            const totalApproved = [...allDivisionData, ...allDepartmentData, ...allSystemData]
              .reduce((sum, item) => sum + item.approved, 0)
            const totalSoApproved = [...allDivisionData, ...allDepartmentData, ...allSystemData]
              .reduce((sum, item) => sum + item.soApproved, 0)
            const totalCompleted = [...allDivisionData, ...allDepartmentData, ...allSystemData]
              .reduce((sum, item) => sum + item.total, 0)
            
            const totalItems = allDivisionData.length + allDepartmentData.length + allSystemData.length
            
            return {
              review: totalItems > 0 ? Math.round(totalReview / totalItems) : 0,
              approved: totalItems > 0 ? Math.round(totalApproved / totalItems) : 0,
              soApproved: totalItems > 0 ? Math.round(totalSoApproved / totalItems) : 0,
              completed: totalItems > 0 ? Math.round(totalCompleted / totalItems) : 0,
            }
          }
          return progressData.grandTotal
        },
      }),
      {
        name: 'uar-progress-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedPeriod: state.selectedPeriod,
          selectedDivisionFilter: state.selectedDivisionFilter,
          selectedDepartmentFilter: state.selectedDepartmentFilter,
          selectedSystemFilter: state.selectedSystemFilter,
        }),
      }
    ),
    {
      name: 'uar-progress-store',
    }
  )
)
