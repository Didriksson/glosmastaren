<template>
    <div class="flex flex-col items-center justify-center min-h-[50vh]">
        <!-- Start screen -->
        <div
            v-if="!isActive && !isFinished"
            class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full"
        >
            <div class="text-6xl mb-6">🔗</div>
            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">Para ihop!</h2>
            <p class="text-slate-500 mb-6 text-lg">
                Dra eller tryck på ett ord och matcha det med rätt översättning.
            </p>

            <div
                class="bg-slate-50 p-4 rounded-xl mb-4 flex flex-col gap-2 border border-slate-100"
            >
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >Välj riktning:</label
                >
                <div class="flex gap-2">
                    <button
                        @click="matchDirection = 'sv-en'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            matchDirection === 'sv-en'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                        "
                    >
                        {{ store.nativeLang.name }} ↔ {{ store.foreignLang.name }}
                    </button>
                    <button
                        @click="matchDirection = 'en-sv'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            matchDirection === 'en-sv'
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-slate-200 text-slate-500 hover:border-purple-200'
                        "
                    >
                        {{ store.foreignLang.name }} ↔ {{ store.nativeLang.name }}
                    </button>
                </div>
            </div>

            <div
                class="bg-slate-50 p-4 rounded-xl mb-8 flex flex-col gap-2 border border-slate-100"
            >
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                    >Antal par:</label
                >
                <div class="flex gap-2">
                    <button
                        v-for="n in availablePairCounts"
                        :key="n"
                        @click="pairCount = n"
                        class="flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        :class="
                            pairCount === n
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 text-slate-500 hover:border-indigo-200'
                        "
                    >
                        {{ n }}
                    </button>
                </div>
            </div>

            <button
                @click="startMatch"
                :disabled="store.count < 4"
                class="w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
                🔗 Starta spelet
            </button>

            <p
                v-if="store.count < 4"
                class="text-sm text-red-400 mt-4 font-medium bg-red-50 py-2 rounded-lg"
            >
                Du behöver minst 4 ord för att spela.
            </p>
        </div>

        <!-- Match game -->
        <div v-else-if="isActive" class="w-full max-w-xl">
            <div class="flex justify-between items-center mb-6">
                <span class="text-slate-500 text-sm font-medium">
                    {{ matchedPairs.size }} / {{ leftCards.length }} parade
                </span>
                <button
                    @click="resetMatch"
                    class="text-slate-300 hover:text-slate-500 transition-colors"
                    title="Avsluta"
                >
                    ✕
                </button>
            </div>

            <div ref="gridEl" class="grid grid-cols-2 gap-10 relative">

                <!-- SVG connector lines for matched pairs -->
                <svg
                    v-if="matchLines.length > 0"
                    class="absolute inset-0 pointer-events-none z-10"
                    style="overflow: visible; width: 100%; height: 100%;"
                >
                    <g v-for="line in matchLines" :key="line.wordId">
                        <path
                            :d="`M ${line.x1},${line.y1} C ${line.cx1},${line.y1} ${line.cx2},${line.y2} ${line.x2},${line.y2}`"
                            :stroke="line.color"
                            stroke-width="2.5"
                            fill="none"
                            stroke-linecap="round"
                            class="connector-line"
                        />
                        <circle :cx="line.x1" :cy="line.y1" r="4" :fill="line.color" />
                        <circle :cx="line.x2" :cy="line.y2" r="4" :fill="line.color" />
                    </g>
                </svg>

                <!-- Left column (draggable source) -->
                <div class="flex flex-col gap-3">
                    <div
                        v-for="card in leftCards"
                        :key="card.id"
                        :ref="(el) => storeCardRef(el, card.id)"
                        :data-word-id="card.wordId"
                        @pointerdown="onPointerDown($event, card)"
                        @click="onClickLeft(card)"
                        class="rounded-2xl p-4 border-2 select-none text-center font-bold text-sm min-h-[56px] flex items-center justify-center relative touch-none"
                        :class="leftCardClass(card)"
                    >
                        {{ card.text }}
                        <span
                            v-if="card.matched"
                            class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-black"
                            :class="pairBadgeClass(card.wordId)"
                        >✓</span>
                    </div>
                </div>

                <!-- Right column (drop targets) -->
                <div class="flex flex-col gap-3">
                    <div
                        v-for="card in rightCards"
                        :key="card.id"
                        :ref="(el) => storeCardRef(el, card.id)"
                        :data-word-id="card.wordId"
                        data-drop-target="true"
                        @click="onClickRight(card)"
                        class="rounded-2xl p-4 border-2 transition-all select-none text-center font-bold text-sm min-h-[56px] flex items-center justify-center relative"
                        :class="rightCardClass(card)"
                    >
                        {{ card.text }}
                        <span
                            v-if="card.matched"
                            class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-black"
                            :class="pairBadgeClass(card.wordId)"
                        >✓</span>
                    </div>
                </div>
            </div>

            <p
                v-if="wrongFlashMessage"
                class="mt-4 text-center text-sm font-bold text-red-500 bg-red-50 py-2 rounded-lg"
            >
                {{ wrongFlashMessage }}
            </p>
        </div>

        <!-- Finished screen -->
        <div
            v-else-if="isFinished"
            class="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full"
        >
            <div class="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 class="text-3xl font-extrabold text-slate-800 mb-2">Alla par hittade!</h2>
            <p class="text-slate-500 mb-2 text-lg">
                Du parade ihop alla
                <strong class="text-indigo-600 font-bold">{{ leftCards.length }}</strong>
                par.
            </p>
            <p class="text-slate-400 text-sm mb-8">{{ totalAttempts }} försök totalt</p>

            <div class="flex flex-col gap-3">
                <button
                    @click="startMatch"
                    class="w-full py-3 text-base font-bold text-white rounded-xl transition-all transform active:scale-95 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    🔄 Spela igen
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

    <!-- Dragging trail particles (teleported to body) -->
    <Teleport to="body">
        <div
            v-for="p in trailParticles"
            :key="p.id"
            class="fixed pointer-events-none z-40 rounded-full trail-particle"
            :style="{
                left: p.x + 'px',
                top: p.y + 'px',
                width: p.size + 'px',
                height: p.size + 'px',
                background: p.color,
                transform: 'translate(-50%, -50%)',
            }"
        />
        <!-- Floating drag card -->
        <div
            v-if="isDragging && draggingCard"
            class="fixed pointer-events-none z-50 rounded-2xl px-4 py-3 border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold text-sm shadow-2xl"
            :style="{
                left: dragPos.x + 'px',
                top: dragPos.y + 'px',
                transform: 'translate(-50%, -50%) rotate(-3deg) scale(1.08)',
                minWidth: '80px',
                textAlign: 'center',
            }"
        >
            {{ draggingCard.text }}
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from "vue";
import confetti from "canvas-confetti";
import { useGlossaryStore } from "../stores/glossaryStore";

