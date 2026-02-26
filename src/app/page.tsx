'use client'
import Image from "next/image";
import logo from "@/public/logo.png";
import { useAuth } from "./context/AuthUserContext";

export default function Home() {
  const { user } = useAuth();
  
  return !user
    ? <section className="w-full flex flex-col items-center text-neutral-900 py-20 ">
        <Image width={400} height={200} src={logo.src} alt="itacate logo"></Image>
        <h1 className="text-2xl font-bold m-4 text-neutral-900">Bienvenido, inicia sesión para acceder</h1>
      </section>
    : <section className="w-full flex flex-col items-center text-neutral-900 py-20 ">
        <Image width={400} height={200} src={logo.src} alt="itacate logo"></Image>
        <h1 className="text-2xl font-bold m-4 text-neutral-900">Bienvenido {user.displayName}</h1>
      </section>
}
