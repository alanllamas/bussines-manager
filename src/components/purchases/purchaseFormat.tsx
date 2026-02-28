'use client'
// PurchaseFormat — vista de detalle de una compra en /purchases/[documentId].
// Recibe purchase como prop directamente (el padre lo fetcha, sin fetch propio).
// PrintPurchaseFormat config (de getPurchase.ts) configura documentTitle + nombre de archivo.
// Fecha formateada con toLocaleDateString() (locale del sistema).
// Botón "Imprimir" manual — sin auto-print (ver PurchasePrintFormat para ese patrón).
import React, { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import type { Purchase } from "@/types"
import PurchaseBaseFormat from "./purchaseBaseFormat"
import { PrintPurchaseFormat } from "@/api/hooks/purchases/getPurchase"

const PurchaseFormat: React.FC<{ purchase: Purchase }> = ({ purchase }) => {
  const date = new Date(purchase?.purchase_date || '').toLocaleDateString()
  const contentRef = useRef<HTMLDivElement>(null)
  const PrintPurchase = useReactToPrint(PrintPurchaseFormat(contentRef, purchase))

  return (
    <section className="flex flex-col w-full justify-center items-center">
      <div className="w-full pb-4 px-4 sm:px-8 md:px-16 lg:px-32 flex justify-end">
        <button className="btn-secondary" onClick={() => PrintPurchase()}>
          <span className="material-symbols-outlined text-[16px]">print</span>
          Imprimir
        </button>
      </div>
      <section
        ref={contentRef}
        className="flex flex-col print:w-full print:shadow-none w-full sm:w-11/12 md:w-3/4 lg:w-1/2 px-6 sm:px-10 py-3 shadow-xl border border-gray-300 print:border-none print:px-12 print:pt-2 text-sm"
      >
        <PurchaseBaseFormat purchase={purchase} date={date} />
      </section>
    </section>
  )
}

export default PurchaseFormat
