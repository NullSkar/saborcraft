<script setup>
import { ref, computed, onMounted } from 'vue'
import { authService, adminService } from '../services/api'

const activeTab = ref('dashboard')
const isLoading = ref(false)

// Dashboard data
const stats = ref({})
const recipes = ref([])
const recipesPage = ref(1)
const recipesLimit = ref(10)
const recipesTotalPages = ref(1)
const users = ref([])
const categories = ref([])

// Form state
const newCategory = ref({
    name: '',
    description: '',
    color: '#00272B'
})

const editingCategory = ref(null)

onMounted(async () => {
    if (!authService.isLoggedIn()) {
        window.location.href = '/login'
        return
    }

    // Verificar que el usuario es admin
    const isAdmin = await authService.isAdmin()
    if (!isAdmin) {
        alert('No tienes permisos para acceder al panel de administración')
        window.location.href = '/'
        return
    }

    await loadDashboardData()
})

async function loadDashboardData() {
    isLoading.value = true
    try {
        const [statsData, recipesData, usersData, categoriesData] = await Promise.all([
            adminService.getStats(),
            adminService.getAllRecipes(recipesPage.value, recipesLimit.value),
            adminService.getUsers(),
            adminService.getCategories()
        ])
        stats.value = statsData
        recipes.value = recipesData.data || []
        recipesTotalPages.value = recipesData.totalPages || 1
        users.value = usersData
        categories.value = categoriesData
    } catch (error) {
        alert('Error al cargar datos: ' + error.message)
    } finally {
        isLoading.value = false
    }
}

// Variables de edición de recetas
const editingRecipe = ref(null)

