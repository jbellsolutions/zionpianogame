import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Zion's Minecraft Tutor",
  description: 'AI-powered learning adventure in a Minecraft world',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-b from-sky-400 to-sky-600 min-h-screen">
        {children}
      </body>
    </html>
  )
}
