<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { recipeService } from '../services/api.js'

const query = ref('')
const emit = defineEmits(['searched'])
const router = useRouter()

async function onSearch() {
  const trimmed = query.value.trim()
  if (!trimmed) return
  try {
    const results = await recipeService.search(trimmed)
    emit('searched', results)
    router.push({ name: 'Recipes', query: { buscar: trimmed } })
  } catch (error) {
    console.error('Error al buscar recetas:', error)
  }
}
</script>

<template>
  <form @submit.prevent="onSearch" class="flex items-center w-96">
    <input
      v-model="query"
      type="text"
      placeholder="Buscar recetas, ingredientes..."
      class="px-4 py-3 flex-1 bg-light-bg border-2 border-light-accent rounded-l-full focus:outline-none focus:ring-2 focus:ring-light-accent border-r-0"
    />
    <button
      type="submit"
      class="bg-light-accent text-white px-6 py-3 rounded-r-full hover:bg-light-accent/90 transition-colors border-2 border-light-accent border-l-0 font-medium"
    >
      Buscar
    </button>
  </form>
</template>