'use client'
import React, { useState } from "react"
import { TabPanel } from "@headlessui/react"
import { Product } from "@/api/hooks/getProducts"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import { fetcher } from "@/api/fetcher"
import { useSWRConfig } from "swr"

const VariantesTab: React.FC<{ product: Product }> = ({ product }) => {
  const { mutate } = useSWRConfig()
  const { variants, isLoading } = useGetProductVariants()
  const [selectedId, setSelectedId] = useState('')
  const [saving, setSaving] = useState(false)

  const allVariants = variants?.data ?? []
  const current = product.product_variants ?? []
  const currentIds = new Set(current.map(v => v.id))

  // Variants not yet associated with this product
  const available = allVariants.filter(v => !currentIds.has(v.id))

  const updateVariants = async (newIds: number[]) => {
    setSaving(true)
    await fetcher(`/api/products/${product.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { product_variants: newIds } }),
    })
    setSaving(false)
    mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/products'))
    setSelectedId('')
  }

  const handleAdd = () => {
    if (!selectedId) return
    const toAdd = allVariants.find(v => String(v.id) === selectedId)
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
        <div className="flex gap-2 items-center">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border border-neutral-400 rounded-sm px-2 py-1 text-sm bg-white"
          >
            <option value="">-- Seleccionar variante --</option>
            {available.map(v => (
              <option key={v.id} value={String(v.id)}>
                {v.name}{v.type ? ` (${v.type})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedId || saving}
            className="px-3 py-1 bg-neutral-300 hover:bg-neutral-400 text-sm disabled:opacity-50"
          >
            {saving ? '...' : 'Agregar'}
          </button>
        </div>
      )}
    </TabPanel>
  )
}

export default VariantesTab
