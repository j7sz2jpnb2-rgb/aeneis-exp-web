import React, { useState } from 'react';
import { X, CornerDownLeft } from 'lucide-react';
import { AeneidBook, CartographicMap } from '../data/aeneidData';
import { parseCitationQuery } from '../utils/navigationParser';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  books: AeneidBook[];
  currentBookNumber: number;
  onSelectBook: (bookNumber: number) => void;
  maps: CartographicMap[];
  onSelectMap: (mapId: 'map-mediterranean' | 'map-latium' | 'map-avernus') => void;
  onSelectPrologue: () => void;
  onSelectAiSecurity: () => void;
  onLineJump: (lineNumber: number) => void;
  onJumpToCitation?: (bookNumber: number, lineNumber: number) => void;
  currentBookTotalLines: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  books,
  currentBookNumber,
  onSelectBook,
  maps,
  onSelectMap,
  onSelectPrologue,
  onSelectAiSecurity,
  onLineJump,
  onJumpToCitation,
  currentBookTotalLines,
}) => {
  const [lineInput, setLineInput] = useState<string>('');

  if (!isOpen) return null;

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseCitationQuery(lineInput, currentBookNumber, books.length);
    if (parsed.isValid) {
      if (onJumpToCitation) {
        onJumpToCitation(parsed.bookNumber, parsed.lineNumber);
      } else {
        onLineJump(parsed.lineNumber);
      }
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="卷次总目与行号导航"
      className="fixed inset-0 z-50 flex justify-start bg-black/20 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[272px] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between shadow-xl p-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-zinc-100 dark:border-zinc-850">
            <h2 className="text-sm font-serif-sc font-medium text-zinc-900 dark:text-zinc-100">
              目录与诗行检索
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              aria-label="关闭目录"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Jumper Box */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>卷·行直达</span>
              <span>第 {currentBookNumber} 卷 (1–{currentBookTotalLines})</span>
            </div>

            <form onSubmit={handleJumpSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="如 1.25 或 6.743..."
                value={lineInput}
                onChange={(e) => setLineInput(e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 text-xs font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
              />
              <button
                type="submit"
                aria-label="跳转"
                className="absolute right-1.5 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Prologue Link */}
          <div className="mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-850">
            <button
              type="button"
              onClick={() => {
                onSelectPrologue();
                onClose();
              }}
              className="w-full text-left py-1.5 px-2 text-xs font-serif-sc text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded transition-colors cursor-pointer"
            >
              译本导言与凡例
            </button>
          </div>

          {/* 12 Books Grid */}
          <div className="space-y-1.5 mb-6">
            <div className="text-[11px] font-mono text-zinc-400 px-1 mb-2">
              十二卷正文
            </div>
            <div className="grid grid-cols-2 gap-1 font-serif-sc text-xs">
              {books.map((b) => {
                const isCurrent = b.number === currentBookNumber;
                return (
                  <button
                    key={b.number}
                    type="button"
                    onClick={() => {
                      onSelectBook(b.number);
                      onClose();
                    }}
                    className={`text-left py-1.5 px-2.5 transition-colors cursor-pointer flex items-center justify-between rounded border ${
                      isCurrent
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span>{b.titleZh}</span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {b.roman}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Maps */}
          <div className="space-y-1 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <div className="text-[11px] font-mono text-zinc-400 px-1 mb-1.5">
              随书历史舆图
            </div>
            {maps.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelectMap(m.id);
                  onClose();
                }}
                className="w-full text-left py-1.5 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded transition-colors flex items-center justify-between font-serif-sc cursor-pointer"
              >
                <span>{m.titleZh}</span>
                <span className="font-mono text-[10px] text-zinc-400">{m.indexNumber}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom utility */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 text-[11px] font-mono text-zinc-400 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectAiSecurity();
              onClose();
            }}
            className="w-full text-left py-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            30行复制保护与AI对比架构
          </button>
        </div>
      </div>
    </div>
  );
};
