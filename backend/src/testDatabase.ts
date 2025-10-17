// Test file to verify JSON database implementation
import { DatabaseManager, PetsDatabase } from './models';
import { validateEnvironment } from './models/errorHandling';

async function testJSONDatabase() {
  try {
    console.log('Testing JSON Database Layer...');

    // Validate environment
    validateEnvironment();

    // Initialize database
    await DatabaseManager.initialize();

    // Test pet creation
    const testPet = await PetsDatabase.create({
      name: 'Test Pet',
      type: 'dog',
      breed: 'Test Breed',
      age: 2,
      gender: 'male',
      status: 'in_shelter',
      description: 'Test pet for database verification',
      intakeDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('✓ Pet created successfully:', testPet.id);

    // Test retrieval
    const retrievedPet = await PetsDatabase.findById(testPet.id);
    console.log('✓ Pet retrieved successfully:', retrievedPet?.name);

    // Test health status
    const health = await DatabaseManager.getHealthStatus();
    console.log('✓ Database health:', health.status);
    console.log('✓ Pet count:', health.databases.pets.count);

    console.log('JSON Database Layer test completed successfully!');

  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testJSONDatabase();
}
