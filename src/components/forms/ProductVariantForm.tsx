'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import { ProductVariant } from "@/api/hooks/getProducts"
import useCreateProductVariant, { CreateVariantReq } from "@/api/hooks/productVariants/useCreateProductVariant"
import useEditProductVariant from "@/api/hooks/productVariants/useEditProductVariant"

const fieldClass = "border border-neutral-400 rounded-sm px-2"

const ProductVariantForm: React.FC<{
  variant?: ProductVariant;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({ variant, onSuccess, onCancel }) => {
  const isEdit = !!variant

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
      if (onSuccess) onSuccess()
    }
  }, [createLoading, created, createError])

  useEffect(() => {
    if (!editError && !editLoading && edited) {
      if (onSuccess) onSuccess()
    }
  }, [editLoading, edited, editError])

  const isSubmitting = createLoading || editLoading

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      {() => (
        <Form className="flex gap-2 items-center">
          <Field className={fieldClass} name="name" type="text" placeholder="Nombre" />
          <Field as="select" className={fieldClass + ' bg-white'} name="type">
            <option value="">-- Tipo --</option>
            <option value="color">Color</option>
            <option value="tamano">Tamaño</option>
            <option value="empaque">Empaque</option>
          </Field>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-700 px-3 py-1 text-white text-sm disabled:opacity-50"
          >
            {isSubmitting ? '...' : isEdit ? 'Guardar' : 'Agregar'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-3 py-1 text-sm bg-neutral-300">
              Cancelar
            </button>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default ProductVariantForm
