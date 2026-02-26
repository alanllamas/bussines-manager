'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-24 gap-4 text-neutral-700">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-sm text-neutral-500">{error.message}</p>
      <button
        className="px-4 py-2 bg-neutral-400 text-white rounded-sm"
        onClick={reset}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
