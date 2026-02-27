'use-client'
import { fetcher } from '../../fetcher';
import useSWR from 'swr';
import { Invoice } from './getInvoices';
import { Client } from '../clients/getClient';
import { TicketProduct, Ticket } from './getTicketsByClient';

export type Meta = {
  pagination?: {
    total: number;
    page: number;
    count:number;
  }
}

export type StrapiFile = {
    files?: File
    ref: string
    refId: string
    field: string
  }

export type InvoiceInitialValues = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string;
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: Record<string, unknown>
}

export type createInvoiceReq = {
  payment_date?: Date | null;
  invoice_number?: number;
  invoice_id: string;
  client: string[];
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: string
}

type ResumeData = {
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
  total: number,
  sub_total: number,
  total_taxes: number
}
export type Totals = {
  total: number,
  sub_total: number,
  total_taxes: number
}
export const PrintInvoiceFormat = (contentRef: any,client_name: any,initial_date: any,ending_date: any) => ({
  contentRef,
  documentTitle: `Corte-${client_name}-${initial_date}-${ending_date}`
});

export const generateResume = (filteredTickets: InvoiceInitialValues['tickets'], tickets:Ticket[], client?:Client) => {
  const resume = filteredTickets?.reduce((acc: {[key: string]: any}, ticket_id: string) => {
      // console.log(ticket_id);
    const ticket = tickets.find((value, i) => { return value.id === Number(ticket_id)})
    if (ticket) {
      // console.log(ticket);
      ticket.products.reduce((prodAcc: {[key: string]: any}, prod: TicketProduct) => {
        // prodAcc = {
        //   ...prodAcc,
        //   [prod?.product?.name || '']: {
        //     ...prod,
        //     name: prod?.product?.name,
        //   }
        // }

        if (acc[prod?.product?.name || ''] && acc[prod?.product?.name || '']?.price === prod?.price) {
          // console.log('prod.product_total: ', prod.product_total);
          acc[prod?.product?.name || ''].total += prod?.product?.taxes ? ((prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes/100)) : prod.product_total
          acc[prod?.product?.name || ''].sub_total += prod.product_total
          acc[prod?.product?.name || ''].quantity += prod.quantity
          acc[prod?.product?.name || ''].total_taxes += prod?.product?.taxes ? (prod?.product_total || 0) * (prod?.product?.taxes/100) : 0
          
        } else {
          acc[prod?.product?.name || ''] = {
            price: prod.price,
            quantity: prod.quantity,
            unit: prod?.product?.measurement_unit,
            taxes: prod?.product?.taxes,
            variants: [prod.product_variants?.map((variant: any) => variant.name)],
            total:  prod?.product?.taxes ? ((prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes/100)) : prod.product_total,
            sub_total: prod.product_total,
            total_taxes: prod?.product?.taxes ? (prod?.product_total || 0) * (prod?.product?.taxes/100) : 0
          }
        }
        return prodAcc
      }, {})
      // console.log('client: ', client);

      if (acc['envios'].quantity) {
        if (ticket.shipping_price) {
          acc['envios'].total += client?.taxing_info?.shipping_invoice ? ticket.shipping_price + (ticket.shipping_price * (16/100)) : ticket.shipping_price
          acc['envios'].sub_total += ticket.shipping_price
          acc['envios'].total_taxes += client?.taxing_info?.shipping_invoice ? (ticket.shipping_price * (16/100)) : 0
          acc['envios'].quantity += 1
        }
      } else  if (ticket.shipping_price) {
        acc.envios = {
          price: 0,
          quantity: 1,
          unit: '',
          taxes: 16,
          variants: [],
          sub_total: ticket.shipping_price || 0,
          total: client?.taxing_info?.shipping_invoice ? ticket.shipping_price + (ticket.shipping_price * (16/100)) : ticket.shipping_price,
          total_taxes: client?.taxing_info?.shipping_invoice ? (ticket.shipping_price * (16/100)) : 0
        }
      }
    }
    return acc
  },{
    envios: {
      price: 0,
      quantity: 0,
      unit: '',
      taxes: 16,
      variants: [],
      sub_total:  0,
      total: 0,
      total_taxes: 0
    }
  })

  console.log('resume: ', resume);
  const totals = Object.entries(resume).reduce((acc: {total: number, sub_total: number, total_taxes: number},[key, value]) => {
    const { total, sub_total, total_taxes} = value
    // console.log('key: ', key);
    // console.log('value: ', value);
    
    acc = {
      total: (total || 0) + (acc.total),
      sub_total: key === 'envios' ? acc.sub_total : (sub_total || 0) + (acc.sub_total),
      total_taxes: (total_taxes || 0) + (acc.total_taxes) 
    }
    return acc
  }, {total: 0, sub_total: 0, total_taxes: 0})
  // console.table(totals);
  const { envios, ...rest} = resume
  // console.log('envios: ', envios);
  const results: Resume = {
    ...totals,
    envios: {
      ...envios,
      name: 'envios'
    },
    products: Object.entries(rest).map(([key, value]) => ({name: key, ...value}))
  }
  // console.table(results);
  return {
    totals,
    results
  }
}
async function GetInvoice([url]: [string]) {
  return await fetcher<{data: Invoice, meta: Meta}>(url, { method: 'GET' });
}

export default function useGetInvoice(id: number) {
  const url = id
    ? `/api/invoices/${id}?populate=client&populate=client.taxing_info&populate=tickets&populate=tickets.products&populate=tickets.products.product&populate=tickets.products.product_variants`
    : null;

  const { data, isLoading, error } = useSWR(
    url ? [url] : null,
    GetInvoice,
  );

  const invoice = data;

  return {
    invoice,
    error,
    isLoading,
  };
}
