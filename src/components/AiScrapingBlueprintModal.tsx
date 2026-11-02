import React, { useState } from 'react';
import { ShieldCheck, Terminal, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AENEID_BOOKS } from '../data/aeneidData';
import { enforceCopyLineLimit, MAX_HUMAN_COPY_LINES } from '../utils/copyGuard';

interface AiScrapingBlueprintPanelProps {
  onTriggerCopyBanner?: (msg: string, isBlocked: boolean) => void;
}

export const AiScrapingBlueprintPanel: React.FC<AiScrapingBlueprintPanelProps> = ({
  onTriggerCopyBanner,
}) => {
  const [sandboxLineCount, setSandboxLineCount] = useState<number>(42);
  const [sandboxResult, setSandboxResult] = useState<{
    allowed: boolean;
    totalSelectedLines: number;
    copiedLinesCount: number;
    formattedText: string;
    warningMessage: string | null;
  } | null>(() => {
    const bookOne = AENEID_BOOKS[0];
    const sampleLines = Array.from({ length: 42 }, (_, idx) => {
      const verse = bookOne.verses[idx % bookOne.verses.length];
      return verse.zh;
    });
    return enforceCopyLineLimit(sampleLines, bookOne.roman, bookOne.titleZh);
  });

  const [apiBook, setApiBook] = useState<number>(1);
  const [apiStartLine, setApiStartLine] = useState<number>(1);
  const [apiEndLine, setApiEndLine] = useState<number>(12);
  const [simulateMode, setSimulateMode] = useState<'legit_ai' | 'over_50_lines' | 'bulk_scraper'>('legit_ai');
  const [apiResponseText, setApiResponseText] = useState<string>(() =>
    JSON.stringify(
      {
        status: 'OK_AI_COMPARISON',
        explanation: '合法的 AI 跨译本诗段对比请求：已返回中文诗体译文与注释载荷（附带 X-Robots-Tag: noarchive）。',
        metadata: {
          work: '埃涅阿斯纪 · 中文诗体翻译',
          bookRoman: 'I',
          requestedRange: '1–4',
        },
        passageComparison: AENEID_BOOKS[0].verses.slice(0, 4).map((v) => ({
          line: v.lineNumber,
          zhPoeticTranslation: v.zh,
        })),
      },
      null,
      2
    )
  );
  const [apiStatus, setApiStatus] = useState<number | null>(200);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  const runCopySimulation = (lineCountToTest: number) => {
    setSandboxLineCount(lineCountToTest);
    const bookOne = AENEID_BOOKS[0];
    const sampleLines = Array.from({ length: lineCountToTest }, (_, idx) => {
      const verse = bookOne.verses[idx % bookOne.verses.length];
      return verse.zh;
    });

    const result = enforceCopyLineLimit(sampleLines, bookOne.roman, bookOne.titleZh);
    setSandboxResult(result);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(result.formattedText).catch(() => {});
    }

    if (result.allowed) {
      onTriggerCopyBanner?.(
        `测试通过：请求复制 ${result.totalSelectedLines} 行（≤ ${MAX_HUMAN_COPY_LINES} 行），已写入剪贴板并附出处。`,
        false
      );
    } else {
      onTriggerCopyBanner?.(
        result.warningMessage || `已拦截超出 30 行的复制请求`,
        true
      );
    }
  };

  const runLiveApiTest = async (mode: 'legit_ai' | 'over_50_lines' | 'bulk_scraper') => {
    setSimulateMode(mode);
    setIsLoadingApi(true);
    try {
      let url = `/api/compare?book=${apiBook}&startLine=${apiStartLine}&endLine=${apiEndLine}`;
      if (mode === 'over_50_lines') {
        url = `/api/compare?book=1&startLine=1&endLine=85`;
      } else if (mode === 'bulk_scraper') {
        url = `/api/compare?book=1&startLine=1&endLine=30&simulateScraper=1`;
      }
      const res = await fetch(url);
      setApiStatus(res.status);
      const data = await res.json();
      setApiResponseText(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiStatus(500);
      setApiResponseText(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <section aria-label="AI 对比与防爬架构方案" className="py-6 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-xs font-mono text-zinc-400 tracking-wider mb-2">
          ARCHITECTURE · AI 开放对比与防爬保护设计
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
          如何既让 AI 自由对比，又阻止爬虫全量下载？
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-4xl leading-relaxed">
          网页直接公开全文易被整站爬取，但如果封锁又无法进行 AI 学术对比。本方案采用<strong>四层解耦防护</strong>：通过标准协议分流爬虫，对 AI 开放 50 行以内的按段对比接口，并配合滑动窗口蜜罐锁与前端 30 行复制守护。
        </p>
      </div>

      {/* 4 Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-6 border-b md:border-r border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 mb-2">01 · 协议分流</div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            llms.txt + noarchive
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            通过根目录 <code className="font-mono text-zinc-700 dark:text-zinc-300">/llms.txt</code> 引导 AI 阅读助手调用按段对比接口；响应头注入 <code className="font-mono text-zinc-700 dark:text-zinc-300">noarchive</code>，禁止建立离线全文镜像。
          </p>
        </div>

        <div className="p-6 border-b lg:border-r border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 mb-2">02 · 语义对比接口</div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            按诗段开放 (/api/compare)
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            AI 对比只需关注特定诗行区间。后端接口单次最多返回 50 行对齐数据，满足学术对比需求，同时杜绝一次性导出整卷。
          </p>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 mb-2">03 · 顺次遍历防爬锁</div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            滑动窗口与连续游标检测
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            针对顺次调用接口拼凑全书的爬虫，服务端滑动窗口检测到连续游标（Hits ≥ 3）或突发高频请求时，立即返回 <code className="font-mono text-zinc-700 dark:text-zinc-300">HTTP 429</code>。
          </p>
        </div>

        <div className="p-6">
          <div className="text-xs font-mono text-zinc-400 mb-2">04 · 剪贴板保护与暗水印</div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            单次 30 行限制 + 零宽水印
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            网页全局拦截复制事件：≤ 30 行正常复制；&gt; 30 行截断至前 30 行。网页 DOM 中内嵌不可见的零宽字符，任何未经授权的暴力抓取均可溯源。
          </p>
        </div>
      </div>

      {/* Two Interactive Test Consoles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 30 Lines Copy Guard */}
        <div className="lg:col-span-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  人类网页端「最多复制 30 行」实测
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">MAX = 30 LINES</span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
              可在正文拖选文字按 <code className="font-mono">Ctrl+C / Cmd+C</code> 体验，也可直接点击下方按钮测试 18 行与 42 行时的不同截断行为：
            </p>

            <div className="flex flex-wrap gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => runCopySimulation(18)}
                className={`px-4 py-2 text-xs font-mono cursor-pointer ${
                  sandboxLineCount === 18 && sandboxResult?.allowed
                    ? 'btn-opus-primary'
                    : 'btn-opus-secondary'
                }`}
              >
                测试复制 18 行 (≤ 30 允许)
              </button>

              <button
                type="button"
                onClick={() => runCopySimulation(42)}
                className={`px-4 py-2 text-xs font-mono cursor-pointer ${
                  sandboxLineCount === 42 && sandboxResult && !sandboxResult.allowed
                    ? 'btn-opus-primary'
                    : 'btn-opus-secondary'
                }`}
              >
                测试复制 42 行 (触发截断保护)
              </button>
            </div>

            {sandboxResult && (
              <div className="space-y-3">
                <div
                  className={`p-4 border text-xs flex items-start gap-2.5 ${
                    sandboxResult.allowed
                      ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {sandboxResult.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-mono font-medium mb-0.5">
                      {sandboxResult.allowed
                        ? `允许 · 选中 ${sandboxResult.totalSelectedLines} 行，完整写入剪贴板 ${sandboxResult.copiedLinesCount} 行`
                        : `截断 · 选中 ${sandboxResult.totalSelectedLines} 行，仅允许写入前 ${sandboxResult.copiedLinesCount} 行`}
                    </div>
                    {sandboxResult.warningMessage && (
                      <div className="text-zinc-500 dark:text-zinc-400">{sandboxResult.warningMessage}</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-zinc-400 mb-1">
                    剪贴板实际写入预览：
                  </div>
                  <pre className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {sandboxResult.formattedText}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-400">
            全站正文阅读区已生效此剪贴板防护规则。
          </div>
        </div>

        {/* Right: /api/compare Live Test */}
        <div className="lg:col-span-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  AI 对比接口 (/api/compare) 联调
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">REST API</span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              向服务端发起真实请求，查验 AI 对比时获取的结构化诗文数据及超量防爬响应：
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <label className="block text-xs font-mono text-zinc-500">
                卷次 (Book)
                <select
                  value={apiBook}
                  onChange={(e) => setApiBook(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
                >
                  {AENEID_BOOKS.map((b) => (
                    <option key={b.number} value={b.number}>
                      卷{b.roman} · {b.titleZh}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-mono text-zinc-500">
                起始行 (Start)
                <input
                  type="number"
                  min={1}
                  max={46}
                  value={apiStartLine}
                  onChange={(e) => setApiStartLine(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
                />
              </label>

              <label className="block text-xs font-mono text-zinc-500">
                结束行 (End)
                <input
                  type="number"
                  min={1}
                  max={46}
                  value={apiEndLine}
                  onChange={(e) => setApiEndLine(Number(e.target.value))}
                  className="mt-1 w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => runLiveApiTest('legit_ai')}
                className="btn-opus-primary px-3 py-1.5 text-xs font-mono cursor-pointer"
              >
                1. 正常对比 (200 OK)
              </button>

              <button
                type="button"
                onClick={() => runLiveApiTest('over_50_lines')}
                className="btn-opus-secondary px-3 py-1.5 text-xs font-mono cursor-pointer"
              >
                2. 超范围拦截 (403 拒绝)
              </button>

              <button
                type="button"
                onClick={() => runLiveApiTest('bulk_scraper')}
                className="btn-opus-secondary px-3 py-1.5 text-xs font-mono cursor-pointer"
              >
                3. 遍历盗爬拦截 (429 蜜罐)
              </button>
            </div>

            {apiResponseText && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-zinc-400">RESPONSE</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">HTTP {apiStatus}</span>
                </div>
                <pre className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {isLoadingApi ? '正在请求 /api/compare...' : apiResponseText}
                </pre>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              已启用 /llms.txt 协议分流
            </span>
            <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">
              查看 /llms.txt ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
