import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="bg-brand-soft text-brand grid size-16 place-items-center rounded-full">
        <Compass className="size-7" />
      </span>
      <p className="font-display text-muted mt-8 text-6xl font-semibold">404</p>
      <h1 className="font-display text-default mt-3 text-3xl font-semibold tracking-tight">
        Wrong turn
      </h1>
      <p className="text-muted mt-3 text-pretty">
        That page isn&rsquo;t here. The listing may have been taken down, or the link was mistyped.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/search">Browse homes</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
