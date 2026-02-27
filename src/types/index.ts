// Domain types — single source of truth

export type Contact = {
  id?: string
  name: string
  area: string
  email: string
  extension: string
  job_title: string
  phone: string
}

export type TaxingInfo = {
  billing_period: number
  comments: string
  email: string
  invoice_period: number
  payment_method: string
  payment_period: number
  taxing_CFDI_use: string
  taxing_RFC: string
  shipping_invoice: boolean
  taxing_company_name: string
  taxing_method_of_payment: string
  taxing_payment_method: string
  taxing_regime: string
  zip_code: number
}

export type Client = {
  id: number
  documentId: string
  name: string
  taxing_info?: TaxingInfo
  tickets?: Ticket[]
  invoices?: Invoice[]
  contacts?: Contact[]
}

export type ProductVariant = {
  id: number
  documentId: string
  name: string
  type: string
}

export type Product = {
  id: number
  documentId: string
  name: string
  price: number
  measurement_unit: string
  taxes?: number
  product_variants: ProductVariant[]
  total: number
  quantity: number
}

export type TicketProduct = {
  id?: number
  name?: string
  price?: number
  product_variants?: ProductVariant[]
  product_total?: number
  quantity?: number
  measurement_unit?: string
  product?: Product
}

export type Ticket = {
  id: number
  documentId: string
  name: string
  ticket_number: number
  client: Client
  sale_date: Date
  total: number
  sub_total: number
  shipping_price: number
  products: TicketProduct[]
  invoice?: Invoice | null
}

export type StrapiFile = {
  file?: File
  ref: string
  refId: string
  field: string
}

export type Invoice = {
  id?: number
  documentId?: string
  invoice_number?: number
  invoice_id: string
  client: Client
  tickets: Ticket[]
  sub_total: number
  taxes: number
  total: number
  shipping_price?: number
  comments?: string
  inner_comments?: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string
  payment_date?: Date | null
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  resume?: Record<string, unknown>
}
