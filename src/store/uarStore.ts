import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UarSystemOwnerRecord, UarDivisionUserRecord, LogEntry } from '../../data'
import { initialUarSystemOwnerData, initialUarDivisionUserData } from '../../data'

export interface UarState {
  systemOwnerRecords: UarSystemOwnerRecord[]
  divisionUserRecords: UarDivisionUserRecord[]
  selectedSystemOwner: UarSystemOwnerRecord | null
  selectedDivisionUser: UarDivisionUserRecord | null
  selectedLog: LogEntry | null
  setSystemOwnerRecords: (records: UarSystemOwnerRecord[]) => void
  setDivisionUserRecords: (records: UarDivisionUserRecord[]) => void
  selectSystemOwner: (record: UarSystemOwnerRecord | null) => void
  selectDivisionUser: (record: UarDivisionUserRecord | null) => void
  setSelectedLog: (log: LogEntry | null) => void
  resetSelections: () => void
}

export const useUarStore = create<UarState>()(
  devtools(
    (set) => ({
      systemOwnerRecords: initialUarSystemOwnerData,
      divisionUserRecords: initialUarDivisionUserData,
      selectedSystemOwner: null,
      selectedDivisionUser: null,
      selectedLog: null,
      setSystemOwnerRecords: (records) =>
        set({ systemOwnerRecords: records, selectedSystemOwner: null }),
      setDivisionUserRecords: (records) =>
        set({ divisionUserRecords: records, selectedDivisionUser: null }),
      selectSystemOwner: (record) => set({ selectedSystemOwner: record }),
      selectDivisionUser: (record) => set({ selectedDivisionUser: record }),
      setSelectedLog: (log) => set({ selectedLog: log }),
      resetSelections: () => set({ selectedSystemOwner: null, selectedDivisionUser: null, selectedLog: null }),
    }),
    {
      name: 'UarStore',
    }
  )
)
