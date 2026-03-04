'use client'

// Desktop profile avatar component — lives in the top-right corner of the navbar header.
// Shows a loading skeleton while Firebase resolves the auth state, then either:
//   - Authenticated: Headless UI dropdown with photo, name, email, and logout button.
//   - Unauthenticated: "inicia sesión" button that triggers Google OAuth popup.

import { useAuth } from "@/app/context/AuthUserContext"
import Image from "next/image"
import React from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const ProfileAvatar: React.FC = () => {
  const { user, isLoading, signIn, logOut} = useAuth()

  // Sign out and reload the page. Firebase signOut() is async — the 500ms delay ensures the
  // session is cleared before the reload triggers, preventing a flash of authenticated UI.
  const handleLogout = () => {
    logOut()
    setTimeout(() => window.location.reload(), 500);
  }

  // Show a skeleton placeholder while Firebase checks the persisted session on mount.
  // Prevents layout shift between the login button and the avatar.
  if (isLoading) return <div className="w-32 h-8 rounded-sm bg-surface-100 animate-pulse" />

  return <div className="flex items-center">
    {
      !!user
        // Authenticated: Headless UI Menu provides accessible dropdown with keyboard navigation.
        ? <Menu>
            {/* MenuButton shows the user's Google profile photo and display name. */}
            <MenuButton className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image width={32} height={32} src={`${user.photoURL}`} className="rounded-full" alt="user" />
              <span className="text-sm font-medium text-surface-700">{user.displayName}</span>
              <span className="material-symbols-outlined text-[16px] text-surface-400">expand_more</span>
            </MenuButton>
            {/* anchor="bottom end" aligns the dropdown to the bottom-right of the button. */}
            <MenuItems anchor="bottom end" className="bg-surface-50 border border-surface-200 shadow-xl rounded-sm mt-1 min-w-40 py-1 text-surface-900">
              {/* Email shown as non-interactive info row. */}
              <MenuItem>
                <div className="px-4 py-2 border-b border-surface-200">
                  <p className="text-xs text-surface-400">{user.email}</p>
                </div>
              </MenuItem>
              <MenuItem>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-100 text-red-500" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        // Unauthenticated: single button triggers Google OAuth popup via signIn().
        : <button className="btn-secondary" onClick={signIn}>inicia sesión</button>
    }
  </div>
}

export default ProfileAvatar
