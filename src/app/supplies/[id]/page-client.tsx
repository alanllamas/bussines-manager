'use client'
// SupplyPage — vista de detalle de un insumo (/supplies/[id]).
// Usa useSWR directamente con fetcher local — mismo patrón que ProductPage (inconsistencia vs hooks).
// populate=supply_variants (solo variantes, no populate=* como productos).
import React from "react"
import { fetcher } from "@/api/fetcher"
import useSWR from "swr"
import type { Supply } from "@/types"
import SupplyDetail from "../components/SupplyDetail"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"

async function GetSupply([url]: [string]) {
  return await fetcher<{ data: Supply }>(url, { method: 'GET' })
}

const SupplyPage: React.FC<{ id: string }> = ({ id }) => {
  const { isLoading: authLoading } = useAuthGuard()

  const { data, isLoading, error } = useSWR(
    id ? [`/api/supplies/${id}?populate=supply_variants`] : null,
    GetSupply,
    { revalidateOnFocus: false }
  )

  if (authLoading || isLoading) return <Spinner />
  if (error) return <p className="p-4 text-surface-700">Error al cargar el insumo</p>
  if (!data?.data) return null

  return (
    <section>
      <SupplyDetail supply={data.data} />
    </section>
  )
}

export default SupplyPage
