import { create } from 'zustand'

type Notification = {
  id: string
  type?: 'info' | 'success' | 'error'
  title: string
  message?: string
}

type NotificationStore = {
  items: Notification[]
  push: (n: Omit<Notification,'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: [],
  push: (n) =>
    set((s) => ({ items: [{ ...n, id: String(Date.now()) }, ...s.items].slice(0, 6) })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))

export type { Notification }
