// ProductsLayout — Server Component layout para /products/*. Sidebar + main, mismo patrón que clients.
import React from "react"
import ProductsSideBar from "./components/sidebar"

export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full flex flex-col lg:flex-row">
      <ProductsSideBar />
      <main className="w-full">
        {children}
      </main>
    </section>
  )
}
