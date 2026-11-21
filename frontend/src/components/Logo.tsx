import { useState } from 'react'
import { cn } from '../lib/utils'

interface LogoProps {
  compacto?: boolean
  className?: string
  logoSrc?: string
}

export function Logo({ compacto = false, className, logoSrc = '/logo.png' }: LogoProps) {
  const [errorCarga, setErrorCarga] = useState(false)

  return (
    <div className={cn('group flex items-center gap-3 select-none', className)}>
      {/* 
        ESPACIO DEDICADO PARA TU LOGO SUBIDO:
        Si colocas un archivo en /frontend/public/logo.png (o .svg), se cargará prioritariamente.
        Si aún no lo subes, se despliega este emblema vectorial isométrico 3D de alta gama.
      */}
      {!errorCarga ? (
        <img
          src={logoSrc}
          alt="TechAsset Logo"
          onError={() => setErrorCarga(true)}
          className={cn(
            'object-contain transition-transform duration-300 group-hover:scale-105',
            compacto ? 'size-9' : 'h-10 w-auto max-w-[150px]'
          )}
        />
      ) : (
        <div className="relative flex shrink-0 items-center justify-center">
          {/* Resplandor ambiental de fondo */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 opacity-40 blur-md transition-all duration-300 group-hover:opacity-75 group-hover:blur-lg" />

          {/* Emblema Vectorial Tridimensional de Activo Tecnológico */}
          <div
            className={cn(
              'relative flex items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 shadow-lg ring-1 ring-black/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/30',
              compacto ? 'size-9.5' : 'size-11'
            )}
          >
            <svg
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={compacto ? 'size-6' : 'size-7'}
            >
              <defs>
                <linearGradient id="topFacet" x1="22" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="leftFacet" x1="6" y1="14" x2="22" y2="39" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1D4ED8" />
                  <stop offset="1" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="rightFacet" x1="22" y1="19" x2="38" y2="39" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#1E3A8A" />
                </linearGradient>
                <linearGradient id="chipGlow" x1="17" y1="17" x2="27" y2="27" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#818CF8" />
                </linearGradient>
              </defs>

              {/* Cara superior del hipercubo/activo */}
              <path
                d="M22 6L37 14.5L22 23L7 14.5L22 6Z"
                fill="url(#topFacet)"
                stroke="#93C5FD"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Cara lateral izquierda */}
              <path
                d="M7 14.5V29.5L22 38V23L7 14.5Z"
                fill="url(#leftFacet)"
                stroke="#60A5FA"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Cara lateral derecha */}
              <path
                d="M22 23V38L37 29.5V14.5L22 23Z"
                fill="url(#rightFacet)"
                stroke="#93C5FD"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Chip / Núcleo central del activo */}
              <circle cx="22" cy="22" r="4.5" fill="url(#chipGlow)" className="animate-pulse" />
              <circle cx="22" cy="22" r="2" fill="#FFFFFF" />

              {/* Micro-circuitos de conexión */}
              <path d="M22 17.5V10" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M18 24.5L12 28" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M26 24.5L32 28" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            {/* Micro-led verde de estado operativo online */}
            <span className="absolute -bottom-0.5 -right-0.5 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-xs" />
            </span>
          </div>
        </div>
      )}

      {/* Tipografía Corporativa de Alta Precisión */}
      {!compacto && (
        <div className="leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[1.25rem] font-bold tracking-tight text-ink">
              Tech
            </span>
            <span className="text-[1.25rem] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300 bg-clip-text text-transparent">
              Asset
            </span>
            <span className="ml-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              PRO
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-muted">
              Innovatech Solutions
            </span>
            <span className="size-1 rounded-full bg-blue-500/60" />
            <span className="text-[0.58rem] font-semibold text-muted/80">S.A.C.</span>
          </div>
        </div>
      )}
    </div>
  )
}
