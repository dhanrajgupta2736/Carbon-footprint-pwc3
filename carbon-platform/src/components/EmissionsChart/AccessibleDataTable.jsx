import PropTypes from 'prop-types'

export default function AccessibleDataTable({ rows, caption }) {
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
