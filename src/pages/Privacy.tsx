import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '../components/Logo'

const UPDATED = 'Junho de 2025'

export function Privacy() {
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
          <h1 className="font-sans text-3xl font-extrabold text-foreground">
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">Última atualização: {UPDATED}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Esta Política de Privacidade descreve como a Certara coleta, usa e protege seus dados
          pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <Section title="1. Dados Coletados">
          <p>Coletamos as seguintes categorias de dados pessoais:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Dados de cadastro:</strong> e-mail e senha (armazenada de forma criptografada
              via AWS Cognito).
            </li>
            <li>
              <strong>Dados de uso:</strong> histórico de quizzes, pontuações, domínios praticados
              e sequência de estudos.
            </li>
            <li>
              <strong>Dados de pagamento:</strong> informações de cartão de crédito processadas
              diretamente pela Stripe Inc. A Certara não armazena dados de cartão em seus servidores.
            </li>
            <li>
              <strong>Dados técnicos:</strong> endereço IP, tipo de navegador e logs de acesso para
              fins de segurança e diagnóstico.
            </li>
          </ul>
        </Section>

        <Section title="2. Como Usamos seus Dados">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Personalização:</strong> adaptar questões, feedback e plano de estudos ao seu
              desempenho individual.
            </li>
            <li>
              <strong>Cobrança:</strong> processar e gerenciar assinaturas Premium via Stripe.
            </li>
            <li>
              <strong>Comunicação:</strong> enviar notificações sobre sua conta, atualizações da
              plataforma e dicas de estudo (apenas com seu consentimento).
            </li>
            <li>
              <strong>Melhoria do serviço:</strong> analisar padrões de uso agregados e anônimos
              para aprimorar a plataforma.
            </li>
          </ul>
        </Section>

        <Section title="3. Compartilhamento de Dados">
          <p>
            Compartilhamos seus dados somente com parceiros essenciais à operação do serviço:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Amazon Web Services (AWS):</strong> infraestrutura de nuvem onde a plataforma
              opera (servidores, banco de dados, autenticação e geração de IA).
            </li>
            <li>
              <strong>Stripe Inc.:</strong> processamento seguro de pagamentos e gerenciamento de
              assinaturas.
            </li>
          </ul>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins
            publicitários.
          </p>
        </Section>

        <Section title="4. Seus Direitos (LGPD)">
          <p>
            Como titular de dados, você tem os seguintes direitos garantidos pela LGPD:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Acesso:</strong> solicitar uma cópia dos dados que temos sobre você.
            </li>
            <li>
              <strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados.
            </li>
            <li>
              <strong>Exclusão:</strong> solicitar a exclusão dos seus dados pessoais (observadas
              obrigações legais de retenção).
            </li>
            <li>
              <strong>Portabilidade:</strong> receber seus dados em formato estruturado e
              interoperável.
            </li>
            <li>
              <strong>Revogação de consentimento:</strong> retirar o consentimento para tratamento
              de dados a qualquer momento.
            </li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, entre em contato com nosso DPO (Encarregado
            de Proteção de Dados):{' '}
            <a href="mailto:privacidade@certara.com.br" className="text-primary hover:underline">
              privacidade@certara.com.br
            </a>
          </p>
        </Section>

        <Section title="5. Retenção de Dados">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, os
            dados são removidos em até 30 dias, exceto quando a retenção for exigida por lei.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação e
            preferências) e cookies analíticos para entender como o serviço é utilizado. Você pode
            gerenciar suas preferências de cookies pelo banner exibido no primeiro acesso.
          </p>
        </Section>

        <Section title="7. Segurança">
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não
            autorizado, incluindo criptografia em trânsito (TLS) e em repouso, autenticação via
            AWS Cognito e controles de acesso baseados em funções.
          </p>
        </Section>

        <Section title="8. Alterações nesta Política">
          <p>
            Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças
            significativas por e-mail ou aviso na plataforma. O uso continuado após as alterações
            implica aceitação da nova versão.
          </p>
        </Section>

        <Section title="9. Contato">
          <p>
            Para dúvidas sobre privacidade e proteção de dados, entre em contato com nosso DPO:{' '}
            <a href="mailto:privacidade@certara.com.br" className="text-primary hover:underline">
              privacidade@certara.com.br
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