// Funciones para recetas
async function deleteRecipe(recipeId) {
    if (!confirm('¿Estás seguro de que deseas ELIMINAR esta receta? Esta acción no se puede deshacer.')) return
    try {
        await adminService.deleteRecipe(recipeId)
        alert('Receta eliminada correctamente')
        recipes.value = recipes.value.filter(r => r.id !== recipeId)
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

async function startEditRecipe(recipe) {
    editingRecipe.value = { ...recipe }
}

function cancelEditRecipe() {
    editingRecipe.value = null
}

async function updateRecipeStatus() {
    if (!editingRecipe.value) return
    try {
        const recipeId = editingRecipe.value.id
        const newStatus = editingRecipe.value.status
        
        await adminService.updateRecipeStatus(recipeId, newStatus)
        
        alert('Estado de receta actualizado')
        editingRecipe.value = null
        await loadDashboardData()
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

function nextPage() {
    if (recipesPage.value < recipesTotalPages.value) {
        recipesPage.value++
        loadDashboardData()
    }
}

function previousPage() {
    if (recipesPage.value > 1) {
        recipesPage.value--
        loadDashboardData()
    }
}

// Funciones para usuarios
async function toggleUserActive(userId) {
    try {
        await adminService.toggleUserActive(userId)
        const user = users.value.find(u => u.id === userId)
        if (user) {
            user.is_active = user.is_active ? 0 : 1
        }
        alert('Estado del usuario actualizado')
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

// Funciones para categorías
async function addCategory() {
    if (!newCategory.value.name.trim()) {
        alert('El nombre de la categoría es requerido')
        return
    }

    try {
        await adminService.createCategory(
            newCategory.value.name,
            newCategory.value.description,
            newCategory.value.color
        )
        alert('Categoría creada correctamente')
        newCategory.value = { name: '', description: '', color: '#00272B' }
        await loadDashboardData()
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

async function updateCategory() {
    if (!editingCategory.value.name.trim()) {
        alert('El nombre de la categoría es requerido')
        return
    }

    try {
        await adminService.updateCategory(
            editingCategory.value.id,
            editingCategory.value.name,
            editingCategory.value.description,
            editingCategory.value.color,
            editingCategory.value.is_active
        )
        alert('Categoría actualizada correctamente')
        editingCategory.value = null
        await loadDashboardData()
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('¿Estás seguro de que deseas ELIMINAR esta categoría?')) return
    try {
        await adminService.deleteCategory(categoryId)
        alert('Categoría eliminada correctamente')
        await loadDashboardData()
    } catch (error) {
        alert('Error: ' + error.message)
    }
}

async function startEditCategory(category) {
    editingCategory.value = { ...category }
}

function cancelEdit() {
    editingCategory.value = null
}
</script>

<template>
    <div class="min-h-screen bg-light-light pt-20 pb-12">
        <div class="max-w-7xl mx-auto px-4">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-2xl md:text-4xl font-bold text-light-primary mb-2">Administración</h1>
                <p class="text-sm md:text-base text-light-secondary">Gestiona recetas, usuarios y categorías</p>
            </div>

            <!-- Navigation Tabs -->
            <div class="flex gap-0 mb-6 md:mb-8 border-b-2 border-light-secondary/20 overflow-x-auto">
                <button
                    @click="activeTab = 'dashboard'"
                    :class="[
                        'px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-sm md:text-base',
                        activeTab === 'dashboard'
                            ? 'text-light-primary border-light-primary'
                            : 'text-light-secondary/60 border-transparent hover:text-light-primary'
                    ]"
                >
                    Dashboard
                </button>
                <button
                    @click="activeTab = 'recipes'"
                    :class="[
                        'px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-sm md:text-base',
                        activeTab === 'recipes'
                            ? 'text-light-primary border-light-primary'
                            : 'text-light-secondary/60 border-transparent hover:text-light-primary'
                    ]"
                >
                    Recetas
                </button>
                <button
                    @click="activeTab = 'users'"
                    :class="[
                        'px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-sm md:text-base',
                        activeTab === 'users'
                            ? 'text-light-primary border-light-primary'
                            : 'text-light-secondary/60 border-transparent hover:text-light-primary'
                    ]"
                >
                    Usuarios
                </button>
                <button
                    @click="activeTab = 'categories'"
                    :class="[
                        'px-3 md:px-6 py-2 md:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-sm md:text-base',
                        activeTab === 'categories'
                            ? 'text-light-primary border-light-primary'
                            : 'text-light-secondary/60 border-transparent hover:text-light-primary'
                    ]"
                >
                    Categorías
                </button>
            </div>

            <!-- Loading spinner -->
            <div v-if="isLoading" class="text-center py-12">
                <p class="text-light-secondary">Cargando datos...</p>
            </div>

            <!-- TAB: DASHBOARD -->
            <div v-else-if="activeTab === 'dashboard'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <!-- Stat Card 1: Total Recetas -->
                <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-light-primary hover:shadow-lg transition">
                    <div class="text-light-secondary/70 text-xs font-semibold uppercase tracking-wide mb-2">Total Recetas</div>
                    <div class="text-2xl md:text-3xl font-bold text-light-primary mb-3">{{ stats.totalRecipes || 0 }}</div>
                    <div class="text-xs text-light-secondary/60 space-y-1">
                        <p>Publicadas: <span class="font-semibold text-light-primary">{{ stats.recipesByStatus?.publicada || 0 }}</span></p>
                        <p>Pendientes: <span class="font-semibold text-light-accent">{{ stats.recipesByStatus?.pendiente || 0 }}</span></p>
                    </div>
                </div>

                <!-- Stat Card 2: Usuarios Activos -->
                <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-light-secondary hover:shadow-lg transition">
                    <div class="text-light-secondary/70 text-xs font-semibold uppercase tracking-wide mb-2">Usuarios Activos</div>
                    <div class="text-2xl md:text-3xl font-bold text-light-secondary mb-3">{{ stats.totalActiveUsers || 0 }}</div>
                    <p class="text-xs text-light-secondary/60">Usuarios en el sistema</p>
                </div>

                <!-- Stat Card 3: Calificaciones -->
                <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-light-tertiary hover:shadow-lg transition">
                    <div class="text-light-secondary/70 text-xs font-semibold uppercase tracking-wide mb-2">Calificaciones</div>
                    <div class="text-2xl md:text-3xl font-bold text-light-tertiary mb-3">{{ stats.totalRatings || 0 }}</div>
                    <p class="text-xs text-light-secondary/60">Promedio: <span class="font-semibold">{{ stats.averageRating || 0 }}</span></p>
                </div>

                <!-- Stat Card 4: Vistas -->
                <div class="bg-white rounded-lg shadow-md p-4 md:p-6 border-l-4 border-light-accent hover:shadow-lg transition">
                    <div class="text-light-secondary/70 text-xs font-semibold uppercase tracking-wide mb-2">Vistas Totales</div>
                    <div class="text-2xl md:text-3xl font-bold text-light-accent mb-3">{{ stats.totalViews || 0 }}</div>
                    <p class="text-xs text-light-secondary/60">Vistas acumuladas</p>
                </div>
            </div>

            <!-- TAB: RECETAS -->
            <div v-else-if="activeTab === 'recipes'" class="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-4 md:mb-6">
                    <h2 class="text-xl md:text-2xl font-bold text-light-primary">Gestión de Recetas</h2>
                    <div class="text-xs md:text-sm text-light-secondary/60">
                        Página {{ recipesPage }} de {{ recipesTotalPages }}
                    </div>
                </div>

                <div v-if="recipes.length === 0" class="text-center py-12 text-light-secondary/60">
                    <p class="text-lg">No hay recetas</p>
                </div>

                <div v-else class="grid gap-3 md:gap-4">
                    <div v-for="recipe in recipes" :key="recipe.id" class="border border-light-secondary/20 rounded-lg p-3 md:p-4 hover:shadow-lg hover:border-light-secondary/40 transition">
                        <!-- View Mode -->
                        <div v-if="editingRecipe?.id !== recipe.id" class="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                            <div class="flex-1 min-w-0">
                                <h4 class="text-base md:text-lg font-bold text-light-primary mb-2 break-words">{{ recipe.title }}</h4>
                                <p class="text-xs md:text-sm text-light-secondary/70 mb-1">Por: {{ recipe.author?.username || 'Desconocido' }}</p>
                                <p class="text-xs md:text-sm text-light-secondary/70 mb-2">Categoría: {{ recipe.category?.name || 'Sin categoría' }}</p>
                                <p class="text-xs text-light-secondary/60 line-clamp-1">{{ recipe.description }}</p>
                                <div class="text-xs text-light-secondary/60 mt-2">
                                    <span>⭐ {{ (Number(recipe.averageRating) || 0).toFixed(1) }}</span>
                                    <span class="ml-3">👁️ {{ recipe.viewsCount }}</span>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2 items-stretch md:items-end">
                                <span
                                    class="px-3 py-1 rounded text-xs font-semibold text-center"
                                    :class="{
                                        'bg-light-primary/10 text-light-primary': recipe.difficulty === 'facil',
                                        'bg-light-accent/10 text-light-accent': recipe.difficulty === 'medio',
                                        'bg-light-secondary/10 text-light-secondary': recipe.difficulty === 'dificil'
                                    }"
                                >
                                    {{ recipe.difficulty }}
                                </span>
                                <span
                                    class="px-3 py-1 rounded text-xs font-semibold text-white text-center"
                                    :class="{
                                        'bg-green-600': recipe.status === 'publicada',
                                        'bg-orange-500': recipe.status === 'pendiente',
                                        'bg-red-600': recipe.status === 'rechazada'
                                    }"
                                >
                                    {{ recipe.status }}
                                </span>
                                <div class="flex gap-2 flex-col sm:flex-row">
                                    <button
                                        @click="startEditRecipe(recipe)"
                                        class="px-3 py-1 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 transition text-xs md:text-sm font-semibold"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        @click="deleteRecipe(recipe.id)"
                                        class="px-3 py-1 bg-light-secondary/20 text-light-secondary rounded hover:bg-light-secondary/30 transition text-xs md:text-sm font-semibold"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Edit Mode -->
                        <div v-else class="space-y-3">
                            <div>
                                <label class="block text-xs font-semibold text-light-primary mb-1">Estado</label>
                                <select
                                    v-model="editingRecipe.status"
                                    class="w-full px-3 py-2 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 text-sm"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="publicada">Publicada</option>
                                    <option value="rechazada">Rechazada</option>
                                </select>
                            </div>

                            <div class="flex gap-2 justify-end pt-2">
                                <button
                                    @click="cancelEditRecipe"
                                    class="px-3 py-1 bg-light-secondary/20 text-light-secondary rounded hover:bg-light-secondary/30 transition text-sm font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    @click="updateRecipeStatus"
                                    class="px-3 py-1 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 transition text-sm font-semibold"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Paginación -->
                <div v-if="recipesTotalPages > 1" class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-light-secondary/20">
                    <button
                        @click="previousPage"
                        :disabled="recipesPage === 1"
                        class="px-3 md:px-4 py-2 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm md:text-base w-full sm:w-auto"
                    >
                        Anterior
                    </button>
                    <span class="text-xs md:text-sm text-light-secondary/60 text-center">
                        {{ (recipesPage - 1) * recipesLimit + 1 }} - {{ Math.min(recipesPage * recipesLimit, stats.totalRecipes || 0) }} de {{ stats.totalRecipes || 0 }} recetas
                    </span>
                    <button
                        @click="nextPage"
                        :disabled="recipesPage === recipesTotalPages"
                        class="px-3 md:px-4 py-2 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm md:text-base w-full sm:w-auto"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <!-- TAB: USUARIOS -->
            <div v-else-if="activeTab === 'users'" class="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h2 class="text-xl md:text-2xl font-bold text-light-primary mb-4 md:mb-6">Gestión de Usuarios</h2>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm md:text-base">
                        <thead>
                            <tr class="border-b-2 border-light-secondary/20">
                                <th class="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-light-primary text-xs md:text-base">Usuario</th>
                                <th class="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-light-primary text-xs md:text-base">Email</th>
                                <th class="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-light-primary text-xs md:text-base">Recetas</th>
                                <th class="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-light-primary text-xs md:text-base">Estado</th>
                                <th class="px-2 md:px-4 py-2 md:py-3 text-center font-semibold text-light-primary text-xs md:text-base">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id" class="border-b border-light-secondary/10 hover:bg-light-secondary/5">
                                <td class="px-2 md:px-4 py-2 md:py-3 font-semibold text-light-primary text-xs md:text-base">{{ user.username }}</td>
                                <td class="px-2 md:px-4 py-2 md:py-3 text-light-secondary/80 text-xs md:text-base break-all">{{ user.email }}</td>
                                <td class="px-2 md:px-4 py-2 md:py-3 text-center">
                                    <span class="inline-block bg-light-primary/10 text-light-primary px-2 md:px-3 py-1 rounded text-xs md:text-sm font-semibold">
                                        {{ user.recipe_count }}
                                    </span>
                                </td>
                                <td class="px-2 md:px-4 py-2 md:py-3 text-center">
                                    <span
                                        :class="[
                                            'inline-block px-2 md:px-3 py-1 rounded text-xs font-semibold',
                                            user.is_active
                                                ? 'bg-light-tertiary/10 text-light-tertiary'
                                                : 'bg-light-secondary/10 text-light-secondary'
                                        ]"
                                    >
                                        {{ user.is_active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="px-2 md:px-4 py-2 md:py-3 text-center">
                                    <button
                                        @click="toggleUserActive(user.id)"
                                        :class="[
                                            'px-2 md:px-3 py-1 rounded font-semibold transition text-xs md:text-sm',
                                            user.is_active
                                                ? 'bg-light-secondary/20 text-light-secondary hover:bg-light-secondary/30'
                                                : 'bg-light-tertiary/20 text-light-tertiary hover:bg-light-tertiary/30'
                                        ]"
                                    >
                                        {{ user.is_active ? 'Desactivar' : 'Activar' }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAB: CATEGORÍAS -->
            <div v-else-if="activeTab === 'categories'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <!-- Formulario para crear categoría -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h3 class="text-lg md:text-xl font-bold text-light-primary mb-4">Nueva Categoría</h3>

                        <div class="space-y-3 md:space-y-4">
                            <div>
                                <label class="block text-xs md:text-sm font-semibold text-light-primary mb-2">Nombre</label>
                                <input
                                    v-model="newCategory.name"
                                    type="text"
                                    class="w-full px-3 md:px-4 py-2 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 text-sm"
                                    placeholder="Ej: Desayunos"
                                />
                            </div>

                            <div>
                                <label class="block text-xs md:text-sm font-semibold text-light-primary mb-2">Descripción</label>
                                <textarea
                                    v-model="newCategory.description"
                                    class="w-full px-3 md:px-4 py-2 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 resize-none text-sm"
                                    rows="3"
                                    placeholder="Descripción opcional"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block text-xs md:text-sm font-semibold text-light-primary mb-2">Color</label>
                                <input
                                    v-model="newCategory.color"
                                    type="color"
                                    class="w-full h-10 border border-light-secondary/20 rounded cursor-pointer"
                                />
                            </div>

                            <button
                                @click="addCategory"
                                class="w-full py-2 bg-light-primary text-white rounded font-semibold hover:bg-light-primary/90 transition text-sm"
                            >
                                Crear Categoría
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Lista de categorías -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h3 class="text-lg md:text-xl font-bold text-light-primary mb-4">Categorías Existentes</h3>

                        <div v-if="categories.length === 0" class="text-center py-8 text-light-secondary/60">
                            <p class="text-sm md:text-base">No hay categorías creadas</p>
                        </div>

                        <div v-else class="grid gap-3 md:gap-4">
                            <div
                                v-for="category in categories"
                                :key="category.id"
                                class="border border-light-secondary/20 rounded-lg p-3 md:p-4 hover:shadow-lg hover:border-light-secondary/40 transition"
                            >
                                <!-- View Mode -->
                                <div v-if="editingCategory?.id !== category.id" class="flex justify-between items-start gap-2">
                                    <div class="flex-1">
                                        <h4 class="text-lg font-bold text-light-primary mb-2">{{ category.name }}</h4>
                                        <p class="text-sm text-light-secondary/70 mb-2">{{ category.description }}</p>
                                        <p class="text-xs text-light-secondary/60">
                                            {{ category.recipe_count }} receta{{ category.recipe_count !== 1 ? 's' : '' }}
                                        </p>
                                    </div>

                                    <div class="flex gap-2">
                                        <button
                                            @click="startEditCategory(category)"
                                            class="px-3 py-1 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 transition text-sm font-semibold"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            @click="deleteCategory(category.id)"
                                            class="px-3 py-1 bg-light-secondary/20 text-light-secondary rounded hover:bg-light-secondary/30 transition text-sm font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                <!-- Edit Mode -->
                                <div v-else class="space-y-3">
                                    <div>
                                        <label class="block text-xs font-semibold text-light-primary mb-1">Nombre</label>
                                        <input
                                            v-model="editingCategory.name"
                                            type="text"
                                            class="w-full px-3 py-2 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label class="block text-xs font-semibold text-light-primary mb-1">Descripción</label>
                                        <textarea
                                            v-model="editingCategory.description"
                                            class="w-full px-3 py-2 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 resize-none text-sm"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block text-xs font-semibold text-light-primary mb-1">Color</label>
                                            <input
                                                v-model="editingCategory.color"
                                                type="color"
                                                class="w-full h-8 border border-light-secondary/20 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label class="block text-xs font-semibold text-light-primary mb-1">Activa</label>
                                            <select
                                                v-model="editingCategory.is_active"
                                                class="w-full px-2 py-1 border border-light-secondary/20 rounded focus:outline-none focus:border-light-primary focus:ring-1 focus:ring-light-primary/20 text-sm"
                                            >
                                                <option :value="1">Sí</option>
                                                <option :value="0">No</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="flex gap-2 justify-end pt-2">
                                        <button
                                            @click="cancelEdit"
                                            class="px-3 py-1 bg-light-secondary/20 text-light-secondary rounded hover:bg-light-secondary/30 transition text-sm font-semibold"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            @click="updateCategory"
                                            class="px-3 py-1 bg-light-primary/20 text-light-primary rounded hover:bg-light-primary/30 transition text-sm font-semibold"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>