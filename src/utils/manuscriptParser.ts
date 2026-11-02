import { VerseLine } from '../data/aeneidData';

export interface ParseManuscriptOptions {
  bookNumber: number;
  baseLineNumber?: number;
  stripLeadingLineNumbers?: boolean;
}

const BOOK_HEADER_PATTERNS: Array<{ bookNumber: number; regex: RegExp }> = [
  { bookNumber: 12, regex: /^(?:#+\s*)?(?:第十二卷|卷十二|卷\s*XII|BOOK\s*XII|LIBER\s*XII)(?:\s.*)?$/i },
  { bookNumber: 11, regex: /^(?:#+\s*)?(?:第十一卷|卷十一|卷\s*XI|BOOK\s*XI|LIBER\s*XI)(?:\s.*)?$/i },
  { bookNumber: 10, regex: /^(?:#+\s*)?(?:第十卷|卷十|卷\s*X|BOOK\s*X|LIBER\s*X)(?:\s.*)?$/i },
  { bookNumber: 9, regex: /^(?:#+\s*)?(?:第九卷|卷九|卷\s*IX|BOOK\s*IX|LIBER\s*IX)(?:\s.*)?$/i },
  { bookNumber: 8, regex: /^(?:#+\s*)?(?:第八卷|卷八|卷\s*VIII|BOOK\s*VIII|LIBER\s*VIII)(?:\s.*)?$/i },
  { bookNumber: 7, regex: /^(?:#+\s*)?(?:第七卷|卷七|卷\s*VII|BOOK\s*VII|LIBER\s*VII)(?:\s.*)?$/i },
  { bookNumber: 6, regex: /^(?:#+\s*)?(?:第六卷|卷六|卷\s*VI|BOOK\s*VI|LIBER\s*VI)(?:\s.*)?$/i },
  { bookNumber: 5, regex: /^(?:#+\s*)?(?:第五卷|卷五|卷\s*V|BOOK\s*V|LIBER\s*V)(?:\s.*)?$/i },
  { bookNumber: 4, regex: /^(?:#+\s*)?(?:第四卷|卷四|卷\s*IV|BOOK\s*IV|LIBER\s*IV)(?:\s.*)?$/i },
  { bookNumber: 3, regex: /^(?:#+\s*)?(?:第三卷|卷三|卷\s*III|BOOK\s*III|LIBER\s*III)(?:\s.*)?$/i },
  { bookNumber: 2, regex: /^(?:#+\s*)?(?:第二卷|卷二|卷\s*II|BOOK\s*II|LIBER\s*II)(?:\s.*)?$/i },
  { bookNumber: 1, regex: /^(?:#+\s*)?(?:第一卷|卷一|卷\s*I|BOOK\s*I|LIBER\s*I)(?:\s.*)?$/i },
];

/**
 * Strips accidental leading line numbers from a Chinese verse draft line,
 * e.g. "5 昔日图尔努斯..." or "12. 熟悉的金钉..." -> "昔日图尔努斯..."
 */
export function cleanLeadingLineNumber(line: string): string {
  return line.replace(/^\s*(?:\[\d+\]|\d+[.、:：)?\]]?)\s+/, '').trim();
}

/**
 * Parses a single book's raw text into VerseLine[], preserving blank lines as stanzaBreakAfter
 * and extracting {{词条::标题::解释}} or {{词条::解释}} inline annotations.
 */
export function parseSingleBookManuscript(
  rawText: string,
  options: ParseManuscriptOptions
): VerseLine[] {
  const { bookNumber, baseLineNumber = 1, stripLeadingLineNumbers = true } = options;
  const rawLines = rawText.split(/\r?\n/);

  const verses: VerseLine[] = [];
  let currentLineNum = baseLineNumber;

  for (let i = 0; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();

    // Comment lines starting with # (unless it's a book heading) are skipped
    if (trimmed.startsWith('#')) {
      continue;
    }

    // Blank line marks stanza break on the previous verse if one exists
    if (trimmed.length === 0) {
      if (verses.length > 0) {
        verses[verses.length - 1].stanzaBreakAfter = true;
      }
      continue;
    }

    // Also skip standalone book title lines if user pasted "第一卷" at top of single-book import
    if (BOOK_HEADER_PATTERNS.some((p) => p.regex.test(trimmed))) {
      continue;
    }

    const [zhPartRaw, laPartRaw] = trimmed.split('|').map((s) => s.trim());
    const rawVerseText = stripLeadingLineNumbers
      ? cleanLeadingLineNumber(zhPartRaw)
      : zhPartRaw;

    if (!rawVerseText) continue;

    const annotations: NonNullable<VerseLine['annotations']> = [];
    let cleanZh = rawVerseText;

    // Match {{词条::标题::注释内容}} or {{词条::注释内容}}
    const regex = /\{\{([^:}]+?)::([^:}]+?)(?:::([^}]+?))?\}\}/g;
    let match: RegExpExecArray | null;
    let noteIdx = 1;

    while ((match = regex.exec(rawVerseText)) !== null) {
      const [fullMatch, phraseRaw, secondPart, thirdPart] = match;
      const phrase = phraseRaw.trim();
      const title = thirdPart ? secondPart.trim() : `${phrase} 译注`;
      const explanation = thirdPart ? thirdPart.trim() : secondPart.trim();

      cleanZh = cleanZh.replace(fullMatch, phrase);
      annotations.push({
        id: `custom-${bookNumber}-${currentLineNum}-${noteIdx}`,
        markerLabel: String(noteIdx).padStart(2, '0'),
        anchorPhrase: phrase,
        category: '译法辨析',
        title,
        latinTerm: laPartRaw || undefined,
        explanation,
      });
      noteIdx++;
    }

    verses.push({
      lineNumber: currentLineNum,
      zh: cleanZh,
      annotations: annotations.length > 0 ? annotations : undefined,
    });

    currentLineNum++;
  }

  // Clear trailing stanzaBreakAfter on the very last line of a book
  if (verses.length > 0 && verses[verses.length - 1].stanzaBreakAfter) {
    delete verses[verses.length - 1].stanzaBreakAfter;
  }

  return verses;
}

/**
 * Detects if a raw manuscript contains multiple books (e.g. "第一卷 ... 第二卷 ...")
 * and parses all detected books into a map of bookNumber -> VerseLine[].
 */
export function parseMultiBookManuscript(
  rawText: string,
  stripLeadingLineNumbers = true
): Record<number, VerseLine[]> | null {
  const lines = rawText.split(/\r?\n/);
  const bookBuckets: Record<number, string[]> = {};
  let currentDetectedBook: number | null = null;
  let detectedCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const matchedHeader = BOOK_HEADER_PATTERNS.find((p) => p.regex.test(trimmed));
    if (matchedHeader) {
      currentDetectedBook = matchedHeader.bookNumber;
      if (!bookBuckets[currentDetectedBook]) {
        bookBuckets[currentDetectedBook] = [];
        detectedCount++;
      }
      continue;
    }

    if (currentDetectedBook !== null) {
      bookBuckets[currentDetectedBook].push(line);
    }
  }

  if (detectedCount === 0) {
    return null;
  }

  const result: Record<number, VerseLine[]> = {};
  for (const [bookNumStr, bucketLines] of Object.entries(bookBuckets)) {
    const bookNum = Number(bookNumStr);
    const parsed = parseSingleBookManuscript(bucketLines.join('\n'), {
      bookNumber: bookNum,
      baseLineNumber: 1,
      stripLeadingLineNumbers,
    });
    if (parsed.length > 0) {
      result[bookNum] = parsed;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
