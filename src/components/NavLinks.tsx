'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"

const navItem = (active: boolean) =>
  `flex items-center gap-1 px-4 h-20 text-sm font-medium border-b-2 transition-colors ${
    active
      ? 'border-primary-500 text-primary-600'
      : 'border-transparent text-surface-600 hover:text-primary-500 hover:border-primary-300'
  }`

export default function NavLinks() {
  const path = usePathname()

  return (
    <ul className="flex items-center h-20">

      <Link href="/tickets">
        <li className={navItem(path.startsWith('/tickets'))}>
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Notas
        </li>
      </Link>

      <Link href="/invoices">
        <li className={navItem(path.startsWith('/invoices'))}>
          <span className="material-symbols-outlined text-[18px]">description</span>
          Cortes
        </li>
      </Link>

      <Link href="/clients">
        <li className={navItem(path.startsWith('/clients'))}>
          <span className="material-symbols-outlined text-[18px]">groups</span>
          Clientes
        </li>
      </Link>

      <Menu as="li" className="relative h-full flex items-center">
        <MenuButton className={navItem(path.startsWith('/products') || path.startsWith('/product-variants'))}>
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          Productos
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </MenuButton>
        <MenuItems anchor="bottom" className="bg-white border border-surface-200 shadow-lg z-50 min-w-[160px]">
          <MenuItem>
            <Link href="/products" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span>
              Productos
            </Link>
          </MenuItem>
          <MenuItem>
            <Link href="/product-variants" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
              <span className="material-symbols-outlined text-[16px]">style</span>
              Variantes
            </Link>
          </MenuItem>
        </MenuItems>
      </Menu>

      <li className="flex items-center gap-1 px-4 py-5 text-sm font-medium border-b-2 border-transparent text-surface-300 cursor-not-allowed">
        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
        Compras
      </li>

      <li className="flex items-center gap-1 px-4 py-5 text-sm font-medium border-b-2 border-transparent text-surface-300 cursor-not-allowed">
        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
        Análisis
      </li>

    </ul>
  )
}
