import React, { useState, useRef, useEffect } from 'react';
import { X, Pin } from 'lucide-react';
import { InlineAnnotation } from '../data/aeneidData';

interface InlineAnnotationTriggerProps {
  annotation: InlineAnnotation;
  lineNumber: number;
  activeAnnotationId: string | null;
  pinnedAnnotationId: string | null;
  onActivate: (id: string | null) => void;
  onTogglePin: (id: string) => void;
}

export const InlineAnnotationTrigger: React.FC<InlineAnnotationTriggerProps> = ({
  annotation,
  lineNumber,
  activeAnnotationId,
  pinnedAnnotationId,
  onActivate,
  onTogglePin,
}) => {
  const isOpen = activeAnnotationId === annotation.id || pinnedAnnotationId === annotation.id;
  const isPinned = pinnedAnnotationId === annotation.id;
  const containerRef = useRef<HTMLSpanElement>(null);
  const [alignRight, setAlignRight] = useState(false);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      setAlignRight(rect.left > viewportWidth * 0.55);
    }
  }, [isOpen]);

  return (
    <span
      ref={containerRef}
      className="relative inline"
      onMouseEnter={() => onActivate(annotation.id)}
      onMouseLeave={() => {
        if (!isPinned) {
          onActivate(null);
        }
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(annotation.id);
        }}
        aria-expanded={isOpen}
        aria-label={`注释 ${annotation.markerLabel}：${annotation.title}`}
        className={`inline text-left transition-colors cursor-pointer border-b border-dotted ${
          isOpen
            ? 'border-zinc-900 text-zinc-950 dark:border-zinc-100 dark:text-zinc-50 bg-zinc-100/70 dark:bg-zinc-800/70'
            : 'border-zinc-400/60 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-200'
        }`}
      >
        <span>{annotation.anchorPhrase}</span>
        <sup
          data-annotation-badge="true"
          className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500 ml-0.5 select-none font-normal"
        >
          [{annotation.markerLabel}]
        </sup>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={`注释详情：${annotation.title}`}
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-40 top-full mt-1.5 w-[280px] sm:w-[320px] p-3.5 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 rounded-lg shadow-[0_8px_28px_rgba(0,0,0,0.08)] text-left select-none font-sans animate-fade-up ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">注 {annotation.markerLabel}</span>
              <span>·</span>
              <span>L.{lineNumber}</span>
              <span>·</span>
              <span>{annotation.category}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTogglePin(annotation.id)}
                className={`p-0.5 cursor-pointer transition-colors ${
                  isPinned ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title={isPinned ? '取消固定' : '固定注释'}
                aria-label={isPinned ? '取消固定注释' : '固定注释'}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onActivate(null);
                  if (isPinned) onTogglePin(annotation.id);
                }}
                className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                aria-label="关闭注释"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1 font-serif-sc">
            {annotation.title}
          </h4>

          {annotation.latinTerm && (
            <div className="text-[11px] font-mono text-zinc-500 mb-2 italic">
              {annotation.latinTerm}
            </div>
          )}

          <p className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            {annotation.explanation}
          </p>

          {annotation.comparativeNote && (
            <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] leading-relaxed text-zinc-400">
              <span className="text-zinc-500 dark:text-zinc-300 mr-1">[译辨]</span>
              {annotation.comparativeNote}
            </div>
          )}
        </div>
      )}
    </span>
  );
};
