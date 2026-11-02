import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCitationQuery } from './navigationParser';

test('parses standard dot-separated Book.Line e.g. 6.743 and 1.25', () => {
  const r1 = parseCitationQuery('6.743', 1);
  assert.equal(r1.isValid, true);
  assert.equal(r1.bookNumber, 6);
  assert.equal(r1.lineNumber, 743);

  const r2 = parseCitationQuery('1.25', 4);
  assert.equal(r2.isValid, true);
  assert.equal(r2.bookNumber, 1);
  assert.equal(r2.lineNumber, 25);

  const r3 = parseCitationQuery('12.90', 1);
  assert.equal(r3.isValid, true);
  assert.equal(r3.bookNumber, 12);
  assert.equal(r3.lineNumber, 90);
});

test('parses colon and hyphen separators e.g. 6:40 and 2-15', () => {
  const r1 = parseCitationQuery('6:40', 1);
  assert.equal(r1.isValid, true);
  assert.equal(r1.bookNumber, 6);
  assert.equal(r1.lineNumber, 40);

  const r2 = parseCitationQuery('2-15', 1);
  assert.equal(r2.isValid, true);
  assert.equal(r2.bookNumber, 2);
  assert.equal(r2.lineNumber, 15);
});

test('parses Roman numeral citations e.g. VI.15 and iv.3', () => {
  const r1 = parseCitationQuery('VI.15', 1);
  assert.equal(r1.isValid, true);
  assert.equal(r1.bookNumber, 6);
  assert.equal(r1.lineNumber, 15);

  const r2 = parseCitationQuery('iv.3', 1);
  assert.equal(r2.isValid, true);
  assert.equal(r2.bookNumber, 4);
  assert.equal(r2.lineNumber, 3);
});

test('parses single number as line in current book', () => {
  const r = parseCitationQuery('42', 3);
  assert.equal(r.isValid, true);
  assert.equal(r.bookNumber, 3);
  assert.equal(r.lineNumber, 42);
});

test('handles invalid text gracefully', () => {
  const r = parseCitationQuery('abc', 2);
  assert.equal(r.isValid, false);
});
