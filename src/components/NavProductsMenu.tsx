'use client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Link from 'next/link'

export default function NavProductsMenu() {
  return (
    <Menu as="li" className="px-4 relative">
      <MenuButton className="font-bold bg-primary-500 text-white py-2 px-6 h-full hover:bg-primary-600">
        Productos
      </MenuButton>
      <MenuItems
        anchor="bottom"
        className="bg-surface-50 shadow-xl text-surface-900 z-50 min-w-[140px]"
      >
        <MenuItem>
          <Link href="/products" className="block px-4 py-2 hover:bg-surface-100">
            Productos
          </Link>
        </MenuItem>
        <MenuItem>
          <Link href="/product-variants" className="block px-4 py-2 hover:bg-surface-100">
            Variantes
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
