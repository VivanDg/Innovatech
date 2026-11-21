import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EquipoMasUtilizado, EquipoPorEstado, EstadoEquipo, PrestamoPorArea } from '../../types/api'

const COLORES_ESTADO: Record<EstadoEquipo, string> = {
  Disponible: '#10b981',    // Emerald 500
  Prestado: '#3b82f6',      // Blue 500
  Mantenimiento: '#f59e0b', // Amber 500
  Baja: '#94a3b8',          // Slate 400
}

const estiloTooltip = {
  backgroundColor: 'var(--paper)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
  color: 'var(--ink)',
  padding: '8px 12px',
}

export function EstadoEquiposChart({ datos }: { datos: EquipoPorEstado[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={datos}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="46%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            stroke="var(--paper)"
            strokeWidth={2}
          >
            {datos.map((entrada) => (
              <Cell key={entrada.estado} fill={COLORES_ESTADO[entrada.estado]} />
            ))}
          </Pie>
          <Tooltip contentStyle={estiloTooltip} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(valor) => <span style={{ color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>{valor}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopEquiposChart({ datos }: { datos: EquipoMasUtilizado[] }) {
  const series = datos.map((equipo) => ({
    nombre: equipo.codigoPatrimonial,
    cantidad: equipo.totalPrestamos,
    detalle: equipo.nombre,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={96}
            tick={{ fill: 'var(--ink)', fontSize: 11, fontWeight: 600 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <Tooltip contentStyle={estiloTooltip} cursor={{ fill: 'var(--soft)' }} />
          <Bar dataKey="cantidad" name="Préstamos" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreasChart({ datos }: { datos: PrestamoPorArea[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="area"
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            width={28}
          />
          <Tooltip contentStyle={estiloTooltip} cursor={{ fill: 'var(--soft)' }} />
          <Bar dataKey="totalPrestamos" name="Préstamos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
