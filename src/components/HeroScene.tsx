import { useEffect, useRef } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { HeroHex } from './HeroHex'
import '../styles/hero3d.css'

const OPTIONS = [
  { k: 'A', t: 'Amazon S3' },
  { k: 'B', t: 'Amazon CloudFront', ok: true },
  { k: 'C', t: 'AWS Direct Connect' },
  { k: 'D', t: 'Amazon Route 53' },
]

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const move = (e: MouseEvent) => {
      const r = scene.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      stage.style.setProperty('--ry', `${(-11 + px * 14).toFixed(2)}deg`)
      stage.style.setProperty('--rx', `${(7 - py * 12).toFixed(2)}deg`)
    }
    const leave = () => {
      stage.style.setProperty('--ry', '-11deg')
      stage.style.setProperty('--rx', '7deg')
    }

    scene.addEventListener('mousemove', move)
    scene.addEventListener('mouseleave', leave)
    return () => {
      scene.removeEventListener('mousemove', move)
      scene.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div className="hscene" ref={sceneRef}>
      <div className="hstage" ref={stageRef}>
        <HeroHex id="qh1" cls="h1" variant="saa" label="SAA" />
        <HeroHex id="qh2" cls="h2" variant="clf" label="CLF" />
        <HeroHex id="qh3" cls="h3" variant="dva" label="DVA" />
        <div className="horb ho1" />
        <div className="horb ho2" />

        <div className="qcard bg-white border border-[#EBE9F5] rounded-[18px] p-[22px]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans font-extrabold text-[13px] text-[#D97706] bg-[#FEF3E2] px-[11px] py-[5px] rounded-lg">
              CLF-C02
            </span>
            <span className="text-[12.5px] text-[#9B98AD] font-semibold">Questão 1 de 10 · 10%</span>
          </div>

          <div className="h-[5px] rounded bg-[#F7F6FD] overflow-hidden mb-[18px]">
            <div className="h-full w-[10%] rounded bg-gradient-to-r from-[#3B39E8] to-[#2D2BC5]" />
          </div>

          <p className="font-sans text-base font-bold leading-snug mb-4">
            Qual serviço AWS fornece uma CDN globalmente distribuída para servir conteúdo com baixa latência?
          </p>

          {OPTIONS.map((o) => (
            <div
              key={o.k}
              className={`flex items-center gap-3 border-[1.5px] rounded-[11px] px-[15px] py-[13px] mb-2.5 text-sm font-medium transition
                ${o.ok ? 'border-green-600 bg-[#EFFBF3]' : 'border-[#EBE9F5]'}`}
            >
              <span className={`w-6 h-6 rounded-[7px] flex items-center justify-center text-xs font-bold shrink-0
                ${o.ok ? 'bg-green-600 text-white' : 'bg-[#F7F6FD] text-[#6B6780]'}`}>
                {o.k}
              </span>
              {o.t}
              {o.ok && <CheckCircle2 className="ml-auto w-[19px] h-[19px] text-green-600" />}
            </div>
          ))}

          <div className="flex gap-2.5 bg-[#EFFBF3] border border-green-200 rounded-[11px] px-3.5 py-3 mt-3.5">
            <Sparkles className="w-[18px] h-[18px] text-green-600 shrink-0 mt-px" />
            <div>
              <b className="text-[#15803D] text-[13px] font-bold">Correto!</b>
              <p className="mt-0.5 text-[12.5px] text-[#4B7A5C] leading-snug">
                O CloudFront distribui conteúdo via edge locations, reduzindo a latência para usuários no mundo todo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
