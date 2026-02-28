'use client'
// SuppliesPage — estado vacío de /supplies: muestra ícono + "Selecciona un insumo".
import React from "react"

const SuppliesPage: React.FC = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center py-24 text-surface-400">
      <span className="material-symbols-outlined text-[48px]">package_2</span>
      <p className="mt-2 text-sm">Selecciona un insumo de la barra lateral</p>
    </section>
  )
}

export default SuppliesPage
