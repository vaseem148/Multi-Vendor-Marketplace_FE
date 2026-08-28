import { Compass, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer, Navbar } from '@/components/layout'
import { Button } from '@/components/ui'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="hero-mesh flex flex-1 items-center justify-center px-4 py-24 text-center">
        <div>
          <p className="text-7xl font-extrabold tracking-tight text-[var(--primary)]">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">This page took a wrong turn</h1>
          <p className="mx-auto mt-3 max-w-md text-muted">
            The page you were after does not exist, or it has been moved somewhere else.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button size="lg" icon={<Home className="size-4.5" />}>
                Go home
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="outline" icon={<Compass className="size-4.5" />}>
                Browse the shop
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
