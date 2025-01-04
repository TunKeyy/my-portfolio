import { ThemeProvider } from '../lib/theme.provider'
import './globals.css'

export const metadata = {
  title: "Kha's zone"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
