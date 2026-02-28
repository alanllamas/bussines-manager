'use client'
import React, { useState } from "react"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import ProductVariantForm from "@/components/forms/ProductVariantForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"
import { useSWRConfig } from "swr"
import { ActionButtons, EmptyState } from "@/components/ui"
import type { ProductVariant } from "@/api/hooks/getProducts"
import { usePaginatedData } from "@/hooks/usePaginatedData"
import ReactPaginate from "react-paginate"

const TYPE_LABELS: Record<string, string> = {
  tamano: 'Tamaño', color: 'Color', empaque: 'Empaque'
}

const ProductVariantsPage: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { variants, isLoading, error } = useGetProductVariants()
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const { mutate } = useSWRConfig()

  const refresh = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/product-variants')
  )

  if (authLoading || isLoading) return <Spinner />
  if (error) return <p className="p-4 text-surface-700">Error al cargar variantes</p>

  const list = variants?.data ?? []

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-full py-6 px-4 sm:w-11/12 sm:py-8 sm:px-6 lg:w-7/12 lg:py-12 lg:px-8 bg-surface-50 text-surface-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Variantes de Productos</h1>
          {!showCreate && (
            <button className="btn-primary" onClick={() => { setShowCreate(true); setEditing(null) }}>
              <span className="material-symbols-outlined text-[16px]">add</span>
              Nueva variante
            </button>
          )}
        </div>

        {showCreate && (
          <div className="mb-6 p-4 border border-surface-200 rounded bg-white">
            <h2 className="text-sm font-semibold mb-3">Nueva variante</h2>
            <ProductVariantForm
              onSuccess={() => { refresh(); setShowCreate(false) }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        )}

        <PaginatedList list={list} editing={editing} setEditing={setEditing} refresh={refresh} />
      </section>
    </section>
  )
}

function PaginatedList({ list, editing, setEditing, refresh }: {
  list: ProductVariant[]
  editing: ProductVariant | null
  setEditing: (v: ProductVariant | null) => void
  refresh: () => void
}) {
  const { currentItems, pageCount, handlePageChange } = usePaginatedData(list, 10)

  return (
    <section className="w-full flex flex-col items-center min-h-[60vh] sm:min-h-0 pb-16 sm:pb-0">
      {/* Mobile cards */}
      <div className="sm:hidden w-full space-y-2">
        {list.length === 0 ? (
          <EmptyState icon="style" message="Sin variantes" />
        ) : currentItems.map((v) => (
          <div key={v.documentId} className="border border-surface-200 rounded p-3 bg-white text-sm">
            {editing?.documentId === v.documentId ? (
              <ProductVariantForm
                variant={v}
                onSuccess={() => { refresh(); setEditing(null) }}
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
              <tr><td colSpan={3}><EmptyState icon="style" message="Sin variantes" /></td></tr>
            ) : currentItems.map((v) => (
              <tr key={v.documentId}>
                {editing?.documentId === v.documentId ? (
                  <td colSpan={3} className="py-2">
                    <ProductVariantForm
                      variant={v}
                      onSuccess={() => { refresh(); setEditing(null) }}
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

      {pageCount > 1 && (
        <div className="paginator-bar">
          <ReactPaginate
            className="paginator"
            breakLabel="…"
            nextLabel="siguiente ›"
            previousLabel="‹ anterior"
            onPageChange={handlePageChange}
            pageRangeDisplayed={5}
            pageCount={pageCount}
          />
        </div>
      )}
    </section>
  )
}

export default ProductVariantsPage
