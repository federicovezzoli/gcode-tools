import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'G-Code Tools',
  description:
    'Free online tool to generate diagnostic G-code test patterns for CNC machines, routers and plotters. Calibrate steps/mm, backlash, acceleration, Z-level, surfacing and more.',
  keywords: [
    'gcode generator',
    'CNC calibration',
    'test patterns',
    'gcode test',
    'CNC router',
    'steps per mm',
    'backlash test',
    'surfacing gcode',
    'acceleration test',
  ],
  authors: [{ name: 'Federico Vezzoli', url: 'https://federicovezzoli.com' }],
  openGraph: {
    title: 'G-Code Tools',
    description:
      'Generate diagnostic G-code test patterns for CNC machines. Rulers, Z-tests, acceleration, surfacing and more — free, in-browser.',
    url: 'https://gcode-tools.federicovezzoli.com/',
    siteName: 'G-Code Tools',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'G-Code Tools',
    description: 'Generate diagnostic G-code test patterns for CNC machines. Free, in-browser.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
