'use client'
import useGetClient, { Client } from "@/api/hooks/clients/getClient";
import React, { useEffect, useState } from "react";
import ClientTabs from "../components/ClientTabs";
import Spinner from "@/components/ui/Spinner";

const ClientPage: React.FC<{id: string}> = ({ id }: {id: string}) => {

  
  const {
    client: clientData,
    isLoading,
    error
  } = useGetClient(id)

  const [client, setClient] = useState<Client>()
  
  
  useEffect(() => {
    if (!isLoading && !error) {
      
      console.log('clientData: ', clientData.data);
      setClient(clientData.data)
    }
  }, [isLoading, error, clientData])


  const LoadingScreen = () => <Spinner />
  
  const ErrorScreen = () =>  <section className="w-full flex">
    <p className="text-black">Error loading client</p>
  </section>

  const DataScreen = () =>  <section className="">
    <ClientTabs client={client}></ClientTabs>
  </section>
  


  return isLoading
    ? <LoadingScreen />
    : error
      ? <ErrorScreen />
      : <DataScreen />

}
export default ClientPage