/**
 * MediaGallery - Resort images/videos with lightbox, captions, lazy loading
 */
import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { MediaItem } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface MediaGalleryProps {
  items?: MediaItem[] | null
  resortName?: string
  className?: string
}

export function MediaGallery({ items, resortName = '', className }: MediaGalleryProps) {
  const media = ensureArray(items)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const goNext = useCallback(() => {
    if (lightboxIndex == null) return
    setLightboxIndex((lightboxIndex + 1) % media.length)
  }, [lightboxIndex, media.length])

  const goPrev = useCallback(() => {
    if (lightboxIndex == null) return
    setLightboxIndex((lightboxIndex - 1 + media.length) % media.length)
  }, [lightboxIndex, media.length])

  useEffect(() => {
    if (lightboxIndex == null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

  if (media.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-video items-center justify-center rounded-lg bg-secondary text-muted-foreground',
          className
        )}
      >
        <span className="text-sm">No media</span>
      </div>
    )
  }

  const currentItem = lightboxIndex != null ? media[lightboxIndex] : null

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4',
          className
        )}
        role="list"
        aria-label={`Media gallery for ${resortName}`}
      >
        {media.map((m, index) => (
          <button
            key={m.id}
            type="button"
            className="group relative aspect-video overflow-hidden rounded-lg bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => openLightbox(index)}
            aria-label={m.caption ?? `View image ${index + 1}`}
          >
            <img
              src={m.url}
              alt={m.caption ?? m.type ?? `Resort image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            {m.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-left text-xs text-white line-clamp-2">{m.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={lightboxIndex != null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-0" showClose={false}>
          <DialogTitle className="sr-only">
            {currentItem?.caption ?? `Image ${(lightboxIndex ?? 0) + 1} of ${media.length}`}
          </DialogTitle>
          {currentItem && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
                onClick={closeLightbox}
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={currentItem.url}
                alt={currentItem.caption ?? 'Resort image'}
                className="max-h-[85vh] w-full object-contain"
              />
              {currentItem.caption && (
                <p className="p-4 text-center text-sm text-white">
                  {currentItem.caption}
                </p>
              )}
              {media.length > 1 && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
              )}
              {media.length > 1 && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
