'use client'
import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Supply } from "@/types"
import { fetcher } from "@/api/fetcher"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import useGetSupplyVariants from "@/api/hooks/supply-variants/getSupplyVariants"
import useCreateSupplyVariant from "@/api/hooks/supply-variants/useCreateSupplyVariant"
import type { CreateSupplyVariantReq } from "@/api/hooks/supply-variants/useCreateSupplyVariant"

const supplySchema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
  cost: Yup.number().min(0, 'El costo no puede ser negativo').required('El costo es requerido'),
  measurement_unit: Yup.string().required('La unidad de medida es requerida'),
  quantity: Yup.number().min(0).required('La cantidad es requerida'),
})

const SupplyDetail: React.FC<{ supply: Supply }> = ({ supply }) => {
  const { mutate } = useSWRConfig()
  const invalidate = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/supplies')
  )

  const searchParams = useSearchParams()
  const [editing, setEditing] = useState(searchParams.get('edit') === '1')
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [showNewVariant, setShowNewVariant] = useState(false)
  const [newVariantData, setNewVariantData] = useState<CreateSupplyVariantReq>()

  const { variants, isLoading: variantsLoading } = useGetSupplyVariants()
  const { variant: createdVariant, isLoading: creatingVariant } = useCreateSupplyVariant(newVariantData)

  const allVariants = variants?.data ?? []
  const current = supply.supply_variants ?? []
  const currentDocIds = new Set(current.map(v => v.documentId))
  const available = allVariants.filter(v => !currentDocIds.has(v.documentId))

  const updateVariants = async (documentIds: string[]) => {
    setSaving(true)
    try {
      await fetcher(`/api/supplies/${supply.documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: { supply_variants: documentIds } }),
      })
      invalidate()
      toast.success('Variantes actualizadas')
    } catch {
      toast.error('Error al actualizar variantes')
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariant = () => {
    const toAdd = allVariants.find(v => v.documentId === selectedId)
    if (!toAdd) return
    updateVariants([...current.map(v => v.documentId), toAdd.documentId])
    setSelectedId('')
  }

  const handleRemoveVariant = (docId: string) => {
    updateVariants(current.map(v => v.documentId).filter(id => id !== docId))
  }

  const handleSave = async (values: { name: string; cost: number; measurement_unit: string; quantity: number }) => {
    setSaving(true)
    try {
      await fetcher(`/api/supplies/${supply.documentId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: values }),
      })
      setEditing(false)
      invalidate()
      toast.success('Insumo guardado')
    } catch {
      toast.error('Error al guardar el insumo')
    } finally {
      setSaving(false)
    }
  }

  React.useEffect(() => {
    if (createdVariant && !creatingVariant) {
      const newDocId = (createdVariant as any)?.data?.documentId
      if (newDocId) {
        updateVariants([...current.map(v => v.documentId), newDocId])
      }
      setShowNewVariant(false)
      setNewVariantData(undefined)
    }
  }, [createdVariant, creatingVariant])

  return (
    <div className="p-4 sm:p-6 text-surface-700">
      <h2 className="font-bold text-lg mb-4">{supply.name}</h2>

      {/* VIEW MODE */}
      {!editing && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex flex-col gap-2 text-sm flex-1">
            <div className="flex gap-4">
              <span className="text-surface-500 w-40">Costo</span>
              <span>{supply.cost?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-surface-500 w-40">Unidad de medida</span>
              <span>{supply.measurement_unit}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-surface-500 w-40">Cantidad</span>
              <span>{supply.quantity} {supply.measurement_unit}</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Variantes</h3>
            <div className="flex flex-wrap gap-2">
              {current.length === 0 && <p className="text-sm text-surface-400">Sin variantes</p>}
              {current.map(v => (
                <span key={v.documentId} className="bg-surface-100 px-3 py-1 rounded-full text-sm">
                  {v.name}{v.type && <span className="text-surface-400 text-xs ml-1">({v.type})</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {editing && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Supply fields */}
          <div className="flex-1">
            <Formik
              initialValues={{
                name: supply.name,
                cost: supply.cost,
                measurement_unit: supply.measurement_unit,
                quantity: supply.quantity,
              }}
              validationSchema={supplySchema}
              onSubmit={handleSave}
              enableReinitialize
            >
              {({ errors, touched }) => (
                <Form className="flex flex-col gap-4">
                  <div className="field-group">
                    <label className="field-label required">Nombre</label>
                    <Field className="field-input" name="name" type="text" />
                    {touched.name && errors.name && <p className="alert-field">{errors.name}</p>}
                  </div>
                  <div className="field-group">
                    <label className="field-label required">Costo</label>
                    <Field className="field-input" name="cost" type="number" step="0.01" min="0" />
                    {touched.cost && errors.cost && <p className="alert-field">{errors.cost}</p>}
                  </div>
                  <div className="field-group">
                    <label className="field-label required">Unidad de medida</label>
                    <Field as="select" className="field-select" name="measurement_unit">
                      <option value="">-- Seleccionar --</option>
                      <option value="kg">Kg</option>
                      <option value="lt">Lt</option>
                      <option value="pza">Pza</option>
                      <option value="dza">Dza</option>
                    </Field>
                    {touched.measurement_unit && errors.measurement_unit && <p className="alert-field">{errors.measurement_unit}</p>}
                  </div>
                  <div className="field-group">
                    <label className="field-label required">Cantidad</label>
                    <Field className="field-input" name="quantity" type="number" min="0" />
                    {touched.quantity && errors.quantity && <p className="alert-field">{errors.quantity}</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
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

            <div className="flex flex-wrap gap-2 mb-3">
              {current.length === 0 && <p className="text-sm text-surface-400">Sin variantes</p>}
              {current.map(v => (
                <span key={v.documentId} className="flex items-center gap-1 bg-surface-100 px-3 py-1 rounded-full text-sm">
                  {v.name}{v.type && <span className="text-surface-400 text-xs ml-1">({v.type})</span>}
                  <button onClick={() => handleRemoveVariant(v.documentId)} disabled={saving} className="ml-1 text-surface-400 hover:text-red-600 disabled:opacity-50">×</button>
                </span>
              ))}
            </div>

            {!variantsLoading && available.length > 0 && (
              <div className="flex gap-2 items-center mb-3">
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="field-select"
                >
                  <option value="">-- Agregar variante --</option>
                  {available.map(v => (
                    <option key={v.documentId} value={v.documentId}>
                      {v.name}{v.type ? ` (${v.type})` : ''}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddVariant} disabled={!selectedId || saving} className="btn-secondary disabled:opacity-50">
                  Agregar
                </button>
              </div>
            )}

            {showNewVariant ? (
              <Formik
                initialValues={{ name: '', type: '', description: '' }}
                onSubmit={(values) => setNewVariantData({ name: values.name, type: values.type, description: values.description || undefined })}
              >
                {() => (
                  <Form className="flex flex-wrap gap-2 items-end">
                    <Field className="field-input" name="name" type="text" placeholder="Nombre" />
                    <Field as="select" className="field-select" name="type">
                      <option value="">-- Tipo --</option>
                      <option value="tamano">Tamaño</option>
                      <option value="color">Color</option>
                      <option value="empaque">Empaque</option>
                    </Field>
                    <button type="submit" disabled={creatingVariant} className="btn-primary disabled:opacity-50">
                      {creatingVariant ? '...' : 'Crear'}
                    </button>
                    <button type="button" onClick={() => setShowNewVariant(false)} className="btn-secondary">×</button>
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
        <button className="btn-secondary mt-4" onClick={() => setEditing(true)}>
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Editar
        </button>
      )}
    </div>
  )
}

export default SupplyDetail
