import rawData from "./hsk7.json" assert { type: "json" };

type HSKEntry = {
  simplified: string;
  traditional?: string;
  pinyin?: string;
  definition: string;
};

const typedData = rawData as HSKEntry[];

export const hsk7 = typedData.map((entry) => ({
  question: {
    simplified: entry.simplified,
    traditional: entry.traditional || "",
    pinyin: entry.pinyin || "",
  },
  answer: entry.definition,
}));
