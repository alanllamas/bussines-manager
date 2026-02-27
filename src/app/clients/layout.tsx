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