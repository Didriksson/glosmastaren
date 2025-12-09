<template>
    <div class="flex flex-col items-center justify-center min-h-[50vh]">
        <div
            v-if="!isActive && !isFinished"
            class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full transition-all hover:shadow-2xl"
        >
            <div class="text-6xl mb-6 animate-bounce-slow">🎓</div>
            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">
                Dags för förhör!
            </h2>
            <p class="text-slate-500 mb-6 text-lg">
                Du har
                <strong class="text-indigo-600 font-bold">{{
                    store.count
                }}</strong>
                ord att bemästra.
            </p>

            <div
                class="bg-slate-50 p-4 rounded-xl mb-8 flex flex-col gap-2 border border-slate-100"
            >
                <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >Välj riktning:</label
                >
                <div class="flex gap-2">
                    <button
                        @click="quizDirection = 'sv-en'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            quizDirection === 'sv-en'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                        "
                    >
                        🇸🇪 Sv ➔ 🇬🇧 En
                    </button>
                    <button
                        @click="quizDirection = 'en-sv'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            quizDirection === 'en-sv'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-slate-200 text-slate-500 hover:border-purple-200'
                        "
                    >
                        🇬🇧 En ➔ 🇸🇪 Sv
                    </button>
                </div>
            </div>

            <button
                @click="startQuiz"
                :disabled="store.count === 0"
                class="w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
                🚀 Starta spelet
            </button>

            <p
                v-if="store.count === 0"
                class="text-sm text-red-400 mt-4 font-medium bg-red-50 py-2 rounded-lg"
            >
                Psst! Lägg in lite ord i flik 1 först.
            </p>
        </div>

        <div v-else-if="isActive && currentWord" class="w-full max-w-md">
            <div
                class="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden shadow-inner"
            >
                <div
                    class="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: progressPercentage + '%' }"
                ></div>
            </div>

            <div
                class="bg-white p-8 rounded-3xl shadow-2xl border-4 border-transparent text-center relative transition-all"
                :class="animClass"
            >
                <button
                    @click="resetQuiz"
                    class="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                    title="Avsluta"
                >
                    ✕
                </button>

                <span
                    class="inline-block bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
                >
                    {{
                        quizDirection === "sv-en"
                            ? "Översätt till engelska"
                            : "Översätt till svenska"
                    }}
                </span>

                <h1
                    class="text-5xl font-black text-slate-800 mb-2 tracking-tight break-words"
                >
                    {{ displayQuestionWord }}
                </h1>

                <div class="h-8 mb-4 flex items-center justify-center">
                    <button
                        v-if="!hintShown"
                        @click="showHint"
                        class="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-yellow-500 transition-colors"
                    >
                        <span class="text-lg">💡</span> Vill du ha en ledtråd?
                    </button>
                    <span
                        v-else
                        class="text-yellow-600 font-mono font-bold tracking-[0.2em] bg-yellow-50 px-3 py-1 rounded-md"
                    >
                        {{ hintText }}
                    </span>
                </div>

                <input
                    v-model="userAnswer"
                    @keyup.enter="checkAnswer"
                    type="text"
                    placeholder="Skriv ditt svar..."
                    :disabled="isChecking"
                    ref="answerInput"
                    class="w-full p-4 text-xl text-center border-2 border-slate-200 bg-slate-50 rounded-2xl mb-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    :class="{
                        'border-red-500 bg-red-50 text-red-900':
                            feedbackType === 'error',
                        'border-green-500 bg-green-50 text-green-900':
                            feedbackType === 'success',
                    }"
                    autocomplete="off"
                />

                <button
                    @click="checkAnswer"
                    :disabled="isChecking"
                    class="w-full py-4 rounded-xl font-bold text-lg text-white shadow-md transition-colors duration-200"
                    :class="
                        isChecking
                            ? 'bg-slate-400 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    "
                >
                    {{ isChecking ? "🤔 Rättar..." : "Svara" }}
                </button>

                <transition name="fade">
                    <div
                        v-if="feedback"
                        class="mt-6 p-4 rounded-xl font-bold text-lg animate-fade-in-up"
                        :class="
                            feedbackType === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        "
                    >
                        {{ feedback }}
                    </div>
                </transition>
            </div>

            <p
                class="text-center text-slate-400 mt-6 font-medium text-sm tracking-wide"
            >
                FRÅGA {{ currentIndex + 1 }} / {{ quizQueue.length }}
            </p>
        </div>

        <div
            v-else-if="isFinished"
            class="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-md w-full animate-fade-in-up"
        >
            <div class="text-6xl mb-4 animate-bounce">
                {{ score === quizQueue.length ? "🏆" : "💪" }}
            </div>

            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">
                {{ score === quizQueue.length ? "Alla rätt!" : "Bra jobbat!" }}
            </h2>

            <div class="my-8 relative inline-block">
                <svg
                    class="w-32 h-32 transform -rotate-90 text-slate-100"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="8"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10B981"
                        stroke-width="8"
                        stroke-dasharray="283"
                        :stroke-dashoffset="
                            283 - (283 * score) / quizQueue.length
                        "
                        class="transition-all duration-1000 ease-out"
                        stroke-linecap="round"
                    />
                </svg>
                <div
                    class="absolute inset-0 flex items-center justify-center flex-col"
                >
                    <span class="text-3xl font-black text-slate-800"
                        >{{ score }} / {{ quizQueue.length }}</span
                    >
                    <span class="text-xs text-slate-500 uppercase font-bold"
                        >Poäng</span
                    >
                </div>
            </div>

            <p
                v-if="score === quizQueue.length"
                class="text-green-600 font-bold mb-6"
            >
                Du är en stjärna! 🌟
            </p>

            <p v-else-if="wrongAnswers.length > 0" class="text-slate-500 mb-6">
                Du satte <strong class="text-slate-800">{{ score }}</strong> av
                <strong class="text-slate-800">{{ quizQueue.length }}</strong>
                ord.
                <br />
                Vill du öva på de
                <strong class="text-red-500">{{ wrongAnswers.length }}</strong>
                du missade?
            </p>

            <p v-else class="text-slate-500 mb-6">Snyggt jobbat!</p>

            <div class="flex flex-col gap-3">
                <button
                    v-if="wrongAnswers.length > 0"
                    @click="retryMistakes"
                    class="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg flex justify-center items-center gap-2"
                >
                    <span>🧠</span> Öva på mina
                    {{ wrongAnswers.length }} misstag
                </button>

                <button
                    @click="startQuiz"
                    class="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                    🔄 Kör om alla ord
                </button>

                <button
                    @click="$emit('back-to-input')"
                    class="w-full py-3 bg-white text-slate-500 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-700 transition-all"
                >
                    Lägg till fler ord
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useGlossaryStore } from "../stores/glossaryStore";
import confetti from "canvas-confetti";
import type { Word } from "../stores/types"; // ✅ Alltid säkert

