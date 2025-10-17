import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { PicUser } from '../../data'
import { initialPicUsers } from '../../data'

export interface UarPicFilters {
  name: string
  division: string
}

export interface UarPicState {
  // Data
  pics: PicUser[]
  filteredPics: PicUser[]
  selectedPic: PicUser | null
  
  // Filters
  filters: UarPicFilters
  
  // Pagination
  currentPage: number
  itemsPerPage: number
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Actions
  setPics: (pics: PicUser[]) => void
  setFilteredPics: (pics: PicUser[]) => void
  setSelectedPic: (pic: PicUser | null) => void
  setFilters: (filters: Partial<UarPicFilters>) => void
  resetFilters: () => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // CRUD Operations
  addPic: (pic: Omit<PicUser, 'id'>) => void
  updatePic: (id: number, updates: Partial<PicUser>) => void
  deletePic: (id: number) => void
  
  // Computed
  getTotalPages: () => number
  getCurrentPagePics: () => PicUser[]
}

const initialFilters: UarPicFilters = {
  name: '',
  division: '',
}

export const useUarPicStore = create<UarPicState>()(
  devtools(
    persist(
      (set, get) => ({
  // Initial state
  pics: initialPicUsers,
  filteredPics: initialPicUsers,
  selectedPic: null,
  filters: initialFilters,
  currentPage: 1,
  itemsPerPage: 10,
  isLoading: false,
  error: null,
  
  // Actions
  setPics: (pics) => set({ pics, filteredPics: pics }),
  
  setFilteredPics: (filteredPics) => set({ filteredPics }),
  
  setSelectedPic: (selectedPic) => set({ selectedPic }),
  
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
  addPic: (newPic) => {
    const { pics } = get()
    const id = Math.max(...pics.map(p => p.id), 0) + 1
    const pic: PicUser = { ...newPic, id }
    set((state) => ({
      pics: [pic, ...state.pics],
      filteredPics: [pic, ...state.filteredPics],
    }))
  },
  
  updatePic: (id, updates) => {
    set((state) => ({
      pics: state.pics.map(pic =>
        pic.id === id ? { ...pic, ...updates } : pic
      ),
      filteredPics: state.filteredPics.map(pic =>
        pic.id === id ? { ...pic, ...updates } : pic
      ),
    }))
  },
  
  deletePic: (id) => {
    set((state) => ({
      pics: state.pics.filter(pic => pic.id !== id),
      filteredPics: state.filteredPics.filter(pic => pic.id !== id),
    }))
  },
  
  // Computed
  getTotalPages: () => {
    const { filteredPics, itemsPerPage } = get()
    return Math.ceil(filteredPics.length / itemsPerPage)
  },
  
  getCurrentPagePics: () => {
    const { filteredPics, currentPage, itemsPerPage } = get()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPics.slice(startIndex, endIndex)
  },
}),
    {
      name: 'uar-pic-store',
      // Only persist data, not UI state
      partialize: (state) => ({
        pics: state.pics,
        filters: state.filters,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  ),
    {
      name: 'UarPicStore',
    }
  )
)
