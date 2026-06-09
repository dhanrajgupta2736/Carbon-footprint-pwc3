import PropTypes from 'prop-types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BENCHMARKS } from '../../constants/emissions.js'
import AccessibleDataTable from './AccessibleDataTable.jsx'

export default function ComparisonBar({ total, comparison }) {
  const barData = [
    { name: 'You',          value: total,               fill: total <= BENCHMARKS.global ? '#16a34a' : '#dc2626' },
    { name: 'Global Avg',   value: BENCHMARKS.global,   fill: '#94a3b8' },
    { name: 'India Avg',    value: BENCHMARKS.india,    fill: '#64748b' },
    { name: '🎯 Target',    value: BENCHMARKS.parisTarget, fill: '#14b8a6' },
  ]

  return (
    <>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={185}>
          <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 36, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dcfce7" />
            <XAxis
              type="number"
              domain={[0, Math.max(total + 1, 6)]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              unit="t"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
              width={74}
            />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length
                  ? <div className="glass-card rounded-lg px-2 py-1 text-xs font-bold text-eco-800 shadow">{payload[0].value}t CO2e/yr</div>
                  : null
              }
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fontWeight: 700, fill: '#374151', formatter: (v) => `${v}t` }}>
              {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <AccessibleDataTable
        caption="Your emissions compared to global benchmarks"
        rows={barData.map((d) => ({ label: d.name, value: `${d.value}t CO2e/yr` }))}
      />

      <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
        {[
          { label: 'vs. Global Avg', val: comparison.vsGlobal },
          { label: 'vs. India Avg',  val: comparison.vsIndia  },
        ].map(({ label, val }) => (
          <div
            key={label}
            className={`rounded-xl p-2.5 text-center ${val < 0 ? 'bg-eco-50 text-eco-700' : 'bg-red-50 text-red-700'}`}
            aria-label={`${label}: ${val > 0 ? '+' : ''}${val}%`}
          >
            <div className="font-bold text-base tabular-nums">{val > 0 ? '+' : ''}{val}%</div>
            <div className="opacity-80">{label}</div>
          </div>
        ))}
      </div>
    </>
  )
}

ComparisonBar.propTypes = {
  total:      PropTypes.number.isRequired,
  comparison: PropTypes.shape({ vsGlobal: PropTypes.number, vsIndia: PropTypes.number }).isRequired,
}
