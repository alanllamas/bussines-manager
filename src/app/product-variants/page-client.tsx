'use client'
import React, { useState } from "react"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import ProductVariantForm from "@/components/forms/ProductVariantForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"

const ProductVariantsPage: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const { variants, isLoading, error } = useGetProductVariants()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const refresh = () => window.location.reload()

  if (authLoading || isLoading) return <p className="p-4 text-neutral-700">Cargando...</p>
  if (error) return <p className="p-4 text-neutral-700">Error al cargar variantes</p>

  const list = variants?.data ?? []

  return (
    <section className="w-full p-6 text-neutral-700">
      <h1 className="text-xl font-bold mb-4">Variantes de Productos</h1>

      <table className="w-full text-sm mb-4 border border-neutral-200">
        <thead>
          <tr className="bg-neutral-200 text-left">
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((v) => (
            <tr key={v.documentId} className="border-b border-neutral-200">
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
                      className="text-xs px-2 py-1 bg-neutral-300 hover:bg-neutral-400"
                    >
                      Editar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-neutral-400">No hay variantes registradas</td>
            </tr>
          )}
        </tbody>
      </table>

      {showCreate ? (
        <ProductVariantForm onSuccess={refresh} onCancel={() => setShowCreate(false)} />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-neutral-300 hover:bg-neutral-400 text-sm"
        >
          + Nueva variante
        </button>
      )}
    </section>
  )
}

export default ProductVariantsPage
