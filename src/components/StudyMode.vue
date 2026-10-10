<template>
    <div class="flex flex-col items-center justify-center min-h-[50vh]">
        <!-- Start screen -->
        <div
            v-if="!isActive && !isFinished"
            class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full"
        >
            <div class="text-6xl mb-6">📖</div>
            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">
                Dags att studera!
            </h2>
            <p class="text-slate-500 mb-6 text-lg">
                Se ordet och skriv av det — nöta in det i fingrarna.
            </p>

            <div
                class="bg-slate-50 p-4 rounded-xl mb-8 flex flex-col gap-2 border border-slate-100"
            >
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >Välj riktning:</label
                >
                <div class="flex gap-2">
                    <button
                        @click="studyDirection = 'sv-en'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            studyDirection === 'sv-en'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                        "
                    >
                        {{ store.nativeLang.name }} ➔ {{ store.foreignLang.name }}
                    </button>
                    <button
                        @click="studyDirection = 'en-sv'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            studyDirection === 'en-sv'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-slate-200 text-slate-500 hover:border-purple-200'
                        "
                    >
                        {{ store.foreignLang.name }} ➔ {{ store.nativeLang.name }}
                    </button>
                </div>
            </div>

            <button
                @click="startStudy"
                :disabled="store.count === 0"
                class="w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
                📖 Starta studieläge
            </button>

            <p
                v-if="store.count === 0"
                class="text-sm text-red-400 mt-4 font-medium bg-red-50 py-2 rounded-lg"
            >
                Psst! Lägg in lite ord i flik 1 först.
            </p>
        </div>

        <!-- Study card -->
        <div v-else-if="isActive && currentWord" class="w-full max-w-md">
            <div
                class="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden shadow-inner"
            >
                <div
                    class="bg-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: progressPercentage + '%' }"
                ></div>
            </div>

            <div
                class="bg-white p-8 rounded-3xl shadow-2xl border-4 text-center relative transition-all"
                :class="cardBorderClass"
            >
                <button
                    @click="resetStudy"
                    class="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                    title="Avsluta"
                >
                    ✕
                </button>

                <span
                    class="inline-block bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                >
                    {{ studyDirection === "sv-en" ? store.foreignLang.name : store.nativeLang.name }}
                </span>

                <!-- Source word -->
                <h1 class="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">
                    {{ displayWord }}
                </h1>
                <p class="text-slate-400 text-sm mb-6">
                    {{ currentIndex + 1 }} / {{ studyQueue.length }}
                </p>

                <!-- Fill-in display: ghost letters + typed overlay -->
                <div
                    class="flex gap-1 justify-center flex-wrap mb-6 cursor-text py-2"
                    @click="hiddenInput?.focus()"
                >
                    <span
                        v-for="(targetLetter, i) in targetLetters"
                        :key="i"
                        class="text-3xl font-bold tracking-wide transition-all duration-100 min-w-[1ch]"
                        :class="letterClass(i)"
                    >
                        {{ displayLetter(i) }}
                    </span>
                </div>

                <!-- Hidden input that captures typing -->
                <input
                    ref="hiddenInput"
                    type="text"
                    :value="userAnswer"
                    @keydown="handleKeydown"
                    class="sr-only"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    aria-label="Skriv in ordet"
                />

                <!-- Hint: tap to type -->
                <p
                    v-if="feedbackType === '' && userAnswer.length === 0"
                    class="text-slate-400 text-sm mb-4"
                >
                    Tryck här och börja skriva...
                </p>

                <!-- Feedback -->
                <p
                    v-if="feedback"
                    class="text-sm font-bold mb-4 py-2 px-4 rounded-lg"
                    :class="
                        feedbackType === 'correct'
                            ? 'bg-green-50 text-green-700'
                            : feedbackType === 'error'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-indigo-50 text-indigo-600'
                    "
                >
                    {{ feedback }}
                </p>

                <!-- Buttons -->
                <div class="flex flex-col gap-2 mt-2">
                    <button
                        v-if="feedbackType === 'correct' || feedbackType === 'revealed'"
                        @click="nextWord"
                        class="w-full py-3 text-base font-bold text-white rounded-xl transition-all transform active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                        Nästa ord →
                    </button>

                    <button
                        v-if="feedbackType === '' || feedbackType === 'error'"
                        @click="revealAnswer"
                        class="w-full py-3 text-sm font-bold rounded-xl border-2 border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500 transition-all active:scale-95"
                    >
                        Visa svar
                    </button>
                </div>
            </div>
        </div>

        <!-- Finished screen -->
        <div
            v-else-if="isFinished"
            class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full"
        >
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">Bra jobbat!</h2>
            <p class="text-slate-500 mb-8 text-lg">
                Du övade på
                <strong class="text-indigo-600 font-bold">{{ studyQueue.length }}</strong>
                ord.
            </p>

            <div class="flex flex-col gap-3">
                <button
                    @click="startStudy"
                    class="w-full py-3 text-base font-bold text-white rounded-xl transition-all transform active:scale-95 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    🔄 Öva igen
                </button>
                <button
                    @click="emit('back-to-input')"
                    class="w-full py-3 text-base font-bold rounded-xl border-2 border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
                >
                    ← Tillbaka till ord
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import confetti from "canvas-confetti";
import { useGlossaryStore } from "../stores/glossaryStore";
import type { Word } from "../stores/types";

