import { Component, ErrorInfo, ReactNode } from 'react'
import { Logo } from './Logo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 text-center">
          <Logo size="lg" />
          <div className="space-y-2">
            <h1 className="font-sans text-xl font-bold text-foreground">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Recarregue a página para continuar.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
