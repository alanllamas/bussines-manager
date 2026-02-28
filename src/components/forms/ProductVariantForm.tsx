// ProductVariantForm — inline create/edit form for a product variant (Variante de Producto).
// Displayed on the /product-variants page as a compact horizontal form.
// Mutation pattern: SWR mutation hooks; invalidateVariants broadcasts cache invalidation
// so the variant list on the same page refreshes without a full reload.
//
// onSuccess: called after create or edit succeeds (used to hide the form or refresh parent).
// onCancel: optional — shows a Cancel button when provided (e.g. when editing inline).
'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import { ProductVariant } from "@/api/hooks/getProducts"
import useCreateProductVariant, { CreateVariantReq } from "@/api/hooks/productVariants/useCreateProductVariant"
import useEditProductVariant from "@/api/hooks/productVariants/useEditProductVariant"
import { useSWRConfig } from "swr"

const variantSchema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
})

const ProductVariantForm: React.FC<{
  variant?: ProductVariant;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ variant, onSuccess, onCancel }) => {
  const isEdit = !!variant
  const { mutate } = useSWRConfig()
  // invalidateVariants — SWR key predicate mutation: refetches all /api/product-variants queries.
  const invalidateVariants = () => mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/product-variants'))

  // SWR mutation state — undefined until Formik submits, triggers the hook request.
  const [newVariant, setNewVariant] = useState<CreateVariantReq>()
  const [editPayload, setEditPayload] = useState<{ data: CreateVariantReq; documentId: string }>()

  const { variant: created, error: createError, isLoading: createLoading } = useCreateProductVariant(newVariant)
  const { variant: edited, error: editError, isLoading: editLoading } = useEditProductVariant(editPayload)

  const initialValues: CreateVariantReq = {
    name: variant?.name ?? '',
    type: variant?.type ?? '',
  }

  // handleSubmit — routes to create or edit based on isEdit flag.
  const handleSubmit = (values: CreateVariantReq) => {
    if (isEdit && variant?.documentId) {
      setEditPayload({ data: values, documentId: variant.documentId })
    } else {
      setNewVariant(values)
    }
  }

  // After create/edit succeeds: invalidate variant list cache and notify parent.
  useEffect(() => {
    if (!createError && !createLoading && created) {
      invalidateVariants()
      if (onSuccess) onSuccess()
    }
  }, [createLoading, created, createError])

  useEffect(() => {
    if (!editError && !editLoading && edited) {
      invalidateVariants()
      if (onSuccess) onSuccess()
    }
  }, [editLoading, edited, editError])

  const isSubmitting = createLoading || editLoading

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize validationSchema={variantSchema}>
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
              <option value="color">Color</option>
              <option value="tamano">Tamaño</option>
              <option value="empaque">Empaque</option>
            </Field>
          </div>
          <div className="flex gap-2 items-end self-end pb-0.5">
            <button type="submit" disabled={isSubmitting || !isValid} className="btn-primary disabled:opacity-50">
              {isSubmitting ? '...' : isEdit ? 'Guardar' : 'Agregar'}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ProductVariantForm
