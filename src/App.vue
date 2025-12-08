<template>
    <div
        class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700"
    >
        <nav
            class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100"
        >
            <div class="max-w-3xl mx-auto px-4 sm:px-6">
                <div class="flex justify-between h-16 items-center">
                    <div
                        class="flex items-center gap-3 cursor-pointer group"
                        @click="currentView = 'input'"
                    >
                        <div
                            class="bg-indigo-600 text-white p-2 rounded-lg text-xl group-hover:scale-110 transition-transform"
                        >
                            🧠
                        </div>
                        <h1
                            class="font-extrabold text-xl tracking-tight text-slate-900"
                        >
                            Glos<span class="text-indigo-600">Mästaren</span>
                        </h1>
                    </div>

                    <div class="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                        <button
                            @click="currentView = 'input'"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                            :class="
                                currentView === 'input'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                            "
                        >
                            <span>📝</span>
                            <span class="hidden sm:inline">Mata in</span>
                        </button>

                        <button
                            @click="currentView = 'quiz'"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                            :class="
                                currentView === 'quiz'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                            "
                        >
                            <span>🚀</span>
                            <span class="hidden sm:inline">Förhör</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-2xl mx-auto mt-8 px-4 pb-20">
            <transition name="fade" mode="out-in">
                <div :key="currentView">
                    <WordInput
                        v-if="currentView === 'input'"
                        @start-quiz="currentView = 'quiz'"
                    />
                    <QuizMode
                        v-if="currentView === 'quiz'"
                        @back-to-input="currentView = 'input'"
                    />
                </div>
            </transition>
        </main>

        <footer
            class="fixed bottom-0 w-full text-center text-slate-400 text-xs py-4 bg-slate-50/90 backdrop-blur border-t border-slate-200"
        >
            &copy; 2025 GlosMästaren Inc.
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import WordInput from "./components/WordInput.vue";
import QuizMode from "./components/QuizMode.vue";

type ViewState = "input" | "quiz";
const currentView = ref<ViewState>("input");
</script>

<style>
/* Globala animationer */
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
