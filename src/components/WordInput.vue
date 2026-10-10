<template>
    <div class="flex flex-col gap-6">
        <div
            class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100"
        >
            <div class="text-center mb-6">
                <h2 class="text-3xl font-extrabold text-slate-800 mb-2">
                    Lägg till glosor
                </h2>
                <p class="text-slate-500">
                    Fyll på ditt ordförråd inför förhöret
                </p>
            </div>

            <!-- Language selectors -->
            <div class="flex gap-2 items-center mb-6 bg-slate-50 rounded-xl p-3 border border-slate-100">

                <!-- Native language picker -->
                <div class="relative flex-1">
                    <button
                        type="button"
                        @click="openPicker = openPicker === 'native' ? null : 'native'"
                        class="w-full flex items-center justify-between gap-1 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-lg px-3 py-2 hover:border-indigo-300 transition-colors"
                        :class="openPicker === 'native' ? 'border-indigo-400' : ''"
                    >
                        <span class="flex items-center gap-1.5"><img :src="flagUrl(store.nativeLang.cc)" :alt="store.nativeLang.name" class="w-5 h-auto rounded-sm" />{{ store.nativeLang.code }}</span>
                        <span class="text-slate-400 text-xs leading-none">▾</span>
                    </button>
                    <div
                        v-if="openPicker === 'native'"
                        class="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto max-h-48 w-full min-w-[110px]"
                    >
                        <button
                            v-for="lang in LANGUAGES"
                            :key="lang.id"
                            type="button"
                            @click="store.nativeLangId = lang.id; openPicker = null"
                            class="w-full text-left px-3 py-2 text-sm font-bold transition-colors"
                            :class="store.nativeLangId === lang.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            <span class="flex items-center gap-1.5"><img :src="flagUrl(lang.cc)" :alt="lang.name" class="w-5 h-auto rounded-sm" />{{ lang.code }}</span>
                        </button>
                    </div>
                </div>

                <span class="text-slate-300 text-base">↔</span>

                <!-- Foreign language picker -->
                <div class="relative flex-1">
                    <button
                        type="button"
                        @click="openPicker = openPicker === 'foreign' ? null : 'foreign'"
                        class="w-full flex items-center justify-between gap-1 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-lg px-3 py-2 hover:border-purple-300 transition-colors"
                        :class="openPicker === 'foreign' ? 'border-purple-400' : ''"
                    >
                        <span class="flex items-center gap-1.5"><img :src="flagUrl(store.foreignLang.cc)" :alt="store.foreignLang.name" class="w-5 h-auto rounded-sm" />{{ store.foreignLang.code }}</span>
                        <span class="text-slate-400 text-xs leading-none">▾</span>
                    </button>
                    <div
                        v-if="openPicker === 'foreign'"
                        class="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto max-h-48 w-full min-w-[110px]"
                    >
                        <button
                            v-for="lang in LANGUAGES"
                            :key="lang.id"
                            type="button"
                            @click="store.foreignLangId = lang.id; openPicker = null"
                            class="w-full text-left px-3 py-2 text-sm font-bold transition-colors"
                            :class="store.foreignLangId === lang.id ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            <span class="flex items-center gap-1.5"><img :src="flagUrl(lang.cc)" :alt="lang.name" class="w-5 h-auto rounded-sm" />{{ lang.code }}</span>
                        </button>
                    </div>
                </div>

            </div>

            <!-- Transparent backdrop to close pickers -->
            <div
                v-if="openPicker"
                class="fixed inset-0 z-10"
                @click="openPicker = null"
            />

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
                <div class="flex flex-col sm:flex-row gap-2 items-center">
                    <div class="w-full space-y-1 relative">
                        <label
                            class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                            >{{ store.nativeLang.name }}</label
                        >
                        <input
                            v-model="nativeInput"
                            type="text"
                            :placeholder="`t.ex. Katt`"
                            required
                            ref="firstInput"
                            class="w-full p-4 bg-slate-50 text-lg border-2 border-slate-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <button
                        type="button"
                        @click="swapInputs"
                        class="mt-6 p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Växla språk (om du skrev fel)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 rotate-90 sm:rotate-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                    </button>

                    <div class="w-full space-y-1">
                        <label
                            class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                            >{{ store.foreignLang.name }}</label
                        >
                        <input
                            v-model="foreignInput"
                            type="text"
                            :placeholder="`t.ex. Cat`"
                            required
                            class="w-full p-4 bg-slate-50 text-lg border-2 border-slate-100 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    class="w-full py-4 mt-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg"
                >
                    <span class="text-xl">➕</span> Lägg till ordet
                </button>
            </form>
        </div>

        <div
            class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[200px]"
        >
            <div
                class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"
            >
                <h3 class="text-xl font-bold text-slate-700">Dina glosor</h3>
                <div class="flex items-center gap-2">
                    <span
                        class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold"
                    >
                        {{ store.count }} st
                    </span>
                    <button
                        v-if="store.count > 0"
                        @click="confirmClear"
                        class="text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-full border border-slate-200 hover:border-red-200 transition-colors"
                    >
                        Rensa alla
                    </button>
                </div>
            </div>

            <div v-if="store.count > 0">
                <ul class="space-y-3">
                    <li
                        v-for="word in store.words"
                        :key="word.id"
                        class="group flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors"
                    >
                        <div class="flex items-center gap-3 flex-1">
                            <span class="font-bold text-slate-800">{{
                                word.native
                            }}</span>
                            <span class="text-slate-300">→</span>
                            <span class="text-indigo-600 font-medium">{{
                                word.foreign
                            }}</span>
                        </div>

                        <div class="flex items-center gap-1">
                            <button
                                @click="store.swapWordLanguages(word.id)"
                                class="text-slate-300 hover:text-indigo-500 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                title="Växla språk (om du råkat lägga in dem tvärtom)"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                    />
                                </svg>
                            </button>

                            <button
                                @click="store.removeWord(word.id)"
                                class="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Ta bort"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>

            <div v-else class="text-center py-12 text-slate-400">
                <div class="text-4xl mb-3 opacity-50">📂</div>
                <p>Listan är tom.</p>
                <p class="text-sm">Skriv in ditt första ord ovan!</p>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-100">
                <button
                    @click="$emit('start-quiz')"
                    :disabled="store.count === 0"
                    class="w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                    🚀 Starta spelet
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useGlossaryStore, LANGUAGES, flagUrl } from "../stores/glossaryStore";

defineEmits(["start-quiz"]);

const store = useGlossaryStore();
const openPicker = ref<"native" | "foreign" | null>(null);
const nativeInput = ref("");
const foreignInput = ref("");
const firstInput = ref<HTMLInputElement | null>(null);

const handleSubmit = () => {
    if (!nativeInput.value || !foreignInput.value) return;
    store.addWord(nativeInput.value, foreignInput.value);
    nativeInput.value = "";
    foreignInput.value = "";
    nextTick(() => {
        firstInput.value?.focus();
    });
};

// Funktion för att växla innehållet i input-rutorna
const swapInputs = () => {
    const temp = nativeInput.value;
    nativeInput.value = foreignInput.value;
    foreignInput.value = temp;
};

const confirmClear = () => {
    if (confirm(`Är du säker? Alla ${store.count} glosor tas bort.`)) {
        store.clearWords();
    }
};
</script>
