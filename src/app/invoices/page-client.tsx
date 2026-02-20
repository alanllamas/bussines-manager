'use client'
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthUserContext";
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices";
import "react-datepicker/dist/react-datepicker.css";
import InvoiceList from "@/components/invoices/InvoiceList";


const ClientInvoices: React.FC = () => {
  // console.log('client_param: ', client_param);
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if(!user) {

      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 1000)
        // console.log(interval);
        
      setinterval(interval)
    }
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(user);
    // console.log(interval);
    if (!user) {
        // window.location.pathname = '/'

    } else {
      clearInterval(interval)

    }
  }, [user])

  const [invoices, setInvoices] = useState<Invoice[]>([])

  const {
    invoices: invoicesData,
    error: invoicesError,
    isLoading: invoicesIsLoading,
  } = useGetInvoices()
 
  useEffect(() => {
    if ((!invoicesError && !invoicesIsLoading && invoicesData.data)) {
      
      // console.log('invoicesData.data: ', invoicesData.data);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      setInvoices(invoicesData.data)
    }
  }, [invoicesIsLoading, invoicesData.data, invoicesError])
  

  

  return <section className="w-full flex flex-col items-center">
    {
      (invoicesIsLoading)
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          <InvoiceList invoicesData={invoices} />
        </section>
    }



  </section>


}
 export default ClientInvoices