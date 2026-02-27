'use client'
import React, { useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import type { Purchase } from "@/types"
import PurchaseBaseFormat from "./purchaseBaseFormat"
import { PrintPurchaseFormat } from "@/api/hooks/purchases/getPurchase"

const PurchasePrintFormat: React.FC<{ purchase: Purchase }> = ({ purchase }) => {
  const date = new Date(purchase?.purchase_date || '').toLocaleDateString()
  const contentRef = useRef<HTMLDivElement>(null)
  const PrintPurchase = useReactToPrint(PrintPurchaseFormat(contentRef, purchase))

  useEffect(() => {
    const t = setTimeout(() => PrintPurchase(), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <section ref={contentRef} className="hidden print:block print:w-full print:shadow-none print:border-none px-12 pt-2">
      <PurchaseBaseFormat purchase={purchase} date={date} />
    </section>
  )
}

export default PurchasePrintFormat
