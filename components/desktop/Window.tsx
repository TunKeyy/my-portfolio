'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktop } from './DesktopProvider'
import { useTheme } from '../../lib/theme.provider'

interface WindowProps {
  id: string
  title: string
  icon: string
  children: ReactNode
  defaultWidth?: number
  defaultHeight?: number
  defaultX?: number
  defaultY?: number
}

export function Window({
  id,
  title,
  icon,
  children,
  defaultWidth = 700,
  defaultHeight = 500,
  defaultX = 100,
  defaultY = 60,
}: WindowProps) {
  const {
    windowStates,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    activeWindowId,
  } = useDesktop()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const state = windowStates[id]
  const [pos, setPos] = useState({ x: defaultX, y: defaultY })
  const dragInfo = useRef({ startX: 0, startY: 0, dragging: false })

  const isOpen = !!state?.isOpen && !state?.isMinimized
  const isActive = activeWindowId === id
  const isMaximized = !!state?.isMaximized

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragInfo.current.dragging) return
      setPos({
        x: e.clientX - dragInfo.current.startX,
        y: Math.max(28, e.clientY - dragInfo.current.startY),
      })
    }
    const onUp = () => {
      dragInfo.current.dragging = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onTitleBarDown = (e: React.MouseEvent) => {
    if (isMaximized) return
    e.preventDefault()
    dragInfo.current = {
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y,
      dragging: true,
    }
    focusWindow(id)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onMouseDown={() => focusWindow(id)}
          style={{
            position: 'fixed',
            left: isMaximized ? 0 : pos.x,
            top: isMaximized ? 28 : pos.y,
            width: isMaximized ? '100vw' : defaultWidth,
            height: isMaximized ? 'calc(100vh - 28px - 76px)' : defaultHeight,
            zIndex: state?.zIndex ?? 10,
          }}
          className={`flex flex-col overflow-hidden transition-shadow duration-200 ${
            isMaximized ? 'rounded-none' : 'rounded-xl'
          } ${
            isActive
              ? isLight
                ? 'shadow-2xl shadow-black/20 ring-1 ring-black/10'
                : 'shadow-2xl shadow-black/70 ring-1 ring-white/15'
              : isLight
                ? 'shadow-xl shadow-black/10 ring-1 ring-black/5'
                : 'shadow-xl shadow-black/50 ring-1 ring-white/5'
          }`}
        >
          {/* Title bar */}
          <div
            onMouseDown={onTitleBarDown}
            className={`flex items-center px-4 h-11 shrink-0 select-none ${
              isLight
                ? isActive ? 'bg-[#e8e8ec] border-b border-black/5' : 'bg-[#dcdce0] border-b border-black/5'
                : isActive ? 'bg-[#323236] border-b border-white/5' : 'bg-[#3a3a3e] border-b border-white/5'
            } ${
              isMaximized
                ? 'cursor-default'
                : 'cursor-grab active:cursor-grabbing'
            }`}
          >
            {/* Traffic lights */}
            <div
              className="flex gap-2 mr-4"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => closeWindow(id)}
                className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition group relative"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/60 opacity-0 group-hover:opacity-100">
                  ✕
                </span>
              </button>
              <button
                onClick={() => minimizeWindow(id)}
                className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-125 transition group relative"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/60 opacity-0 group-hover:opacity-100">
                  −
                </span>
              </button>
              <button
                onClick={() => maximizeWindow(id)}
                className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-125 transition group relative"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[7px] text-black/60 opacity-0 group-hover:opacity-100">
                  ⤢
                </span>
              </button>
            </div>
            <div className="flex-1 text-center">
              <span className={`text-[13px] flex items-center justify-center gap-1.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <span>{icon}</span>
                <span>{title}</span>
              </span>
            </div>
            <div className="w-[60px]" />
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isLight ? 'bg-white' : 'bg-[#1c1c1e]'}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
