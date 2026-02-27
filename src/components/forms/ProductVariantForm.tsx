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
  const invalidateVariants = () => mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/product-variants'))

  const [newVariant, setNewVariant] = useState<CreateVariantReq>()
  const [editPayload, setEditPayload] = useState<{ data: CreateVariantReq; documentId: string }>()

  const { variant: created, error: createError, isLoading: createLoading } = useCreateProductVariant(newVariant)
  const { variant: edited, error: editError, isLoading: editLoading } = useEditProductVariant(editPayload)

  const initialValues: CreateVariantReq = {
    name: variant?.name ?? '',
    type: variant?.type ?? '',
  }

  const handleSubmit = (values: CreateVariantReq) => {
    if (isEdit && variant?.documentId) {
      setEditPayload({ data: values, documentId: variant.documentId })
    } else {
      setNewVariant(values)
    }
  }

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
        <Form className="flex gap-2 items-start">
          <div className="flex flex-col">
            <label className="field-label required">Nombre</label>
            <Field className="field-input" name="name" type="text" placeholder="Nombre" />
            {touched.name && errors.name && <p className="alert-field">{errors.name}</p>}
          </div>
          <Field as="select" className="field-select" name="type">
            <option value="">-- Tipo --</option>
            <option value="color">Color</option>
            <option value="tamano">Tamaño</option>
            <option value="empaque">Empaque</option>
          </Field>
          <button type="submit" disabled={isSubmitting || !isValid} className="btn-primary disabled:opacity-50">
            {isSubmitting ? '...' : isEdit ? 'Guardar' : 'Agregar'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default ProductVariantForm
