// SupplyVariantForm — inline create/edit form for a supply variant (Variante de Insumo).
// Mirrors ProductVariantForm in structure and pattern.
// Note: CreateSupplyVariantReq has an optional `description` field not shown in this form —
// description can only be set via Strapi admin or a future form enhancement.
//
// onSuccess / onCancel: same usage as ProductVariantForm (list page inline form).
'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import type { SupplyVariant } from "@/types"
import useCreateSupplyVariant, { CreateSupplyVariantReq } from "@/api/hooks/supply-variants/useCreateSupplyVariant"
import useEditSupplyVariant from "@/api/hooks/supply-variants/useEditSupplyVariant"
import { useSWRConfig } from "swr"

const schema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
  type: Yup.string().required('El tipo es requerido'),
})

const SupplyVariantForm: React.FC<{
  variant?: SupplyVariant;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ variant, onSuccess, onCancel }) => {
  const isEdit = !!variant
  const { mutate } = useSWRConfig()
  // invalidate — refetches all /api/supply-variants SWR queries after mutation.
  const invalidate = () => mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/supply-variants'))

  // SWR mutation state — undefined until Formik submits, triggers the hook request.
  const [newVariant, setNewVariant] = useState<CreateSupplyVariantReq>()
  const [editPayload, setEditPayload] = useState<{ data: CreateSupplyVariantReq; documentId: string }>()

  const { variant: created, error: createError, isLoading: createLoading } = useCreateSupplyVariant(newVariant)
  const { variant: edited, error: editError, isLoading: editLoading } = useEditSupplyVariant(editPayload)

  // initialValues — description is not pre-filled here (field not shown in form).
  const initialValues: CreateSupplyVariantReq = {
    name: variant?.name ?? '',
    type: variant?.type ?? '',
  }

  const handleSubmit = (values: CreateSupplyVariantReq) => {
    if (isEdit && variant?.documentId) {
      setEditPayload({ data: values, documentId: variant.documentId })
    } else {
      setNewVariant(values)
    }
  }

  // After create/edit: invalidate supply-variants cache and notify parent.
  useEffect(() => {
    if (!createError && !createLoading && created) { invalidate(); if (onSuccess) onSuccess() }
  }, [createLoading, created, createError])

  useEffect(() => {
    if (!editError && !editLoading && edited) { invalidate(); if (onSuccess) onSuccess() }
  }, [editLoading, edited, editError])

  const isSubmitting = createLoading || editLoading

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize validationSchema={schema}>
      {({ errors, touched, isValid }) => (
        <Form className="flex flex-wrap gap-2 items-start">
          <div className="flex flex-col">
            <label className="field-label required">Nombre</label>
            <Field className="field-input" name="name" type="text" placeholder="Nombre" />
            {touched.name && errors.name && <p className="alert-field">{errors.name}</p>}
          </div>
          <div className="flex flex-col">
            <label className="field-label required">Tipo</label>
            <Field as="select" className="field-select" name="type">
              <option value="">-- Tipo --</option>
              <option value="tamano">Tamaño</option>
              <option value="color">Color</option>
              <option value="empaque">Empaque</option>
            </Field>
            {touched.type && errors.type && <p className="alert-field">{errors.type}</p>}
          </div>
          <div className="flex gap-2 items-end self-end pb-0.5">
            <button type="submit" disabled={isSubmitting || !isValid} className="btn-primary disabled:opacity-50">
              {isSubmitting ? '...' : isEdit ? 'Guardar' : 'Agregar'}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SupplyVariantForm
