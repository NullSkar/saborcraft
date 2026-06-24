<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService, recipeService, ingredientService, categoryService } from '../services/api'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const categories = ref([])
const originalImage = ref('')
const originalStatus = ref('')
const originalData = ref({})

const form = ref({
  title: '',
  description: '',
  prepTime: '',
  cookTime: '',
  servings: '',
  difficulty: 'medio',
  categoryId: '',
  instructions: [],
  ingredients: [],
  image: ''
})

const imagePreview = ref('')
const newInstruction = ref('')
const newIngredient = ref({
  name: '',
  quantity: '',
  measurement: 'gramos',
  notes: '',
  isOptional: false
})

const ingredientSuggestions = ref([])
const showSuggestions = ref(false)

onMounted(async () => {
  // Verificar que está logueado
  if (!authService.isLoggedIn()) {
    router.push('/login')
    return
  }

  // Cargar categorías
  try {
    const categoriesData = await categoryService.getAll()
    categories.value = categoriesData
  } catch (err) {
    console.error('Error cargando categorías:', err)
  }

  // Cargar receta para editar
  const recipeId = route.params.id
  if (recipeId) {
    await loadRecipeForEdit(recipeId)
  } else {
    // Si no hay ID, redirigir
    router.push('/profile')
  }
})

const loadRecipeForEdit = async (id) => {
  try {
    isLoading.value = true
    const response = await recipeService.getById(id)
    if (response.data) {
      const recipe = response.data
      
      // Mapear instrucciones correctamente - si son objetos, extraer solo el instruction
      let instructions = recipe.instructions || []
      if (Array.isArray(instructions) && instructions.length > 0) {
        // Si es un array de objetos, extraer solo la propiedad 'instruction'
        if (typeof instructions[0] === 'object' && instructions[0].instruction) {
          instructions = instructions.map(inst => inst.instruction)
        }
      }
      
      // Mapear ingredientes correctamente
      let ingredients = recipe.ingredients || []
      if (Array.isArray(ingredients) && ingredients.length > 0) {
        // Si es un array de objetos con estructura de BD, extraer propiedades necesarias
        if (typeof ingredients[0] === 'object') {
          ingredients = ingredients.map(ing => ({
            name: ing.ingredient?.name || ing.name || '',
            quantity: ing.quantity || '',
            measurement: ing.measurement || 'gramos',
            notes: ing.notes || '',
            isOptional: ing.is_optional || ing.isOptional || false
          }))
        }
      }
      
      originalImage.value = recipe.image || ''
      imagePreview.value = recipe.image || ''
      originalStatus.value = recipe.status || 'pendiente'
      
      form.value = {
        title: recipe.title || '',
        description: recipe.description || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        servings: recipe.servings || '',
        difficulty: recipe.difficulty || 'medio',
        categoryId: recipe.categoryId || '',
        instructions: instructions,
        ingredients: ingredients,
        image: recipe.image || ''
      }
      
      // Guardar una copia de los datos originales para comparar
      originalData.value = JSON.parse(JSON.stringify(form.value))
    }
  } catch (err) {
    console.error('Error cargando receta:', err)
    error.value = 'Error al cargar la receta para editar'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''
  
  // Validar campos requeridos
  if (!form.value.title.trim()) {
    error.value = 'El título es requerido'
    return
  }
  
  if (!form.value.description.trim()) {
    error.value = 'La descripción es requerida'
    return
  }

  if (!form.value.categoryId) {
    error.value = 'La categoría es requerida'
    return
  }

  if (form.value.instructions.length === 0) {
    error.value = 'Debes agregar al menos un paso'
    return
  }

  if (form.value.ingredients.length === 0) {
    error.value = 'Debes agregar al menos un ingrediente'
    return
  }

  isLoading.value = true

  try {
    // Construir objeto con solo los cambios
    const recipeData = { status: originalStatus.value }
    
    // Comparar cada campo y solo incluir si cambió
    if (form.value.title !== originalData.value.title) {
      recipeData.title = form.value.title
    }
    if (form.value.description !== originalData.value.description) {
      recipeData.description = form.value.description
    }
    if (form.value.prepTime !== originalData.value.prepTime) {
      recipeData.prepTime = form.value.prepTime
    }
    if (form.value.cookTime !== originalData.value.cookTime) {
      recipeData.cookTime = form.value.cookTime
    }
    if (form.value.servings !== originalData.value.servings) {
      recipeData.servings = form.value.servings
    }
    if (form.value.difficulty !== originalData.value.difficulty) {
      recipeData.difficulty = form.value.difficulty
    }
    if (form.value.categoryId !== originalData.value.categoryId) {
      recipeData.categoryId = form.value.categoryId
    }
    
    // Comparar ingredientes (siempre enviar si alguno cambió)
    const ingredientsChanged = JSON.stringify(form.value.ingredients) !== JSON.stringify(originalData.value.ingredients)
    if (ingredientsChanged) {
      recipeData.ingredients = form.value.ingredients
    }
    
    // Comparar instrucciones (siempre enviar si alguna cambió)
    const instructionsChanged = JSON.stringify(form.value.instructions) !== JSON.stringify(originalData.value.instructions)
    if (instructionsChanged) {
      recipeData.instructions = form.value.instructions
    }
    
    // Solo incluir imagen si fue modificada
    if (form.value.image !== originalImage.value) {
      recipeData.image = form.value.image
    }

    // Actualizar receta
    const response = await recipeService.update(route.params.id, recipeData)
    if (response.success) {
      successMessage.value = 'Receta actualizada correctamente'
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    }
  } catch (err) {
    console.error('Error:', err)
    error.value = err.response?.data?.message || 'Error al guardar la receta'
  } finally {
    isLoading.value = false
  }
}

const addInstruction = () => {
  if (newInstruction.value.trim()) {
    form.value.instructions.push(newInstruction.value.trim())
    newInstruction.value = ''
  }
}

const removeInstruction = (index) => {
  form.value.instructions.splice(index, 1)
}

const addIngredient = () => {
  if (newIngredient.value.name.trim() && newIngredient.value.quantity.trim()) {
    form.value.ingredients.push({
      name: newIngredient.value.name.trim(),
      quantity: newIngredient.value.quantity.trim(),
      measurement: newIngredient.value.measurement,
      notes: newIngredient.value.notes.trim(),
      isOptional: newIngredient.value.isOptional
    })
    newIngredient.value = {
      name: '',
      quantity: '',
      measurement: 'gramos',
      notes: '',
      isOptional: false
    }
  }
}

const removeIngredient = (index) => {
  form.value.ingredients.splice(index, 1)
}

const searchIngredients = async (term) => {
  if (term.length < 2) {
    ingredientSuggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    const results = await ingredientService.search(term)
    ingredientSuggestions.value = results
    showSuggestions.value = true
  } catch (err) {
    console.error('Error buscando ingredientes:', err)
    ingredientSuggestions.value = []
    showSuggestions.value = false
  }
}

const selectSuggestion = (suggestion) => {
  newIngredient.value.name = suggestion.name
  ingredientSuggestions.value = []
  showSuggestions.value = false
}

const handleImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Validar tamaño del archivo (máximo 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      error.value = 'La imagen es muy grande. Máximo 100MB'
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target.result
      imagePreview.value = base64Data
      form.value.image = base64Data
      console.log('Image loaded as base64, size:', base64Data.length)
    }
    reader.readAsDataURL(file)
  }
}

