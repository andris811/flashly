import rawData from './hsk2.json';

export const hsk2 = rawData.map((entry) => ({
  question: {
    simplified: entry.simplified,
    traditional: entry.forms?.[0]?.traditional || '',
    pinyin: entry.forms?.[0]?.transcriptions?.pinyin || '',
  },
  answer: entry.forms?.[0]?.meanings?.[0] || '',
}));
