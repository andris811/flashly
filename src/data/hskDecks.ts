import hsk1Raw from "./hsk1.json";
import hsk2Raw from "./hsk2.json";
import hsk3Raw from "./hsk3.json";
import hsk4Raw from "./hsk4.json";
import hsk5Raw from "./hsk5.json";
import hsk6Raw from "./hsk6.json";
import hsk79Raw from "./hsk7.json" assert { type: "json" };

type HSKEntry = {
  simplified: string;
  forms?: {
    traditional?: string;
    transcriptions?: {
      pinyin?: string;
    };
    meanings?: string[];
  }[];
};

const parseHSK = (data: HSKEntry[]) =>
  data.map((entry) => ({
    question: {
      simplified: entry.simplified,
      traditional: entry.forms?.[0]?.traditional || "",
      pinyin: entry.forms?.[0]?.transcriptions?.pinyin || "",
    },
    answer: entry.forms?.[0]?.meanings?.[0] || "",
  }));

export const hskDecks = {
  hsk1: parseHSK(hsk1Raw as HSKEntry[]),
  hsk2: parseHSK(hsk2Raw as HSKEntry[]),
  hsk3: parseHSK(hsk3Raw as HSKEntry[]),
  hsk4: parseHSK(hsk4Raw as HSKEntry[]),
  hsk5: parseHSK(hsk5Raw as HSKEntry[]),
  hsk6: parseHSK(hsk6Raw as HSKEntry[]),
  hsk79: parseHSK(hsk79Raw as HSKEntry[]),
};

export type HSKLevel = keyof typeof hskDecks;
