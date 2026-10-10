import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { Word } from "./types";

export const LANGUAGES = [
  { id: "sv", cc: "se", code: "Sv", name: "Svenska" },
  { id: "en", cc: "gb", code: "En", name: "Engelska" },
  { id: "de", cc: "de", code: "De", name: "Tyska" },
  { id: "fr", cc: "fr", code: "Fr", name: "Franska" },
  { id: "es", cc: "es", code: "Es", name: "Spanska" },
  { id: "it", cc: "it", code: "It", name: "Italienska" },
  { id: "no", cc: "no", code: "No", name: "Norska" },
  { id: "da", cc: "dk", code: "Da", name: "Danska" },
  { id: "fi", cc: "fi", code: "Fi", name: "Finska" },
  { id: "ja", cc: "jp", code: "Ja", name: "Japanska" },
  { id: "zh", cc: "cn", code: "Zh", name: "Kinesiska" },
  { id: "ru", cc: "ru", code: "Ru", name: "Ryska" },
  { id: "ar", cc: "sa", code: "Ar", name: "Arabiska" },
] as const;

export const flagUrl = (cc: string) => `/flags/${cc}.png`;

export type LangId = (typeof LANGUAGES)[number]["id"];

const findLang = (id: string) =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0]!;

export const useGlossaryStore = defineStore("glossary", () => {
  const savedWords = localStorage.getItem("glossary-words");
  const words = ref<Word[]>(savedWords ? JSON.parse(savedWords) : []);

  // One-time migration: if both langs are "sv" (state before language feature), reset foreign to "en"
  if (
    localStorage.getItem("glossary-native-lang") === "sv" &&
    localStorage.getItem("glossary-foreign-lang") === "sv"
  ) {
    localStorage.removeItem("glossary-foreign-lang");
  }

  const nativeLangId = ref<LangId>(
    (localStorage.getItem("glossary-native-lang") as LangId) ?? "sv",
  );
  const foreignLangId = ref<LangId>(
    (localStorage.getItem("glossary-foreign-lang") as LangId) ?? "en",
  );

  const nativeLang = computed(() => findLang(nativeLangId.value));
  const foreignLang = computed(() => findLang(foreignLangId.value));

  watch(nativeLangId, (v) => localStorage.setItem("glossary-native-lang", v));
  watch(foreignLangId, (v) => localStorage.setItem("glossary-foreign-lang", v));

  watch(
    words,
    (newWords) => {
      localStorage.setItem("glossary-words", JSON.stringify(newWords));
    },
    { deep: true },
  );

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const addWord = (native: string, foreign: string) => {
    words.value.push({
      id: generateId(),
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
    nativeLangId,
    foreignLangId,
    nativeLang,
    foreignLang,
    addWord,
    removeWord,
    swapWordLanguages,
  };
});
