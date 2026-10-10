<template>
    <div
        class="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center overflow-hidden"
    >
        <div class="text-center mb-6 z-10 select-none">
            <div class="text-5xl mb-2">🎊</div>
            <h2 class="text-3xl font-extrabold text-white mb-1">
                Perfekt poäng!
            </h2>
            <p class="text-indigo-200 text-lg">
                Poppa bubblorna innan de flyger iväg!
            </p>
            <p class="text-indigo-300 text-sm mt-1">
                {{ poppedCount }} / {{ bubbles.length }} poppade
            </p>
        </div>

        <!-- Bubbles -->
        <template v-for="bubble in bubbles" :key="bubble.id">
        <div
            v-if="!bubble.popped"
            @click="popBubble(bubble, $event)"
            class="absolute cursor-pointer select-none flex items-center justify-center rounded-full font-bold text-white text-sm shadow-2xl bubble"
            :style="{
                left: bubble.x + '%',
                top: bubble.startY + '%',
                width: bubble.size + 'px',
                height: bubble.size + 'px',
                background: bubble.gradient,
                animationDuration: bubble.duration + 's',
                animationDelay: bubble.delay + 's',
            }"
        >
            <span class="px-2 text-center leading-tight">{{ bubble.text }}</span>
        </div>
        </template>

        <!-- Timer bar -->
        <div class="fixed bottom-0 left-0 right-0 h-2 bg-indigo-900">
            <div
                class="h-2 bg-gradient-to-r from-indigo-400 to-purple-400 timer-bar"
                :style="{ width: timerBarWidth + '%' }"
            ></div>
        </div>

        <!-- Skip button -->
        <button
            @click="emit('done')"
            class="fixed bottom-6 right-6 text-indigo-300 hover:text-white text-sm transition-colors"
        >
            Hoppa över →
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import confetti from "canvas-confetti";
import type { Word } from "../stores/types";

const props = defineProps<{ words: Word[] }>();
const emit = defineEmits<{ (e: "done"): void }>();

interface Bubble {
    id: string;
    text: string;
    x: number;
    startY: number;
    size: number;
    duration: number;
    delay: number;
    gradient: string;
    popped: boolean;
}

const GAME_DURATION = 10000;
const gradients = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #8b5cf6, #ec4899)",
    "linear-gradient(135deg, #06b6d4, #6366f1)",
    "linear-gradient(135deg, #10b981, #6366f1)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
];

const bubbles = ref<Bubble[]>([]);
const poppedCount = ref(0);
const timerBarWidth = ref(100);
let timerInterval: number;
let endTimeout: number;

const createBubbles = () => {
    const selected = [...props.words].sort(() => Math.random() - 0.5).slice(0, 8);
    bubbles.value = selected.map((w, i) => ({
        id: `bubble-${i}`,
        text: w.native,
        x: 5 + Math.random() * 75,
        startY: 55 + Math.random() * 30,
        size: 80 + Math.random() * 40,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 3,
        gradient: gradients[i % gradients.length] as string,
        popped: false,
    }));
};

const popBubble = (bubble: Bubble, event: MouseEvent) => {
    bubble.popped = true;
    poppedCount.value++;
    confetti({
        particleCount: 30,
        spread: 50,
        origin: {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight,
        },
        startVelocity: 20,
        ticks: 60,
    });
};

onMounted(() => {
    createBubbles();

    const startTime = Date.now();
    timerInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        timerBarWidth.value = Math.max(0, 100 - (elapsed / GAME_DURATION) * 100);
    }, 50);

    endTimeout = window.setTimeout(() => {
        emit("done");
    }, GAME_DURATION);
});

onUnmounted(() => {
    clearInterval(timerInterval);
    clearTimeout(endTimeout);
});
</script>

<style scoped>
@keyframes bubble-float {
    0% {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
    80% {
        opacity: 1;
    }
    100% {
        transform: translateY(-120vh) scale(0.8);
        opacity: 0;
    }
}

.bubble {
    animation: bubble-float linear forwards;
}

.timer-bar {
    transition: width 0.05s linear;
}
</style>
