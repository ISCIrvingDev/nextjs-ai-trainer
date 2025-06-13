import type { Metadata } from "next";
/*
import {
  // ClerkProvider, // Se reemplazo por el "ConvexClerkProvider"

  // El header lo borro y no mostro eso en el video
  // SignInButton,
  // SignUpButton,
  // SignedIn,
  // SignedOut,
  // UserButton,
} from '@clerk/nextjs'
*/

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

// * Providers
import ConvexClerkProvider from "@/providers/ConvexClerkProvider";

// * Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Trainer',
  description: 'A modern fitness AI platform to get jacked for free',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* El header lo borro y no mostro eso en el video */}
          {/* <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header> */}
          <Navbar />

          {/* # GRID BACKGROUND */}
          <div className="fixed inset-0 -z-1">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background"></div>
            <div className="absolute inset-0 bg-[linear-gradient(var(--cyber-grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--cyber-grid-color)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>

          <main className="pt-24 flex-grow">{children}</main>

          <Footer />
        </body>
      </html>
    </ConvexClerkProvider>
  )
}