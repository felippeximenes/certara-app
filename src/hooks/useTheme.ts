import { useEffect } from 'react'

export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('tema')
  }, [])

  return { isDark: false, toggle: () => {} }
}
