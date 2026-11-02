import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  ShieldAlert,
  CheckCircle2,
  Sun,
  Moon,
  X,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ArrowUp,
  Menu,
} from 'lucide-react';
import {
  AENEID_BOOKS,
  THREE_MAPS,
  AeneidBook,
  VerseLine,
  InlineAnnotation,
} from './data/aeneidData';
import {
  enforceCopyLineLimit,
  embedZeroWidthCanary,
  MAX_HUMAN_COPY_LINES,
} from './utils/copyGuard';
import { SwissBookPlate } from './components/SwissBookPlate';
import { InlineAnnotationTrigger } from './components/InlineAnnotationPopover';
import { SwissCartographyAtlas } from './components/SwissCartographyAtlas';
import { AiScrapingBlueprintPanel } from './components/AiScrapingBlueprintModal';
import { ManuscriptImporterModal } from './components/ManuscriptImporterModal';
import { PrologueLanding } from './components/PrologueLanding';
import { SidebarDrawer } from './components/SidebarDrawer';
import { PersistentRightNavigator } from './components/PersistentRightNavigator';
import { parseCitationQuery } from './utils/navigationParser';

// Section navigation types: Default is 'prologue' (intro landing), then 'reader', 'maps', 'ai-security'
type ActiveSection = 'prologue' | 'reader' | 'maps' | 'ai-security';

