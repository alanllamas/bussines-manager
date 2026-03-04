// SuppliesLayout — Server Component layout para /supplies/*. Sidebar + main, mismo patrón que clients/products.
import React from "react"
import SuppliesSideBar from "./components/sidebar"

export default async function SuppliesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full flex flex-col lg:flex-row">
      <SuppliesSideBar />
      <main className="w-full">
        {children}
      </main>
    </section>
  )
}
