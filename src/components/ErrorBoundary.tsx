import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Without this, a throw anywhere in the tree unmounts the whole app and the
 * user just sees a white page. Catching it keeps the failure visible and local.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[var(--danger-soft)] text-[var(--danger)]">
            <AlertTriangle className="size-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Something broke on this page</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The rest of the app is fine — this screen hit an error while rendering.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-left font-mono text-xs text-[var(--danger)]">
            {error.message}
          </pre>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)]"
            >
              <RotateCcw className="size-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-fg)] transition-opacity hover:opacity-90"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
