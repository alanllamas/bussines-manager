'use client'
// PurchasesPage — página /purchases: lista global de compras.
// Fetcha todas las compras aquí y las pasa a PurchaseList (que no hace fetch propio).
// Spinner combinado: authLoading || isLoading en un solo guard.
import React from "react"
import PurchaseList from "@/components/purchases/PurchaseList"
import useGetPurchases from "@/api/hooks/purchases/getPurchases"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"

const PurchasesPage: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { purchases, isLoading } = useGetPurchases()

  if (authLoading || isLoading) return <Spinner />

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-full py-6 px-4 sm:w-11/12 sm:py-8 sm:px-6 lg:w-9/12 lg:py-12 lg:px-8 bg-surface-50 text-surface-900">
        <h1 className="text-xl font-bold mb-4">Compras</h1>
        <PurchaseList purchaseData={purchases?.data ?? []} />
      </section>
    </section>
  )
}

export default PurchasesPage
