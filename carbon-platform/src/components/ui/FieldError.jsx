import PropTypes from 'prop-types'
import { AlertCircle } from 'lucide-react'

export default function FieldError({ message, id }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-1">
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </p>
  )
}

FieldError.propTypes = {
  message: PropTypes.string,
  id: PropTypes.string.isRequired,
}
