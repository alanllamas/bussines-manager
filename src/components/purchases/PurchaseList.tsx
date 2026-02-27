'use client'
import React, { useEffect, useState } from "react"
import { usePaginatedData } from "@/hooks/usePaginatedData"
import { ActionButtons } from "@/components/ui"
import type { Purchase } from "@/types"
import ReactPaginate from "react-paginate"
import PurchaseForm, { createPurchaseReq, emptyPurchaseSupply, PurchaseInitialValues } from "../forms/PurchaseForm"
import PurchasePrintFormat from "./purchasePrintFormat"
import useCreatePurchase from "@/api/hooks/purchases/useCreatePurchase"
import useEditPurchase from "@/api/hooks/purchases/useEditPurchase"
import useGetPurchaseNumber from "@/api/hooks/purchases/getPurchaseNumber"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

const REASON_LABELS: Record<string, string> = {
  supplies: 'Insumos', tools: 'Herramientas', food: 'Comida', drinks: 'Bebidas', other: 'Otro'
}
const STATUS_LABELS: Record<string, string> = {
  planned: 'Planeada', send: 'Enviada', paid: 'Pagada', in_progress: 'En proceso', completed: 'Completada', canceled: 'Cancelada'
}

interface PurchaseListProps { purchaseData?: Purchase[]; itemsPerPage?: number }

