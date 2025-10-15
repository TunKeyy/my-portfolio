'use client'

import { useState } from 'react'
import { Copy, Github, Linkedin, Facebook } from 'lucide-react'
import { FadeInSection } from './FadeInSection'

export function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)
  
  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setEmailCopied(true)
        setTimeout(() => setEmailCopied(false), 2000)
      } else {
        setPhoneCopied(true)
        setTimeout(() => setPhoneCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  return (
    <FadeInSection>
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Get in touch
          </h2>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
            What&apos;s next? Feel free to reach out to me if you&apos;re looking for
            a developer, have a query, or simply want to connect.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">📧</span>
              <a
                href="mailto:ntkha71@gmail.com"
                className="text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                ntkha71@gmail.com
              </a>
              <button
                onClick={() => copyToClipboard('ntkha71@gmail.com', 'email')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Copy email"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {emailCopied && (
                <span className="text-sm text-green-500">Copied!</span>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-600 dark:text-gray-300">📱</span>
              <a
                href="tel:+84375627330"
                className="text-xl text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
              >
                +84 375627330
              </a>
              <button
                onClick={() => copyToClipboard('+84375627330', 'phone')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Copy phone"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {phoneCopied && (
                <span className="text-sm text-green-500">Copied!</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You may also find me on these platforms:
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/TunKeyy"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
            <a
              href="https://www.linkedin.com/in/kha-nguyen-tuan/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>

            <a
              href="https://www.facebook.com/kha.nguyentuan.73/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}