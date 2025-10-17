export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff' | 'volunteer'
  isActive: boolean
  createdAt: string
}

export interface Pet {
  id: string
  name: string
  type: 'dog' | 'cat' | 'other'
  breed: string
  age?: number
  dateOfBirth?: string
  gender: 'male' | 'female' | 'unknown'
  status: 'in_shelter' | 'foster' | 'adopted' | 'medical_hold'
  description?: string
  photoUrl: string
  intakeDate: string
  createdAt: string
  updatedAt: string
}

export interface AdoptionApplication {
  id: string
  petId: string
  adopter: {
    name: string
    email: string
    phone: string
    address: string
  }
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
}
