'use client'
import React from "react"
import PurchaseFormat from "@/components/purchases/purchaseFormat"
import useGetPurchase from "@/api/hooks/purchases/getPurchase"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"

const PurchasePage: React.FC<{ id: string }> = ({ id }) => {
  const { isLoading: authLoading } = useAuthGuard()
  const { purchase, isLoading, error } = useGetPurchase(id)

  if (authLoading || isLoading) return <Spinner />
  if (error) return <p className="p-4 text-surface-700">Error al cargar la compra</p>
  if (!purchase?.data) return null

  return (
    <section className="w-full py-6 px-4 sm:py-8 sm:px-6">
      <PurchaseFormat purchase={purchase.data} />
    </section>
  )
}

export default PurchasePage
