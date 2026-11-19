import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxItem {
  src: string;
  alt: string;
}

export default function MediaLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((images: LightboxItem[], startIndex: number) => {
    setItems(images);
    setCurrentIndex(startIndex);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    // Collect all article images and attach click listeners
    const scanImages = () => {
      const articleImages = Array.from(
        document.querySelectorAll<HTMLImageElement>('.article-content img, .blog-gallery img')
      );

      if (articleImages.length === 0) return;

      const mediaItems: LightboxItem[] = articleImages.map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt || 'Изображение статьи'
      }));

      articleImages.forEach((img, index) => {
        if (img.dataset.lightboxBound) return;
        img.dataset.lightboxBound = 'true';
        img.style.cursor = 'zoom-in';
        img.classList.add('transition-transform', 'duration-200', 'hover:opacity-95');

        img.addEventListener('click', (e) => {
          e.preventDefault();
          openLightbox(mediaItems, index);
        });
      });
    };

    scanImages();

    // Re-scan when content swaps or loads
    document.addEventListener('astro:page-load', scanImages);
    document.addEventListener('astro:after-swap', scanImages);

    return () => {
      document.removeEventListener('astro:page-load', scanImages);
      document.removeEventListener('astro:after-swap', scanImages);
    };
  }, [openLightbox]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, handlePrev, handleNext]);

  if (!isOpen || items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={closeLightbox}
    >
      {/* Top action bar: Counter & Close button */}
      <div 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {items.length > 1 && (
          <div className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs backdrop-blur-sm border border-white/10">
            {currentIndex + 1} / {items.length}
          </div>
        )}
        <button
          type="button"
          onClick={closeLightbox}
          className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Закрыть"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Prev button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer z-10 backdrop-blur-sm"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      {/* Main image container */}
      <div 
        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl transition-all duration-200 animate-in zoom-in-95 duration-200"
        />
        {current.alt && current.alt !== 'Изображение статьи' && (
          <p className="mt-3 text-center text-xs sm:text-sm text-neutral-300 font-medium max-w-xl truncate">
            {current.alt}
          </p>
        )}
      </div>

      {/* Next button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer z-10 backdrop-blur-sm"
          aria-label="Следующее изображение"
        >
          <ChevronRight className="size-6" />
        </button>
      )}
    </div>
  );
}