const PurchaseList: React.FC<PurchaseListProps> = ({ purchaseData, itemsPerPage = 10 }) => {
  const { mutate } = useSWRConfig()
  const invalidate = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/purchases')
  )

  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [initialFormValues, setInitialFormValues] = useState<PurchaseInitialValues>()
  const [isOpen, setIsOpen] = useState(false)
  const [editPurchase, setEditPurchase] = useState<Purchase>()
  const [printPurchase, setPrintPurchase] = useState<Purchase>()
  const [printKey, setPrintKey] = useState(0)

  const sendPrint = (purchase: Purchase) => {
    setPrintKey(k => k + 1)
    setPrintPurchase(purchase)
  }
  const [newPurchase, setNewPurchase] = useState<createPurchaseReq>()
  const [newEditPurchase, setNewEditPurchase] = useState<{ purchase: createPurchaseReq; documentId: string }>()

  const { purchase: createdPurchase, error: createError, isLoading: createLoading } = useCreatePurchase(newPurchase)
  const { purchase: editedPurchase, error: editError, isLoading: editLoading } = useEditPurchase(newEditPurchase)
  const { purchase_number } = useGetPurchaseNumber()

  useEffect(() => {
    if (purchaseData) setPurchases([...purchaseData].sort((a, b) => b.id - a.id))
  }, [purchaseData])

  useEffect(() => {
    if (createError && !createLoading) {
      toast.error('Error al crear la compra')
    } else if (!createError && !createLoading && createdPurchase) {
      toast.success('Compra creada')
      invalidate()
      setNewPurchase(undefined)
      sendClose()
    }
  }, [createLoading, createdPurchase, createError])

  useEffect(() => {
    if (editError && !editLoading) {
      toast.error('Error al editar la compra')
    } else if (editedPurchase && !editError && !editLoading) {
      toast.success('Compra actualizada')
      invalidate()
      setNewEditPurchase(undefined)
      sendClose()
    }
  }, [editedPurchase, editError, editLoading])

  useEffect(() => {
    if (editPurchase) {
      setInitialFormValues({
        purchase_number: editPurchase.purchase_number,
        purchase_date: new Date(editPurchase.purchase_date).valueOf(),
        purchase_reason: editPurchase.purchase_reason,
        purchase_status: editPurchase.purchase_status ?? '',
        shipping_cost: editPurchase.shipping_cost ?? 0,
        subtotal: editPurchase.subtotal,
        total: editPurchase.total,
        comments: editPurchase.comments ?? '',
        supplies: editPurchase.supplies.map(s => ({
          name: s.supply?.name ?? '',
          supply: s.supply?.id ?? 0,
          price: s.price,
          quantity: s.quantity,
          supply_total: s.supply_total,
          supply_variants: s.supply_variants?.map(v => v.documentId) ?? [],
          unit: s.supply?.measurement_unit ?? '',
        }))
      })
    }
  }, [editPurchase])

  useEffect(() => {
    if (initialFormValues) setIsOpen(true)
  }, [initialFormValues])

  const sendCreate = () => {
    setEditPurchase(undefined)
    setInitialFormValues({
      purchase_number: (purchase_number !== undefined && !isNaN(Number(purchase_number)) ? Number(purchase_number) : 0) + 1,
      purchase_date: new Date().valueOf(),
      purchase_reason: 'supplies',
      purchase_status: 'planned',
      supplies: [emptyPurchaseSupply],
      shipping_cost: 0,
      subtotal: 0,
      total: 0,
      comments: '',
    })
  }

  const sendClose = () => {
    setEditPurchase(undefined)
    setInitialFormValues(undefined)
    setIsOpen(false)
  }

  const handleSubmit = (values: PurchaseInitialValues) => {
    const data: createPurchaseReq = {
      purchase_number: values.purchase_number,
      purchase_date: new Date(values.purchase_date),
      purchase_reason: values.purchase_reason,
      purchase_status: values.purchase_status,
      shipping_cost: values.shipping_cost,
      subtotal: values.subtotal,
      total: values.total,
      comments: values.comments,
      supplies: values.supplies.map(s => ({
        supply: [s.supply],
        quantity: s.quantity,
        supply_total: s.supply_total,
        supply_variants: s.supply_variants,
        price: s.price,
      }))
    }
    if (editPurchase) {
      setNewEditPurchase({ purchase: data, documentId: editPurchase.documentId })
    } else {
      setNewPurchase(data)
    }
  }

  function Items({ currentItems }: { currentItems: Purchase[] }) {
    return (
      <>
        {currentItems.map((purchase, index) => (
          <tr key={`purchase-${index}`}>
            <td className="whitespace-nowrap">
              <a className="text-primary-600 hover:underline font-medium" href={`/purchases/${purchase.documentId}`}>
                {String(purchase.purchase_number ?? '').padStart(5, '0')}
              </a>
            </td>
            <td className="whitespace-nowrap">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
            <td>{REASON_LABELS[purchase.purchase_reason] ?? purchase.purchase_reason}</td>
            <td>{purchase.purchase_status ? STATUS_LABELS[purchase.purchase_status] ?? purchase.purchase_status : '—'}</td>
            <td className="font-medium whitespace-nowrap">$ {purchase.total}</td>
            <td><div className="flex justify-center"><ActionButtons onEdit={() => setEditPurchase(purchase)} onPrint={() => sendPrint(purchase)} /></div></td>
          </tr>
        ))}
      </>
    )
  }

  function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
    const { currentItems, pageCount, handlePageChange } = usePaginatedData(purchases, itemsPerPage)
    return (
      <section className="w-full flex flex-col items-center">
        {/* Mobile cards */}
        <div className="sm:hidden w-full space-y-2 mt-4">
          {purchases.length === 0
            ? <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-surface-300 block">inbox</span>
                <p className="text-sm text-surface-400 mt-2">Sin compras</p>
              </div>
            : currentItems.map((purchase: Purchase) => (
                <div key={purchase.documentId} className="border border-surface-200 rounded p-3 bg-white text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-surface-800">
                      #{String(purchase.purchase_number ?? '').padStart(5, '0')}
                    </span>
                    <ActionButtons onEdit={() => setEditPurchase(purchase)} onPrint={() => sendPrint(purchase)} />
                  </div>
                  <p className="text-surface-600 mt-1">
                    {REASON_LABELS[purchase.purchase_reason] ?? purchase.purchase_reason}
                    {purchase.purchase_status && (
                      <span className="ml-2 text-xs text-surface-400">· {STATUS_LABELS[purchase.purchase_status] ?? purchase.purchase_status}</span>
                    )}
                  </p>
                  <p className="text-surface-400 text-xs mt-1">
                    {new Date(purchase.purchase_date).toLocaleDateString()} · $ {purchase.total}
                  </p>
                </div>
              ))
          }
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="data-table mt-6 min-w-[480px] [&_th]:!text-center [&_td]:text-center">
            <thead>
              <tr>
                <th className="w-20">Folio</th>
                <th className="w-28">Fecha</th>
                <th className="w-32">Razón</th>
                <th className="w-32">Estado</th>
                <th className="w-28">Total</th>
                <th className="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0
                ? <tr><td colSpan={6} className="py-12 text-center">
                    <span className="material-symbols-outlined text-[40px] text-surface-300 block">inbox</span>
                    <p className="text-sm text-surface-400 mt-2">Sin compras</p>
                  </td></tr>
                : <Items currentItems={currentItems} />
              }
            </tbody>
          </table>
        </div>
        <ReactPaginate
          className="paginator"
          breakLabel="…"
          nextLabel="siguiente ›"
          previousLabel="‹ anterior"
          onPageChange={handlePageChange}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          renderOnZeroPageCount={null}
        />
      </section>
    )
  }

  const apiError = createError || editError

  return (
    <>
      <PurchaseForm
        sendCreate={sendCreate}
        initialFormValues={initialFormValues}
        handleSubmit={handleSubmit}
        isOpen={isOpen}
        sendClose={sendClose}
        editPurchase={editPurchase}
        apiError={apiError}
      />
      <PaginatedItems itemsPerPage={itemsPerPage} />
      {printPurchase && <PurchasePrintFormat key={printKey} purchase={printPurchase} />}
    </>
  )
}

export default PurchaseList