const handleCancel = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6 md:py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-900">
          Editar Receta
        </h1>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-8">
        <!-- Error Message -->
        <div v-if="error" class="mb-4 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-red-700 text-xs md:text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 md:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-green-700 text-xs md:text-sm">
          {{ successMessage }}
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12 md:py-16">
          <p class="text-xs md:text-base text-gray-600">Cargando...</p>
        </div>

        <!-- Form Content -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6">
          <!-- Título -->
          <div>
            <label for="title" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Título *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Nombre de la receta"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label for="description" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Describe tu receta"
              rows="3"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              required
            ></textarea>
          </div>

          <!-- Portada de Receta -->
          <div>
            <label for="image" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Portada de la receta
            </label>
            <div class="flex flex-col gap-3 md:gap-4">
              <!-- Preview de imagen -->
              <div v-if="imagePreview" class="w-full h-40 md:h-48 rounded-lg overflow-hidden bg-gray-200">
                <img :src="imagePreview" alt="Preview de portada" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-40 md:h-48 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                <p>Vista previa de portada</p>
              </div>
              
              <!-- Input file -->
              <label class="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="hidden"
                />
                <span class="inline-block px-3 md:px-4 py-2 bg-light-primary text-white rounded-lg hover:bg-light-tertiary transition text-xs md:text-sm font-medium">
                  Seleccionar imagen
                </span>
              </label>
              <p class="text-xs text-gray-500">PNG, JPG o GIF (máx. 100MB)</p>
            </div>
          </div>

          <!-- Categoría -->
          <div>
            <label for="categoryId" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Categoría *
            </label>
            <select
              id="categoryId"
              v-model="form.categoryId"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              required
            >
              <option value="">Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Dificultad -->
          <div>
            <label for="difficulty" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Dificultad
            </label>
            <select
              id="difficulty"
              v-model="form.difficulty"
              class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
            >
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>

          <!-- Tiempos y Servings -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label for="prepTime" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Tiempo Prep (min)
              </label>
              <input
                id="prepTime"
                v-model="form.prepTime"
                type="number"
                placeholder="30"
                class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div>
              <label for="cookTime" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Tiempo Cocción (min)
              </label>
              <input
                id="cookTime"
                v-model="form.cookTime"
                type="number"
                placeholder="45"
                class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div>
              <label for="servings" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Porciones
              </label>
              <input
                id="servings"
                v-model="form.servings"
                type="number"
                placeholder="4"
                class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
            </div>
          </div>

          <!-- Ingredientes -->
          <div>
            <label class="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
              Ingredientes
            </label>
            
            <!-- Agregar nuevo ingrediente -->
            <div class="space-y-2 md:space-y-3 mb-4 bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <div class="relative">
                <input
                  v-model="newIngredient.name"
                  type="text"
                  placeholder="Nombre del ingrediente"
                  @input="searchIngredients(newIngredient.name)"
                  @focus="showSuggestions = ingredientSuggestions.length > 0"
                  @blur="setTimeout(() => showSuggestions = false, 200)"
                  class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
                
                <!-- Sugerencias de ingredientes -->
                <div v-if="showSuggestions && ingredientSuggestions.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    v-for="suggestion in ingredientSuggestions"
                    :key="suggestion.id"
                    type="button"
                    @click="selectSuggestion(suggestion)"
                    class="w-full text-left px-3 md:px-4 py-2 hover:bg-light-primary/20 transition border-b border-gray-100 last:border-b-0 text-xs md:text-sm"
                  >
                    <p class="font-medium text-gray-900">{{ suggestion.name }}</p>
                    <p class="text-xs text-gray-500">{{ suggestion.measurementUnit }}</p>
                  </button>
                </div>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
                <input
                  v-model="newIngredient.quantity"
                  type="text"
                  placeholder="Cantidad (ej: 2.5)"
                  class="px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
                <select
                  v-model="newIngredient.measurement"
                  class="px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                >
                  <option value="gramos">Gramos</option>
                  <option value="mililitros">Mililitros</option>
                  <option value="tazas">Tazas</option>
                  <option value="cucharadas">Cucharadas</option>
                  <option value="cucharaditas">Cucharaditas</option>
                  <option value="unidades">Unidades</option>
                  <option value="kg">Kilogramos</option>
                  <option value="litros">Litros</option>
                </select>
              </div>

              <div>
                <input
                  v-model="newIngredient.notes"
                  type="text"
                  placeholder="Notas opcionales (ej: picado finamente)"
                  class="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div class="flex items-center gap-2">
                <input
                  id="isOptional"
                  v-model="newIngredient.isOptional"
                  type="checkbox"
                  class="w-4 h-4"
                />
                <label for="isOptional" class="text-xs md:text-sm text-gray-700">
                  Es ingrediente opcional
                </label>
              </div>

              <button
                type="button"
                @click="addIngredient"
                class="w-full px-3 md:px-4 py-2 bg-light-primary hover:bg-light-tertiary text-white rounded-lg font-medium transition text-xs md:text-sm"
              >
                Agregar Ingrediente
              </button>
            </div>

            <!-- Lista de ingredientes -->
            <div v-if="form.ingredients.length > 0" class="space-y-2">
              <div
                v-for="(ingredient, index) in form.ingredients"
                :key="index"
                class="flex items-start justify-between bg-gray-50 p-2 md:p-3 rounded-lg border border-gray-200"
              >
                <div class="flex-1 text-xs md:text-sm">
                  <p class="font-medium text-gray-900">{{ ingredient.name }}</p>
                  <p class="text-gray-600">
                    {{ ingredient.quantity }} {{ ingredient.measurement }}
                    <span v-if="ingredient.notes" class="block text-xs text-gray-500 italic">
                      Nota: {{ ingredient.notes }}
                    </span>
                    <span v-if="ingredient.isOptional" class="block text-xs bg-yellow-100 text-yellow-800 p-1 rounded w-fit mt-1">
                      Opcional
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  @click="removeIngredient(index)"
                  class="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 font-medium"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-else class="text-gray-500 text-xs md:text-sm italic">
              No hay ingredientes agregados aún
            </div>
          </div>

          <!-- Instrucciones -->
          <div>
            <label class="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
              Pasos de la Receta
            </label>
            
            <!-- Agregar nuevo paso -->
            <div class="flex gap-2 mb-4">
              <input
                v-model="newInstruction"
                type="text"
                placeholder="Escribe un paso y presiona Agregar"
                @keyup.enter="addInstruction"
                class="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary"
              />
              <button
                type="button"
                @click="addInstruction"
                class="px-3 md:px-4 py-2 md:py-2.5 bg-light-primary hover:bg-light-tertiary text-white rounded-lg font-medium transition text-xs md:text-sm"
              >
                Agregar
              </button>
            </div>

            <!-- Lista de pasos -->
            <div v-if="form.instructions.length > 0" class="space-y-2">
              <div
                v-for="(instruction, index) in form.instructions"
                :key="index"
                class="flex items-start justify-between bg-gray-50 p-2 md:p-3 rounded-lg border border-gray-200"
              >
                <div class="flex items-start gap-2 md:gap-3 flex-1">
                  <span class="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-light-primary text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold">
                    {{ index + 1 }}
                  </span>
                  <p class="text-gray-700 text-xs md:text-sm pt-0.5">{{ instruction }}</p>
                </div>
                <button
                  type="button"
                  @click="removeInstruction(index)"
                  class="flex-shrink-0 ml-2 text-red-600 hover:text-red-700 font-medium"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-else class="text-gray-500 text-xs md:text-sm italic">
              No hay pasos agregados aún
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-light-primary text-white rounded-lg font-medium hover:bg-light-tertiary transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {{ isLoading ? 'Guardando...' : 'Actualizar Receta' }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              class="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition text-sm md:text-base"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
