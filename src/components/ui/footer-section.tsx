import React from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { FileText, Shield, Mail, Award } from 'lucide-react'
import { Logo } from '../Logo'

interface FooterLink {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
}

interface FooterSection {
  label: string
  links: FooterLink[]
}

const footerLinks: FooterSection[] = [
  {
    label: 'Plataforma',
    links: [
      { title: 'Como funciona', href: '/#como-funciona', external: true },
      { title: 'Funcionalidades', href: '/#funcionalidades', external: true },
      { title: 'Preços', href: '/#precos', external: true },
      { title: 'Entrar', href: '/login', external: false },
      { title: 'Criar conta', href: '/login', external: false },
    ],
  },
  {
    label: 'Empresa',
    links: [
      { title: 'Termos de uso', href: '/termos', icon: FileText, external: false },
      { title: 'Política de privacidade', href: '/privacidade', icon: Shield, external: false },
      { title: 'Suporte', href: 'mailto:suporte@certara.app', icon: Mail, external: true },
    ],
  },
  {
    label: 'Certificações AWS',
    links: [
      { title: 'Cloud Practitioner (CLF-C02)', href: '/#como-funciona', icon: Award, external: true },
      { title: 'Solutions Architect (SAA-C03)', href: '/#como-funciona', icon: Award, external: true },
      { title: 'Developer Associate (DVA-C02)', href: '/#como-funciona', icon: Award, external: true },
    ],
  },
]

export function FooterSection() {
  return (
    <footer className="relative w-full border-t border-border bg-card">
      {/* Linha brilhante no topo — glow sutil indigo */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-px rounded-full blur-sm bg-primary/50"
      />

      <div className="mx-auto max-w-5xl px-4 py-12 lg:py-16">
        <div className="grid w-full gap-10 xl:grid-cols-3 xl:gap-12">

          {/* Coluna da marca */}
          <AnimatedContainer className="space-y-4">
            <Logo size="md" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Prepare-se para a certificação AWS com questões geradas por IA e feedback
              personalizado em cada resposta.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">Alimentado por Amazon Bedrock</span>
            </div>
          </AnimatedContainer>

          {/* Grid de links */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 xl:col-span-2 xl:mt-0">
            {footerLinks.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.15 + index * 0.1}>
                <div>
                  <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-foreground">
                    {section.label}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        {link.external ? (
                          <a
                            href={link.href}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                          >
                            {link.icon && <link.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                            {link.title}
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-primary"
                          >
                            {link.icon && <link.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                            {link.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        {/* Barra inferior */}
        <AnimatedContainer delay={0.5}>
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Certara. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">Feito para quem estuda de verdade.</p>
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  )
}

type ViewAnimationProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -10, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
