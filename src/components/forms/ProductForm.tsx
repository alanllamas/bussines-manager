'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import { Product } from "@/api/hooks/getProducts"
import useCreateProduct, { CreateProductReq } from "@/api/hooks/products/useCreateProduct"
import useEditProduct from "@/api/hooks/products/useEditProduct"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

const ProductForm: React.FC<{ product?: Product; onSuccess?: () => void }> = ({ product, onSuccess }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
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
    if (createError && !createLoading) {
      toast.error('Error al crear el producto')
    } else if (!createError && !createLoading && created) {
      toast.success('Producto creado')
      const id = (created as any)?.data?.documentId
      if (id) router.push(`/products/${id}?edit=1`)
      else if (onSuccess) onSuccess()
    }
  }, [createLoading, created, createError])

  useEffect(() => {
    if (editError && !editLoading) {
      toast.error('Error al guardar el producto')
    } else if (!editError && !editLoading && edited) {
      toast.success('Producto guardado')
      mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/products'))
      if (onSuccess) onSuccess()
    }
  }, [editLoading, edited, editError])

  const isSubmitting = createLoading || editLoading

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      {() => (
        <Form className="flex flex-col gap-4 w-full max-w-sm">
          <div className="field-group">
            <label className="field-label">Nombre</label>
            <Field className="field-input" name="name" type="text" />
          </div>
          <div className="field-group">
            <label className="field-label">Precio</label>
            <Field className="field-input" name="price" type="number" step="0.01" min="0" />
          </div>
          <div className="field-group">
            <label className="field-label">Unidad de medida</label>
            <Field as="select" className="field-select" name="measurement_unit">
              <option value="">-- Seleccionar --</option>
              <option value="kg">Kg</option>
              <option value="pza">Pza</option>
              <option value="lt">Lt</option>
            </Field>
          </div>
          <div className="field-group">
            <label className="field-label">Impuestos (%)</label>
            <Field className="field-input" name="taxes" type="number" step="0.01" min="0" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear producto'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ProductForm