// Events
defineEmits(["back-to-input"]);

const store = useGlossaryStore();

// State
const isActive = ref(false);
const isFinished = ref(false);
const currentIndex = ref(0);
const quizQueue = ref<Word[]>([]);
const wrongAnswers = ref<Word[]>([]);
const userAnswer = ref("");
const score = ref(0);
const feedback = ref("");
const feedbackType = ref<"success" | "error" | "">("");
const isChecking = ref(false);
const answerInput = ref<HTMLInputElement | null>(null);

// Nya state-variabler
const quizDirection = ref<"sv-en" | "en-sv">("sv-en");
const hintShown = ref(false);

// Animation state
const animClass = ref("");

const currentWord = computed(() => quizQueue.value[currentIndex.value]);

// Räkna ut vilket ord som ska visas beroende på riktning
const displayQuestionWord = computed(() => {
    if (!currentWord.value) return "";
    return quizDirection.value === "sv-en"
        ? currentWord.value.native
        : currentWord.value.foreign;
});

// Räkna ut facit beroende på riktning
const targetAnswer = computed(() => {
    if (!currentWord.value) return "";
    return quizDirection.value === "sv-en"
        ? currentWord.value.foreign
        : currentWord.value.native;
});

// Skapa ledtrådstext (t.ex. "C _ _")
const hintText = computed(() => {
    const answer = targetAnswer.value;
    if (!answer) return "";
    // Ta första bokstaven och ersätt resten med understreck
    return (
        answer.charAt(0).toUpperCase() +
        " " +
        "_ ".repeat(answer.length - 1).trim()
    );
});

const progressPercentage = computed(() => {
    if (quizQueue.value.length === 0) return 0;
    return (currentIndex.value / quizQueue.value.length) * 100;
});

const showHint = () => {
    hintShown.value = true;
};

const startQuiz = () => {
    if (store.count === 0) return;
    wrongAnswers.value = [];
    quizQueue.value = [...store.words].sort(() => Math.random() - 0.5);
    startRound();
};

const retryMistakes = () => {
    if (wrongAnswers.value.length === 0) return;
    quizQueue.value = [...wrongAnswers.value].sort(() => Math.random() - 0.5);
    wrongAnswers.value = [];
    startRound();
};

const startRound = () => {
    currentIndex.value = 0;
    score.value = 0;
    isActive.value = true;
    isFinished.value = false;
    resetField();
};

const checkAnswer = async () => {
    const word = currentWord.value;
    if (!word || !word.id || !userAnswer.value || isChecking.value) return;

    isChecking.value = true;

    const correct = targetAnswer.value.toLowerCase(); // Använd vår computed target
    const answer = userAnswer.value.toLowerCase().trim();
    var timeout;
    if (answer === correct) {
        score.value++;
        feedback.value = "Rätt! 🎉";
        feedbackType.value = "success";
        animClass.value = "pop-border";
        runConfetti();
        timeout = 2000;
    } else {
        feedback.value = `Fel! Rätt svar: ${targetAnswer.value}`;
        feedbackType.value = "error";
        animClass.value = "shake-horizontal";

        if (!wrongAnswers.value.find((w) => w.id === word.id)) {
            wrongAnswers.value.push(currentWord.value);
        }
        timeout = 5000;
    }

    setTimeout(() => {
        nextQuestion();
    }, 5000);
};

const nextQuestion = () => {
    if (currentIndex.value < quizQueue.value.length - 1) {
        currentIndex.value++;
        resetField();
    } else {
        isActive.value = false;
        isFinished.value = true;
        if (score.value === quizQueue.value.length) runConfetti();
    }
};

const resetField = () => {
    userAnswer.value = "";
    feedback.value = "";
    feedbackType.value = "";
    animClass.value = "";
    isChecking.value = false;
    hintShown.value = false; // Göm ledtråd för nytt ord
    nextTick(() => {
        answerInput.value?.focus();
    });
};

const resetQuiz = () => {
    isActive.value = false;
    isFinished.value = false;
};

const runConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};
</script>

<style scoped>
/* Custom animations */
.shake-horizontal {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    @apply border-red-500;
}

.pop-border {
    animation: pop 0.3s ease;
    @apply border-green-500;
}

.animate-bounce-slow {
    animation: bounce 2s infinite;
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }
    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }
    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }
    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

@keyframes pop {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
