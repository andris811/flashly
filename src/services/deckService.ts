import API from "./api";
import type { FlashcardData } from "../types/Flashcard";

export const getDecks = () => API.get("/decks");

export const createDeck = (name: string) => API.post("/decks", { name });

export const deleteDeck = (deckId: string) =>
  API.delete(`/decks/${deckId}`);

export const getCards = (deckId: string) =>
  API.get(`/decks/${deckId}/cards`);

export const addCard = (deckId: string, card: FlashcardData) =>
  API.post(`/decks/${deckId}/cards`, card);