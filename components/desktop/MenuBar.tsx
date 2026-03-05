'use client'

import { useState, useEffect } from 'react'
import { Wifi, Battery, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from '../../lib/theme.provider'
import { useDesktop } from './DesktopProvider'

const APP_TITLES: Record<string, string> = {
  profile: 'Profile',
  about: 'About Me',
  skills: 'Skills',
  experience: 'Experience',
  fields: 'Fields',
  certificates: 'Certificates',
  contact: 'Contact',
  resume: 'Resume',
}

export function MenuBar() {
  const { theme, toggleTheme } = useTheme()
  const { activeWindowId } = useDesktop()
  const isLight = theme === 'light'
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    tick()
    const i = setInterval(tick, 30000)
    return () => clearInterval(i)
  }, [])

  const activeTitle = activeWindowId
    ? APP_TITLES[activeWindowId] ?? 'Finder'
    : 'Finder'

  return (
    <div className={`fixed top-0 inset-x-0 h-7 backdrop-blur-2xl z-[9999] flex items-center justify-between px-4 text-[13px] select-none ${
      isLight
        ? 'bg-white/70 border-b border-black/10 text-gray-600'
        : 'bg-black/60 border-b border-white/5 text-gray-300'
    }`}>
      <div className="flex items-center gap-5">
        <span className="font-semibold text-sm">🍒</span>
        <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{activeTitle}</span>
        {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => (
          <span
            key={m}
            className={`cursor-default transition-colors ${
              isLight ? 'text-gray-500 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <Wifi className="w-3.5 h-3.5 text-gray-500" />
        <Battery className="w-4 h-3.5 text-gray-500" />
        <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>{time}</span>
      </div>
    </div>
  )
}
