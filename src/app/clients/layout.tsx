// ClientsLayout — Server Component layout para todas las rutas /clients/*.
// Estructura: sidebar fijo (lg:w-64) a la izquierda + main a la derecha (lg:flex-row).
// En mobile apilan verticalmente (flex-col) — el sidebar se convierte en acordeón.
import React from "react";
import ClientsSideBar from "./components/sidebar";

export default async function ClientsLayout({ children }: { children: React.ReactNode }) {
  

  return <section className="w-full flex flex-col lg:flex-row">
    <ClientsSideBar></ClientsSideBar>
    <main className="w-full">
      {/* The children prop renders the content of the child routes */}
      {children}
    </main>

  </section>

}