export type TextCard = {
  type: "text";
  question: string;           
  answer: string | string[]; 
};

export type QACard = {
  type: "qa";
  question: { prompt: string; hint?: string };
  answer: string | string[];
};

export type MCQCard = {
  type: "mcq";
  question: { prompt: string; choices: string[] };
  answer: string; 
};

export type ClozeCard = {
  type: "cloze";
  question: { text: string };
  answer: string | string[];
};

export type HSKCard = {
  type: "hsk";
  question: {
    simplified: string;
    traditional?: string;
    pinyin?: string;
  };
  answer: string | string[];
};

export type AnyCardPayload = TextCard | QACard | MCQCard | ClozeCard | HSKCard;

export type Card = AnyCardPayload & {
  _id: string;
  deckId: string;
  createdAt?: string;
  updatedAt?: string;
};

// Decks
export type Deck = { _id: string; name: string; userId: string; createdAt?: string; updatedAt?: string };

// API bodies/responses
export type ListDecksResponse = Deck[];
export type CreateDeckBody = { name: string };
export type CreateDeckResponse = Deck;

export type ListCardsResponse = Card[];

export type AddCardBody = AnyCardPayload;
export type AddCardResponse = Card;