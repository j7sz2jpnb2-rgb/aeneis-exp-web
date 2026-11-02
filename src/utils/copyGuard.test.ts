import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_HUMAN_COPY_LINES,
  enforceCopyLineLimit,
  parseSelectedPoeticLines,
  embedZeroWidthCanary,
  extractZeroWidthCanary,
  stripZeroWidthCanary,
  evaluateScraperRequest,
} from './copyGuard';

test('parseSelectedPoeticLines strips line numbers, footnote badges, and empty lines', () => {
  const raw = `
    001 我歌唱兵燹与那一人，他最先自特洛伊的海岸，
    [注 01]
    002 被命运放逐，来到意大利与拉维尼姆的滩头；
    003 他在陆上与海上漂泊良久，受尽苍穹诸神的摧折，
  `;
  const parsed = parseSelectedPoeticLines(raw);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0], '我歌唱兵燹与那一人，他最先自特洛伊的海岸，');
});

test('enforceCopyLineLimit allows copying up to 30 lines in full', () => {
  const twentyFiveLines = Array.from({ length: 25 }, (_, i) => `第 ${i + 1} 行：战火与流亡者的航迹`);
  const result = enforceCopyLineLimit(twentyFiveLines, 'I', '风暴与迦太基海岸');

  assert.equal(result.allowed, true);
  assert.equal(result.totalSelectedLines, 25);
  assert.equal(result.copiedLinesCount, 25);
  assert.equal(result.warningMessage, null);
  assert.ok(result.formattedText.includes('第 25 行：战火与流亡者的航迹'));
});

test('enforceCopyLineLimit allows exact boundary of 30 lines', () => {
  const thirtyLines = Array.from({ length: MAX_HUMAN_COPY_LINES }, (_, i) => `诗行 ${i + 1}`);
  const result = enforceCopyLineLimit(thirtyLines, 'I', '风暴与迦太基海岸');

  assert.equal(result.allowed, true);
  assert.equal(result.copiedLinesCount, 30);
});

test('enforceCopyLineLimit blocks and truncates selections exceeding 30 lines (e.g. 45 lines)', () => {
  const fortyFiveLines = Array.from({ length: 45 }, (_, i) => `卷一诗行 #${i + 1}`);
  const result = enforceCopyLineLimit(fortyFiveLines, 'I', '风暴与迦太基海岸');

  assert.equal(result.allowed, false);
  assert.equal(result.totalSelectedLines, 45);
  assert.equal(result.copiedLinesCount, 30);
  assert.ok(result.warningMessage !== null);
  assert.ok(result.formattedText.includes('卷一诗行 #30'));
  assert.ok(!result.formattedText.includes('卷一诗行 #31'));
  assert.ok(result.formattedText.includes('单次最多允许复制 30 行诗句'));
});

test('zero-width steganographic canary embeds and extracts cleanly', () => {
  const original = '我歌唱兵燹与那流亡者';
  const watermarked = embedZeroWidthCanary(original, 1, 1);
  assert.notEqual(watermarked, original);
  assert.equal(stripZeroWidthCanary(watermarked), original);

  const extractedHex = extractZeroWidthCanary(watermarked);
  assert.ok(extractedHex && extractedHex.startsWith('0x'));
});

test('evaluateScraperRequest permits AI passage comparison up to 50 lines and blocks bulk scrapers', () => {
  const okAi = evaluateScraperRequest({
    requestedLineCount: 25,
    recentRequestsInWindow: 2,
    sequentialCursorHits: 0,
    userAgent: 'ClaudeBot/1.0 (+https://www.anthropic.com)',
  });
  assert.equal(okAi.permitted, true);
  assert.equal(okAi.httpStatus, 200);

  const sequentialTrap = evaluateScraperRequest({
    requestedLineCount: 40,
    recentRequestsInWindow: 5,
    sequentialCursorHits: 4,
    userAgent: 'Mozilla/5.0 CustomScraper',
  });
  assert.equal(sequentialTrap.permitted, false);
  assert.equal(sequentialTrap.reasonCode, 'ERR_SEQUENTIAL_SCRAPE_DETECTED');
  assert.equal(sequentialTrap.httpStatus, 429);

  const rangeTooBig = evaluateScraperRequest({
    requestedLineCount: 120,
    recentRequestsInWindow: 1,
    sequentialCursorHits: 0,
    userAgent: 'OAI-SearchBot/1.0',
  });
  assert.equal(rangeTooBig.permitted, false);
  assert.equal(rangeTooBig.reasonCode, 'ERR_RANGE_TOO_LARGE');
});
