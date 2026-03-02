import React from "react"
import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SettingsProvider } from '@/hooks/use-settings'
import { GameActionProvider } from '@/context/GameActionContext'
import { EconomyProvider } from '@/context/EconomyContext'
import { OrientationLock } from '@/components/game-ui/OrientationLock'
import './globals.css'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
});

// Remove unused Geist fonts

export const metadata: Metadata = {
  title: 'INDUSTRIALIST - Descent Into Darkness',
  description: 'A fully functional raycasting 3D FPS game with 8 enemy types across 3 levels',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased`}>
        <SettingsProvider>
          <GameActionProvider>
            <EconomyProvider>
              <OrientationLock />
              {children}
            </EconomyProvider>
          </GameActionProvider>
        </SettingsProvider>
        <Analytics />
      </body>
    </html>
  )
}

