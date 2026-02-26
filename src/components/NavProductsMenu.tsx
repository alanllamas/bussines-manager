'use client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Link from 'next/link'

export default function NavProductsMenu() {
  return (
    <Menu as="li" className="px-4 relative">
      <MenuButton className="font-bold bg-neutral-400 py-2 px-6 h-full">
        Productos
      </MenuButton>
      <MenuItems
        anchor="bottom"
        className="bg-neutral-50 shadow-xl text-neutral-900 z-50 min-w-[140px]"
      >
        <MenuItem>
          <Link href="/products" className="block px-4 py-2 hover:bg-neutral-200">
            Productos
          </Link>
        </MenuItem>
        <MenuItem>
          <Link href="/product-variants" className="block px-4 py-2 hover:bg-neutral-200">
            Variantes
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
