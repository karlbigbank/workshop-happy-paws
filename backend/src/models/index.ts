import { JSONDatabase } from './JSONDatabase';
import {
  Pet,
  User,
  AdoptionApplication,
  MedicalRecord,
  PetSchema,
  UserSchema,
  AdoptionApplicationSchema,
  MedicalRecordSchema
} from './schemas';

// Database instances
export const petsDb = new JSONDatabase<Pet>('pets.json', PetSchema);
export const usersDb = new JSONDatabase<User>('users.json', UserSchema);
export const applicationsDb = new JSONDatabase<AdoptionApplication>('applications.json', AdoptionApplicationSchema);
export const medicalRecordsDb = new JSONDatabase<MedicalRecord>('medical-records.json', MedicalRecordSchema);

// Database initialization and seeding
export class DatabaseManager {
  static async initialize(): Promise<void> {
    try {
      console.log('Initializing JSON database...');

      // Create daily backups for all databases
      await Promise.all([
        petsDb.createBackup(),
        usersDb.createBackup(),
        applicationsDb.createBackup(),
        medicalRecordsDb.createBackup(),
      ]);

      console.log('Database backups created successfully');

      // Check if we need to seed initial data
      await this.seedInitialData();

      console.log('Database initialization completed');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  static async seedInitialData(): Promise<void> {
    try {
      // Check if admin user exists
      const existingUsers = await usersDb.findAll();

      if (existingUsers.length === 0) {
        console.log('No users found, creating default admin user...');

        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await usersDb.create({
          email: 'admin@shelter.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
        });

        console.log('Default admin user created: admin@shelter.com / admin123');
      }

      // Add sample pets if database is empty
      const existingPets = await petsDb.findAll();

      if (existingPets.length === 0) {
        console.log('Adding sample pets...');

        const samplePets = [
          {
            name: 'Buddy',
            type: 'dog' as const,
            breed: 'Golden Retriever',
            age: 3,
            gender: 'male' as const,
            status: 'in_shelter' as const,
            description: 'Friendly and energetic dog looking for a loving family.',
            photoUrl: '/placeholder-dog.jpg',
            intakeDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            name: 'Whiskers',
            type: 'cat' as const,
            breed: 'Domestic Shorthair',
            age: 2,
            gender: 'female' as const,
            status: 'in_shelter' as const,
            description: 'Calm and affectionate cat, great with children.',
            photoUrl: '/placeholder-cat.jpg',
            intakeDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        for (const pet of samplePets) {
          await petsDb.create(pet);
        }

        console.log('Sample pets added successfully');
      }
    } catch (error) {
      console.error('Failed to seed initial data:', error);
      throw error;
    }
  }

  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    databases: Record<string, { count: number; lastBackup?: string }>;
    message: string;
  }> {
    try {
      const [petsCount, usersCount, applicationsCount, medicalRecordsCount] = await Promise.all([
        petsDb.count(),
        usersDb.count(),
        applicationsDb.count(),
        medicalRecordsDb.count(),
      ]);

      return {
        status: 'healthy',
        databases: {
          pets: { count: petsCount },
          users: { count: usersCount },
          applications: { count: applicationsCount },
          medicalRecords: { count: medicalRecordsCount },
        },
        message: 'All databases are operational',
      };
    } catch (error) {
      return {
        status: 'error',
        databases: {},
        message: `Database health check failed: ${error}`,
      };
    }
  }
}

// Export individual database instances for use in controllers
export { petsDb as PetsDatabase };
export { usersDb as UsersDatabase };
export { applicationsDb as ApplicationsDatabase };
export { medicalRecordsDb as MedicalRecordsDatabase };
