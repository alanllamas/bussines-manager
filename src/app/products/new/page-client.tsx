'use client'
import React from "react"
import ProductForm from "@/components/forms/ProductForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"

const NewProduct: React.FC = () => {
  const { isLoading } = useAuthGuard()
  if (isLoading) return null

  return (
    <section className="w-full flex p-4">
      <ProductForm />
    </section>
  )
}

export default NewProduct
