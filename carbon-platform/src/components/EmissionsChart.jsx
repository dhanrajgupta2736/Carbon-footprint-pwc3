/**
 * @fileoverview Emissions analytics panel with Recharts visualisations.
 * All charts include accessible titles, descriptions, and ARIA labels.
 * Data tables are provided as accessible alternatives to visual charts.
 */

import PropTypes from 'prop-types'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { BENCHMARKS } from '../constants/emissions.js'

// ─── Colour palette (WCAG AA contrast on white bg) ────────────────────────
const PALETTE = {
  transport: { fill: '#16a34a', light: '#dcfce7', label: 'Transport'       },
  home:      { fill: '#0d9488', light: '#ccfbf1', label: 'Home Energy'     },
  lifestyle: { fill: '#b45309', light: '#fef3c7', label: 'Lifestyle & Diet' },
}

// ─── Custom tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2 shadow-lg text-xs" role="tooltip">
      <p className="font-bold text-eco-800">{payload[0].name}</p>
      <p className="text-eco-600 tabular-nums">{payload[0].value} t CO2e</p>
    </div>
  )
}
ChartTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array }

// ─── Accessible data table (screen reader alternative) ────────────────────
function AccessibleDataTable({ rows, caption }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
AccessibleDataTable.propTypes = {
  rows:    PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })).isRequired,
  caption: PropTypes.string.isRequired,
}

// ─── Emission gauge ────────────────────────────────────────────────────────
function EmissionGauge({ total }) {
  const max    = 10
  const capped = Math.min(total, max)
  const pct    = (capped / max) * 100
  const color  = total <= 2 ? '#16a34a' : total <= 4.7 ? '#ca8a04' : '#dc2626'
  const label  = total <= 2 ? 'Low Impact 🌟' : total <= 4.7 ? 'Average 📊' : 'High Impact ⚠️'

  return (
    <div
      role="img"
      aria-label={`Your total carbon footprint is ${total} tonnes CO2 equivalent per year — ${label}`}
      className="space-y-2"
    >
      <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold tabular-nums" style={{ color }} aria-hidden="true">{total}</div>
          <div className="text-xs text-eco-500 font-medium">tonnes CO2e / year</div>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: color + '20', color }}
          aria-hidden="true"
        >
          {label}
        </span>
      </div>
      <div className="h-3 rounded-full bg-eco-100 overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-eco-400" aria-hidden="true">
        <span>0t</span>
        <span>🎯 Paris: 2t</span>
        <span>🌍 Global avg: 4.7t</span>
        <span>10t+</span>
      </div>
    </div>
  )
}
EmissionGauge.propTypes = { total: PropTypes.number.isRequired }

// ─── Donut breakdown chart ─────────────────────────────────────────────────
function BreakdownDonut({ transport, home, lifestyle, breakdown }) {
  const pieData = [
    { name: 'Transport',      value: transport, key: 'transport' },
    { name: 'Home Energy',    value: home,      key: 'home'      },
    { name: 'Lifestyle',      value: lifestyle, key: 'lifestyle' },
  ].filter((d) => d.value > 0)

  if (pieData.length === 0) {
    return (
      <div className="text-center py-8 text-eco-400 text-sm" role="status">
        Enter your data above to see the breakdown
      </div>
    )
  }

  return (
    <>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {pieData.map((d) => (
                <Cell key={d.key} fill={PALETTE[d.key].fill} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-eco-700 font-medium">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible alternative */}
      <AccessibleDataTable
        caption="Emissions breakdown by category in tonnes CO2 equivalent per year"
        rows={[
          { label: 'Transport',   value: `${transport}t (${breakdown.transport}%)` },
          { label: 'Home Energy', value: `${home}t (${breakdown.home}%)`           },
          { label: 'Lifestyle',   value: `${lifestyle}t (${breakdown.lifestyle}%)` },
        ]}
      />

      {/* Visual summary bars */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {Object.entries(PALETTE).map(([key, c]) => {
          const val = key === 'transport' ? transport : key === 'home' ? home : lifestyle
          const pct = breakdown[key]
          return (
            <div
              key={key}
              className="text-center rounded-xl p-2"
              style={{ background: c.light }}
              aria-hidden="true"
            >
              <div className="text-xs font-semibold text-eco-700">{c.label}</div>
              <div className="text-lg font-bold tabular-nums" style={{ color: c.fill }}>{val}t</div>
              <div className="text-xs" style={{ color: c.fill }}>{pct}%</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
BreakdownDonut.propTypes = {
  transport: PropTypes.number.isRequired,
  home:      PropTypes.number.isRequired,
  lifestyle: PropTypes.number.isRequired,
  breakdown: PropTypes.shape({
    transport: PropTypes.number,
    home:      PropTypes.number,
    lifestyle: PropTypes.number,
  }).isRequired,
}

// ─── Comparison bar chart ──────────────────────────────────────────────────
function ComparisonBar({ total, comparison }) {
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

// ─── Main export ──────────────────────────────────────────────────────────

export default function EmissionsChart({ transport, home, lifestyle, total, breakdown, comparison }) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Total gauge */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-4">Your Total Carbon Footprint</h3>
        <EmissionGauge total={total} />
      </div>

      {/* Donut breakdown */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-3">Emissions Breakdown</h3>
        <BreakdownDonut transport={transport} home={home} lifestyle={lifestyle} breakdown={breakdown} />
      </div>

      {/* Comparison */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-3">Global Comparison</h3>
        <ComparisonBar total={total} comparison={comparison} />
      </div>
    </div>
  )
}

EmissionsChart.propTypes = {
  transport:  PropTypes.number.isRequired,
  home:       PropTypes.number.isRequired,
  lifestyle:  PropTypes.number.isRequired,
  total:      PropTypes.number.isRequired,
  breakdown:  PropTypes.object.isRequired,
  comparison: PropTypes.object.isRequired,
}
