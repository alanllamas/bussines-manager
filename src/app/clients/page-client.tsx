'use client'
// ClientsPage — estado vacío de /clients cuando no hay cliente seleccionado.
// Muestra ícono + mensaje "Selecciona un cliente de la barra lateral".
import React, { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";

const ClientsPage: React.FC = () => {


  

  
  


  return (
    <section className="w-full flex flex-col items-center justify-center py-24 text-surface-400">
      <span className="material-symbols-outlined text-[48px]">person</span>
      <p className="mt-2 text-sm">Selecciona un cliente de la barra lateral</p>
    </section>
  )


}
 export default ClientsPage