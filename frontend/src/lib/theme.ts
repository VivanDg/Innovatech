import { useCallback, useState } from 'react'

const CLAVE_TEMA = 'techasset.tema'

export function inicializarTema(): void {
  const guardado = localStorage.getItem(CLAVE_TEMA)
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
  const oscuro = guardado ? guardado === 'oscuro' : prefiereOscuro
  document.documentElement.classList.toggle('dark', oscuro)
}

export function useTheme() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))

  const alternar = useCallback(() => {
    setOscuro((actual) => {
      const siguiente = !actual
      document.documentElement.classList.toggle('dark', siguiente)
      localStorage.setItem(CLAVE_TEMA, siguiente ? 'oscuro' : 'claro')
      return siguiente
    })
  }, [])

  return { oscuro, alternar }
}
