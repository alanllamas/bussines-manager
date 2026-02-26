'use client'
import React from "react"
import { Product } from "@/api/hooks/getProducts"
import { fetcher } from "@/api/fetcher"
import useSWR from "swr"
import ProductDetail from "../components/ProductTabs"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import Spinner from "@/components/ui/Spinner"

async function GetProduct([url]: [string]) {
  return await fetcher<{ data: Product }>(url, { method: 'GET' });
}

const ProductPage: React.FC<{ id: string }> = ({ id }) => {
  const { isLoading: authLoading } = useAuthGuard()

  const { data, isLoading, error } = useSWR(
    id ? [`/api/products/${id}?populate=*`] : null,
    GetProduct,
    { revalidateOnFocus: false }
  )

  if (authLoading || isLoading) return <Spinner />
  if (error) return <p className="p-4 text-surface-700">Error al cargar el producto</p>
  if (!data?.data) return null

  return (
    <section>
      <ProductDetail product={data.data} />
    </section>
  )
}

export default ProductPage
