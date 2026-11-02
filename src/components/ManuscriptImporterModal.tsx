import React, { useState, useRef } from 'react';
import { X, FileText, Check, Upload, Download, RotateCcw } from 'lucide-react';
import { AeneidBook, VerseLine } from '../data/aeneidData';
import {
  parseSingleBookManuscript,
  parseMultiBookManuscript,
} from '../utils/manuscriptParser';

interface ManuscriptImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: AeneidBook[];
  selectedBookNumber: number;
  onImportVerses: (bookNumber: number, newVerses: VerseLine[]) => void;
  onImportMultiBooks?: (multiBookMap: Record<number, VerseLine[]>) => void;
  onResetAllBooks?: () => void;
}

export const ManuscriptImporterModal: React.FC<ManuscriptImporterModalProps> = ({
  isOpen,
  onClose,
  books,
  selectedBookNumber,
  onImportVerses,
  onImportMultiBooks,
  onResetAllBooks,
}) => {
  const [targetBook, setTargetBook] = useState<number>(selectedBookNumber);
  const [rawText, setRawText] = useState<string>(
    `# 支持直接粘贴或上传 .txt / .md 译稿文件（空行自动识别为诗节分段）\n# 若文本中包含“第一卷”、“第二卷”等标题，可勾选“自动按卷次拆分导入”一次性导入多卷\n我歌唱{{兵燹与那一人::Arma virumque 译注::开篇双关，统摄漂泊与战争}}，他最先自特洛伊的海岸，\n被天命驱策，流亡至意大利与拉维尼姆的滩头；`
  );
  const [appendMode, setAppendMode] = useState<'replace' | 'append'>('replace');
  const [stripLeadingNumbers, setStripLeadingNumbers] = useState<boolean>(true);
  const [autoSplitMultiBook, setAutoSplitMultiBook] = useState<boolean>(true);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentBookObj = books.find((b) => b.number === targetBook) || books[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      // Check if it's a JSON export file
      if (file.name.endsWith('.json')) {
        try {
          const parsedJson = JSON.parse(content);
          if (Array.isArray(parsedJson) && onImportMultiBooks) {
            const map: Record<number, VerseLine[]> = {};
            for (const b of parsedJson) {
              if (typeof b.number === 'number' && Array.isArray(b.verses)) {
                map[b.number] = b.verses;
              }
            }
            if (Object.keys(map).length > 0) {
              onImportMultiBooks(map);
              onClose();
              return;
            }
          }
        } catch {
          // Fall back to treating as text
        }
      }
      setRawText(content);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(books, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeneid-chinese-manuscript.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleParseAndSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Try multi-book batch split if enabled and multiple book headers exist
    if (autoSplitMultiBook && onImportMultiBooks) {
      const multiMap = parseMultiBookManuscript(rawText, stripLeadingNumbers);
      if (multiMap && Object.keys(multiMap).length >= 2) {
        onImportMultiBooks(multiMap);
        onClose();
        return;
      }
    }

    // 2. Single book parse
    const baseLineNum =
      appendMode === 'append' && currentBookObj.verses.length > 0
        ? currentBookObj.verses[currentBookObj.verses.length - 1].lineNumber + 1
        : 1;

    const parsedVerses = parseSingleBookManuscript(rawText, {
      bookNumber: targetBook,
      baseLineNumber: baseLineNum,
      stripLeadingLineNumbers: stripLeadingNumbers,
    });

    if (parsedVerses.length === 0) return;

    const finalVerses =
      appendMode === 'append'
        ? [...currentBookObj.verses, ...parsedVerses]
        : parsedVerses;

    onImportVerses(targetBook, finalVerses);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="导入或编辑译稿"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-[0_16px_48px_rgba(0,0,0,0.12)] animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-sm font-serif-sc font-medium text-zinc-900 dark:text-zinc-100">
              译稿录入、本地文件导入与数据导出
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            aria-label="关闭窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleParseAndSave} className="space-y-4">
          {/* Quick File Upload & Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-opus-secondary px-3 py-1.5 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>读取本地 .txt / .md / .json</span>
              </button>
              {uploadedFileName && (
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[180px]">
                  已载入: {uploadedFileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                title="将当前全部十二卷译稿与注释导出为 JSON 文件"
                className="btn-opus-secondary px-2.5 py-1.5 text-[11px] font-mono inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>导出全书 JSON</span>
              </button>
              {onResetAllBooks && (
                <button
                  type="button"
                  onClick={onResetAllBooks}
                  title="恢复系统内置示例译文"
                  className="px-2 py-1.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置示例</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-mono text-zinc-500">
              目标卷次（单卷导入时生效）
              <select
                value={targetBook}
                onChange={(e) => setTargetBook(Number(e.target.value))}
                className="mt-1.5 w-full px-3 py-2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              >
                {books.map((b) => (
                  <option key={b.number} value={b.number}>
                    {b.titleZh} · {b.roman}（当前 {b.verses.length} 行）
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-mono text-zinc-500">
              写入方式
              <select
                value={appendMode}
                onChange={(e) => setAppendMode(e.target.value as 'append' | 'replace')}
                className="mt-1.5 w-full px-3 py-2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value="replace">替换本卷现有诗行 (Replace)</option>
                <option value="append">追加至本卷末尾 (Append)</option>
              </select>
            </label>
          </div>

          {/* Smart Parsing Options */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stripLeadingNumbers}
                onChange={(e) => setStripLeadingNumbers(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span>自动清理原稿行首数字（正文中将自动按每 5 行标号）</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSplitMultiBook}
                onChange={(e) => setAutoSplitMultiBook(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span>包含“第一卷 ~ 第十二卷”标题时自动拆分导入多卷</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1.5">
              译稿正文（每行一句；空行代表分段留白；支持{' '}
              <code className="text-zinc-800 dark:text-zinc-200">
                {'{{词条::注释标题::注释内容}}'}
              </code>{' '}
              随文注释语法）
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
              className="w-full p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-serif-sc leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400">
              导入后自动保存在当前浏览器；亦可直接将译稿发给 AI 写入源码
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="btn-opus-secondary px-4 py-2 text-xs font-mono cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-opus-primary px-5 py-2 text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>解析并载入译稿</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