const emit = defineEmits<{ (e: "back-to-input"): void }>();
const store = useGlossaryStore();

interface MatchCard {
    id: string;
    text: string;
    wordId: string;
    matched: boolean;
    wrong: boolean;
}

const MATCHED_LINE_COLOR = "#10b981";

const isActive = ref(false);
const isFinished = ref(false);
const matchDirection = ref<"sv-en" | "en-sv">("sv-en");
const pairCount = ref(6);
const leftCards = ref<MatchCard[]>([]);
const rightCards = ref<MatchCard[]>([]);
const selectedLeft = ref<string | null>(null);
const matchedPairs = ref<Set<string>>(new Set());
const totalAttempts = ref(0);
const wrongFlashMessage = ref("");
const draggingWordId = ref<string | null>(null);
const dragOverWordId = ref<string | null>(null);

// SVG connector lines
interface MatchLine { wordId: string; x1: number; y1: number; x2: number; y2: number; cx1: number; cx2: number; color: string }
const matchLines = ref<MatchLine[]>([]);
const gridEl = ref<HTMLElement | null>(null);
const cardEls = new Map<string, HTMLElement>();

const storeCardRef = (el: unknown, cardId: string) => {
    if (el instanceof HTMLElement) cardEls.set(cardId, el);
    else cardEls.delete(cardId);
};

