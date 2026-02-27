import { useState, useEffect } from 'react'

export function usePaginatedData<T>(data: T[], itemsPerPage = 10) {
  const [itemOffset, setItemOffset] = useState(0)

  useEffect(() => { setItemOffset(0) }, [data.length])

  const currentItems = data.slice(itemOffset, itemOffset + itemsPerPage)
  const pageCount = Math.ceil(data.length / itemsPerPage)

  const handlePageChange = ({ selected }: { selected: number }) => {
    setItemOffset((selected * itemsPerPage) % Math.max(data.length, 1))
  }

  return { currentItems, pageCount, handlePageChange }
}
