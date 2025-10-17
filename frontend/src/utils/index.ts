// API utilities - will be expanded in later stories
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// Helper functions for pet status styling
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'in_shelter':
      return 'status-available'
    case 'foster':
      return 'status-foster'
    case 'adopted':
      return 'status-adopted'
    case 'medical_hold':
      return 'status-medical'
    default:
      return 'bg-gray-500'
  }
}

// Format date helpers
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}
