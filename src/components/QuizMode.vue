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

// FIX: Använd en lokal variabel 'word' för att säkra typen
const displayQuestionWord = computed(() => {
    const word = currentWord.value;
    if (!word) return "";
    return quizDirection.value === "sv-en" ? word.native : word.foreign;
});

// FIX: Samma sak här
const targetAnswer = computed(() => {
    const word = currentWord.value;
    if (!word) return "";
    return quizDirection.value === "sv-en" ? word.foreign : word.native;
});

const hintText = computed(() => {
    const answer = targetAnswer.value;
    if (!answer) return "";
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
    // FIX: Spara ner i lokal variabel så TS förstår att den inte är undefined
    const word = currentWord.value;

    if (!word || !userAnswer.value || isChecking.value) return;

    isChecking.value = true;

    const correct = targetAnswer.value.toLowerCase();
    const answer = userAnswer.value.toLowerCase().trim();

    if (answer === correct) {
        score.value++;
        feedback.value = "Rätt! 🎉";
        feedbackType.value = "success";
        animClass.value = "pop-border";
        runConfetti();
    } else {
        feedback.value = `Fel! Rätt svar: ${targetAnswer.value}`;
        feedbackType.value = "error";
        animClass.value = "shake-horizontal";

        // Nu använder vi 'word' istället för 'currentWord.value'
        if (!wrongAnswers.value.find((w) => w.id === word.id)) {
            wrongAnswers.value.push(word);
        }
    }

    setTimeout(() => {
        nextQuestion();
    }, 2000);
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
    hintShown.value = false;
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
