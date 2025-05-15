import rawData from './hsk4.json';

export const hsk4 = rawData.map((entry) => ({
  question: {
    simplified: entry.simplified,
    traditional: entry.forms?.[0]?.traditional || '',
    pinyin: entry.forms?.[0]?.transcriptions?.pinyin || '',
  },
  answer: entry.forms?.[0]?.meanings?.[0] || '',
}));
