import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Image with a shimmer placeholder, a fade-in once decoded, and a themed
 * fallback tile if the CDN is unreachable — so a dead URL never leaves a
 * broken-image icon in the middle of the layout.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  eager,
  sizes,
}: {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  eager?: boolean
  sizes?: string
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => setState('loading'), [src])

  return (
    <div className={cn('bg-surface-2 relative overflow-hidden', wrapperClassName)}>
      {state === 'loading' && <div className="skeleton absolute inset-0" />}
      {state === 'error' ? (
        <div className="text-muted absolute inset-0 grid place-items-center gap-2">
          <ImageOff className="size-6 opacity-50" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          className={cn(
            'size-full object-cover transition-opacity duration-500',
            state === 'ready' ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  )
}
