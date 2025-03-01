'use client'
import { useAuth } from "@/app/context/AuthUserContext"
import Image from "next/image"
import React from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const ProfileAvatar: React.FC = () => {
  // const { signIn } = useAuth();
  // @ts-expect-error no type found

  const { user, signIn, logOut} = useAuth()
  // console.log('user: ', user)
  const handleLogout = () => {
    logOut()
    setTimeout(() => window.location.reload(), 500);

  }

  return <div className="flex items-center">
    {
        !!user
          ?  <Menu>
            <MenuButton className="flex flex-col items-center justify-center mt-3">
              <Image width={40} height={40} src={`${user.photoURL}`} className="rounded-full" alt="user" />
              <p className="text-sm ">{user.displayName}</p>
            </MenuButton>
            <MenuItems anchor="bottom" className="bg-neutral-50 p-3 text-neutral-900 shadow-xl">
              <MenuItem>
                <p className="border-b border-neutral-300">Perfil</p>
              </MenuItem>
              <MenuItem>
                <button className="px-3 py-1" onClick={handleLogout}>Log Out</button>
              </MenuItem>
            </MenuItems>
          </Menu>
        : <button className="px-4 py-2 bg-neutral-400" onClick={signIn}>inicia sesión</button>
    }
        </div>
} 

export default ProfileAvatar