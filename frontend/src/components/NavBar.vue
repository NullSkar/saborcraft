<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService, recipeService } from '../services/api'

const router = useRouter()
const route = useRoute()
const isOpen = ref(false)
const searchQuery = ref('')
const isLoggedIn = ref(false)
const isAdminUser = ref(false)
const currentUser = reactive({ firstName: '', lastName: '' })
const searchResults = ref([])
const showSearchResults = ref(false)

onMounted(() => {
  checkAuthStatus()
})

// Verificar estado de autenticación cuando cambia la ruta
watch(() => route.path, () => {
  checkAuthStatus()
})

const checkAuthStatus = () => {
  isLoggedIn.value = authService.isLoggedIn()
  if (isLoggedIn.value) {
    authService.getCurrentUser()
      .then(response => {
        // La respuesta tiene estructura: { success, data: { firstName, lastName, ... } }
        const userData = response.data || response
        if (userData) {
          currentUser.firstName = userData.firstName || ''
          currentUser.lastName = userData.lastName || ''
        }
      })
      .catch(err => {
        console.error('Error obteniendo usuario:', err)
      })
    
    // Verificar si es administrador
    authService.isAdmin()
      .then(isAdmin => {
        isAdminUser.value = isAdmin
      })
      .catch(err => {
        console.error('Error verificando admin status:', err)
        isAdminUser.value = false
      })
  } else {
    // Limpiar datos del usuario si no está logueado
    currentUser.firstName = ''
    currentUser.lastName = ''
    isAdminUser.value = false
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  try {
    const results = await recipeService.search(searchQuery.value)
    searchResults.value = Array.isArray(results) ? results : results.data || []
    showSearchResults.value = true
  } catch (error) {
    console.error('Error en búsqueda:', error)
    searchResults.value = []
  }
}

const goToRecipe = (id) => {
  router.push(`/recipes/${id}`)
  searchQuery.value = ''
  showSearchResults.value = false
  isOpen.value = false // Cerrar menú móvil
}

const handleLogout = async () => {
  try {
    await authService.logout()
    isLoggedIn.value = false
    currentUser.firstName = ''
    currentUser.lastName = ''
    router.push('/')
  } catch (error) {
    console.error('Error en logout:', error)
  }
}
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="text-xl font-bold text-primary-600">SaborCraft</router-link>
        </div>

        <!-- Desktop Menu - Center -->
        <div class="hidden md:block flex-1 mx-8">
          <div class="flex space-x-4">
            <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-light-accent transition">Inicio</router-link>
            <router-link to="/recipes" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-light-accent transition">Recetas</router-link>
          </div>
        </div>

        <!-- Search Bar - Left side of auth buttons -->
        <div class="hidden md:flex items-center flex-1 max-w-xs mr-4">
          <div class="relative w-full">
            <input 
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Buscar recetas..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-600"
            />
            <svg class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <!-- Search Results Dropdown -->
            <div v-if="showSearchResults && searchResults.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              <div v-for="recipe in searchResults.slice(0, 5)" :key="recipe.id" @click="goToRecipe(recipe.id)" class="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                <p class="font-medium text-gray-900">{{ recipe.title }}</p>
                <p class="text-sm text-gray-600 truncate">{{ recipe.description }}</p>
              </div>
            </div>
            <div v-else-if="showSearchResults && searchResults.length === 0 && searchQuery" class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 text-center text-gray-500">
              No se encontraron recetas
            </div>
          </div>
        </div>

        <!-- Auth Buttons - Right side -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Usuario logueado -->
          <div v-if="isLoggedIn" class="flex items-center space-x-3">
            <router-link 
              v-if="isAdminUser"
              to="/admin"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-light-accent transition"
              title="Panel de administración"
            >
              Admin
            </router-link>
            <router-link 
              to="/profile"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-light-accent transition"
            >
              Mi Perfil
            </router-link>
            <button 
              @click="handleLogout"
              class="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>
          </div>

          <!-- Usuario no logueado -->
          <div v-else class="flex items-center space-x-3">
            <router-link 
              to="/login"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition"
            >
              Iniciar sesión
            </router-link>
            <router-link 
              to="/register"
              class="px-4 py-2 rounded-md text-sm font-medium bg-light-primary text-light-bg hover:bg-light-primary/85 transition"
            >
              Registrarse
            </router-link>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center space-x-4">
          <button @click="isOpen = !isOpen" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none">
            <span class="sr-only">Open main menu</span>
            <svg v-if="!isOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden bg-white border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <!-- Mobile Search -->
        <div class="px-3 py-2">
          <input 
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Buscar recetas..."
            class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-600"
          />
          <div v-if="showSearchResults && searchResults.length > 0" class="mt-2 space-y-2">
            <div v-for="recipe in searchResults.slice(0, 3)" :key="recipe.id" @click="goToRecipe(recipe.id)" class="p-2 hover:bg-gray-100 cursor-pointer rounded">
              <p class="font-medium text-gray-900 text-sm">{{ recipe.title }}</p>
            </div>
          </div>
        </div>

        <!-- Mobile Nav Links -->
        <router-link to="/" @click="isOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600">Inicio</router-link>
        <router-link to="/recipes" @click="isOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600">Recetas</router-link>

        <!-- Mobile Auth -->
        <div class="border-t border-gray-200 pt-2 mt-2 space-y-2">
          <div v-if="isLoggedIn">
            <router-link 
              v-if="isAdminUser"
              to="/admin"
              @click="isOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-light-accent"
            >
              Admin
            </router-link>
            <router-link 
              to="/profile"
              @click="isOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-light-accent"
            >
              Mi Perfil
            </router-link>
            <button 
              @click="handleLogout; isOpen = false"
              class="w-full px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
            >
              Cerrar sesión
            </button>
          </div>
          <div v-else>
            <router-link 
              to="/login"
              @click="isOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
            >
              Iniciar sesión
            </router-link>
            <router-link 
              to="/register"
              @click="isOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
            >
              Registrarse
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>