<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/api'

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    // authService.login guardará las credenciales en sessionStorage
    // y las enviará via Basic Auth
    const response = await authService.login(username.value, password.value)
    
    if (response.success) {
      // Redirigir a la página que intentó acceder o a home
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      error.value = response.message || 'Error de autenticación'
    }
  } catch (err) {
    console.error('Error en login:', err)
    error.value = err.response?.data?.message || 'Error al conectarse al servidor'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8 md:py-0">
    <div class="w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-900">Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin" class="space-y-4 md:space-y-6">
        <div>
          <label for="username" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Usuario</label>
          <input 
            v-model="username" 
            type="text" 
            id="username" 
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary" 
            required 
          />
        </div>
        <div>
          <label for="password" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            class="w-full border border-gray-300 rounded-lg shadow-sm px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary" 
            required 
          />
        </div>
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full mt-6 md:mt-8 py-2.5 md:py-3 px-4 bg-light-primary text-white rounded-lg hover:bg-light-secondary transition font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Cargando...' : 'Ingresar' }}
        </button>
      </form>
      <p class="text-center text-xs md:text-sm text-gray-600 mt-4 md:mt-6">
        ¿No tienes cuenta? <router-link to="/register" class="text-light-primary font-semibold hover:text-light-secondary transition">Regístrate</router-link>
      </p>
      <div v-if="error" class="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs md:text-sm">{{ error }}</div>
    </div>
  </div>
</template>
