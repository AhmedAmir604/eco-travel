import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/calendar.css"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { AuthProvider } from "../contexts/AuthContext"
import { ToastProvider } from "../contexts/ToastContext"
import ToastContainer from "../components/ToastContainer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EcoTravel - Sustainable Travel Planner",
  description:
    "Plan your eco-friendly travels with sustainable accommodations, low-carbon transport options, and responsible tourism activities.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            {children}
            <Footer />
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
