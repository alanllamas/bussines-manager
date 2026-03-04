// usePaginatedData — client-side pagination hook (ADR-006).
// Slices a pre-fetched array into pages for display. Does not interact with the API —
// all data is loaded upfront (typically with pagination[limit]=10000) and pagination
// is applied locally in the browser.
//
// Designed to pair with react-paginate: handlePageChange accepts react-paginate's
// onPageChange event shape ({ selected: number }) where selected is 0-indexed page number.

import { useState, useEffect } from 'react'

// data: the full dataset to paginate (must be a stable array; hook uses data.length as dep).
// itemsPerPage: items shown per page (default 10).
//
// Returns:
//   currentItems — the slice of data for the current page
//   pageCount    — total number of pages (for react-paginate pageCount prop)
//   handlePageChange — event handler to pass to react-paginate onPageChange
export function usePaginatedData<T>(data: T[], itemsPerPage = 10) {
  // itemOffset: byte index into the array where the current page starts.
  const [itemOffset, setItemOffset] = useState(0)

  // Reset to page 1 whenever the dataset changes size (e.g. after a search filter changes).
  // Uses data.length as the dependency so the effect fires on add/remove but not on item mutation.
  useEffect(() => { setItemOffset(0) }, [data.length])

  // Slice the current page from the full dataset.
  const currentItems = data.slice(itemOffset, itemOffset + itemsPerPage)
  const pageCount = Math.ceil(data.length / itemsPerPage)

  // handlePageChange — react-paginate onPageChange handler.
  // selected is 0-indexed; multiply by itemsPerPage to get the array offset.
  // Math.max(data.length, 1) prevents division by zero when data is empty.
  const handlePageChange = ({ selected }: { selected: number }) => {
    setItemOffset((selected * itemsPerPage) % Math.max(data.length, 1))
  }

  return { currentItems, pageCount, handlePageChange }
}
