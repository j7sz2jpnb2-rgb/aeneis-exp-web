import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { AENEID_BOOKS, THREE_MAPS } from './src/data/aeneidData';
import { evaluateScraperRequest, MAX_AI_COMPARE_LINES, MAX_HUMAN_COPY_LINES } from './src/utils/copyGuard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sliding-window memory tracker per client IP for anti-bulk-scraping
interface ClientAccessState {
  recentTimestamps: number[];
  lastBook: number;
  lastEndLine: number;
  sequentialCursorHits: number;
}

const clientSlidingWindows = new Map<string, ClientAccessState>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Global security & anti-archive headers so search engines and AI indexers read live without caching full corpus dumps
  app.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'index, follow, noarchive, max-snippet:1200');
    next();
  });

  // 1. /robots.txt: Permit passage-level AI search/comparison agents on /api/compare; disallow bulk corpus scrapers
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain; charset=utf-8').send(
`# AENEIS · 埃涅阿斯纪中文诗体译注本 — AI 对比开放与防全量爬虫协议
# 允许 AI 助手通过 /llms.txt 与 /api/compare 按诗行区间进行跨译本语义对比
# 严禁全量抓取、离线镜像打包或将整部译本下载至本地

User-agent: OAI-SearchBot
Allow: /llms.txt
Allow: /api/compare
Disallow: /bulk-export

User-agent: ClaudeBot
Allow: /llms.txt
Allow: /api/compare
Disallow: /bulk-export

User-agent: PerplexityBot
Allow: /llms.txt
Allow: /api/compare
Disallow: /bulk-export

# 拒绝无差别全量语料打包爬虫
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: HTTrack
Disallow: /

User-agent: *
Allow: /
Allow: /llms.txt
Allow: /api/compare
`
    );
  });

  // 2. /llms.txt: Standard machine-readable manifest for LLMs to perform translation comparisons
  app.get('/llms.txt', (_req, res) => {
    res.type('text/plain; charset=utf-8').send(
`# AENEIS (埃涅阿斯纪) — 现代中文诗体译注本 (Swiss Modernist Critical Edition)

> 本站点提供维吉尔（Publius Vergilius Maro）史诗《埃涅阿斯纪》（Aeneid）十二卷原创中文诗体全译本、语文学悬浮注释及三幅历史地理舆图。

## AI 跨译本对比指南 (Instructions for AI Comparative Reading Agents)
1. **允许的用途 (Permitted AI Usage)**：
   - 允许 AI 助手（Claude, ChatGPT, Gemini, Perplexity 等）读取指定诗行区间，将本中文诗体译本与维吉尔拉丁原文（Vergil's Latin hexameter）或其他中英译本进行用词、格律、修辞及注释层面的学术对比分析。
2. **禁止的行为 (Prohibited Actions)**：
   - 严禁通过顺次翻页爬虫将全书十二卷批量下载、拼接或转存至本地文件。
   - 人类网页剪贴板单次复制上限为 ${MAX_HUMAN_COPY_LINES} 行；AI 语义对比接口单次查询上限为 ${MAX_AI_COMPARE_LINES} 行。

## 结构化对比接口 (Passage Comparison Endpoint)
- **GET** \`/api/compare?book={1..12}&startLine={start}&endLine={end}\`
  - 返回指定卷次与诗行区间（单次最多 ${MAX_AI_COMPARE_LINES} 行）的中文诗体译文、拉丁原文、英文参校及语文学注释 JSON。
  - 示例：\`/api/compare?book=1&startLine=1&endLine=11\`（获取卷一序诗 1-11 行对照数据）。

## 十二卷目录索引 (12 Books Catalog)
${AENEID_BOOKS.map((b) => `- 卷 ${b.number} (${b.titleZh}) — 共 ${b.verses.length} 行译文`).join('\n')}

## 三幅随书舆图 (3 Cartographic Maps)
${THREE_MAPS.map((m) => `- ${m.indexNumber}: ${m.titleZh} (${m.scopeBooks})`).join('\n')}
`
    );
  });

  // 3. /api/compare: Passage-scoped semantic comparison endpoint with sliding-window anti-scraper protection
  app.get('/api/compare', (req, res) => {
    const bookNum = Number(req.query.book || 1);
    const startLine = Number(req.query.startLine || 1);
    const endLine = Number(req.query.endLine || 15);
    const simulateScraper = req.query.simulateScraper === '1';

    const requestedLineCount = Math.max(1, endLine - startLine + 1);
    const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local');
    const now = Date.now();

    const state: ClientAccessState = clientSlidingWindows.get(clientIp) || {
      recentTimestamps: [],
      lastBook: 0,
      lastEndLine: -999,
      sequentialCursorHits: 0,
    };

    // Keep requests in the last 30 seconds
    state.recentTimestamps = state.recentTimestamps.filter((t) => now - t < 30_000);
    state.recentTimestamps.push(now);

    if (state.lastBook === bookNum && Math.abs(startLine - (state.lastEndLine + 1)) <= 2) {
      state.sequentialCursorHits += 1;
    } else if (!simulateScraper) {
      state.sequentialCursorHits = Math.max(0, state.sequentialCursorHits - 1);
    }

    state.lastBook = bookNum;
    state.lastEndLine = endLine;
    clientSlidingWindows.set(clientIp, state);

    const evaluation = evaluateScraperRequest({
      requestedLineCount,
      recentRequestsInWindow: state.recentTimestamps.length,
      sequentialCursorHits: simulateScraper ? 4 : state.sequentialCursorHits,
      userAgent: String(req.headers['user-agent'] || ''),
    });

    res.setHeader('X-Robots-Tag', 'noarchive, noimageai');

    if (!evaluation.permitted) {
      res.status(evaluation.httpStatus).json({
        status: 'BLOCKED_BY_ANTI_SCRAPER_GUARD',
        reasonCode: evaluation.reasonCode,
        explanation: evaluation.explanation,
        policy: {
          maxAiLinesPerQuery: MAX_AI_COMPARE_LINES,
          maxHumanCopyLines: MAX_HUMAN_COPY_LINES,
          allowComparativeAnalysis: true,
          allowFullCorpusDownload: false,
        },
      });
      return;
    }

    const book = AENEID_BOOKS.find((b) => b.number === bookNum) || AENEID_BOOKS[0];
    const matchingVerses = book.verses.filter(
      (v) => v.lineNumber >= startLine && v.lineNumber <= endLine
    );

    res.status(200).json({
      status: 'OK_AI_COMPARISON',
      explanation: evaluation.explanation,
      metadata: {
        work: '埃涅阿斯纪 · 中文诗体翻译',
        bookNumber: book.number,
        bookRoman: book.roman,
        bookTitleZh: book.titleZh,
        requestedRange: `${startLine}–${endLine}`,
        returnedCount: matchingVerses.length,
        licenseNotice: '仅限 AI 跨译本实时对比分析与学术引述，禁止拼接下载全文。',
      },
      passageComparison: matchingVerses.map((v) => ({
        line: v.lineNumber,
        zhPoeticTranslation: v.zh,
        annotations: (v.annotations || []).map((a) => ({
          term: a.anchorPhrase,
          category: a.category,
          note: a.explanation,
          comparativeNote: a.comparativeNote || null,
        })),
      })),
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AENEIS Swiss Critical Edition server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
