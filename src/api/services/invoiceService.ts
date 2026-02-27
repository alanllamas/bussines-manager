import { Client, Ticket, TicketProduct } from '@/types'

export type ResumeData = {
  price?: number
  quantity?: number
  unit?: string
  taxes?: number
  variants?: string[]
  total?: number
  sub_total?: number
  total_taxes?: number
  name: string
}

export type Resume = {
  products: ResumeData[]
  envios: ResumeData
  total: number
  sub_total: number
  total_taxes: number
}

export type Totals = {
  total: number
  sub_total: number
  total_taxes: number
}

export function generateResume(
  filteredTickets: string[],
  tickets: Ticket[],
  client?: Client
): { totals: Totals; results: Resume } {
  const resume = filteredTickets?.reduce((acc: { [key: string]: any }, ticket_id: string) => {
    const ticket = tickets.find((value) => value.id === Number(ticket_id))
    if (ticket) {
      ticket.products.reduce((prodAcc: { [key: string]: any }, prod: TicketProduct) => {
        if (acc[prod?.product?.name || ''] && acc[prod?.product?.name || '']?.price === prod?.price) {
          acc[prod?.product?.name || ''].total += prod?.product?.taxes
            ? (prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes / 100)
            : prod.product_total
          acc[prod?.product?.name || ''].sub_total += prod.product_total
          acc[prod?.product?.name || ''].quantity += prod.quantity
          acc[prod?.product?.name || ''].total_taxes += prod?.product?.taxes
            ? (prod?.product_total || 0) * (prod?.product?.taxes / 100)
            : 0
        } else {
          acc[prod?.product?.name || ''] = {
            price: prod.price,
            quantity: prod.quantity,
            unit: prod?.product?.measurement_unit,
            taxes: prod?.product?.taxes,
            variants: [prod.product_variants?.map((variant: any) => variant.name)],
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
        acc.envios = {
          price: 0,
          quantity: 1,
          unit: '',
          taxes: 16,
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

  const { envios, ...rest } = resume
  const results: Resume = {
    ...totals,
    envios: { ...envios, name: 'envios' },
    products: Object.entries(rest).map(([key, value]) => ({ name: key, ...value })),
  }

  return { totals, results }
}
