'use client'
import React, { useEffect, useState } from "react";
import useGetClients, { Client } from "@/api/hooks/getClients";
import { useAuth } from "@/app/context/AuthUserContext";
import Link from "next/link";

// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";

const ClientInvoices: React.FC = () => {
  // @ts-expect-error no type found
 const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()


  
  useEffect(() => {
    if(!user) {

      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 1000)
        console.log(interval);
        
      setinterval(interval)
    }
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    console.log(user);
    console.log(interval);
    if (!user) {
        // window.location.pathname = '/'

    } else {
      clearInterval(interval)

    }
  }, [user])

  const [clients, setClients] = useState<Client[]>([])
  
  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()
  
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // @ts-expect-error missing type

      setClients(clientsData.data)
    }
      // @ts-expect-error missing type
  }, [clientsIsLoading, clientsData.data, clientsError])
  


  return <section className="w-full">
    <section className=" py-12 px-4 bg-neutral-100 text-neutral-900 ">
      {
        clients.map((client, index: number) => {
          return <div key={`client-${index}`} className="shadow-md bg-neutral-200 rounded-md px-6 py-2 m-4">
            <h4>{client.name}</h4>
            <Link href={`/invoices/${client.documentId}`}>
              <p>ver cortes </p>
            </Link>
          </div>
        })      
      }
    </section>


  </section>


}
 export default ClientInvoices