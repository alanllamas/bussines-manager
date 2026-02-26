'use client'
import React, { useState } from "react"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import ProductVariantForm from "@/components/forms/ProductVariantForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"
import { useSWRConfig } from "swr"

const ProductVariantsPage: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { variants, isLoading, error } = useGetProductVariants()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { mutate } = useSWRConfig()

  const refresh = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/product-variants')
  )

  if (authLoading || isLoading) return <Spinner />
  if (error) return <p className="p-4 text-surface-700">Error al cargar variantes</p>

  const list = variants?.data ?? []

  return (
    <section className="w-full p-6 text-surface-700">
      <h1 className="text-xl font-bold mb-4">Variantes de Productos</h1>

      <table className="w-full text-sm mb-4 border border-surface-200">
        <thead>
          <tr className="bg-surface-100 text-left">
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((v) => (
            <tr key={v.documentId} className="border-b border-surface-200">
              {editingId === v.documentId ? (
                <td colSpan={3} className="px-4 py-2">
                  <ProductVariantForm
                    variant={v}
                    onSuccess={refresh}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              ) : (
                <>
                  <td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2">{v.type}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setEditingId(v.documentId)}
                      className="btn-secondary"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Editar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-surface-400">No hay variantes registradas</td>
            </tr>
          )}
        </tbody>
      </table>

      {showCreate ? (
        <ProductVariantForm onSuccess={refresh} onCancel={() => setShowCreate(false)} />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="btn-secondary"
        >
          + Nueva variante
        </button>
      )}
    </section>
  )
}

export default ProductVariantsPage
