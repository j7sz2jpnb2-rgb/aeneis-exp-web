/**
 * Core Copy-Guard, Steganographic Canary, and AI Comparison vs. Anti-Scraper Logic
 * Decoupled for deterministic unit testing and shared client/server enforcement.
 */

export const MAX_HUMAN_COPY_LINES = 30;
export const MAX_AI_COMPARE_LINES = 50;

export interface CopyEnforcementResult {
  allowed: boolean;
  totalSelectedLines: number;
  copiedLinesCount: number;
  formattedText: string;
  warningMessage: string | null;
}

/**
 * Strips invisible zero-width canary characters from text.
 */
export function stripZeroWidthCanary(raw: string): string {
  return raw.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
}

/**
 * Embeds a deterministic zero-width canary signature into a verse string
 * so bulk DOM scrapers carry an invisible fingerprint, while human copy<=30 strips it.
 */
export function embedZeroWidthCanary(verse: string, bookNumber: number, lineNumber: number): string {
  const clean = stripZeroWidthCanary(verse);
  const hashVal = ((bookNumber * 31 + lineNumber * 17) & 0xff).toString(2).padStart(8, '0');
  const zwSignature = hashVal
    .split('')
    .map((bit) => (bit === '1' ? '\u200B' : '\u200C'))
    .join('');
  if (clean.length < 2) return clean + zwSignature;
  return clean.slice(0, 1) + zwSignature + clean.slice(1);
}

/**
 * Extracts the embedded 8-bit canary signature from a scraped verse string.
 */
export function extractZeroWidthCanary(text: string): string | null {
  const matches = text.match(/[\u200B\u200C]{8}/);
  if (!matches) return null;
  const bits = matches[0]
    .split('')
    .map((ch) => (ch === '\u200B' ? '1' : '0'))
    .join('');
  return `0x${parseInt(bits, 2).toString(16).toUpperCase().padStart(2, '0')}`;
}

/**
 * Counts how many poetic lines are present in a user selection or array of verse strings.
 * Filters out empty whitespace-only lines or pure line-number tokens.
 */
export function parseSelectedPoeticLines(rawSelection: string): string[] {
  const cleaned = stripZeroWidthCanary(rawSelection);
  return cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    // Remove leading standalone line numbers like "005" or "L.012" if copied across gutter
    .map((line) => line.replace(/^(?:L\.)?\d{1,4}\s+/, '').trim())
    .filter((line) => line.length > 0 && !/^\d{1,4}$/.test(line) && !/^\[注\s*\d+\]$/.test(line));
}

/**
 * Enforces the strict 30-line human clipboard copy ceiling.
 * - If <= 30 lines: allows full copy with clean scholarly attribution.
 * - If > 30 lines: truncates strictly at 30 lines and appends a copyright truncation notice.
 */
export function enforceCopyLineLimit(
  rawSelectionOrLines: string | string[],
  bookRoman: string,
  bookTitleZh: string,
  maxLines: number = MAX_HUMAN_COPY_LINES
): CopyEnforcementResult {
  const lines = Array.isArray(rawSelectionOrLines)
    ? rawSelectionOrLines.map((l) => stripZeroWidthCanary(l).trim()).filter(Boolean)
    : parseSelectedPoeticLines(rawSelectionOrLines);

  const totalSelectedLines = lines.length;

  if (totalSelectedLines === 0) {
    return {
      allowed: true,
      totalSelectedLines: 0,
      copiedLinesCount: 0,
      formattedText: '',
      warningMessage: null,
    };
  }

  if (totalSelectedLines <= maxLines) {
    const body = lines.join('\n');
    const attribution = `\n—— 维吉尔《埃涅阿斯纪》中文诗体译本 · 卷${bookRoman}《${bookTitleZh}》（引用 ${totalSelectedLines} 行）`;
    return {
      allowed: true,
      totalSelectedLines,
      copiedLinesCount: totalSelectedLines,
      formattedText: `${body}${attribution}`,
      warningMessage: null,
    };
  }

  // Exceeds 30 lines: truncate at 30 lines and refuse the remainder
  const truncatedLines = lines.slice(0, maxLines);
  const body = truncatedLines.join('\n');
  const truncationNotice = `\n\n[版权保护截断：本译本人类网页端单次最多允许复制 ${maxLines} 行诗句。您当前选中了 ${totalSelectedLines} 行，超出 ${maxLines} 行的部分已停止复制。如需大范围译本对比，请通过开放的 AI 语义对比接口 /api/compare 进行对照分析。]`;

  return {
    allowed: false,
    totalSelectedLines,
    copiedLinesCount: maxLines,
    formattedText: `${body}${truncationNotice}`,
    warningMessage: `已触发单次 ${maxLines} 行复制上限：当前选中 ${totalSelectedLines} 行，仅前 ${maxLines} 行已写入剪贴板，超出部分不再复制。`,
  };
}

export interface ScraperEvaluationInput {
  requestedLineCount: number;
  recentRequestsInWindow: number;
  sequentialCursorHits: number;
  userAgent: string;
}

export interface ScraperEvaluationResult {
  permitted: boolean;
  reasonCode: 'OK_AI_COMPARISON' | 'ERR_RANGE_TOO_LARGE' | 'ERR_SEQUENTIAL_SCRAPE_DETECTED' | 'ERR_BULK_BOT_UA';
  httpStatus: 200 | 403 | 429;
  explanation: string;
}

const BLOCKED_BULK_CRAWLERS = ['ccbot', 'bytespider', 'scrapy', 'httrack', 'wget', 'curl-bulk', 'python-urllib-scraper'];

/**
 * Evaluates whether an incoming request to `/api/compare` is a legitimate AI comparative
 * reading query or an automated bulk-scraping attempt.
 */
export function evaluateScraperRequest(input: ScraperEvaluationInput): ScraperEvaluationResult {
  const uaLower = (input.userAgent || '').toLowerCase();

  if (BLOCKED_BULK_CRAWLERS.some((bot) => uaLower.includes(bot))) {
    return {
      permitted: false,
      reasonCode: 'ERR_BULK_BOT_UA',
      httpStatus: 403,
      explanation: '检测到全量数据集抓取爬虫 User-Agent，已拒绝全库下载。仅允许按诗行区间进行跨译本语义对比。',
    };
  }

  if (input.requestedLineCount > MAX_AI_COMPARE_LINES) {
    return {
      permitted: false,
      reasonCode: 'ERR_RANGE_TOO_LARGE',
      httpStatus: 403,
      explanation: `单次 AI 对比接口请求上限为 ${MAX_AI_COMPARE_LINES} 行（当前请求 ${input.requestedLineCount} 行）。请缩小诗行区间以防止整卷导出。`,
    };
  }

  // If a client requests sequential chunks (e.g. 1-50, 51-100, 101-150, 151-200) or bursts > 12 requests/window
  if (input.sequentialCursorHits >= 3 || input.recentRequestsInWindow > 12) {
    return {
      permitted: false,
      reasonCode: 'ERR_SEQUENTIAL_SCRAPE_DETECTED',
      httpStatus: 429,
      explanation: '检测到连续顺次遍历抓取特征（Sequential Traversal Trap），触发滑动窗口防爬锁，禁止将全文拼接下载至本地。',
    };
  }

  return {
    permitted: true,
    reasonCode: 'OK_AI_COMPARISON',
    httpStatus: 200,
    explanation: '合法的 AI 跨译本诗段对比请求：已返回中文诗体译文、拉丁原文与格律注释对照载荷（附带 X-Robots-Tag: noarchive）。',
  };
}
