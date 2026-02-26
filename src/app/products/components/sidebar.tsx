'use client'
import React from "react"
import useGetProducts from "@/api/hooks/getProducts"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/useAuthGuard"

const ProductsSideBar: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { products, error, isLoading } = useGetProducts()

  if (authLoading) return null

  const list = (!error && !isLoading) ? (products?.data ?? []) : []

  return (
    <section className="w-3/12 bg-neutral-200 text-neutral-900">
      {list.map((product, index) => (
        <Link
          key={`product-${index}`}
          href={`/products/${product.documentId}`}
          className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
        >
          <h4>{product.name}</h4> <h4>{'>'}</h4>
        </Link>
      ))}
      <Link
        href="/products/new"
        className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
      >
        <h4>Crear Producto</h4> <h4>{'+'}</h4>
      </Link>
    </section>
  )
}

export default ProductsSideBar
