import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanLeadingLineNumber,
  parseSingleBookManuscript,
  parseMultiBookManuscript,
} from './manuscriptParser';

test('cleanLeadingLineNumber strips leading numbers and punctuation only when followed by space', () => {
  assert.equal(cleanLeadingLineNumber('5 昔日图尔努斯将这少年击倒刺伤'), '昔日图尔努斯将这少年击倒刺伤');
  assert.equal(cleanLeadingLineNumber('10. 熟悉的金钉扣环闪烁着光芒'), '熟悉的金钉扣环闪烁着光芒');
  assert.equal(cleanLeadingLineNumber('[15] 我歌唱兵燹与那一人'), '我歌唱兵燹与那一人');
  assert.equal(cleanLeadingLineNumber('我歌唱兵燹与那一人'), '我歌唱兵燹与那一人');
});

test('parseSingleBookManuscript preserves stanza breaks and extracts inline annotations', () => {
  const sample = `
# 注释说明行
1 我歌唱{{兵燹与那一人::Arma virumque::开篇点题}}，他最先自特洛伊的海岸，
被天命驱策，流亡至意大利与拉维尼姆的滩头；

5 他在陆上与海上久经{{赫拉的暴怒::高贵朱诺难忘的怨恨}}，
历尽战争的苦难，直到建立起城邦。
`;
  const verses = parseSingleBookManuscript(sample, {
    bookNumber: 1,
    baseLineNumber: 1,
    stripLeadingLineNumbers: true,
  });

  assert.equal(verses.length, 4);
  assert.equal(verses[0].lineNumber, 1);
  assert.equal(verses[0].zh, '我歌唱兵燹与那一人，他最先自特洛伊的海岸，');
  assert.equal(verses[0].annotations?.length, 1);
  assert.equal(verses[0].annotations?.[0].anchorPhrase, '兵燹与那一人');
  assert.equal(verses[0].annotations?.[0].title, 'Arma virumque');
  assert.equal(verses[0].annotations?.[0].explanation, '开篇点题');

  // Blank line after verse 2 sets stanzaBreakAfter on verse 2
  assert.equal(verses[1].stanzaBreakAfter, true);
  assert.equal(verses[2].lineNumber, 3);
  assert.equal(verses[2].annotations?.[0].anchorPhrase, '赫拉的暴怒');
  assert.equal(verses[2].annotations?.[0].explanation, '高贵朱诺难忘的怨恨');
});

test('parseMultiBookManuscript splits multi-book file automatically', () => {
  const multiText = `
第一卷
我歌唱兵燹与那一人，
被天命驱策至拉维尼姆。

第六卷
他们步入幽暗的冥府森林，
穿行在寂静的夜影之中。
`;
  const parsed = parseMultiBookManuscript(multiText);
  assert.ok(parsed);
  assert.equal(parsed[1]?.length, 2);
  assert.equal(parsed[6]?.length, 2);
  assert.equal(parsed[6]?.[0].zh, '他们步入幽暗的冥府森林，');
});
