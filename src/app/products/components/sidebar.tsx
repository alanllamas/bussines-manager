'use client'
import React from "react"
import useGetProducts from "@/api/hooks/getProducts"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { usePathname } from "next/navigation"

const ProductsSideBar: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const path = usePathname()
  const { products, error, isLoading } = useGetProducts()

  if (authLoading) return null

  const list = (!error && !isLoading) ? (products?.data ?? []) : []

  return (
    <aside className="w-64 shrink-0 border-r border-surface-200 bg-white h-[calc(100vh-5rem)] flex flex-col sticky top-20 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Productos</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {list.map((product) => {
          const active = path === `/products/${product.documentId}`
          return (
            <Link
              key={product.documentId}
              href={`/products/${product.documentId}`}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 font-medium'
                  : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                {product.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-surface-400">chevron_right</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-surface-200">
        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Producto
        </Link>
      </div>
    </aside>
  )
}

export default ProductsSideBar
