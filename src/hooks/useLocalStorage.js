import { useState } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch { return initialValue }
  })
  const updateValue = (nextValue) => setValue((current) => {
    const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
    try { window.localStorage.setItem(key, JSON.stringify(resolved)) } catch { return resolved }
    return resolved
  })
  return [value, updateValue]
}