'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '../lib/theme.provider'
import Link from 'next/link'
import { Modal } from '@/components/Modal'
import { PDFViewer } from '@/components/PDFViewer'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const handleCVClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPDFModalOpen(true)
  }

  return (
    <>
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            {'Portfolio'}
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('work')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Work
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Contact
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-white" />}
            </button>
            
            <a
              href="/pdf_files/CV.pdf"
              onClick={handleCVClick}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 transition-opacity"
            >
              My Resumé
            </a>
          </div>

          {/* Mobile menu drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 md:hidden">
              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-900 p-6 shadow-xl transform transition-transform duration-300 ease-in-out translate-x-full mobile-menu-open:translate-x-0">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                    {'Portfolio'}
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => scrollToSection('about')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    About
                  </button>
                  <button
                    onClick={() => scrollToSection('work')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Work
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Contact
                  </button>
                  
                  <div className="flex items-center gap-4 px-4 py-2">
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-white" />}
                    </button>
                    
                    <a
                      href="/pdf_files/CV.pdf"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsMobileMenuOpen(false)
                        setIsPDFModalOpen(true)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 transition-opacity text-center"
                    >
                      My Resumé
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <Modal isOpen={isPDFModalOpen} onClose={() => setIsPDFModalOpen(false)}>
        <PDFViewer file="/pdf_files/CV.pdf" />
      </Modal>
    </>
  )
}