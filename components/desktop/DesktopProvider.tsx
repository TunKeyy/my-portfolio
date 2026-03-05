'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface WindowState {
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
}

interface DesktopContextType {
  windowStates: Record<string, WindowState>
  openWindow: (id: string) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  activeWindowId: string | null
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined)

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({})
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const zRef = useRef(10)

  const nextZ = useCallback(() => {
    zRef.current += 1
    return zRef.current
  }, [])

  const openWindow = useCallback((id: string) => {
    const z = nextZ()
    setWindowStates(prev => ({
      ...prev,
      [id]: {
        isOpen: true,
        isMinimized: false,
        isMaximized: prev[id]?.isMaximized ?? false,
        zIndex: z,
      }
    }))
    setActiveWindowId(id)
  }, [nextZ])

  const closeWindow = useCallback((id: string) => {
    setWindowStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: prev[id]?.zIndex ?? 0,
      }
    }))
    setActiveWindowId(prev => prev === id ? null : prev)
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindowStates(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }))
    setActiveWindowId(prev => prev === id ? null : prev)
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    setWindowStates(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id]?.isMaximized }
    }))
  }, [])

  const focusWindow = useCallback((id: string) => {
    const z = nextZ()
    setWindowStates(prev => {
      if (!prev[id]?.isOpen) return prev
      return {
        ...prev,
        [id]: { ...prev[id], zIndex: z, isMinimized: false }
      }
    })
    setActiveWindowId(id)
  }, [nextZ])

  return (
    <DesktopContext.Provider value={{
      windowStates,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      activeWindowId,
    }}>
      {children}
    </DesktopContext.Provider>
  )
}

export function useDesktop() {
  const ctx = useContext(DesktopContext)
  if (!ctx) throw new Error('useDesktop must be used within DesktopProvider')
  return ctx
}
