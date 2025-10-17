import { z } from 'zod';

// Pet data schema validation
export const PetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Pet name is required'),
  type: z.enum(['dog', 'cat', 'other']),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().int().positive().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'unknown']),
  status: z.enum(['in_shelter', 'foster', 'adopted', 'medical_hold']).default('in_shelter'),
  description: z.string().optional(),
  photoUrl: z.string().url().optional(),
  intakeDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User data schema validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff', 'volunteer']).default('staff'),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});

// Adoption Application data schema validation
export const AdoptionApplicationSchema = z.object({
  id: z.string().uuid(),
  petId: z.string().uuid(),
  adopter: z.object({
    name: z.string().min(1, 'Adopter name is required'),
    email: z.string().email(),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
  }),
  reason: z.string().min(10, 'Please provide a reason for adoption'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// Medical Record data schema validation
export const MedicalRecordSchema = z.object({
  id: z.string().uuid(),
  petId: z.string().uuid(),
  date: z.string().datetime(),
  type: z.enum(['vaccination', 'checkup', 'treatment', 'surgery', 'other']),
  description: z.string().min(1, 'Description is required'),
  veterinarian: z.string().optional(),
  nextDueDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

// TypeScript types derived from Zod schemas
export type Pet = z.infer<typeof PetSchema>;
export type User = z.infer<typeof UserSchema>;
export type AdoptionApplication = z.infer<typeof AdoptionApplicationSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
