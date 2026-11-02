/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedJumpTarget {
  bookNumber: number;
  lineNumber: number;
  isValid: boolean;
  explanation: string;
}

const ROMAN_MAP: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
  xi: 11,
  xii: 12,
};

/**
 * Parses user citation input into { bookNumber, lineNumber }.
 * Examples supported:
 * - "1.25" -> Book 1, Line 25
 * - "6.743" -> Book 6, Line 743
 * - "6:40" or "6-40" -> Book 6, Line 40
 * - "vi.15" or "VI.15" -> Book 6, Line 15
 * - "卷6 15" or "第6卷 15" -> Book 6, Line 15
 * - "42" (single number) -> Current Book, Line 42
 */
export function parseCitationQuery(
  rawInput: string,
  currentBookNumber: number = 1,
  maxBooks: number = 12
): ParsedJumpTarget {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      bookNumber: currentBookNumber,
      lineNumber: 1,
      isValid: false,
      explanation: '请输入卷号与行号，如 1.25 或 6.743',
    };
  }

  // 1. Check for compound format: "6.743", "1.25", "6:40", "6-40", "6,40", "6 40"
  // Also supports Roman numerals: "VI.12", "iv.3"
  const compoundRegex = /^(?:(?:卷|第)?\s*([0-9]+|[ivxlc]+)\s*(?:卷)?\s*[\.\:\-\,\s]\s*([0-9]+))$/i;
  const compoundMatch = trimmed.match(compoundRegex);

  if (compoundMatch) {
    const rawBook = compoundMatch[1].toLowerCase();
    const rawLine = parseInt(compoundMatch[2], 10);

    let bookNum = parseInt(rawBook, 10);
    if (isNaN(bookNum) && ROMAN_MAP[rawBook]) {
      bookNum = ROMAN_MAP[rawBook];
    }

    if (!isNaN(bookNum) && bookNum >= 1 && !isNaN(rawLine) && rawLine >= 1) {
      const clampedBook = Math.min(Math.max(1, bookNum), maxBooks);
      return {
        bookNumber: clampedBook,
        lineNumber: rawLine,
        isValid: true,
        explanation: `第 ${clampedBook} 卷 · 第 ${rawLine} 行`,
      };
    }
  }

  // 2. Check for Chinese prefix like "第6卷" or "卷6" (without line specified -> line 1)
  const bookOnlyRegex = /^(?:第)?\s*([0-9]+|[ivxlc]+)\s*卷$/i;
  const bookOnlyMatch = trimmed.match(bookOnlyRegex);
  if (bookOnlyMatch) {
    const rawBook = bookOnlyMatch[1].toLowerCase();
    let bookNum = parseInt(rawBook, 10);
    if (isNaN(bookNum) && ROMAN_MAP[rawBook]) {
      bookNum = ROMAN_MAP[rawBook];
    }
    if (!isNaN(bookNum) && bookNum >= 1) {
      const clampedBook = Math.min(Math.max(1, bookNum), maxBooks);
      return {
        bookNumber: clampedBook,
        lineNumber: 1,
        isValid: true,
        explanation: `第 ${clampedBook} 卷 · 第 1 行`,
      };
    }
  }

  // 3. Single number without delimiter:
  // e.g. "42" -> line 42 in current book
  const singleNum = parseInt(trimmed, 10);
  if (!isNaN(singleNum) && singleNum > 0) {
    return {
      bookNumber: currentBookNumber,
      lineNumber: singleNum,
      isValid: true,
      explanation: `当前第 ${currentBookNumber} 卷 · 第 ${singleNum} 行`,
    };
  }

  return {
    bookNumber: currentBookNumber,
    lineNumber: 1,
    isValid: false,
    explanation: `未能识别 "${trimmed}"，支持格式如 1.25 或 6.743`,
  };
}
