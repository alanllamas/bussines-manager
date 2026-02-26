'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import { Product } from "@/api/hooks/getProducts"
import useCreateProduct, { CreateProductReq } from "@/api/hooks/products/useCreateProduct"
import useEditProduct from "@/api/hooks/products/useEditProduct"
import { useRouter } from "next/navigation"

const fieldClass = "border border-surface-300 rounded-sm px-2"

const ProductForm: React.FC<{ product?: Product; onSuccess?: () => void }> = ({ product, onSuccess }) => {
  const router = useRouter()
  const isEdit = !!product

  const [newProduct, setNewProduct] = useState<CreateProductReq>()
  const [editPayload, setEditPayload] = useState<{ data: CreateProductReq; documentId: string }>()

  const { product: created, error: createError, isLoading: createLoading } = useCreateProduct(newProduct)
  const { product: edited, error: editError, isLoading: editLoading } = useEditProduct(editPayload)

  const initialValues: CreateProductReq = {
    name: product?.name ?? '',
    price: product?.price ?? 0,
    measurement_unit: product?.measurement_unit ?? '',
    taxes: product?.taxes ?? 0,
  }

  const handleSubmit = (values: CreateProductReq) => {
    if (isEdit && product?.documentId) {
      setEditPayload({ data: values, documentId: product.documentId })
    } else {
      setNewProduct(values)
    }
  }

  useEffect(() => {
    if (!createError && !createLoading && created) {
      const id = (created as any)?.data?.documentId
      if (id) router.push(`/products/${id}?edit=1`)
      else if (onSuccess) onSuccess()
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
        <Form className="text-surface-600 flex flex-col gap-2 w-80">
          <div className="flex justify-between">
            <label className="px-2">Nombre:</label>
            <Field className={fieldClass} name="name" type="text" />
          </div>
          <div className="flex justify-between">
            <label className="px-2">Precio:</label>
            <Field className={fieldClass} name="price" type="number" step="0.01" min="0" />
          </div>
          <div className="flex justify-between">
            <label className="px-2">Unidad de medida:</label>
            <Field as="select" className={fieldClass + ' bg-white'} name="measurement_unit">
              <option value="">-- Unidad --</option>
              <option value="kg">Kg</option>
              <option value="pza">Pza</option>
              <option value="lt">Lt</option>
            </Field>
          </div>
          <div className="flex justify-between">
            <label className="px-2">Impuestos (%):</label>
            <Field className={fieldClass} name="taxes" type="number" step="0.01" min="0" />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-500 px-4 py-2 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ProductForm
