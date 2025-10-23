import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { Application } from '../../data'
import { initialApplications } from '../../data'

interface ApplicationState {
  applications: Application[]
  searchTerm: string
  currentPage: number
  itemsPerPage: number
  isModalOpen: boolean
  editingApplication: Application | null
  isStatusConfirmationOpen: boolean
  pendingStatusApplication: Application | null
  setApplications: (apps: Application[]) => void
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  addApplication: (app: Application) => void
  updateApplication: (app: Application) => void
  setBulkApplications: (apps: Application[]) => void
  openAddModal: () => void
  openEditModal: (app: Application) => void
  closeModal: () => void
  openStatusConfirmation: (app: Application) => void
  closeStatusConfirmation: () => void
}

export type { ApplicationState }

export const useApplicationStore = create<ApplicationState>()(
  devtools(
    persist(
      (set) => ({
      applications: initialApplications,
      searchTerm: '',
      currentPage: 1,
      itemsPerPage: 10,
      isModalOpen: false,
      editingApplication: null,
      isStatusConfirmationOpen: false,
      pendingStatusApplication: null,
      setApplications: (apps) => set({ applications: apps }),
      setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (size) => set({ itemsPerPage: size, currentPage: 1 }),
      addApplication: (app) =>
        set((state) => ({ applications: [app, ...state.applications], isModalOpen: false })),
      updateApplication: (updatedApp) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.ID === updatedApp.ID ? updatedApp : app
          ),
          isModalOpen: false,
          editingApplication: null,
        })),
      setBulkApplications: (apps) => set({ applications: apps }),
      openAddModal: () => set({ isModalOpen: true, editingApplication: null }),
      openEditModal: (app) => set({ isModalOpen: true, editingApplication: app }),
      closeModal: () => set({ isModalOpen: false, editingApplication: null }),
      openStatusConfirmation: (app) => set({ isStatusConfirmationOpen: true, pendingStatusApplication: app }),
      closeStatusConfirmation: () => set({ isStatusConfirmationOpen: false, pendingStatusApplication: null }),
    }),
    {
      name: 'application-store',
      // Only persist data, not UI state
      partialize: (state) => ({
        applications: state.applications,
        searchTerm: state.searchTerm,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  ),
    {
      name: 'ApplicationStore',
    }
  )
)
