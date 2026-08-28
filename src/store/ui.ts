import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  tone: ToastTone
  message: string
}

type Theme = 'light' | 'dark'

interface UiState {
  toasts: Toast[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: number) => void

  theme: Theme
  toggleTheme: () => void
  initTheme: () => void
}

const THEME_KEY = 'mvm.theme'

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* private mode — fall through to the system preference */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

let nextId = 1

export const useUi = create<UiState>((set, get) => ({
  toasts: [],

  push(tone, message) {
    const id = nextId++
    set({ toasts: [...get().toasts, { id, tone, message }] })
    setTimeout(() => get().dismiss(id), 3800)
  },

  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },

  theme: 'light',

  toggleTheme() {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* nothing persisted — the in-memory theme still applies */
    }
    set({ theme })
  },

  initTheme() {
    const theme = readTheme()
    applyTheme(theme)
    set({ theme })
  },
}))

/** Fire-and-forget toast helper usable outside React components. */
export const toast = {
  success: (message: string) => useUi.getState().push('success', message),
  error: (message: string) => useUi.getState().push('error', message),
  info: (message: string) => useUi.getState().push('info', message),
}
