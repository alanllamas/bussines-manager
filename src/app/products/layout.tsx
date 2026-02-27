import React from "react"
import ProductsSideBar from "./components/sidebar"

export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full flex">
      <ProductsSideBar />
      <main className="w-full">
        {children}
      </main>
    </section>
  )
}
