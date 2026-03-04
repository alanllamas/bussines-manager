'use client'
// NewClient — renderiza ClientForm sin props (modo creación).
// Al crear exitosamente, ClientForm redirige a /clients/[documentId].
import ClientsForm from "@/components/forms/ClientForm";
import React from "react";
// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";

const NewClient: React.FC = () => {


  

  
  


  return <section className="w-full p-6">
   <ClientsForm />


  </section>


}
 export default NewClient