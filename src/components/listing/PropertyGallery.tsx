import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length),
    [images.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  const openAt = (i: number) => {
    setIndex(i)
    setOpen(true)
  }

  const rest = images.slice(1, 5)

  return (
    <>
      <div className="relative grid gap-2 sm:h-[26rem] sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="group relative overflow-hidden rounded-xl sm:col-span-2 sm:row-span-2"
          aria-label="Open photo gallery"
        >
          <SmartImage
            src={images[0]}
            alt={`${title} — main photo`}
            eager
            wrapperClassName="aspect-4/3 sm:aspect-auto sm:h-full"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </button>

        {rest.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => openAt(i + 1)}
            className="group relative hidden overflow-hidden rounded-xl sm:block"
            aria-label={`Open photo ${i + 2}`}
          >
            <SmartImage
              src={src}
              alt={`${title} — photo ${i + 2}`}
              wrapperClassName="h-full"
              className="transition-transform duration-700 group-hover:scale-105"
            />
            {i === rest.length - 1 && images.length > 5 && (
              <span className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-bold text-white">
                +{images.length - 5} more
              </span>
            )}
          </button>
        ))}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => openAt(0)}
          className="absolute right-4 bottom-4 hidden sm:inline-flex"
        >
          <Expand /> All {images.length} photos
        </Button>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => openAt(0)}
        className="mt-2 w-full sm:hidden"
      >
        <Expand /> View all {images.length} photos
      </Button>

      {/* ---------------- lightbox ---------------- */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col outline-none">
            <DialogPrimitive.Title className="sr-only">{title} — photo gallery</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Use the left and right arrow keys to move between photos.
            </DialogPrimitive.Description>

            <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
              <p className="text-sm font-semibold tabular-nums">
                {index + 1} / {images.length}
              </p>
              <DialogPrimitive.Close
                aria-label="Close gallery"
                className="rounded-md p-2 transition-colors hover:bg-white/10"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:left-4"
              >
                <ChevronLeft className="size-5" />
              </button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={index}
                  src={images[index]}
                  alt={`${title} — photo ${index + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </AnimatePresence>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-4"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="no-scrollbar flex shrink-0 justify-start gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'h-16 w-24 shrink-0 overflow-hidden rounded-md transition-all',
                    i === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90',
                  )}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
