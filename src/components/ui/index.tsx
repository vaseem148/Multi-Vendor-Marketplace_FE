import {
  AlertCircle,
  Check,
  ChevronDown,
  Info,
  Loader2,
  Star,
  X,
} from 'lucide-react'
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useEffect,
} from 'react'

import { cn } from '@/lib/utils'
import { useUi } from '@/store/ui'

/* ------------------------------------------------------------------ Button */

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] shadow-[var(--shadow-soft)]',
  secondary:
    'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)] border border-[var(--border)]',
  ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
  outline:
    'border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--primary)]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90',
  success: 'bg-[var(--success)] text-white hover:opacity-90',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2.5',
  icon: 'h-10 w-10 justify-center',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap',
        'transition-all duration-200 active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 shrink-0 animate-spin" /> : icon}
      {children}
    </button>
  )
})

/* ------------------------------------------------------------------- Input */

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
}

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-[var(--text)]">
          {label}
          {required && <span className="text-[var(--danger)]">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[var(--danger)]">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-subtle">{hint}</span>
      )}
    </label>
  )
}

const CONTROL = cn(
  'w-full rounded-xl border bg-[var(--surface)] px-3.5 text-sm text-[var(--text)]',
  'placeholder:text-[var(--text-subtle)] transition-all duration-150',
  'focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldProps {
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, required, leading, trailing, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-subtle)]">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            CONTROL,
            'h-11',
            leading && 'pl-10',
            trailing && 'pr-10',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10'
              : 'border-[var(--border)]',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-subtle)]">
            {trailing}
          </span>
        )}
      </div>
    </FieldShell>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, required, rows = 4, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          CONTROL,
          'resize-y py-2.5 leading-relaxed',
          error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldProps {
  options: { label: string; value: string | number }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, required, options, placeholder, ...props },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            CONTROL,
            'h-11 cursor-pointer appearance-none pr-10',
            error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
      </div>
    </FieldShell>
  )
})

/* ------------------------------------------------------------------- Badge */

type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand'

const TONES: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-3)] text-[var(--text-muted)]',
  info: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  brand: 'bg-[var(--primary)] text-[var(--primary-fg)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
  dot,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------- Card */

export function Card({
  className,
  children,
  hover,
  ...props
}: { hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'card',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Rating */

export function Rating({
  value,
  count,
  size = 14,
  showValue = true,
  className,
}: {
  value: string | number
  count?: number
  size?: number
  showValue?: boolean
  className?: string
}) {
  const rating = Number(value) || 0
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              'shrink-0',
              i <= Math.round(rating)
                ? 'fill-[var(--star)] text-[var(--star)]'
                : 'fill-transparent text-[var(--border-strong)]',
            )}
          />
        ))}
      </span>
      {showValue && rating > 0 && (
        <span className="text-xs font-semibold text-[var(--text)]">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && count > 0 && (
        <span className="text-xs text-subtle">({count})</span>
      )}
    </span>
  )
}

/* ---------------------------------------------------------------- Skeleton */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-20 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-subtle)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ Spinner */

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className={cn('size-7 animate-spin text-[var(--primary)]', className)} />
    </div>
  )
}

/* -------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="animate-[fade-in_0.2s_ease] absolute inset-0 bg-[var(--overlay)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'animate-[scale-in_0.2s_cubic-bezier(0.16,1,0.3,1)] relative w-full',
          'max-h-[92vh] overflow-y-auto rounded-t-2xl bg-[var(--surface)] shadow-2xl sm:rounded-2xl',
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mt-1 -mr-1 rounded-lg p-2 text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- Toasts */

const TOAST_ICONS = {
  success: <Check className="size-4" />,
  error: <AlertCircle className="size-4" />,
  info: <Info className="size-4" />,
}

const TOAST_TONES = {
  success: 'border-l-[var(--success)] text-[var(--success)]',
  error: 'border-l-[var(--danger)] text-[var(--danger)]',
  info: 'border-l-[var(--primary)] text-[var(--primary)]',
}

export function Toaster() {
  const { toasts, dismiss } = useUi()
  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-200 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)] pointer-events-auto',
            'flex items-start gap-3 rounded-xl border border-l-4 border-[var(--border)] bg-[var(--surface)]',
            'p-3.5 shadow-[var(--shadow-lift)]',
            TOAST_TONES[t.tone],
          )}
        >
          <span className="mt-0.5 shrink-0">{TOAST_ICONS[t.tone]}</span>
          <p className="flex-1 text-sm font-medium text-[var(--text)]">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-0.5 text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- Pagination */

export function Pagination({
  page,
  numPages,
  onChange,
}: {
  page: number
  numPages: number
  onChange: (page: number) => void
}) {
  if (numPages <= 1) return null

  // Show a sliding window of 5 around the current page.
  const start = Math.max(1, Math.min(page - 2, numPages - 4))
  const pages = Array.from({ length: Math.min(5, numPages) }, (_, i) => start + i)

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-10">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      {start > 1 && <span className="px-1.5 text-sm text-subtle">…</span>}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'size-9 rounded-lg text-sm font-semibold transition-colors',
            p === page
              ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
          )}
        >
          {p}
        </button>
      ))}
      {start + 4 < numPages && <span className="px-1.5 text-sm text-subtle">…</span>}
      <Button
        size="sm"
        variant="outline"
        disabled={page >= numPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}

/* ------------------------------------------------------------------- Tabs */

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { label: string; value: string; count?: number }[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto border-b border-[var(--border)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors',
            value === tab.value
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                value === tab.value
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                  : 'bg-[var(--surface-3)] text-[var(--text-muted)]',
              )}
            >
              {tab.count}
            </span>
          )}
          {value === tab.value && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[var(--primary)]" />
          )}
        </button>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- StatTile */

export function StatTile({
  label,
  value,
  icon,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  hint?: string
  tone?: Tone
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-muted">{label}</p>
          {/* Money can run long — let it shrink to fit rather than clip to an ellipsis. */}
          <p className="mt-2 text-[clamp(1.125rem,1.7vw,1.5rem)] leading-tight font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
        </div>
        {icon && (
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              TONES[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </Card>
  )
}
