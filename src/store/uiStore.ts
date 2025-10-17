import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export type ActiveView =
  | 'dashboard'
  | 'application'
  | 'uar_progress'
  | 'uar_division_user'
  | 'uar_division_user_detail'
  | 'uar_system_owner'
  | 'uar_system_owner_detail'
  | 'uar_latest_role'
  | 'uar_pic'
  | 'schedule'
  | 'system_master'
  | 'logging_monitoring'
  | 'logging_monitoring_detail'

export type ModalState = {
  addApplication: boolean
  editApplication: boolean
  statusConfirmation: boolean
}

export interface UIState {
  activeView: ActiveView
  sidebarOpen: boolean
  modals: ModalState
  setActiveView: (view: ActiveView) => void
  resetActiveView: () => void
  toggleSidebar: () => void
  openModal: (modal: keyof ModalState) => void
  closeModal: (modal: keyof ModalState) => void
  resetModals: () => void
}

const initialModals: ModalState = {
  addApplication: false,
  editApplication: false,
  statusConfirmation: false,
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
      activeView: 'dashboard',
      sidebarOpen: true,
      modals: initialModals,
      setActiveView: (view) => set({ activeView: view }),
      resetActiveView: () => set({ activeView: 'dashboard' }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      openModal: (modal) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: true,
          },
        })),
      closeModal: (modal) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: false,
          },
        })),
      resetModals: () => set({ modals: initialModals }),
    }),
    {
      name: 'ui-store',
      // Only persist user preferences, not modal states
      partialize: (state) => ({
        activeView: state.activeView,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  ),
    {
      name: 'UIStore',
    }
  )
)
