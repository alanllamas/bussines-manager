'use client'
import React, { useState } from "react"
import useGetSupplyVariants from "@/api/hooks/supply-variants/getSupplyVariants"
import SupplyVariantForm from "@/components/forms/SupplyVariantForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"
import type { SupplyVariant } from "@/types"
import { usePaginatedData } from "@/hooks/usePaginatedData"
import ReactPaginate from "react-paginate"
import { ActionButtons } from "@/components/ui"

const TYPE_LABELS: Record<string, string> = {
  tamano: 'Tamaño', color: 'Color', empaque: 'Empaque'
}

const SupplyVariantsPage: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { variants, isLoading } = useGetSupplyVariants()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<SupplyVariant | null>(null)

  if (authLoading || isLoading) return <Spinner />

  const list = variants?.data ?? []

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-full py-6 px-4 sm:w-11/12 sm:py-8 sm:px-6 lg:w-7/12 lg:py-12 lg:px-8 bg-surface-50 text-surface-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Variantes de Insumos</h1>
          {!showNew && (
            <button className="btn-primary" onClick={() => { setShowNew(true); setEditing(null) }}>
              <span className="material-symbols-outlined text-[16px]">add</span>
              Nueva variante
            </button>
          )}
        </div>

        {showNew && (
          <div className="mb-6 p-4 border border-surface-200 rounded bg-white">
            <h2 className="text-sm font-semibold mb-3">Nueva variante</h2>
            <SupplyVariantForm
              onSuccess={() => setShowNew(false)}
              onCancel={() => setShowNew(false)}
            />
          </div>
        )}

        <PaginatedList list={list} editing={editing} setEditing={setEditing} />
      </section>
    </section>
  )
}

function PaginatedList({ list, editing, setEditing }: {
  list: SupplyVariant[]
  editing: SupplyVariant | null
  setEditing: (v: SupplyVariant | null) => void
}) {
  const { currentItems, pageCount, handlePageChange } = usePaginatedData(list, 10)

  return (
    <section className="w-full flex flex-col items-center min-h-[60vh] sm:min-h-0">
      {/* Mobile cards */}
      <div className="sm:hidden w-full space-y-2">
        {list.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-[40px] text-surface-300 block">style</span>
            <p className="text-sm text-surface-400 mt-2">Sin variantes</p>
          </div>
        ) : currentItems.map((v) => (
          <div key={v.documentId} className="border border-surface-200 rounded p-3 bg-white text-sm">
            {editing?.documentId === v.documentId ? (
              <SupplyVariantForm
                variant={v}
                onSuccess={() => setEditing(null)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-surface-800">{v.name}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{TYPE_LABELS[v.type] ?? v.type}</p>
                </div>
                <ActionButtons onEdit={() => setEditing(v)} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="data-table mt-2 min-w-[400px] [&_th]:!text-center [&_td]:text-center">
          <thead>
            <tr>
              <th className="w-1/3">Nombre</th>
              <th className="w-32">Tipo</th>
              <th className="w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-surface-300 block">style</span>
                <p className="text-sm text-surface-400 mt-2">Sin variantes</p>
              </td></tr>
            ) : currentItems.map((v) => (
              <tr key={v.documentId}>
                {editing?.documentId === v.documentId ? (
                  <td colSpan={3} className="py-2">
                    <SupplyVariantForm
                      variant={v}
                      onSuccess={() => setEditing(null)}
                      onCancel={() => setEditing(null)}
                    />
                  </td>
                ) : (
                  <>
                    <td>{v.name}</td>
                    <td>{TYPE_LABELS[v.type] ?? v.type}</td>
                    <td><div className="flex justify-center"><ActionButtons onEdit={() => setEditing(v)} /></div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto sm:mt-0 w-full">
        <ReactPaginate
          className="paginator"
          breakLabel="…"
          nextLabel="siguiente ›"
          previousLabel="‹ anterior"
          onPageChange={handlePageChange}
          pageRangeDisplayed={5}
          pageCount={Math.max(pageCount, 1)}
        />
      </div>
    </section>
  )
}

export default SupplyVariantsPage
