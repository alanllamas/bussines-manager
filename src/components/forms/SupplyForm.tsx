// SupplyForm — create/edit form for a Supply (Insumo).
// Unlike most other forms, this one calls `fetcher` directly instead of using SWR mutation hooks.
// Reason: supply creation/editing was implemented before the SWR mutation pattern was established.
// `saving` state replaces the SWR `isLoading` flag since there's no hook managing the request.
//
// On create success: redirects to `/supplies/[documentId]?edit=1` so the user can immediately
// add variants on the detail page.
'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import type { Supply } from "@/types"
import { fetcher } from "@/api/fetcher"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

// CreateSupplyReq — body sent to POST /api/supplies and PUT /api/supplies/[id].
export type CreateSupplyReq = {
  name: string;
  quantity: number;
  measurement_unit: string;
  cost: number;
}

const supplySchema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
  cost: Yup.number().min(0, 'El costo no puede ser negativo').required('El costo es requerido'),
  measurement_unit: Yup.string().required('La unidad de medida es requerida'),
  quantity: Yup.number().min(0).required('La cantidad es requerida'),
})

const SupplyForm: React.FC<{ supply?: Supply; onSuccess?: () => void }> = ({ supply, onSuccess }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const isEdit = !!supply
  // saving: manual loading flag (replaces SWR isLoading since fetcher is called directly).
  const [saving, setSaving] = useState(false)

  // invalidate — refetches all /api/supplies SWR queries after mutation.
  const invalidate = () => mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/supplies'))

  const initialValues: CreateSupplyReq = {
    name: supply?.name ?? '',
    quantity: supply?.quantity ?? 1,
    measurement_unit: supply?.measurement_unit ?? '',
    cost: supply?.cost ?? 0,
  }

  const handleSubmit = async (values: CreateSupplyReq) => {
    setSaving(true)
    try {
      if (isEdit && supply?.documentId) {
        // Wraps payload in { data } as required by Strapi v5 PUT body format.
        await fetcher(`/api/supplies/${supply.documentId}`, {
          method: 'PUT',
          body: JSON.stringify({ data: values }),
        })
        toast.success('Insumo guardado')
        invalidate()
        if (onSuccess) onSuccess()
      } else {
        const res: any = await fetcher('/api/supplies', {
          method: 'POST',
          body: JSON.stringify({ data: values }),
        })
        toast.success('Insumo creado')
        invalidate()
        // Redirect to supply detail with ?edit=1 so the user can add variants immediately.
        const id = res?.data?.documentId
        if (id) router.push(`/supplies/${id}?edit=1`)
        else if (onSuccess) onSuccess()
      }
    } catch {
      toast.error('Error al guardar el insumo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize validationSchema={supplySchema}>
      {({ errors, touched, isValid, dirty }) => (
        <Form className="flex flex-col gap-4 w-full max-w-sm">
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
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving || !isValid || !dirty} className="btn-primary disabled:opacity-50">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear insumo'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SupplyForm
