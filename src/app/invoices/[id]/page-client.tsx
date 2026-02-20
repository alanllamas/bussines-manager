'use client'
import React, { useEffect, useState } from "react"
import { useAuth } from "@/app/context/AuthUserContext";
import InvoiceFormat from "@/components/invoices/invoiceFormat";


const ClientInvoice: React.FC<{ id: number }> = ({ id }) => {
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const interval =
      setInterval(() => {
        window.location.pathname = '/'
      }, 500)
    setinterval(interval)
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(interval);
    if (user) {
      clearInterval(interval)
    }
  }, [user])

  

  return <InvoiceFormat id={id}/>
}
export default ClientInvoice


// <>
//   {/* {
//     ticket.products?.map((prod, j) => {
//       return <tr key={j}>
//         <td>{prod.product?.name}</td>
//         <td>{prod.product_variants?.map(variant => variant.name).join(' ')}</td>
//         <td>{prod.quantity} {prod.product?.measurement_unit}</td>
//         <td>{prod.price?.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</td>
//         <td>{prod.product_total?.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</td>
//       </tr>
//     })
//   } */}
// </>