export type QuestionType =
  | string
  | string[]
  | {
      simplified: string;
      traditional?: string;
      pinyin?: string;
    };

export type FlashcardData = {
  question: QuestionType;
  answer: string | string[];
};
