// ProductForm — create/edit form for a Product (Producto).
// Used in /products/new and the product detail edit panel.
// Mutation pattern: SWR mutation hooks (same as ClientForm).
//
// On create success: redirects to `/products/[documentId]?edit=1` so user can add variants.
// On edit success: broadcasts SWR cache invalidation for all /api/products queries.
'use client'
import React, { useEffect, useState } from "react"
import { Field, Form, Formik } from "formik"
import * as Yup from "yup"
import { Product } from "@/api/hooks/getProducts"
import useCreateProduct, { CreateProductReq } from "@/api/hooks/products/useCreateProduct"
import useEditProduct from "@/api/hooks/products/useEditProduct"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

const productSchema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
  price: Yup.number().min(0, 'El precio no puede ser negativo').required('El precio es requerido'),
  measurement_unit: Yup.string().required('La unidad de medida es requerida'),
  // taxes: percentage (e.g. 16 = 16% IVA); 0 = tax-exempt product.
  taxes: Yup.number().min(0, 'Los impuestos no pueden ser negativos'),
})

// ProductForm — product prop present = edit mode; absent = create mode.
const ProductForm: React.FC<{ product?: Product; onSuccess?: () => void }> = ({ product, onSuccess }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const isEdit = !!product

  // SWR mutation state — undefined until Formik submits, triggers the hook request.
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

  // Create result: redirect to detail page with ?edit=1 (opens variant form immediately).
  // documentId is nested in created.data.documentId (Strapi v5 response shape).
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

  // Edit result: invalidate all /api/products SWR queries and notify parent.
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
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize validationSchema={productSchema}>
      {({ errors, touched, isValid }) => (
        <Form className="flex flex-col gap-4 w-full max-w-sm">
          <div className="field-group">
            <label className="field-label required">Nombre</label>
            <Field className="field-input" name="name" type="text" />
            {touched.name && errors.name && <p className="alert-field">{errors.name}</p>}
          </div>
          <div className="field-group">
            <label className="field-label required">Precio</label>
            <Field className="field-input" name="price" type="number" step="0.01" min="0" />
            {touched.price && errors.price && <p className="alert-field">{errors.price}</p>}
          </div>
          <div className="field-group">
            <label className="field-label required">Unidad de medida</label>
            <Field as="select" className="field-select" name="measurement_unit">
              <option value="">-- Seleccionar --</option>
              <option value="kg">Kg</option>
              <option value="pza">Pza</option>
              <option value="lt">Lt</option>
            </Field>
            {touched.measurement_unit && errors.measurement_unit && <p className="alert-field">{errors.measurement_unit}</p>}
          </div>
          <div className="field-group">
            <label className="field-label">Impuestos (%)</label>
            <Field className="field-input" name="taxes" type="number" step="0.01" min="0" />
            {touched.taxes && errors.taxes && <p className="alert-field">{errors.taxes}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting || !isValid} className="btn-primary disabled:opacity-50">
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
