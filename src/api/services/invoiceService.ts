// invoiceService.ts — fiscal aggregation logic extracted from getInvoice.ts (ADR-005).
// Responsible for building the line-item summary (Resume) used in invoice print formats
// and for the invoice edit form's read-only preview.
//
// Extracted because this is pure business logic (not a data-fetching concern) and
// mixing it into a SWR hook made testing and reuse impossible.

import { Client, Ticket, TicketProduct } from '@/types'

// ResumeData — one aggregated line in the invoice summary.
// Products from multiple tickets with the same name + price are merged into a single line.
// `envios` (shipping) is stored as a special ResumeData entry in Resume, not in products[].
export type ResumeData = {
  price?: number
  quantity?: number
  unit?: string
  taxes?: number         // tax percentage (e.g. 16 for 16% IVA)
  variants?: string[]
  total?: number         // pre-tax subtotal + tax amount
  sub_total?: number     // pre-tax subtotal (price × quantity)
  total_taxes?: number   // tax amount only (sub_total × taxes/100)
  name: string
}

// Resume — the full structured breakdown returned by generateResume.
// products[]: aggregated product lines (one per unique name+price combination across all tickets)
// envios: aggregated shipping line (quantity = number of tickets with shipping_price)
// total / sub_total / total_taxes: grand totals across all lines including shipping
export type Resume = {
  products: ResumeData[]
  envios: ResumeData
  total: number
  sub_total: number
  total_taxes: number
}

// Totals — numeric-only snapshot of Resume grand totals.
// Used separately when the caller only needs the totals and not the line-item breakdown.
export type Totals = {
  total: number
  sub_total: number
  total_taxes: number
}

// generateResume — builds a deduplicated, tax-aware invoice line-item summary.
//
// filteredTickets: array of ticket ids (strings) selected for this invoice.
//   These come from the InvoicesForm multiselect and may be a subset of all tickets.
// tickets: full Ticket[] fetched from Strapi (used to look up each id in filteredTickets).
// client: optional client record — needed to determine shipping_invoice flag (see below).
//
// Returns:
//   totals — grand-total numbers for quick display
//   results — full Resume with product lines + envios for print format rendering
export function generateResume(
  filteredTickets: string[],
  tickets: Ticket[],
  client?: Client
): { totals: Totals; results: Resume } {

  // Phase 1: aggregate all products and shipping across the selected tickets.
  // acc is keyed by product name — same name + same price = merge into one line.
  // 'envios' is a reserved key for the shipping accumulator.
  // Initial value for 'envios' has quantity:0 which acts as "no shipping yet" sentinel.
  const resume = filteredTickets?.reduce((acc: { [key: string]: any }, ticket_id: string) => {
    // tickets[] uses numeric id; filteredTickets uses string ids — coerce before compare.
    const ticket = tickets.find((value) => value.id === Number(ticket_id))
    if (ticket) {
      ticket.products.reduce((prodAcc: { [key: string]: any }, prod: TicketProduct) => {
        // If a line with the same product name AND price already exists, merge into it.
        // Same name but different price = separate lines (different SKU or negotiated price).
        if (acc[prod?.product?.name || ''] && acc[prod?.product?.name || '']?.price === prod?.price) {
          // Merge: accumulate total (with tax if applicable), sub_total, quantity, total_taxes.
          acc[prod?.product?.name || ''].total += prod?.product?.taxes
            ? (prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes / 100)
            : prod.product_total
          acc[prod?.product?.name || ''].sub_total += prod.product_total
          acc[prod?.product?.name || ''].quantity += prod.quantity
          acc[prod?.product?.name || ''].total_taxes += prod?.product?.taxes
            ? (prod?.product_total || 0) * (prod?.product?.taxes / 100)
            : 0
        } else {
          // First occurrence: initialize the line with all fields.
          acc[prod?.product?.name || ''] = {
            price: prod.price,
            quantity: prod.quantity,
            unit: prod?.product?.measurement_unit,
            taxes: prod?.product?.taxes,
            variants: [prod.product_variants?.map((variant: any) => variant.name)],
            // total = sub_total + tax. If product has no taxes field, total === sub_total.
            total: prod?.product?.taxes
              ? (prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes / 100)
              : prod.product_total,
            sub_total: prod.product_total,
            total_taxes: prod?.product?.taxes
              ? (prod?.product_total || 0) * (prod?.product?.taxes / 100)
              : 0,
          }
        }
        return prodAcc
      }, {})

      // Handle shipping for this ticket.
      // shipping_invoice flag on client.taxing_info controls whether 16% IVA is added.
      // quantity > 0 means envios is already initialized; just accumulate.
      if (acc['envios'].quantity) {
        if (ticket.shipping_price) {
          acc['envios'].total += client?.taxing_info?.shipping_invoice
            ? ticket.shipping_price + ticket.shipping_price * (16 / 100)
            : ticket.shipping_price
          acc['envios'].sub_total += ticket.shipping_price
          acc['envios'].total_taxes += client?.taxing_info?.shipping_invoice
            ? ticket.shipping_price * (16 / 100)
            : 0
          acc['envios'].quantity += 1
        }
      } else if (ticket.shipping_price) {
        // First ticket with shipping — initialize the envios line.
        acc.envios = {
          price: 0,
          quantity: 1,
          unit: '',
          taxes: 16,  // standard IVA rate; applied only if client.taxing_info.shipping_invoice is true
          variants: [],
          sub_total: ticket.shipping_price || 0,
          total: client?.taxing_info?.shipping_invoice
            ? ticket.shipping_price + ticket.shipping_price * (16 / 100)
            : ticket.shipping_price,
          total_taxes: client?.taxing_info?.shipping_invoice
            ? ticket.shipping_price * (16 / 100)
            : 0,
        }
      }
    }
    return acc
  }, {
    // Initial accumulator — envios.quantity = 0 signals "no shipping encountered yet".
    envios: {
      price: 0,
      quantity: 0,
      unit: '',
      taxes: 16,
      variants: [],
      sub_total: 0,
      total: 0,
      total_taxes: 0,
    },
  })

  // Phase 2: compute grand totals across all lines (products + envios).
  // sub_total intentionally excludes envios — shipping is a separate line on the invoice
  // and the sub_total shown to the client is products-only.
  const totals = Object.entries(resume).reduce(
    (acc: Totals, [key, value]) => {
      const { total, sub_total, total_taxes } = value as ResumeData
      return {
        total: (total || 0) + acc.total,
        sub_total: key === 'envios' ? acc.sub_total : (sub_total || 0) + acc.sub_total,
        total_taxes: (total_taxes || 0) + acc.total_taxes,
      }
    },
    { total: 0, sub_total: 0, total_taxes: 0 }
  )

  // Phase 3: reshape the keyed accumulator into the Resume structure.
  // envios is pulled out separately so products[] contains only product lines.
  const { envios, ...rest } = resume
  const results: Resume = {
    ...totals,
    envios: { ...envios, name: 'envios' },
    // Convert the keyed object into an array, adding `name` from the key.
    products: Object.entries(rest).map(([key, value]) => ({ name: key, ...value })),
  }

  return { totals, results }
}
