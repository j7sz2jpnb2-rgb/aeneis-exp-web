import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { AeneidBook } from '../data/aeneidData';

interface SwissBookPlateProps {
  book: AeneidBook;
  customImageUrl?: string;
  onUploadCustomImage: (bookNumber: number, dataUrl: string | null) => void;
}

export const SwissBookPlate: React.FC<SwissBookPlateProps> = ({
  book,
  customImageUrl,
  onUploadCustomImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpandedEmpty, setIsExpandedEmpty] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustomImage(book.number, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto my-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {customImageUrl ? (
        <div className="space-y-2.5">
          <div className="w-full max-h-[420px] flex items-center justify-center overflow-hidden bg-zinc-50/40 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded">
            <img
              src={customImageUrl}
              alt={`${book.titleZh} 卷首插画`}
              className="max-h-[420px] w-auto object-contain mx-auto"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>{book.titleZh} · 卷首版画</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                更换
              </button>
              <button
                type="button"
                onClick={() => onUploadCustomImage(book.number, null)}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer inline-flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>移除</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-y border-zinc-100 dark:border-zinc-800/80 py-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
            <span>{book.titleZh} · 卷首插画预留位</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpandedEmpty((v) => !v)}
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {isExpandedEmpty ? '收起画框' : '预览画框'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>上传版画</span>
            </button>
          </div>
        </div>
      )}

      {!customImageUrl && isExpandedEmpty && (
        <div className="mt-2 border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 h-36 rounded flex flex-col items-center justify-center text-center">
          <span className="text-xs font-serif-sc text-zinc-400 dark:text-zinc-500 mb-2">
            {book.titleZh} 卷首版画展位（16:9 / 4:3 自适应）
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-opus-secondary text-[11px] font-mono px-3 py-1 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>选择本地图片</span>
          </button>
        </div>
      )}
    </div>
  );
};
