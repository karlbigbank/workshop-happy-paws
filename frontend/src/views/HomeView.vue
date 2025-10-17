<template>
  <div class="home">
    <h1 class="text-4xl font-bold text-primary-700 mb-6">
      🐾 Pet Shelter Registry
    </h1>
    <p class="text-lg text-gray-600 mb-8">
      Welcome to the Pet Shelter Management System
    </p>
    <div class="flex gap-4 justify-center">
      <RouterLink to="/pets" class="btn-primary">
        View Pets
      </RouterLink>
      <RouterLink to="/login" class="btn-secondary">
        Staff Login
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
