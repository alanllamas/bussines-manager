'use client'
import React, { useEffect, useState } from "react";
import useGetClients from "@/api/hooks/clients/getClients";
import { useAuth } from "@/app/context/AuthUserContext";
import Link from "next/link";
import { Client } from "@/api/hooks/clients/getClient";

// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";

const ClientsSideBar: React.FC = () => {
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

  const [clients, setClients] = useState<Client[] | undefined>([])
  
  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()
  
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {


      setClients(clientsData?.data)
    }
  }, [clientsIsLoading, clientsData, clientsError])
  


  return <section className="w-3/12 bg-neutral-200 text-neutral-900">
      {
        clients?.map((client, index: number) => {
          return (
            <Link
              key={`client-${index}`}
              href={`/clients/${client.documentId}`}
              className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
            >
              <h4>{client.name}</h4> <h4>{'>'}</h4>
            </Link>
            
          )
        })      
      }
      <Link
        href={`/clients/new`}
        className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
      >
        <h4>Crear Cliente Nuevo</h4> <h4>{'+'}</h4>
      </Link>
    </section>
}
 export default ClientsSideBar