const emit = defineEmits<{ (e: "back-to-input"): void }>();
const store = useGlossaryStore();

const studyQueue = ref<Word[]>([]);
const currentIndex = ref(0);
const isActive = ref(false);
const isFinished = ref(false);
const studyDirection = ref<"sv-en" | "en-sv">("sv-en");
const userAnswer = ref("");
const feedbackType = ref<"correct" | "error" | "revealed" | "">("");
const feedback = ref("");
const hiddenInput = ref<HTMLInputElement | null>(null);

const currentWord = computed(() => studyQueue.value[currentIndex.value]);

const displayWord = computed(() => {
    if (!currentWord.value) return "";
    return studyDirection.value === "sv-en"
        ? currentWord.value.native
        : currentWord.value.foreign;
});

const targetAnswer = computed(() => {
    if (!currentWord.value) return "";
    return studyDirection.value === "sv-en"
        ? currentWord.value.foreign
        : currentWord.value.native;
});

const targetLetters = computed(() => targetAnswer.value.split(""));

const progressPercentage = computed(() => {
    if (studyQueue.value.length === 0) return 0;
    return (currentIndex.value / studyQueue.value.length) * 100;
});

const cardBorderClass = computed(() => {
    if (feedbackType.value === "correct") return "border-green-400";
    if (feedbackType.value === "error") return "border-red-400";
    if (feedbackType.value === "revealed") return "border-indigo-300";
    return "border-transparent";
});

// Which character to display in each slot
const displayLetter = (i: number): string => {
    if (feedbackType.value === "revealed") return targetLetters.value[i] ?? "";
    if (i < userAnswer.value.length) return userAnswer.value[i] ?? "";
    return targetLetters.value[i] ?? "";
};

// Color class for each letter slot
const letterClass = (i: number): string => {
    if (feedbackType.value === "revealed") {
        return "text-indigo-500";
    }
    if (feedbackType.value === "correct") {
        return "text-green-500";
    }
    if (feedbackType.value === "error") {
        if (i < userAnswer.value.length) return "text-red-400";
        return "text-slate-300";
    }
    // Typing in progress
    if (i < userAnswer.value.length) {
        return "text-slate-800";
    }
    return "text-slate-300"; // ghost letters
};

const handleKeydown = (e: KeyboardEvent) => {
    if (feedbackType.value === "correct" || feedbackType.value === "revealed") {
        if (e.key === "Enter") nextWord();
        return;
    }

    if (e.key === "Backspace") {
        e.preventDefault();
        if (feedbackType.value === "error") {
            // Clear error state and let them retry
            feedbackType.value = "";
            feedback.value = "";
            userAnswer.value = "";
        } else {
            userAnswer.value = userAnswer.value.slice(0, -1);
        }
        return;
    }

    if (e.key === "Enter") return;

    // Only accept printable single characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (feedbackType.value === "error") return;
        if (userAnswer.value.length < targetAnswer.value.length) {
            userAnswer.value += e.key;
        }
    }
};

// Auto-check when the word is fully typed
watch(userAnswer, (val) => {
    if (
        feedbackType.value === "" &&
        val.length === targetAnswer.value.length &&
        targetAnswer.value.length > 0
    ) {
        checkAnswer();
    }
});

const checkAnswer = () => {
    const correct = targetAnswer.value.toLowerCase();
    const answer = userAnswer.value.toLowerCase();
    if (answer === correct) {
        feedbackType.value = "correct";
        feedback.value = "Rätt! 🎉";
    } else {
        feedbackType.value = "error";
        feedback.value = `Inte riktigt — tryck Backspace och försök igen`;
    }
};

const revealAnswer = () => {
    feedbackType.value = "revealed";
    feedback.value = "Kom ihåg det till nästa gång!";
    userAnswer.value = "";
};

const nextWord = () => {
    if (currentIndex.value < studyQueue.value.length - 1) {
        currentIndex.value++;
        resetField();
    } else {
        isActive.value = false;
        isFinished.value = true;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
};

const resetField = () => {
    userAnswer.value = "";
    feedbackType.value = "";
    feedback.value = "";
    nextTick(() => hiddenInput.value?.focus());
};

const startStudy = () => {
    if (store.count === 0) return;
    studyQueue.value = [...store.words].sort(() => Math.random() - 0.5);
    currentIndex.value = 0;
    isActive.value = true;
    isFinished.value = false;
    resetField();
};

const resetStudy = () => {
    isActive.value = false;
    isFinished.value = false;
};
</script>
