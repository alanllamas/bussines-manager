'use client'
// VariantesTab — componente de gestión de variantes de producto (TabPanel).
// NOTA: parece ser una versión anterior/alternativa a la gestión de variantes en ProductDetail.
// No incluye creación inline de nuevas variantes (solo agregar existentes y remover).
// Verifica si sigue siendo referenciado antes de eliminar.
import React, { useState } from "react"
import { TabPanel } from "@headlessui/react"
import { Product } from "@/api/hooks/getProducts"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import { fetcher } from "@/api/fetcher"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

const VariantesTab: React.FC<{ product: Product }> = ({ product }) => {
  const { mutate } = useSWRConfig()
  const { variants, isLoading } = useGetProductVariants()
  const [saving, setSaving] = useState(false)
  const [, setSelectedId] = useState('')

  const allVariants = variants?.data ?? []
  const current = product.product_variants ?? []
  const currentIds = new Set(current.map(v => v.id))

  // Variants not yet associated with this product
  const available = allVariants.filter(v => !currentIds.has(v.id))

  const updateVariants = async (newIds: number[]) => {
    setSaving(true)
    try {
      await fetcher(`/api/products/${product.documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: { product_variants: newIds } }),
      })
      mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/products'))
      setSelectedId('')
      toast.success('Variantes actualizadas')
    } catch {
      toast.error('Error al actualizar variantes')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = (id: string) => {
    const toAdd = allVariants.find(v => String(v.id) === id)
    if (!toAdd) return
    updateVariants([...current.map(v => v.id), toAdd.id])
  }

  const handleRemove = (id: number) => {
    updateVariants(current.map(v => v.id).filter(i => i !== id))
  }

  return (
    <TabPanel className="p-4">
      {/* Current variants */}
      <div className="flex flex-wrap gap-2 mb-4">
        {current.length === 0 && (
          <p className="text-sm text-neutral-400">Sin variantes asociadas</p>
        )}
        {current.map(v => (
          <span
            key={v.id}
            className="flex items-center gap-1 bg-neutral-200 px-3 py-1 rounded-full text-sm"
          >
            {v.name}
            {v.type && <span className="text-neutral-400 text-xs">({v.type})</span>}
            <button
              onClick={() => handleRemove(v.id)}
              disabled={saving}
              className="ml-1 text-neutral-400 hover:text-red-600 disabled:opacity-50"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Add from global list */}
      {!isLoading && available.length > 0 && (
        <select
          value=""
          onChange={e => { if (e.target.value) handleAdd(e.target.value) }}
          disabled={saving}
          className="border border-neutral-400 rounded-sm px-2 py-1 text-sm bg-white disabled:opacity-50"
        >
          <option value="">-- Agregar variante --</option>
          {available.map(v => (
            <option key={v.id} value={String(v.id)}>
              {v.name}{v.type ? ` (${v.type})` : ''}
            </option>
          ))}
        </select>
      )}
    </TabPanel>
  )
}

export default VariantesTab
