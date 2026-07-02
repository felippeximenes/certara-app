import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '../components/Logo'

const UPDATED = 'Junho de 2025'

export function Terms() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Logo size="sm" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="font-sans text-3xl font-extrabold text-foreground">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {UPDATED}</p>
        </div>

        <Section title="1. Sobre o Serviço">
          <p>
            A Certara é uma plataforma educacional de preparação para certificações AWS, que utiliza
            inteligência artificial para gerar questões personalizadas, feedback detalhado e planos
            de estudo adaptativos. Ao utilizar a Certara, você concorda com estes Termos de Uso.
          </p>
        </Section>

        <Section title="2. Planos e Pagamentos">
          <p>
            A Certara oferece dois planos: <strong>Gratuito</strong> (até 5 quizzes por dia, sem
            custo) e <strong>Premium</strong> (quizzes ilimitados e acesso a todas as
            funcionalidades, cobrado mensalmente via Stripe).
          </p>
          <p>
            Os pagamentos são processados com segurança pela Stripe Inc. Ao assinar o plano
            Premium, você autoriza a cobrança recorrente no cartão de crédito cadastrado até que a
            assinatura seja cancelada.
          </p>
          <p>
            Os preços exibidos na plataforma estão em Reais (BRL) e incluem todos os impostos
            aplicáveis.
          </p>
        </Section>

        <Section title="3. Política de Cancelamento">
          <p>
            Você pode cancelar sua assinatura Premium a qualquer momento através da página de
            assinatura dentro da plataforma. O cancelamento terá efeito ao final do período de
            cobrança vigente — você continuará com acesso Premium até essa data. Não realizamos
            reembolsos proporcionais por cancelamentos antecipados.
          </p>
        </Section>

        <Section title="4. Uso Aceitável">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              É proibido realizar engenharia reversa, descompilar ou tentar extrair o código-fonte
              da plataforma.
            </li>
            <li>
              Compartilhamento de contas não é permitido. Cada conta deve ser utilizada por apenas
              uma pessoa física.
            </li>
            <li>
              É proibido utilizar sistemas automatizados (bots, scrapers, scripts) para acessar ou
              coletar conteúdo da plataforma.
            </li>
            <li>
              O conteúdo gerado pela Certara — questões, explicações e planos de estudo — é de uso
              pessoal e não pode ser redistribuído comercialmente.
            </li>
          </ul>
        </Section>

        <Section title="5. Limitação de Responsabilidade">
          <p>
            A Certara é uma ferramenta de apoio ao estudo. Não garantimos aprovação em exames de
            certificação AWS. O conteúdo é gerado por inteligência artificial e pode conter
            imprecisões. Recomendamos utilizar materiais oficiais da AWS em conjunto com a
            plataforma.
          </p>
          <p>
            Em nenhuma circunstância a Certara será responsável por danos indiretos, incidentais ou
            consequenciais decorrentes do uso ou incapacidade de uso da plataforma.
          </p>
        </Section>

        <Section title="6. Alterações nos Termos">
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações
            significativas serão comunicadas por e-mail com pelo menos 15 dias de antecedência. O
            uso continuado da plataforma após as alterações implica aceitação dos novos Termos.
          </p>
        </Section>

        <Section title="7. Contato">
          <p>
            Dúvidas sobre estes Termos de Uso? Entre em contato:{' '}
            <a
              href="mailto:suporte@certara.com.br"
              className="text-primary hover:underline"
            >
              suporte@certara.com.br
            </a>
          </p>
        </Section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          © 2025 Certara. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-sans text-lg font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
