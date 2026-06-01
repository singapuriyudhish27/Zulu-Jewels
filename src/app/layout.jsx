import './globals.css'
import ToastProvider from '@/components/ToastProvider'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'

// LOW-5: Migrated from <link> tag to next/font for:
// - Zero layout shift (font dimensions known at build time)
// - Self-hosted by Vercel (no third-party DNS request to Google)
// - Automatic subsetting for smaller bundle size
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  title: 'Zulu Jewellers - Lab-Grown Diamond Jewelry',
  description: 'Creating timeless moments through exceptional craftsmanship and lab-grown diamonds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <CurrencyProvider>
          <ToastProvider />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  )
}