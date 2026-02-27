'use client'
import React, { ChangeEvent } from "react"
import { DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { FormDialog } from '@/components/ui'
import { Field, FieldArray, Form, Formik, useField, useFormikContext } from "formik"
import * as Yup from "yup"
import logo from "@/public/logo.png"
import type { Supply } from "@/types"
import useGetSupplies from "@/api/hooks/supplies/getSupplies"

export type EPurchaseSupply = {
  name: string;
  supply: number;
  price: number;
  quantity: number;
  supply_total: number;
  supply_variants: string[];
  unit: string;
}

export type PurchaseInitialValues = {
  purchase_number: number;
  purchase_date: number;
  purchase_reason: string;
  purchase_status: string;
  supplies: EPurchaseSupply[];
  shipping_cost: number;
  subtotal: number;
  total: number;
  comments: string;
}

export type createPurchaseReq = {
  purchase_number: number;
  purchase_date: Date;
  purchase_reason: string;
  purchase_status: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  comments: string;
  supplies: {
    supply: [number];
    quantity: number;
    supply_total: number;
    supply_variants: string[];
    price: number;
  }[];
}

export const emptyPurchaseSupply: EPurchaseSupply = {
  name: '',
  supply: 0,
  price: 0,
  supply_variants: [],
  quantity: 0,
  supply_total: 0,
  unit: '',
}

const PURCHASE_REASONS: { value: string; label: string }[] = [
  { value: 'supplies', label: 'Insumos' },
  { value: 'tools', label: 'Herramientas' },
  { value: 'food', label: 'Comida' },
  { value: 'drinks', label: 'Bebidas' },
  { value: 'other', label: 'Otro' },
]

const PURCHASE_STATUSES: { value: string; label: string }[] = [
  { value: 'planned', label: 'Planeada' },
  { value: 'send', label: 'Enviada' },
  { value: 'paid', label: 'Pagada' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'completed', label: 'Completada' },
  { value: 'canceled', label: 'Cancelada' },
]

const purchaseSchema = Yup.object({
  purchase_reason: Yup.string().required('Selecciona una razón'),
  supplies: Yup.array().of(
    Yup.object({
      supply: Yup.number().min(1, 'Selecciona un insumo').required('Selecciona un insumo'),
      quantity: Yup.number().min(0.01, 'La cantidad debe ser mayor a 0').required('Cantidad requerida'),
    })
  ).min(1, 'Agrega al menos un insumo'),
  shipping_cost: Yup.number().min(0, 'El envío no puede ser negativo').required('Ingresa el envío (0 si no aplica)'),
})

const TicketsForm: React.FC<any> = ({ sendCreate, initialFormValues, handleSubmit, isOpen, sendClose, editPurchase, apiError }) => {
  const { supplies: suppliesData, isLoading: suppliesLoading } = useGetSupplies()
  const supplies = suppliesData?.data ?? []

  const SubtotalField = (props: { className: string; placeholder: string; disabled?: boolean; id: string; name: string; type: string }) => {
    const { values: { supplies: supplyItems }, touched, setFieldValue } = useFormikContext<PurchaseInitialValues>()
    const [field, meta] = useField(props)
    React.useEffect(() => {
      if (supplyItems && (touched as any).supplies) {
        const subtotal = supplyItems.reduce((acc: number, s: EPurchaseSupply) => acc + Number(s.supply_total), 0)
        setFieldValue('subtotal', subtotal)
      }
    }, [supplyItems, (touched as any).supplies, setFieldValue])
    return <><input {...props} {...field} />{!!meta.touched && !!meta.error && <div>{meta.error}</div>}</>
  }

  const TotalField = (props: { required: boolean; className: string; placeholder: string; disabled?: boolean; id: string; name: string; type: string }) => {
    const { values: { subtotal, shipping_cost }, touched, setFieldValue } = useFormikContext<PurchaseInitialValues>()
    const [field, meta] = useField(props)
    React.useEffect(() => {
      setFieldValue('total', Number(subtotal) + Number(shipping_cost))
    }, [subtotal, shipping_cost, setFieldValue])
    return <><input {...props} {...field} />{!!meta.touched && !!meta.error && <div>{meta.error}</div>}</>
  }

  const SupplyVariantsField = ({ supplies: allSupplies, index }: { supplies?: Supply[]; index: number }) => {
    const { values } = useFormikContext<PurchaseInitialValues>()
    const currentSupply = allSupplies?.find(s => s.id === values.supplies[index]?.supply)
    const allVariants = currentSupply?.supply_variants ?? []
    const selectedDocIds: string[] = values.supplies[index]?.supply_variants ?? []
    const selectedDocIdSet = new Set(selectedDocIds)
    const availableVariants = allVariants.filter(v => v.documentId && !selectedDocIdSet.has(v.documentId))

    return (
      <FieldArray name={`supplies.${index}.supply_variants`}>
        {({ remove: variantRemove, push: variantPush }) => (
          <div className="mt-2">
            <label className="field-label mb-1">Variantes</label>
            {selectedDocIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedDocIds.map((docId, vi) => {
                  const variant = allVariants.find(v => v.documentId === docId)
                  return (
                    <span key={vi} className="flex items-center gap-1 bg-primary-50 border border-primary-200 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                      {variant?.name ?? docId}
                      <button type="button" onClick={() => variantRemove(vi)} className="hover:text-red-600 leading-none">×</button>
                    </span>
                  )
                })}
              </div>
            )}
            {allVariants.length > 0 ? (
              availableVariants.length > 0 ? (
                <select className="field-select" value="" onChange={(e) => { if (e.target.value) variantPush(e.target.value) }}>
                  <option value="">+ Agregar variante</option>
                  {availableVariants.map((v, i) => <option key={i} value={v.documentId}>{v.name}</option>)}
                </select>
              ) : <p className="text-xs text-surface-400">Todas las variantes agregadas</p>
            ) : currentSupply && <p className="text-xs text-surface-400">Sin variantes para este insumo</p>}
          </div>
        )}
      </FieldArray>
    )
  }

  return (
    <>
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => sendCreate()}>
          <span className="material-symbols-outlined text-[16px]">add</span>
          Crear compra
        </button>
      </div>
      {initialFormValues && (
        <Formik
          initialValues={initialFormValues}
          validationSchema={purchaseSchema}
          onSubmit={async (values: PurchaseInitialValues) => values ? handleSubmit(values) : null}
        >
          {({ values, setFieldValue, errors, touched, isValid, dirty }) => (
            <FormDialog isOpen={isOpen} onClose={() => sendClose()} panelClassName="max-w-lg w-full space-y-4 border bg-surface-50 p-4 sm:p-6 lg:p-10 shadow-2xl text-surface-900 max-h-screen overflow-y-auto">
              <div className="flex justify-between gap-2">
                <img className="w-40 sm:w-52" src={logo.src} alt="" />
                <DialogTitle className="font-bold flex flex-col mt-6 text-sm">
                  <span>Compra: {String(values.purchase_number ?? '').padStart(5, '0')}</span>
                  <span>Fecha: {new Date().toLocaleDateString()}</span>
                </DialogTitle>
              </div>

              <Form>
                <Field className="hidden" name="purchase_number" type="number" />
                <Field className="hidden" name="purchase_date" type="number" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="field-group">
                    <label className="field-label required">Razón de compra</label>
                    <Field as="select" className="field-select" name="purchase_reason">
                      <option value="">-- Seleccionar --</option>
                      {PURCHASE_REASONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Field>
                    {touched.purchase_reason && errors.purchase_reason && <p className="alert-field">{errors.purchase_reason as string}</p>}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Estado</label>
                    <Field as="select" className="field-select" name="purchase_status">
                      <option value="">-- Seleccionar --</option>
                      {PURCHASE_STATUSES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Field>
                  </div>
                </div>

                <FieldArray name="supplies">
                  {({ remove, push }) => (
                    <div>
                      <div className="flex justify-between items-center p-2">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Insumos</h4>
                        <button type="button" className="btn-secondary" onClick={() => push(emptyPurchaseSupply)}>
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Agregar
                        </button>
                      </div>
                      {(touched as any).supplies && typeof errors.supplies === 'string' && (
                        <p className="alert-field px-2">{errors.supplies}</p>
                      )}
                      {values.supplies.map((_, index) => (
                        <Disclosure key={index}>
                          {({ open }) => (
                            <div>
                              <div className="flex justify-between items-center">
                                <DisclosureButton className="py-2 px-2 w-full flex bg-surface-100 justify-between items-center">
                                  <span className="material-symbols-outlined text-[16px] text-surface-400">{open ? 'expand_less' : 'expand_more'}</span>
                                  <p className="mx-1 flex items-center gap-1 flex-1">
                                    {values.supplies[index].name || 'Nuevo insumo'}
                                    {(touched as any).supplies?.[index] && (errors as any).supplies?.[index] && (
                                      <>
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                        <span className="text-xs text-red-500">Revisa este insumo</span>
                                      </>
                                    )}
                                  </p>
                                  <span className="mx-1 text-sm">{values.supplies[index].quantity ? `${values.supplies[index].quantity} ${values.supplies[index].unit}` : ''}</span>
                                  <span className="mx-1 text-sm">{values.supplies[index].supply_total ? `$ ${values.supplies[index].supply_total}` : ''}</span>
                                </DisclosureButton>
                                <button className="btn-danger" type="button" onClick={() => remove(index)}>
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                              <DisclosurePanel>
                                <div className="p-2 pt-0 border border-surface-200 w-full">
                                  <div className="flex flex-col gap-2">
                                    <div className="field-group">
                                      <label>Insumo <span className="text-red-500">*</span></label>
                                      <Field as="select" className="field-select" value={values.supplies[index].supply}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                          const s = supplies.find(s => s.id === Number(e.target.value)) ?? null
                                          setFieldValue(`supplies.${index}.supply`, s?.id ?? 0)
                                          setFieldValue(`supplies.${index}.name`, s?.name ?? '')
                                          setFieldValue(`supplies.${index}.unit`, s?.measurement_unit ?? '')
                                          setFieldValue(`supplies.${index}.price`, s?.cost ?? 0)
                                          setFieldValue(`supplies.${index}.supply_variants`, [])
                                        }}
                                        name={`supplies.${index}.supply`}
                                      >
                                        <option value="">Insumo</option>
                                        {!suppliesLoading && supplies.map((s, i) => (
                                          <option key={i} value={s.id}>{s.name}</option>
                                        ))}
                                      </Field>
                                      {(touched as any).supplies?.[index]?.supply && (errors as any).supplies?.[index]?.supply && (
                                        <p className="alert-field">{(errors as any).supplies[index].supply}</p>
                                      )}
                                    </div>
                                    <SupplyVariantsField supplies={supplies} index={index} />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="field-group">
                                        <label>Cantidad {values.supplies[index].unit ? `(${values.supplies[index].unit})` : ''} <span className="text-red-500">*</span></label>
                                        <Field className="field-input" name={`supplies.${index}.quantity`} type="number" step="0.01" placeholder="cantidad"
                                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            const qty = Number(e.target.value)
                                            const price = Number(values.supplies[index].price)
                                            setFieldValue(`supplies.${index}.quantity`, qty)
                                            setFieldValue(`supplies.${index}.supply_total`, price * qty)
                                          }}
                                        />
                                        {(touched as any).supplies?.[index]?.quantity && (errors as any).supplies?.[index]?.quantity && (
                                          <p className="alert-field">{(errors as any).supplies[index].quantity}</p>
                                        )}
                                      </div>
                                      <div className="field-group">
                                        <label>Precio</label>
                                        <Field className="field-input bg-surface-100" name={`supplies.${index}.price`} disabled type="number" placeholder="precio" />
                                      </div>
                                      <div className="field-group">
                                        <label>Monto</label>
                                        <Field className="field-input bg-surface-100" name={`supplies.${index}.supply_total`} disabled type="number" placeholder="total" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <div className="field-group mt-4">
                  <label className="field-label">Comentarios</label>
                  <Field as="textarea" className="field-textarea" name="comments" rows="2" placeholder="Comentarios" />
                </div>

                <div className="flex justify-end mt-4">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 w-full sm:w-1/2">
                    <label className="text-sm text-right">Subtotal</label>
                    <SubtotalField className="field-input bg-surface-100" disabled id="subtotal" name="subtotal" type="number" placeholder="subtotal" />
                    <label className="text-sm text-right">Envío <span className="text-red-500">*</span></label>
                    <Field className="field-input" id="shipping_cost" name="shipping_cost" type="number" placeholder="Envío" />
                    {touched.shipping_cost && errors.shipping_cost && <p className="alert-field col-span-2 text-right">{errors.shipping_cost as string}</p>}
                    <label className="text-sm font-semibold text-right">Total</label>
                    <TotalField required className="field-input bg-surface-100 font-semibold" disabled id="total" name="total" type="number" placeholder="total" />
                  </div>
                </div>

                {apiError && (
                  <div className="alert-error mt-4">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    Error al guardar. Por favor intenta de nuevo.
                  </div>
                )}

                <div className="flex gap-4 justify-end mt-6">
                  <button className="btn-danger" type="button" onClick={() => sendClose()}>Cancelar</button>
                  <button className="btn-primary disabled:opacity-50" type="submit" disabled={!isValid || !dirty}>
                    {editPurchase ? 'Editar' : 'Crear'}
                  </button>
                </div>
              </Form>
            </FormDialog>
          )}
        </Formik>
      )}
    </>
  )
}

export default TicketsForm