const computeLine = (wordId: string) => {
    const lc = cardEls.get(`left-${wordId}`);
    const rc = cardEls.get(`right-${wordId}`);
    const grid = gridEl.value;
    if (!lc || !rc || !grid) return;
    const gr = grid.getBoundingClientRect();
    const lr = lc.getBoundingClientRect();
    const rr = rc.getBoundingClientRect();
    const x1 = lr.right - gr.left;
    const y1 = lr.top + lr.height / 2 - gr.top;
    const x2 = rr.left - gr.left;
    const y2 = rr.top + rr.height / 2 - gr.top;
    const dx = (x2 - x1) * 0.45;
    matchLines.value.push({ wordId, x1, y1, x2, y2, cx1: x1 + dx, cx2: x2 - dx, color: MATCHED_LINE_COLOR });
};

// Pointer drag state
const isDragging = ref(false);
const dragPos = ref({ x: 0, y: 0 });
const draggingCard = ref<MatchCard | null>(null);

interface TrailParticle { id: number; x: number; y: number; size: number; color: string }
const trailParticles = ref<TrailParticle[]>([]);
let particleCounter = 0;
let lastTrailMs = 0;
const TRAIL_COLORS = ["#6366f1","#818cf8","#a5b4fc","#c4b5fd","#8b5cf6"];

const availablePairCounts = computed(() => {
    const max = Math.min(8, store.count);
    const options = [4, 6, 8].filter((n) => n <= max);
    return options.length > 0 ? options : [max];
});

const startMatch = () => {
    if (store.count < 4) return;
    const count = Math.min(pairCount.value, store.count);
    const selected = [...store.words].sort(() => Math.random() - 0.5).slice(0, count);

    leftCards.value = selected.map((w) => ({
        id: `left-${w.id}`,
        text: matchDirection.value === "sv-en" ? w.native : w.foreign,
        wordId: w.id,
        matched: false,
        wrong: false,
    }));

    rightCards.value = [...selected]
        .sort(() => Math.random() - 0.5)
        .map((w) => ({
            id: `right-${w.id}`,
            text: matchDirection.value === "sv-en" ? w.foreign : w.native,
            wordId: w.id,
            matched: false,
            wrong: false,
        }));

    selectedLeft.value = null;
    matchedPairs.value = new Set();
    matchLines.value = [];
    cardEls.clear();
    totalAttempts.value = 0;
    wrongFlashMessage.value = "";
    draggingWordId.value = null;
    dragOverWordId.value = null;
    isActive.value = true;
    isFinished.value = false;
};

// --- Pointer drag handlers ---

const onPointerDown = (e: PointerEvent, card: MatchCard) => {
    if (card.matched) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.value = true;
    draggingCard.value = card;
    draggingWordId.value = card.wordId;
    selectedLeft.value = card.wordId;
    dragPos.value = { x: e.clientX, y: e.clientY };
    trailParticles.value = [];
    lastTrailMs = 0;

    const onMove = (ev: PointerEvent) => {
        dragPos.value = { x: ev.clientX, y: ev.clientY };
        const now = Date.now();
        if (now - lastTrailMs > 35) {
            lastTrailMs = now;
            const color = TRAIL_COLORS[particleCounter % TRAIL_COLORS.length] ?? TRAIL_COLORS[0]!;
            const particle: TrailParticle = {
                id: particleCounter++,
                x: ev.clientX,
                y: ev.clientY,
                size: 10 + Math.random() * 8,
                color,
            };
            trailParticles.value.push(particle);
            setTimeout(() => {
                trailParticles.value = trailParticles.value.filter(p => p.id !== particle.id);
            }, 500);
        }
        // Highlight drop target under cursor
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const target = el?.closest('[data-drop-target]');
        const targetId = target?.getAttribute('data-word-id') ?? null;
        dragOverWordId.value = targetId;
    };

    const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        isDragging.value = false;
        draggingCard.value = null;
        draggingWordId.value = null;
        dragOverWordId.value = null;
        setTimeout(() => { trailParticles.value = []; }, 500);

        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const target = el?.closest('[data-drop-target]');
        const targetWordId = target?.getAttribute('data-word-id');
        if (targetWordId && selectedLeft.value) {
            const rightCard = rightCards.value.find(c => c.wordId === targetWordId);
            if (rightCard) {
                tryMatch(selectedLeft.value, rightCard);
                return;
            }
        }
        // No valid drop target — keep selectedLeft so click still works
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
};

