import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Pet } from '@/types'

export const usePetsStore = defineStore('pets', () => {
  const pets = ref<Pet[]>([])
  const loading = ref(false)
  const error = ref('')

  function setPets(newPets: Pet[]) {
    pets.value = newPets
  }

  function addPet(pet: Pet) {
    pets.value.push(pet)
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function setError(errorMessage: string) {
    error.value = errorMessage
  }

  return {
    pets,
    loading,
    error,
    setPets,
    addPet,
    setLoading,
    setError
  }
})
