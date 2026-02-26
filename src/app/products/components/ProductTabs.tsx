'use client'
import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Product } from "@/api/hooks/getProducts"
import { Field, Form, Formik } from "formik"
import { fetcher } from "@/api/fetcher"
import useGetProductVariants from "@/api/hooks/productVariants/getProductVariants"
import useCreateProductVariant from "@/api/hooks/productVariants/useCreateProductVariant"
import { CreateVariantReq } from "@/api/hooks/productVariants/useCreateProductVariant"
import { CreateProductReq } from "@/api/hooks/products/useCreateProduct"

const fieldClass = "border border-surface-300 rounded-sm px-2 text-sm"

const ProductDetail: React.FC<{ product: Product }> = ({ product }) => {
  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('edit') === '1')
  const [selectedId, setSelectedId] = useState('')
  const [saving, setSaving] = useState(false)
  const [showNewVariant, setShowNewVariant] = useState(false)
  const [newVariantData, setNewVariantData] = useState<CreateVariantReq>()

  const { variants, isLoading: variantsLoading } = useGetProductVariants()
  const { variant: createdVariant, isLoading: creatingVariant } = useCreateProductVariant(newVariantData)

  const allVariants = variants?.data ?? []
  const current = product.product_variants ?? []
  const currentIds = new Set(current.map(v => v.id))
  const available = allVariants.filter(v => !currentIds.has(v.id))

  const updateVariants = async (newIds: number[]) => {
    setSaving(true)
    await fetcher(`/api/products/${product.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { product_variants: newIds } }),
    })
    setSaving(false)
    window.location.reload()
  }

  const handleAdd = () => {
    const toAdd = allVariants.find(v => String(v.id) === selectedId)
    if (!toAdd) return
    updateVariants([...current.map(v => v.id), toAdd.id])
  }

  const handleRemove = (id: number) => {
    updateVariants(current.map(v => v.id).filter(i => i !== id))
  }

  const handleSaveProduct = async (values: CreateProductReq) => {
    setSaving(true)
    await fetcher(`/api/products/${product.documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: values }),
    })
    setSaving(false)
    window.location.reload()
  }

  // After new variant is created, add it to the product
  React.useEffect(() => {
    if (createdVariant && !creatingVariant) {
      const newId = (createdVariant as any)?.data?.id
      if (newId) {
        updateVariants([...current.map(v => v.id), newId])
      }
      setShowNewVariant(false)
      setNewVariantData(undefined)
    }
  }, [createdVariant, creatingVariant])

  return (
    <div className="p-4 text-surface-700">
      <h2 className="font-bold text-lg mb-4">{product.name}</h2>

      {/* VIEW MODE */}
      {!editing && (
        <div className="flex gap-8">
          <div className="flex flex-col gap-2 text-sm flex-1">
            <div className="flex gap-4">
              <span className="text-surface-500 w-36">Precio</span>
              <span>${product.price}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-surface-500 w-36">Unidad de medida</span>
              <span>{product.measurement_unit}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-surface-500 w-36">Impuestos</span>
              <span>{product.taxes ?? 0}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Variantes</h3>
            <div className="flex flex-wrap gap-2">
              {current.length === 0 && <p className="text-sm text-surface-400">Sin variantes</p>}
              {current.map(v => (
                <span key={v.id} className="bg-surface-100 px-3 py-1 rounded-full text-sm">
                  {v.name}{v.type && <span className="text-surface-400 text-xs ml-1">({v.type})</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div className="flex gap-8">
          {/* Product fields */}
          <div className="flex-1">
            <Formik
              initialValues={{
                name: product.name,
                price: product.price,
                measurement_unit: product.measurement_unit,
                taxes: product.taxes ?? 0,
              }}
              onSubmit={handleSaveProduct}
              enableReinitialize
            >
              {() => (
                <Form className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <label className="w-36 text-surface-500">Nombre</label>
                    <Field className={fieldClass + ' flex-1'} name="name" type="text" />
                  </div>
                  <div className="flex justify-between gap-2">
                    <label className="w-36 text-surface-500">Precio</label>
                    <Field className={fieldClass + ' flex-1'} name="price" type="number" step="0.01" min="0" />
                  </div>
                  <div className="flex justify-between gap-2">
                    <label className="w-36 text-surface-500">Unidad de medida</label>
                    <Field as="select" className={fieldClass + ' flex-1 bg-white'} name="measurement_unit">
                      <option value="">-- Unidad --</option>
                      <option value="kg">Kg</option>
                      <option value="pza">Pza</option>
                      <option value="lt">Lt</option>
                    </Field>
                  </div>
                  <div className="flex justify-between gap-2">
                    <label className="w-36 text-surface-500">Impuestos (%)</label>
                    <Field className={fieldClass + ' flex-1'} name="taxes" type="number" step="0.01" min="0" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white text-sm disabled:opacity-50">
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-surface-200 text-sm">
                      Cancelar
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Variants management */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Variantes</h3>

            {/* Current variants with remove */}
            <div className="flex flex-wrap gap-2 mb-3">
              {current.length === 0 && <p className="text-sm text-surface-400">Sin variantes</p>}
              {current.map(v => (
                <span key={v.id} className="flex items-center gap-1 bg-surface-100 px-3 py-1 rounded-full text-sm">
                  {v.name}{v.type && <span className="text-surface-400 text-xs ml-1">({v.type})</span>}
                  <button onClick={() => handleRemove(v.id)} disabled={saving} className="ml-1 text-surface-400 hover:text-red-600 disabled:opacity-50">×</button>
                </span>
              ))}
            </div>

            {/* Add existing variant */}
            {!variantsLoading && available.length > 0 && (
              <div className="flex gap-2 items-center mb-3">
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="border border-surface-300 rounded-sm px-2 py-1 text-sm bg-white"
                >
                  <option value="">-- Agregar variante --</option>
                  {available.map(v => (
                    <option key={v.id} value={String(v.id)}>
                      {v.name}{v.type ? ` (${v.type})` : ''}
                    </option>
                  ))}
                </select>
                <button onClick={handleAdd} disabled={!selectedId || saving} className="px-3 py-1 bg-surface-200 hover:bg-surface-300 text-sm disabled:opacity-50">
                  Agregar
                </button>
              </div>
            )}

            {/* Create new variant inline */}
            {showNewVariant ? (
              <Formik
                initialValues={{ name: '', type: '' }}
                onSubmit={(values) => setNewVariantData(values)}
              >
                {() => (
                  <Form className="flex gap-2 items-center">
                    <Field className={fieldClass} name="name" type="text" placeholder="Nombre" />
                    <Field as="select" className={fieldClass + ' bg-white'} name="type">
                      <option value="">-- Tipo --</option>
                      <option value="color">Color</option>
                      <option value="tamano">Tamaño</option>
                      <option value="empaque">Empaque</option>
                    </Field>
                    <button type="submit" disabled={creatingVariant} className="px-3 py-1 bg-primary-500 text-white text-sm disabled:opacity-50">
                      {creatingVariant ? '...' : 'Crear'}
                    </button>
                    <button type="button" onClick={() => setShowNewVariant(false)} className="px-3 py-1 bg-surface-200 text-sm">
                      ×
                    </button>
                  </Form>
                )}
              </Formik>
            ) : (
              <button onClick={() => setShowNewVariant(true)} className="text-sm text-surface-500 underline">
                + Crear nueva variante
              </button>
            )}
          </div>
        </div>
      )}

      {!editing && (
        <button className="mt-4 px-4 py-2 bg-surface-200 hover:bg-surface-300 text-sm" onClick={() => setEditing(true)}>
          Editar
        </button>
      )}
    </div>
  )
}

export default ProductDetail
