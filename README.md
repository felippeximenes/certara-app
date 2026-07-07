# Certara

Plataforma de preparação para certificações AWS com questões geradas por Inteligência Artificial, feedback personalizado e sistema de assinatura Premium.

**Acesse em produção:** [quizzapp-six-cyan.vercel.app](https://quizzapp-six-cyan.vercel.app)

---

## Telas

### Landing Page — Hero fullscreen com cena 3D e navbar glassmorphism
![Landing](screenshots/00-landing-desktop.png)

### Login — Painel 3D com hexágonos flutuantes
![Login](screenshots/01-login-desktop.png)

### Cadastro
![Cadastro](screenshots/02-login-register-desktop.png)

### Home — Dashboard com badges e seleção inline
![Home](screenshots/03-home-desktop.png)

### Home — Seleção de dificuldade (accordion inline)
![Dificuldade](screenshots/04-home-difficulty-desktop.png)

### Histórico
![Histórico](screenshots/09-history-desktop.png)

### Assinatura
![Assinatura](screenshots/10-subscription-desktop.png)

---

## Funcionalidades

### Núcleo
- **3 certificações**: CLF-C02 (Cloud Practitioner), SAA-C03 (Solutions Architect), DVA-C02 (Developer)
- **3 dificuldades**: Fácil, Médio, Difícil — seleção inline (accordion) logo abaixo da cert escolhida
- **10 questões por quiz**, geradas em tempo real pelo Amazon Bedrock
- **Feedback com IA** após cada resposta: explicação, links de estudo e tópico
- **Resumo final** com análise de desempenho e plano de estudo personalizado
- **Histórico completo** com placar, percentual e breakdown por domínio

### Landing Page
- Hero fullscreen (`min-h-dvh`) com cena 3D de hexágonos AWS flutuando sobre o card de quiz
- Navbar glassmorphism flutuante (`backdrop-blur-[18px]`) com pill container, transparente em repouso e opaco ao rolar
- Animações de entrada por scroll (`motion/react`): `fadeUp`, `slideLeft`, `slideRight`, `scaleIn` com efeitos distintos por seção
- Coluna de depoimentos com scroll infinito automático em 3 colunas
- Seções: Hero → Stats → Como funciona → Features → Preços → CTA

### Login
- Layout split: painel esquerdo com cena 3D (hexágonos SAA/CLF/DVA flutuando + parallax no mouse), painel direito com formulário
- Formulários de **Entrar** e **Criar conta** em tab toggle com pill deslizante
- Barra de força da senha com 4 segmentos coloridos
- SSO Google (placeholder) com botão full-width
- Validação Cognito: cadastro → confirmação por e-mail → login
- Visual inteiramente em light mode fixo

### Home (Dashboard)
- **Badges hexagonais AWS** com gradiente por certificação (âmbar CLF, azul SAA, verde DVA)
- **Seleção inline de dificuldade**: clicar em uma certificação expande o card accordion com os 3 níveis logo abaixo, sem scroll
- **TrackEmptyState**: card de criação de trilha de estudos com IA ligado à rota `/plano-de-estudos`
- Stats: quizzes feitos, média geral, melhor score, sequência diária
- Gráfico de evolução de desempenho (SVG inline)
- Domínios mais fracos com barras de progresso coloridas
- Plano IA baseado no histórico + ferramentas rápidas (Simulado, Flashcards, Plano, Histórico)
- Banner hero com Ring de prontidão (SVG animado)

### UX
- **Light mode fixo** — dark mode removido globalmente
- Layout responsivo (mobile, tablet, desktop)
- Barra de progresso visual durante o quiz
- `prefers-reduced-motion` respeitado em todas as animações
- Efeito parallax 3D no mouse (login e hero)

### Autenticação
- Cadastro e login via **AWS Cognito**
- Rotas protegidas com redirect automático
- Token JWT em todas as chamadas à API

### Assinatura
| | Gratuito | Premium |
|---|---|---|
| Quizzes/dia | 5 | Ilimitados |
| Feedback IA | Sim | Sim |
| Histórico | Últimos quizzes | Completo |
| Preço | R$ 0 | R$ 14,90/mês |

- Checkout via **Stripe** (cartão de crédito)
- Cancelamento com vigência até o fim do período pago
- **Portal do cliente** para trocar cartão e consultar faturas
- Badge de status Premium no header da Home
- Paywall com upgrade prompt quando cota diária é atingida

---

## Stack Técnica

### Frontend
| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Framework e tipagem |
| Vite | Build e dev server |
| Tailwind CSS v3 | Estilização (design system "Mente Clara") |
| React Router v6 | Roteamento SPA |
| motion/react v12 | Animações declarativas com scroll triggers |
| AWS Amplify v6 | Autenticação Cognito |
| Zustand | Estado global |
| Lucide React | Ícones SVG |
| CSS 3D transforms | Cenas de hexágonos flutuantes (login + hero) |

**Deploy:** Vercel (CI/CD automático a partir do branch `main`)

### Backend
| Tecnologia | Uso |
|---|---|
| AWS SAM | Infraestrutura como código (IaC) |
| AWS Lambda (Python 3.11) | 10 funções serverless |
| Amazon API Gateway (HTTP API) | Roteamento com auth JWT |
| Amazon Cognito | Autenticação de usuários |
| Amazon DynamoDB | Banco de dados (histórico + assinaturas) |
| Amazon Bedrock (Nova Pro) | Geração e avaliação de questões com IA |
| Qdrant | Banco vetorial para contexto das questões |
| Stripe | Pagamentos, webhooks e portal do cliente |

**Deploy:** `sam build && sam deploy` (AWS CloudFormation)

---

## Arquitetura

```
┌─────────────────────────────────────────────┐
│               Frontend (Vercel)              │
│  React + TypeScript + Tailwind CSS           │
│  AWS Amplify ──► Cognito (auth)             │
└────────────────────┬────────────────────────┘
                     │ HTTPS + JWT
┌────────────────────▼────────────────────────┐
│          API Gateway (HTTP API)              │
│         Cognito JWT Authorizer              │
└──┬──────┬──────┬──────┬──────┬─────────────┘
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
Lambda  Lambda Lambda Lambda Lambda  ...
gen_q  eval_a  save  hist  sub   (10 funções)
   │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼
Bedrock Bedrock DynamoDB DynamoDB DynamoDB
(Nova) (Nova)  history  history  subscriptions
                              │
                          Stripe API
                              │
                     ┌────────▼────────┐
                     │ stripe_webhook  │
                     │ (sem auth JWT)  │
                     └─────────────────┘
```

---

## Funções Lambda

| Função | Método | Rota | Descrição |
|---|---|---|---|
| `generate_question` | POST | `/generate-question` | Gera questão via Bedrock com verificação de cota |
| `evaluate_answer` | POST | `/evaluate-answer` | Avalia resposta e gera feedback IA |
| `generate_summary` | POST | `/generate-summary` | Gera plano de estudo com base no desempenho |
| `save_quiz` | POST | `/save-quiz` | Salva resultado e incrementa contador diário |
| `list_history` | GET | `/history` | Lista histórico de quizzes do usuário |
| `get_subscription` | GET | `/subscription` | Retorna plano atual e cota diária |
| `create_checkout_session` | POST | `/create-checkout-session` | Cria sessão Stripe Checkout |
| `cancel_subscription` | POST | `/cancel-subscription` | Agenda cancelamento ao fim do período |
| `customer_portal` | POST | `/customer-portal` | Cria sessão do portal de faturamento Stripe |
| `stripe_webhook` | POST | `/stripe-webhook` | Processa eventos Stripe (sem auth JWT) |

### Eventos Stripe monitorados
- `checkout.session.completed` — ativa o plano Premium
- `customer.subscription.updated` — atualiza período de renovação
- `customer.subscription.deleted` — rebaixa para plano Gratuito
- `invoice.payment_failed` — sinaliza falha de pagamento

---

## Estrutura do Projeto

```
quizzapp/
├── src/
│   ├── pages/
│   │   ├── Landing.tsx          # Landing page pública com hero 3D e animações
│   │   ├── Login.tsx            # Auth (login + cadastro) com painel 3D parallax
│   │   ├── Home.tsx             # Dashboard: badges, stats, seleção inline
│   │   ├── Quiz.tsx             # Quiz com 10 questões e progresso
│   │   ├── Result.tsx           # Resultado e resumo IA
│   │   ├── History.tsx          # Histórico de quizzes
│   │   ├── StudyPlan.tsx        # Plano de estudos gerado por IA
│   │   ├── Flashcards.tsx       # Flashcards de revisão
│   │   ├── Simulation.tsx       # Modo simulado (65 questões)
│   │   └── Subscription.tsx     # Gerenciamento de assinatura
│   ├── components/
│   │   ├── ui/
│   │   │   ├── hero-section-dark.tsx    # Hero fullscreen com RetroGrid
│   │   │   └── testimonials-columns-1.tsx # Colunas com scroll infinito
│   │   ├── FloatingHex.tsx      # Hexágono 3D flutuante (login)
│   │   ├── HeroHex.tsx          # Hexágono 3D flutuante (hero)
│   │   ├── HeroScene.tsx        # Cena 3D completa do hero (hexes + card quiz)
│   │   ├── Logo.tsx             # Logotipo do projeto
│   │   ├── Onboarding.tsx       # Tour de boas-vindas
│   │   ├── NotificationBell.tsx # Sino de notificações
│   │   └── ProtectedRoute.tsx   # Guard de autenticação
│   ├── hooks/
│   │   └── useParallax.ts       # Mouse parallax para cenas 3D
│   ├── styles/
│   │   ├── login3d.css          # CSS 3D da cena do login (.scene/.stage/.fhex)
│   │   └── hero3d.css           # CSS 3D da cena do hero (.hscene/.hstage/.hfhex)
│   ├── services/
│   │   ├── api.ts               # Chamadas ao backend
│   │   ├── auth.ts              # Helpers Cognito/Amplify
│   │   └── analytics.ts         # Eventos de analytics
│   ├── store/
│   │   ├── authStore.ts         # Estado de autenticação (Zustand)
│   │   └── quizStore.ts         # Estado do quiz (Zustand)
│   ├── data/
│   │   └── certifications.ts    # Metadados das 3 certificações AWS
│   ├── types/
│   │   └── quiz.ts              # Tipos TypeScript
│   └── App.tsx                  # Rotas
├── backend/
│   ├── template.yaml            # SAM (infraestrutura)
│   ├── samconfig.toml           # Parâmetros de deploy (gitignored)
│   └── functions/
│       ├── generate_question/
│       ├── evaluate_answer/
│       ├── generate_summary/
│       ├── save_quiz/
│       ├── list_history/
│       ├── get_subscription/
│       ├── create_checkout_session/
│       ├── cancel_subscription/
│       ├── customer_portal/
│       └── stripe_webhook/
├── screenshots/                 # Prints das telas (gitignored)
└── public/
```

---

## Variáveis de Ambiente

### Frontend (`.env.local`)
```env
VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Backend (`backend/samconfig.toml`) — não versionado
```toml
parameter_overrides = [
  "BedrockRegion=us-east-1",
  "BedrockModelId=amazon.nova-pro-v1:0",
  "QdrantUrl=https://...",
  "StripeSecretKey=sk_live_...",
  "StripeWebhookSecret=whsec_...",
  "StripePriceId=price_...",
  "FrontendUrl=https://quizzapp-six-cyan.vercel.app",
]
```

---

## Como rodar localmente

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
sam build
sam deploy
```

> Após o deploy, copie a `ApiUrl` do output do CloudFormation e coloque em `VITE_API_URL`.

---

## DynamoDB — Estrutura das tabelas

### `quizzapp-history`
| Campo | Tipo | Descrição |
|---|---|---|
| `userId` (PK) | String | ID do usuário Cognito |
| `quizId` (SK) | String | UUID do quiz |
| `score` | Number | Acertos |
| `total` | Number | Total de questões |
| `difficulty` | String | easy / medium / hard |
| `answers` | List | Respostas com domínio e resultado |
| `createdAt` | String | ISO timestamp |

### `quizzapp-subscriptions`
| Campo | Tipo | Descrição |
|---|---|---|
| `userId` (PK) | String | ID do usuário Cognito |
| `sortKey` (SK) | String | `SUBSCRIPTION` ou `QUOTA#YYYY-MM-DD` |
| `plan` | String | `free` ou `premium` |
| `stripeCustomerId` | String | ID do cliente Stripe |
| `stripeSubscriptionId` | String | ID da assinatura Stripe |
| `currentPeriodEnd` | Number | Unix timestamp de expiração |
| `cancelAtPeriodEnd` | Boolean | Cancelamento agendado |
| `quizzesToday` | Number | Contador diário de quizzes |

---

## Segurança

- Chaves Stripe e segredos fora do controle de versão (`samconfig.toml` no `.gitignore`)
- Webhook Stripe validado por assinatura HMAC (`stripe.Webhook.construct_event`)
- Todas as rotas autenticadas por JWT Cognito no API Gateway
- Rota `/stripe-webhook` exposta sem auth JWT (validação via assinatura Stripe)
- Variáveis sensíveis com `NoEcho: true` no SAM template

---

## Planos futuros

- Mais certificações AWS (ANS-C01, SCS-C02, MLS-C01)
- Login social Google funcional via Cognito Hosted UI
- Análise de evolução por domínio com gráficos avançados
- App mobile (React Native)