onUnmounted(() => {
    // nothing to clean up — listeners are added/removed per-drag
});

// --- Click handlers (tap to select + tap to match) ---

const onClickLeft = (card: MatchCard) => {
    if (card.matched) return;
    selectedLeft.value = selectedLeft.value === card.wordId ? null : card.wordId;
};

const onClickRight = (card: MatchCard) => {
    if (card.matched || !selectedLeft.value) return;
    tryMatch(selectedLeft.value, card);
};

// --- Match logic ---

const tryMatch = (leftWordId: string, rightCard: MatchCard) => {
    totalAttempts.value++;

    if (leftWordId === rightCard.wordId) {
        matchedPairs.value.add(rightCard.wordId);

        const lc = leftCards.value.find((c) => c.wordId === rightCard.wordId);
        const rc = rightCards.value.find((c) => c.wordId === rightCard.wordId);
        if (lc) lc.matched = true;
        if (rc) rc.matched = true;
        selectedLeft.value = null;

        nextTick(() => computeLine(rightCard.wordId));

        if (matchedPairs.value.size === leftCards.value.length) {
            setTimeout(() => {
                isActive.value = false;
                isFinished.value = true;
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            }, 400);
        }
    } else {
        // Wrong
        const lc = leftCards.value.find((c) => c.wordId === leftWordId);
        const rc = rightCards.value.find((c) => c.wordId === rightCard.wordId);
        if (lc) lc.wrong = true;
        if (rc) rc.wrong = true;
        wrongFlashMessage.value = "Inte ett par — försök igen!";

        setTimeout(() => {
            if (lc) lc.wrong = false;
            if (rc) rc.wrong = false;
            selectedLeft.value = null;
            wrongFlashMessage.value = "";
        }, 700);
    }
};

// --- Card styling ---

const MATCHED_CLASS = "border-green-400 bg-green-50 text-green-700 cursor-default scale-[1.02] transition-all";
const MATCHED_BADGE = "bg-green-500";

const leftCardClass = (card: MatchCard): string => {
    if (card.matched) return MATCHED_CLASS;
    if (card.wrong) return "border-red-400 bg-red-50 text-red-700 shake-card";
    if (isDragging.value && draggingWordId.value === card.wordId) return "border-indigo-400 bg-indigo-50 text-indigo-700 opacity-30 cursor-grabbing transition-all";
    if (selectedLeft.value === card.wordId) return "border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-200 cursor-grab transition-all";
    return "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 cursor-grab transition-all";
};

const rightCardClass = (card: MatchCard): string => {
    if (card.matched) return MATCHED_CLASS;
    if (card.wrong) return "border-red-400 bg-red-50 text-red-700 shake-card";
    if (dragOverWordId.value === card.wordId && draggingWordId.value) {
        return "border-indigo-400 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-200 scale-105";
    }
    return "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
};

const pairBadgeClass = (_wordId: string): string => MATCHED_BADGE;

const resetMatch = () => {
    isActive.value = false;
    isFinished.value = false;
};
</script>

<style scoped>
@keyframes shake-card {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
}

.shake-card {
    animation: shake-card 0.4s ease-in-out;
}
</style>

<style>
@keyframes trail-fade {
    0%   { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0;    transform: translate(-50%, -50%) scale(0.1); }
}
.trail-particle {
    animation: trail-fade 0.5s ease-out forwards;
}

@keyframes line-draw {
    from { opacity: 0; stroke-dashoffset: 1; }
    to   { opacity: 1; stroke-dashoffset: 0; }
}
.connector-line {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: line-draw 0.4s ease-out forwards;
    pathLength: 1;
}
</style>
