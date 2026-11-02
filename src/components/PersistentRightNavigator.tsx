import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, X } from 'lucide-react';
import { AeneidBook } from '../data/aeneidData';
import { parseCitationQuery, ParsedJumpTarget } from '../utils/navigationParser';

interface PersistentRightNavigatorProps {
  books: AeneidBook[];
  currentBookNumber: number;
  totalLinesCurrentBook: number;
  onNavigate: (bookNumber: number, lineNumber: number) => void;
  onShowNotice?: (message: string, isBlocked: boolean) => void;
  isOpenExternal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PersistentRightNavigator: React.FC<PersistentRightNavigatorProps> = ({
  books,
  currentBookNumber,
  totalLinesCurrentBook,
  onNavigate,
  onShowNotice,
  isOpenExternal,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;
  const setIsOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [inputQuery, setInputQuery] = useState<string>('');
  const [previewParse, setPreviewParse] = useState<ParsedJumpTarget | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputQuery.trim()) {
      setPreviewParse(null);
      return;
    }
    const parsed = parseCitationQuery(inputQuery, currentBookNumber, books.length);
    setPreviewParse(parsed);
  }, [inputQuery, currentBookNumber, books.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const parsed = parseCitationQuery(inputQuery, currentBookNumber, books.length);
    if (!parsed.isValid) {
      onShowNotice?.(`请输入如 1.25、6.743 或纯行号`, true);
      return;
    }

    const targetBook = books.find((b) => b.number === parsed.bookNumber) || books[0];
    const maxLine = targetBook.verses.length;
    const clampedLine = Math.min(Math.max(1, parsed.lineNumber), maxLine);

    onNavigate(parsed.bookNumber, clampedLine);

    if (parsed.lineNumber > maxLine) {
      onShowNotice?.(
        `第 ${parsed.bookNumber} 卷当前共 ${maxLine} 行，已定位至末行`,
        false
      );
    }

    setInputQuery('');
    setPreviewParse(null);
    setIsOpen(false);
  };

  const currentBookObj = books.find((b) => b.number === currentBookNumber) || books[0];

  return (
    <aside
      ref={containerRef}
      aria-label="常驻卷次与诗行查阅导航"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none flex items-center"
    >
      {/* 1. Collapsed State: Feather-light right-edge bookmark tab (24px wide) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label="点击展开卷次与诗行直达"
          title="点击展开卷次与诗行查阅"
          className="group relative flex flex-col items-center justify-center w-6 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs border border-r-0 border-zinc-200/80 dark:border-zinc-800 rounded-l hover:w-7 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 cursor-pointer"
        >
          <span className="font-mono text-[10px] font-medium tracking-tighter text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            {currentBookObj.roman}
          </span>
        </button>
      )}

      {/* 2. Expanded Popover: Ultra-compact 192px editorial index card */}
      {isOpen && (
        <div className="mr-3 w-[196px] bg-white/98 dark:bg-zinc-900/98 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.4)] p-2.5 text-left animate-fade-up">
          {/* Minimal Top Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] font-serif-sc text-zinc-500 dark:text-zinc-400">
              {currentBookObj.titleZh}
              <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-600 ml-1.5">
                1–{totalLinesCurrentBook}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="折叠查阅窗口"
              className="p-0.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Single-line Citation Input (supports 1.25, 6.743, or line number) */}
          <form onSubmit={handleSubmit} className="mb-2.5">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="如 1.25 或 6.743"
                aria-label="输入卷次与行号跳转，如 1.25 或 6.743"
                className="w-full pl-2.5 pr-7 py-1 text-[11px] font-mono border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
              />
              <button
                type="submit"
                title="回车或点击跳转"
                aria-label="确认跳转"
                className="absolute right-1 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>

            {previewParse && (
              <div className="mt-1 px-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
                {previewParse.explanation}
              </div>
            )}
          </form>

          {/* Ultra-compact 6x2 Roman Numeral Matrix (No dark heavy blocks) */}
          <div className="grid grid-cols-6 gap-1">
            {books.map((b) => {
              const isCurrent = b.number === currentBookNumber;
              return (
                <button
                  key={b.number}
                  type="button"
                  onClick={() => {
                    onNavigate(b.number, 1);
                    setIsOpen(false);
                  }}
                  title={b.titleZh}
                  className={`h-6 text-[10px] font-mono rounded transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-300 dark:border-zinc-600'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {b.roman}
                </button>
              );
            })}
          </div>

          {/* Subtle Quick Line Anchors */}
          <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <button
              type="button"
              onClick={() => {
                onNavigate(currentBookNumber, 1);
                setIsOpen(false);
              }}
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              首行
            </button>
            {totalLinesCurrentBook > 10 && (
              <button
                type="button"
                onClick={() => {
                  onNavigate(currentBookNumber, Math.floor(totalLinesCurrentBook / 2));
                  setIsOpen(false);
                }}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                L.{Math.floor(totalLinesCurrentBook / 2)}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onNavigate(currentBookNumber, totalLinesCurrentBook);
                setIsOpen(false);
              }}
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              末行
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
