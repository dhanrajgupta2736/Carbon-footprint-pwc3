import PropTypes from 'prop-types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import AccessibleDataTable from './AccessibleDataTable.jsx'

const PALETTE = {
  transport: { fill: '#16a34a', light: '#dcfce7', label: 'Transport'       },
  home:      { fill: '#0d9488', light: '#ccfbf1', label: 'Home Energy'     },
  lifestyle: { fill: '#b45309', light: '#fef3c7', label: 'Lifestyle & Diet' },
}

export default function BreakdownDonut({ transport, home, lifestyle, breakdown }) {
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
export { PALETTE }
