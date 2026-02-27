'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import { useAuth } from "@/app/context/AuthUserContext"
import Image from "next/image"

const navItem = (active: boolean) =>
  `flex items-center gap-1 px-4 h-20 text-sm font-medium border-b-2 transition-colors ${
    active
      ? 'border-primary-500 text-primary-600'
      : 'border-transparent text-surface-600 hover:text-primary-500 hover:border-primary-300'
  }`

const mobileNavItem = (active: boolean) =>
  `flex items-center gap-3 px-6 py-4 text-sm font-medium border-b border-surface-100 transition-colors ${
    active
      ? 'text-primary-600 bg-primary-50'
      : 'text-surface-700 hover:bg-surface-50'
  }`

export default function NavLinks() {
  const path = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, signIn, logOut } = useAuth()

  useEffect(() => {
    setIsMobileOpen(false)
  }, [path])

  return (
    <>
      {/* Desktop nav */}
      <ul className="hidden lg:flex items-center h-20">

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
          <MenuButton className={navItem(path.startsWith('/tickets') || path.startsWith('/products') || path.startsWith('/product-variants'))}>
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Ingresos
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </MenuButton>
          <MenuItems anchor="bottom" className="bg-white border border-surface-200 shadow-lg z-50 min-w-[160px]">
            <MenuItem>
              <Link href="/tickets" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Notas
              </Link>
            </MenuItem>
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

        <Menu as="li" className="relative h-full flex items-center">
          <MenuButton className={navItem(path.startsWith('/purchases') || path.startsWith('/supplies') || path.startsWith('/supply-variants'))}>
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            Gastos
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </MenuButton>
          <MenuItems anchor="bottom" className="bg-white border border-surface-200 shadow-lg z-50 min-w-[160px]">
            <MenuItem>
              <Link href="/purchases" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                Compras
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/supplies" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
                <span className="material-symbols-outlined text-[16px]">package_2</span>
                Insumos
              </Link>
            </MenuItem>
            <MenuItem>
              <Link href="/supply-variants" className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600">
                <span className="material-symbols-outlined text-[16px]">style</span>
                Variantes
              </Link>
            </MenuItem>
          </MenuItems>
        </Menu>

        <li className="flex items-center gap-1 px-4 py-5 text-sm font-medium border-b-2 border-transparent text-surface-300 cursor-not-allowed">
          <span className="material-symbols-outlined text-[18px]">bar_chart</span>
          Análisis
        </li>

      </ul>

      {/* Hamburger button */}
      <button
        className="lg:hidden flex items-center justify-center p-2 rounded text-surface-600 hover:text-primary-600"
        onClick={() => setIsMobileOpen(v => !v)}
        aria-label="Menú"
      >
        <span className="material-symbols-outlined text-[24px]">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile panel */}
      {isMobileOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 z-50 bg-white shadow-lg border-t border-surface-200">
          <ul>
            <li>
              <Link href="/invoices" className={mobileNavItem(path.startsWith('/invoices'))} onClick={() => setIsMobileOpen(false)}>
                <span className="material-symbols-outlined text-[18px]">description</span>
                Cortes
              </Link>
            </li>
            <li>
              <Link href="/clients" className={mobileNavItem(path.startsWith('/clients'))} onClick={() => setIsMobileOpen(false)}>
                <span className="material-symbols-outlined text-[18px]">groups</span>
                Clientes
              </Link>
            </li>
            {/* Ingresos group */}
            <li>
              <span className={mobileNavItem(path.startsWith('/tickets') || path.startsWith('/products') || path.startsWith('/product-variants'))}>
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                Ingresos
              </span>
              <ul className="bg-surface-50">
                <li>
                  <Link href="/tickets" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Notas
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    Productos
                  </Link>
                </li>
                <li>
                  <Link href="/product-variants" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">style</span>
                    Variantes
                  </Link>
                </li>
              </ul>
            </li>
            {/* Gastos group */}
            <li>
              <span className={mobileNavItem(path.startsWith('/purchases') || path.startsWith('/supplies') || path.startsWith('/supply-variants'))}>
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                Gastos
              </span>
              <ul className="bg-surface-50">
                <li>
                  <Link href="/purchases" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    Compras
                  </Link>
                </li>
                <li>
                  <Link href="/supplies" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">package_2</span>
                    Insumos
                  </Link>
                </li>
                <li>
                  <Link href="/supply-variants" className="flex items-center gap-3 pl-12 pr-6 py-3 text-sm border-b border-surface-100 text-surface-700 hover:bg-surface-100" onClick={() => setIsMobileOpen(false)}>
                    <span className="material-symbols-outlined text-[16px]">style</span>
                    Variantes
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <span className="flex items-center gap-3 px-6 py-4 text-sm border-b border-surface-100 text-surface-300 cursor-not-allowed">
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                Análisis
              </span>
            </li>
          </ul>
          {/* Profile section */}
          <div className="border-t border-surface-200 px-6 py-4">
            {user
              ? <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Image width={32} height={32} src={`${user.photoURL}`} className="rounded-full shrink-0" alt="user" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-800 truncate">{user.displayName}</p>
                      <p className="text-xs text-surface-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    className="text-xs text-red-500 hover:text-red-600 shrink-0"
                    onClick={() => { logOut(); setTimeout(() => window.location.reload(), 500) }}
                  >
                    Salir
                  </button>
                </div>
              : <button className="btn-secondary w-full" onClick={signIn}>Inicia sesión</button>
            }
          </div>
        </div>
      )}
    </>
  )
}
