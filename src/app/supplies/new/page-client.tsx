'use client'
import React from "react"
import SupplyForm from "@/components/forms/SupplyForm"
import { useAuthGuard } from "@/hooks/useAuthGuard"

const NewSupply: React.FC = () => {
  const { isLoading } = useAuthGuard()
  if (isLoading) return null

  return (
    <section className="w-full flex p-4 sm:p-6">
      <SupplyForm />
    </section>
  )
}

export default NewSupply
