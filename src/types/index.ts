// Domain types — single source of truth for all business entities.
// These types mirror the Strapi v5 collection schemas. All SWR hooks and components
// import domain types from here (ADR-003: eliminate scattered `any` types).
//
// Strapi v5 note: every entity has both `id` (numeric, internal) and `documentId` (string, public).
// API calls for PUT/relations use `documentId`; some legacy hooks still use numeric `id` —
// see useEditTicket.ts for the known inconsistency.
//
// Type hierarchy:
//   SupplyVariant, Supply, PurchaseSupply, Purchase  — purchases/insumos domain
//   Contact, TaxingInfo, Client                       — client domain (Clientes)
//   ProductVariant, Product, TicketProduct, Ticket    — sales domain (Notas)
//   StrapiFile                                        — file attachment (invoice PDF, etc.)
//   Invoice                                           — billing domain (Cortes)

// SupplyVariant — a presentation/variant of a supply (insumo), e.g. "Bolsa 25kg", "Granel".
// description is optional and shown in purchase line items to clarify the variant.
export type SupplyVariant = {
  id: number
  documentId: string
  name: string
  type: string
  description?: string
}

// Supply — an insumo (raw material or consumable) purchased from suppliers.
// supply_variants: populated when fetched via getSupplies (for PurchaseForm variant selector).
export type Supply = {
  id: number
  documentId: string
  name: string
  quantity: number
  measurement_unit: string
  cost: number
  supply_variants: SupplyVariant[]
}

// PurchaseSupply — a line item within a Purchase (many-to-many join with extra fields).
// id is optional because new line items don't have a Strapi id until saved.
// supply_variants: the selected variants for this line item.
export type PurchaseSupply = {
  id?: number
  supply?: Supply
  quantity: number
  price: number
  supply_total: number       // price × quantity for this line
  supply_variants?: SupplyVariant[]
}

// Purchase — a supplier purchase order (Compra).
// purchase_number: zero-padded display number (e.g. 00042).
// purchase_status: free-text status field (e.g. "pendiente", "recibida").
export type Purchase = {
  id: number
  documentId: string
  purchase_number: number
  purchase_date: Date
  shipping_cost?: number
  total: number
  subtotal: number
  purchase_reason: string
  purchase_status?: string
  supplies: PurchaseSupply[]
  comments?: string
}

// Contact — a person associated with a client (e.g. purchasing agent, accountant).
// id is optional because contacts may be created inline without a Strapi id initially.
export type Contact = {
  id?: string
  name: string
  area: string
  email: string
  extension: string
  job_title: string
  phone: string
}

// TaxingInfo — billing/fiscal configuration for a client.
// shipping_invoice: if true, shipping charges on invoices include 16% IVA (used by generateResume).
// taxing_RFC / taxing_regime / taxing_CFDI_use: SAT (Mexican tax authority) fiscal identifiers.
export type TaxingInfo = {
  billing_period: number
  comments: string
  email: string
  invoice_period: number
  payment_method: string
  payment_period: number
  taxing_CFDI_use: string
  taxing_RFC: string
  shipping_invoice: boolean  // controls whether shipping IVA is added in invoice generation
  taxing_company_name: string
  taxing_method_of_payment: string
  taxing_payment_method: string
  taxing_regime: string
  zip_code: number
}

// Client — a customer (Cliente). UI label: "Clientes".
// taxing_info: populated on detail pages; undefined on list views.
// tickets/invoices/contacts: populated only when explicitly requested via Strapi populate.
export type Client = {
  id: number
  documentId: string
  name: string
  taxing_info?: TaxingInfo
  tickets?: Ticket[]
  invoices?: Invoice[]
  contacts?: Contact[]
}

// ProductVariant — a variant of a product (e.g. "Talla M", "Color Rojo").
export type ProductVariant = {
  id: number
  documentId: string
  name: string
  type: string
}

// Product — a sellable item. taxes is a percentage (e.g. 16 for 16% IVA).
// product_variants: populated when fetched via getProducts (for ticketsForm variant selector).
export type Product = {
  id: number
  documentId: string
  name: string
  price: number
  measurement_unit: string
  taxes?: number             // percentage (e.g. 16 = 16% IVA); undefined = tax-exempt
  product_variants: ProductVariant[]
  total: number
  quantity: number
}

// TicketProduct — a line item within a Ticket (many-to-many join with extra fields).
// All fields are optional because Strapi may return partial data depending on populate depth.
// product_total = price × quantity for this line (computed by Strapi or form logic).
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

// Ticket — a sales receipt / work order. UI label: "Nota".
// invoice: populated when fetched with populate=invoice; null if not yet billed.
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
  invoice?: Invoice | null   // null = unbilled; Invoice = already associated with a Corte
}

// StrapiFile — represents an uploaded file attachment on an entity.
// Used for invoice_file, proof_of_payment, payment_supplement on Invoice.
// ref/refId/field: Strapi upload API fields identifying where the file is attached.
export type StrapiFile = {
  file?: File   // browser File object (present when uploading, absent after save)
  ref: string
  refId: string
  field: string
}

// Invoice — a billing summary grouping multiple tickets. UI label: "Corte".
// id/documentId are optional because a new Invoice doesn't have them until saved.
// resume: stored as JSON in Strapi; the generateResume result serialized at save time.
// invoice_status: free-text (e.g. "pendiente", "pagada", "enviada").
export type Invoice = {
  id?: number
  documentId?: string
  invoice_number?: number
  invoice_id: string          // display identifier (separate from Strapi documentId)
  client: Client
  tickets: Ticket[]
  sub_total: number
  taxes: number
  total: number
  shipping_price?: number
  comments?: string
  inner_comments?: string     // internal notes not shown to client
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
  resume?: Record<string, unknown>  // serialized generateResume result stored in Strapi
}
