import { defineStore } from "pinia";
import { ref, computed, watch } from "vue"; // <-- FIX: computed lades till här
import type { Word } from "./types";

export const useGlossaryStore = defineStore("glossary", () => {
  // Ladda från localStorage
  const savedWords = localStorage.getItem("glossary-words");
  const words = ref<Word[]>(savedWords ? JSON.parse(savedWords) : []);

  // Spara till localStorage vid ändring
  watch(
    words,
    (newWords) => {
      localStorage.setItem("glossary-words", JSON.stringify(newWords));
    },
    { deep: true },
  );

  // FIX: En säkrare funktion för att skapa ID om crypto.randomUUID saknas
  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback för äldre webbläsare
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const addWord = (native: string, foreign: string) => {
    words.value.push({
      id: generateId(), // <-- Använd vår nya säkra funktion
      native: native.trim(),
      foreign: foreign.trim(),
      learned: false,
    });
  };

  const removeWord = (id: string) => {
    words.value = words.value.filter((w) => w.id !== id);
  };

  const swapWordLanguages = (id: string) => {
    const word = words.value.find((w) => w.id === id);
    if (word) {
      const temp = word.native;
      word.native = word.foreign;
      word.foreign = temp;
    }
  };

  return {
    words,
    count: computed(() => words.value.length),
    addWord,
    removeWord,
    swapWordLanguages,
  };
});
