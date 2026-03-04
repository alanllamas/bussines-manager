'use client'
// ProductsPage — estado vacío de /products: muestra ícono + "Selecciona un producto".
import React from "react"

const ProductsPage: React.FC = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center py-24 text-surface-400">
      <span className="material-symbols-outlined text-[48px]">inventory_2</span>
      <p className="mt-2 text-sm">Selecciona un producto de la barra lateral</p>
    </section>
  )
}

export default ProductsPage