export default function App() {
  const [books, setBooks] = useState<AeneidBook[]>(() => {
    try {
      const saved = localStorage.getItem('aeneid_custom_books_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 12) return parsed;
      }
    } catch {}
    return AENEID_BOOKS;
  });
  const [activeSection, setActiveSection] = useState<ActiveSection>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'reader';
    }
    return 'prologue';
  });
  const [selectedBookNum, setSelectedBookNum] = useState<number>(1);
  const [activeMapId, setActiveMapId] = useState<'map-mediterranean' | 'map-latium' | 'map-avernus'>('map-mediterranean');

  // Lateral sidebar, quick navigator & reading state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState<boolean>(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Annotation popover state
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [pinnedAnnotationId, setPinnedAnnotationId] = useState<string | null>(null);

  // Custom uploaded images for plates & maps (localStorage)
  const [customPlateImages, setCustomPlateImages] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('aeneid_custom_plates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customMapImages, setCustomMapImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('aeneid_custom_maps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Floating modern notification toast for copy-guard
  const [copyToast, setCopyToast] = useState<{
    message: string;
    isBlocked: boolean;
  } | null>(null);

  // Importer modal
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Dismiss pinned annotation when clicking outside
  useEffect(() => {
    const handleDocClick = () => {
      if (pinnedAnnotationId) setPinnedAnnotationId(null);
      if (activeAnnotationId) setActiveAnnotationId(null);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [pinnedAnnotationId, activeAnnotationId]);

  // Auto-dismiss copy toast after 4s
  useEffect(() => {
    if (copyToast) {
      const t = setTimeout(() => setCopyToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [copyToast]);

  // Track subtle reading progress for top header hairline
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
      setScrollProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, selectedBookNum]);

  const currentBook = useMemo(
    () => books.find((b) => b.number === selectedBookNum) || books[0],
    [books, selectedBookNum]
  );

  const currentLinkedMap = useMemo(
    () =>
      THREE_MAPS.find((m) => {
        if (currentBook.number <= 6 && m.id === 'map-mediterranean') return true;
        if (currentBook.number === 6 && m.id === 'map-avernus') return true;
        if (currentBook.number >= 7 && m.id === 'map-latium') return true;
        return false;
      }) || THREE_MAPS[0],
    [currentBook.number]
  );

  const handleUploadCustomPlate = (bookNumber: number, dataUrl: string | null) => {
    setCustomPlateImages((prev) => {
      const next = { ...prev };
      if (dataUrl === null) delete next[bookNumber];
      else next[bookNumber] = dataUrl;
      try {
        localStorage.setItem('aeneid_custom_plates', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleUploadCustomMap = (mapId: string, dataUrl: string | null) => {
    setCustomMapImages((prev) => {
      const next = { ...prev };
      if (dataUrl === null) delete next[mapId];
      else next[mapId] = dataUrl;
      try {
        localStorage.setItem('aeneid_custom_maps', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleImportVerses = (bookNumber: number, newVerses: VerseLine[]) => {
    setBooks((prev) => {
      const next = prev.map((b) =>
        b.number === bookNumber ? { ...b, verses: newVerses } : b
      );
      try {
        localStorage.setItem('aeneid_custom_books_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedBookNum(bookNumber);
    setActiveSection('reader');
    setCopyToast({
      message: `已更新${books.find((b) => b.number === bookNumber)?.titleZh || ''}译稿（共 ${newVerses.length} 行）`,
      isBlocked: false,
    });
  };

  const handleImportMultiBooks = (multiBookMap: Record<number, VerseLine[]>) => {
    const updatedBookNums = Object.keys(multiBookMap).map(Number);
    if (updatedBookNums.length === 0) return;

    setBooks((prev) => {
      const next = prev.map((b) =>
        multiBookMap[b.number] ? { ...b, verses: multiBookMap[b.number] } : b
      );
      try {
        localStorage.setItem('aeneid_custom_books_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedBookNum(updatedBookNums[0]);
    setActiveSection('reader');
    setCopyToast({
      message: `已批量更新 ${updatedBookNums.length} 卷译稿并保存至本地`,
      isBlocked: false,
    });
  };

  const handleResetAllBooks = () => {
    setBooks(AENEID_BOOKS);
    try {
      localStorage.removeItem('aeneid_custom_books_v1');
    } catch {}
    setCopyToast({
      message: '已恢复系统内置十二卷示例译文',
      isBlocked: false,
    });
  };

  const handleJumpToBookLine = (bookNumber: number, lineNumber: number) => {
    const isSameBook = selectedBookNum === bookNumber && activeSection === 'reader';
    setSelectedBookNum(bookNumber);
    setActiveSection('reader');

    const scrollToTarget = () => {
      const targetBook = books.find((b) => b.number === bookNumber) || books[0];
      const maxLine = targetBook.verses.length;
      const target = Math.min(Math.max(1, lineNumber), maxLine);
      const el = document.getElementById(`verse-line-${bookNumber}-${target}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedLine(target);
        setTimeout(() => {
          setHighlightedLine((curr) => (curr === target ? null : curr));
        }, 2800);
      }
    };

    if (isSameBook) {
      scrollToTarget();
    } else {
      setTimeout(scrollToTarget, 120);
    }
  };

  const handleLineJump = (lineNum: number) => {
    handleJumpToBookLine(selectedBookNum, lineNum);
  };

  // Human 30-Line Copy Guard Event Handler
  const handleReaderCopy = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const rawText = selection.toString();
      if (!rawText.trim()) return;

      const enforcement = enforceCopyLineLimit(
        rawText,
        currentBook.roman,
        currentBook.titleZh,
        MAX_HUMAN_COPY_LINES
      );

      if (enforcement.totalSelectedLines > 0) {
        e.preventDefault();
        e.clipboardData.setData('text/plain', enforcement.formattedText);

        if (enforcement.allowed) {
          setCopyToast({
            message: `已复制 ${enforcement.copiedLinesCount} 行译文（附带学术出处）`,
            isBlocked: false,
          });
        } else {
          setCopyToast({
            message: `超出单次 ${MAX_HUMAN_COPY_LINES} 行复制限制，已自动截取前 ${MAX_HUMAN_COPY_LINES} 行`,
            isBlocked: true,
          });
        }
      }
    },
    [currentBook.roman, currentBook.titleZh]
  );

  const renderVerseWithInlineAnnotations = (verse: VerseLine, bookNumber: number) => {
    const annotations = verse.annotations || [];
    if (annotations.length === 0) {
      return <span>{embedZeroWidthCanary(verse.zh, bookNumber, verse.lineNumber)}</span>;
    }

    let remaining = verse.zh;
    const segments: React.ReactNode[] = [];
    let segIdx = 0;

    annotations.forEach((ann: InlineAnnotation) => {
      const pos = remaining.indexOf(ann.anchorPhrase);
      if (pos !== -1) {
        if (pos > 0) {
          const prefix = remaining.slice(0, pos);
          segments.push(
            <span key={`txt-${segIdx++}`}>
              {embedZeroWidthCanary(prefix, bookNumber, verse.lineNumber)}
            </span>
          );
        }
        segments.push(
          <InlineAnnotationTrigger
            key={ann.id}
            annotation={ann}
            lineNumber={verse.lineNumber}
            activeAnnotationId={activeAnnotationId}
            pinnedAnnotationId={pinnedAnnotationId}
            onActivate={setActiveAnnotationId}
            onTogglePin={(id) =>
              setPinnedAnnotationId((prev) => (prev === id ? null : id))
            }
          />
        );
        remaining = remaining.slice(pos + ann.anchorPhrase.length);
      }
    });

    if (remaining.length > 0) {
      segments.push(<span key={`txt-${segIdx++}`}>{remaining}</span>);
    }

    return <>{segments}</>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-zinc-200 selection:text-black">
      {/* Top Header: Whisper-quiet minimalist navigation with geometrically locked center axis */}
      <header className="sticky top-0 z-30 relative flex items-center justify-between gap-4 px-6 lg:px-12 h-12 bg-[#FCFCFA]/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/80">
        {/* Left: Brand + Directory Trigger */}
        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <button
            type="button"
            onClick={() => {
              setActiveSection('prologue');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left group cursor-pointer flex items-baseline gap-2"
          >
            <span className="font-serif-sc font-medium text-base text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              埃涅阿斯纪
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400">
              中文诗体翻译
            </span>
          </button>

          <span className="text-zinc-200 dark:text-zinc-800 select-none" aria-hidden="true">/</span>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="展开卷次目录与诗行检索"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>目录与检索</span>
          </button>
        </div>

        {/* Center: Geometrically centered & baseline-aligned reading indicator */}
        {activeSection === 'reader' && (
          <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setIsQuickNavOpen((v) => !v)}
              title="点击展开卷次与诗行直达 (快捷键 ⌘K)"
              aria-label={`当前阅读：${currentBook.titleZh} ${currentBook.roman}，点击快速跳转`}
              className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs leading-none text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <span className="font-serif-sc font-medium tracking-wider leading-none">
                {currentBook.titleZh}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 leading-none select-none" aria-hidden="true">
                ·
              </span>
              <span className="font-serif-sc font-medium tracking-widest text-zinc-400 dark:text-zinc-500 leading-none">
                {currentBook.roman}
              </span>
            </button>
          </div>
        )}

        {/* Right Nav & Utilities */}
        <div className="flex items-center gap-4 sm:gap-5 text-xs font-mono text-zinc-400 dark:text-zinc-500 z-10">
          <button
            type="button"
            onClick={() => {
              setActiveSection('maps');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'maps'
                ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            三幅舆图
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection('ai-security');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`hidden sm:inline-block transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'ai-security'
                ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                : 'hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            AI对比与防爬
          </button>

          <button
            type="button"
            onClick={() => setIsImporterOpen(true)}
            className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            录入译稿
          </button>

          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label="切换明暗主题"
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Hairline reading progress indicator at bottom edge of header */}
        {activeSection === 'reader' && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-px bg-zinc-900/25 dark:bg-zinc-100/25 transition-all duration-150 pointer-events-none"
            style={{ width: `${scrollProgress}%` }}
          />
        )}
      </header>

      {/* Floating Minimal Toast for Notifications */}
      {copyToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-800 dark:text-zinc-100 text-xs font-mono rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-zinc-800"
        >
          {copyToast.isBlocked ? (
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
          )}
          <span>{copyToast.message}</span>
          <button
            type="button"
            onClick={() => setCopyToast(null)}
            className="ml-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
            aria-label="关闭提示"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto px-6 lg:px-12 py-8">
        {/* VIEW 0: PROLOGUE / TRANSLATOR'S NOTE LANDING (First-entry experience) */}
        {activeSection === 'prologue' && (
          <PrologueLanding
            onStartReading={(bookNum = 1) => {
              setSelectedBookNum(bookNum);
              setActiveSection('reader');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDirectory={() => setIsSidebarOpen(true)}
            onOpenMaps={() => {
              setActiveSection('maps');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAiSecurity={() => {
              setActiveSection('ai-security');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 1: POEM READER (Pure, generous white space, 思源宋体) */}
        {activeSection === 'reader' && (
          <div className="max-w-5xl mx-auto">
            {/* Opus 5.5 Editorial Book Heading: Centered axis with subtle classical Roman numeral kicker */}
            <div className="mb-6 pt-3 text-center">
              <div className="inline-flex items-center gap-3 mb-2 text-[11px] font-serif-sc tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                <span className="w-5 h-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                <span>LIBER {currentBook.roman}</span>
                <span className="w-5 h-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif-sc font-normal tracking-wider text-zinc-900 dark:text-zinc-50">
                {currentBook.titleZh}
              </h1>
            </div>

            {/* Book Frontispiece Plate Placeholder (Natural opening slot for this book) */}
            <SwissBookPlate
              book={currentBook}
              customImageUrl={customPlateImages[currentBook.number]}
              onUploadCustomImage={handleUploadCustomPlate}
            />

            {/* Main verse text: Pure Chinese, 思源宋体 (Noto Serif SC), Centered & serene */}
            <div className="max-w-2xl mx-auto w-full mt-8">
              <article
                onCopy={handleReaderCopy}
                data-testid="poem-continuous-scroll"
                aria-label={`${currentBook.titleZh} 诗文正文`}
                className="space-y-2 py-4"
              >
                {/*
                  【译文排版规范注明】：
                  正式全篇诗体译文录入时，无需逐行显式打印行号；遵循古典诗集规范，
                  每隔5行标注（或悬浮提示），以保证诗文排版的纯粹留白与呼吸感。
                */}
                {currentBook.verses.map((verse) => {
                  const isEveryFive = verse.lineNumber % 5 === 0;
                  return (
                    <div
                      key={verse.lineNumber}
                      id={`verse-line-${currentBook.number}-${verse.lineNumber}`}
                      className={`group relative flex items-baseline gap-4 py-2 px-3 -mx-3 transition-colors duration-500 rounded ${
                        highlightedLine === verse.lineNumber
                          ? 'bg-zinc-100/90 dark:bg-zinc-800/70'
                          : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                      } ${
                        verse.stanzaBreakAfter ? 'mb-8 pb-4' : ''
                      }`}
                    >
                      {/* Line number gutter: only shown on multiples of 5, or subtle on hover */}
                      <div className="w-8 shrink-0 text-right select-none">
                        <span
                          className={`font-mono text-[11px] tabular-nums transition-opacity ${
                            isEveryFive
                              ? 'text-zinc-400 dark:text-zinc-500 opacity-100'
                              : 'text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {verse.lineNumber}
                        </span>
                      </div>

                      {/* Pure Chinese Verse Line in 思源宋体 (Noto Serif SC) with slightly bolder stroke weight (font-medium) */}
                      <div className="flex-1 font-serif-sc font-medium text-[17px] sm:text-[18px] leading-[2.3] tracking-[0.025em] text-zinc-900 dark:text-zinc-50">
                        {renderVerseWithInlineAnnotations(verse, currentBook.number)}
                      </div>
                    </div>
                  );
                })}

                {/* Book Turn Footer */}
                <div className="pt-16 mt-16 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-4 font-serif-sc text-sm">
                  <span className="text-xs font-mono text-zinc-400">
                    {currentBook.titleZh} 完
                  </span>

                  <div className="flex items-center gap-3">
                    {currentBook.number > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookNum(currentBook.number - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-opus-secondary px-3.5 py-1.5 text-xs font-mono cursor-pointer"
                      >
                        ← 上一卷（{books[currentBook.number - 2].titleZh}）
                      </button>
                    )}
                    {currentBook.number < 12 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookNum(currentBook.number + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn-opus-soft px-4 py-1.5 text-xs font-serif-sc cursor-pointer"
                      >
                        下一卷（{books[currentBook.number].titleZh}） →
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}

        {/* VIEW 2: CARTOGRAPHY ATLAS (3 MAPS) */}
        {activeSection === 'maps' && (
          <SwissCartographyAtlas
            activeMapId={activeMapId}
            onSelectMap={setActiveMapId}
            customMapImages={customMapImages}
            onUploadCustomMap={handleUploadCustomMap}
            onJumpToBookLine={handleJumpToBookLine}
          />
        )}

        {/* VIEW 3: AI SCRAPING BLUEPRINT & TEST CONSOLE */}
        {activeSection === 'ai-security' && (
          <AiScrapingBlueprintPanel />
        )}
      </main>

      {/* Lateral Sidebar & Line Jumper Drawer (Opens from side, keeping content unburdened) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        books={books}
        currentBookNumber={currentBook.number}
        onSelectBook={(num) => {
          setSelectedBookNum(num);
          setActiveSection('reader');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        maps={THREE_MAPS}
        onSelectMap={(mapId) => {
          setActiveMapId(mapId);
          setActiveSection('maps');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectPrologue={() => {
          setActiveSection('prologue');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectAiSecurity={() => {
          setActiveSection('ai-security');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLineJump={(lineNum) => {
          setActiveSection('reader');
          setTimeout(() => handleLineJump(lineNum), 100);
        }}
        onJumpToCitation={handleJumpToBookLine}
        currentBookTotalLines={currentBook.verses.length}
      />

      {/* Manuscript Importer Modal */}
      <ManuscriptImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        books={books}
        selectedBookNumber={currentBook.number}
        onImportVerses={handleImportVerses}
        onImportMultiBooks={handleImportMultiBooks}
        onResetAllBooks={handleResetAllBooks}
      />

      {/* Modern Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 dark:border-zinc-800 py-6 px-6 lg:px-12 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>《埃涅阿斯纪》中文诗体翻译 · 现代极简数字典藏版</div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveSection('prologue');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            返回题记序言
          </button>
          <span>单次复制限 30 行</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>顶部</span>
          </button>
        </div>
      </footer>

      {/* Persistent Right Floating Navigator (Click to open, click to collapse, supports 1.xxx and 6.743) */}
      <PersistentRightNavigator
        books={books}
        currentBookNumber={currentBook.number}
        totalLinesCurrentBook={currentBook.verses.length}
        onNavigate={handleJumpToBookLine}
        onShowNotice={(msg, isBlocked) => setCopyToast({ message: msg, isBlocked })}
        isOpenExternal={isQuickNavOpen}
        onOpenChange={setIsQuickNavOpen}
      />
    </div>
  );
}
