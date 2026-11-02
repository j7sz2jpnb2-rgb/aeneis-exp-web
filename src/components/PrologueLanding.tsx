import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PrologueLandingProps {
  onStartReading: (bookNumber?: number) => void;
  onOpenDirectory: () => void;
  onOpenMaps: () => void;
  onOpenAiSecurity: () => void;
}

export const PrologueLanding: React.FC<PrologueLandingProps> = ({
  onStartReading,
  onOpenDirectory,
  onOpenMaps,
  onOpenAiSecurity,
}) => {
  return (
    <div className="max-w-xl mx-auto py-4 sm:py-6 px-4 animate-fade-up">
      {/* Title & Epigraph */}
      <div className="text-center space-y-2 mb-6">
        <div className="text-[11px] font-mono tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Publius Vergilius Maro · Aeneis
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif-sc font-medium tracking-wider text-zinc-900 dark:text-zinc-50">
          埃涅阿斯纪
        </h1>
        <div className="font-serif-sc text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 pt-0.5">
          中文诗体全译 · 随文语文学注释本
        </div>
        <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 mx-auto mt-3.5" />
      </div>

      {/* Translator's Note & Preface (Placeholder) */}
      <section className="space-y-3.5 font-serif-sc text-zinc-700 dark:text-zinc-300 text-[15px] leading-[2.0] tracking-[0.02em] font-normal">
        <div className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 tracking-widest text-center mb-3">
          译本导言与凡例（占位说明）
        </div>

        <p className="text-zinc-800 dark:text-zinc-200 font-medium">
          维吉尔的《埃涅阿斯纪》是西方古典文学中兼具严密几何构造与彻骨历史悲悯的史诗。本译本着力于以当代汉语的骨骼感，重建拉丁语六音步诗行的沉凝步态——摒弃晚清以降拟古骈俪的繁复修饰，亦拒绝将严谨诗律稀释为散文流水的妥协，力求在汉诗顿挫之间，再现古典史诗克制、庄严的语言秩序。
        </p>

        <p>
          全书共十二卷。为使阅读保持纯粹的呼吸感，正文仅呈现中文诗行，每隔五行于左侧微标行号；词条考据与译法辨析均收入随文悬浮注释之中，鼠标轻触即可查阅，移开即隐。各卷卷首设独立版画展位，并附三幅历史地理舆图以供按卷索骥。
        </p>

        <p className="text-xs font-sans text-zinc-400 dark:text-zinc-500 pt-1">
          注：此处为译者序言与凡例预留位，待正式译序定稿后可直接替换上述占位文字。
        </p>
      </section>

      {/* Classic Restrained Entry Actions */}
      <div className="mt-7 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onStartReading(1)}
          className="btn-opus-soft group w-full sm:w-auto px-6 py-2.5 text-xs font-serif-sc font-medium tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>进入正文 · 第一卷</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={onOpenDirectory}
          className="btn-opus-secondary w-full sm:w-auto px-5 py-2.5 text-xs font-serif-sc tracking-wider flex items-center justify-center cursor-pointer"
        >
          <span>十二卷目录与行号跳转</span>
        </button>
      </div>

      {/* Subtle Secondary Links */}
      <div className="mt-8 flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
        <button
          type="button"
          onClick={onOpenMaps}
          className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          三幅随书舆图
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={onOpenAiSecurity}
          className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          30行复制保护与AI对比说明
        </button>
      </div>
    </div>
  );
};
