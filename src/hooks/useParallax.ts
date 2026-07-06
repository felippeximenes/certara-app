import { useEffect, type RefObject } from 'react'

export function useParallax(
  sideRef: RefObject<HTMLDivElement>,
  stageRef: RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const side  = sideRef.current
    const stage = stageRef.current
    if (!side || !stage) return

    const move = (e: MouseEvent) => {
      const r  = side.getBoundingClientRect()
      const px = (e.clientX - r.left)  / r.width  - 0.5
      const py = (e.clientY - r.top)   / r.height - 0.5
      stage.style.setProperty('--ry', `${(px *  16).toFixed(2)}deg`)
      stage.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`)
    }
    const leave = () => {
      stage.style.setProperty('--ry', '0deg')
      stage.style.setProperty('--rx', '0deg')
    }

    side.addEventListener('mousemove', move)
    side.addEventListener('mouseleave', leave)
    return () => {
      side.removeEventListener('mousemove', move)
      side.removeEventListener('mouseleave', leave)
    }
  }, [sideRef, stageRef])
}
