import './globals.css'
import ToastProvider from '@/components/ToastProvider'

export const metadata = {
  title: 'Zulu Jewellers - Lab-Grown Diamond Jewelry',
  description: 'Creating timeless moments through exceptional craftsmanship and lab-grown diamonds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}