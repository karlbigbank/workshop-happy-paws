import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref('')
  const isAuthenticated = ref(false)

  function login(userData: any, userToken: string) {
    user.value = userData
    token.value = userToken
    isAuthenticated.value = true
  }

  function logout() {
    user.value = null
    token.value = ''
    isAuthenticated.value = false
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
