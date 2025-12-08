import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { Word } from "./types";

export const useGlossaryStore = defineStore("glossary", () => {
  // Ladda från localStorage om det finns
  const savedWords = localStorage.getItem("glossary-words");
  const words = ref<Word[]>(savedWords ? JSON.parse(savedWords) : []);

  // Spara till localStorage varje gång listan ändras
  watch(
    words,
    (newWords) => {
      localStorage.setItem("glossary-words", JSON.stringify(newWords));
    },
    { deep: true },
  );

  const addWord = (native: string, foreign: string) => {
    words.value.push({
      id: crypto.randomUUID(),
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
