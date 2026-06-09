import { useState, useEffect, useRef } from 'react'

export default function useMessageReveal(messages) {
  const [typing,       setTyping]       = useState(false)
  const [visibleCount, setVisibleCount] = useState(() => messages.length)
  const prevKey = useRef(null)

  useEffect(() => {
    const key = messages.map((m) => m.message).join('|')
    if (key === prevKey.current) return
    prevKey.current = key

    let iv = null
    const t0 = setTimeout(() => {
      if (messages.length === 0) {
        setVisibleCount(0)
      } else {
        setTyping(true)
        setVisibleCount(0)
      }
    }, 0)

    if (messages.length === 0) {
      return () => clearTimeout(t0)
    }

    const t1 = setTimeout(() => {
      setTyping(false)
      let i = 0
      iv = setInterval(() => {
        i += 1
        setVisibleCount(i)
        if (i >= messages.length) {
          clearInterval(iv)
        }
      }, 350)
    }, 1100)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      if (iv) clearInterval(iv)
    }
  }, [messages])

  return { typing, visibleCount }
}
