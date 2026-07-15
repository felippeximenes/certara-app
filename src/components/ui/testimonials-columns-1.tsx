import React from 'react'
import { motion } from 'motion/react'

export interface Testimonial {
  text: string
  initials: string
  gradient: string
  name: string
  role: string
}

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: Testimonial[]
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration: props.duration ?? 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, initials, gradient, name, role }, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm shadow-primary/5 max-w-xs w-full"
              >
                {/* Estrelas */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className="h-3.5 w-3.5 fill-primary" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Texto */}
                <p className="text-sm leading-relaxed text-foreground">{text}</p>

                {/* Autor */}
                <div className="flex items-center gap-3 mt-5">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-border"
                    style={{ background: gradient }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-foreground">{name}</p>
                    <p className="text-xs leading-tight text-muted-foreground mt-0.5">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  )
}
