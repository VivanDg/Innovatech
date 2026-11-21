import type { CategoriaEquipo } from '../types/api'

// Fotos corporativas de alta calidad para cada categoría de activo tecnológico
export const FOTOS_CATEGORIA: Record<CategoriaEquipo, string> = {
  Laptop:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  ComputadoraEscritorio:
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=80',
  Monitor:
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  Impresora:
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  Tablet:
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
  ProyectorMultimedia:
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  EquipoRed:
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
}

// Fallback por defecto
export const FOTO_DEFAULT =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'

// Almacén de fotos personalizadas por ID o Código de equipo
const STORAGE_KEY = 'techasset_equipo_fotos_custom'

function obtenerCustomMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function guardarFotoPersonalizada(identificador: string, url: string) {
  if (!identificador) return
  try {
    const map = obtenerCustomMap()
    if (url.trim()) {
      map[identificador] = url.trim()
    } else {
      delete map[identificador]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (e) {
    console.error('Error al guardar foto personalizada', e)
  }
}

export function obtenerFotoPersonalizada(identificador?: string): string | null {
  if (!identificador) return null
  const map = obtenerCustomMap()
  return map[identificador] ?? null
}

export function obtenerFotoEquipo(categoria: CategoriaEquipo, identificador?: string): string {
  if (identificador) {
    const custom = obtenerFotoPersonalizada(identificador)
    if (custom) return custom
  }
  return FOTOS_CATEGORIA[categoria] ?? FOTO_DEFAULT
}
