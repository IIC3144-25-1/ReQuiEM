import mongoose from "mongoose";

// Setup test database connection to MongoDB Atlas
export const setupTestDB = async () => {
  // Use a test database on MongoDB Atlas
  const testUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;

  if (!testUri) {
    throw new Error(
      "MONGODB_URI_TEST or MONGODB_URI environment variable is required for testing"
    );
  }

  // Ensure we're using a test database
  const uri = testUri.includes("test")
    ? testUri
    : testUri.replace(/\/[^/]*$/, "/requiem_test");

  await mongoose.connect(uri);
};

// Cleanup database after tests
export const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    // Only drop the test database, not the entire connection
    await clearTestDB();
    await mongoose.connection.close();
  }
};

// Clear all collections between tests
export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

// Seed test data
export const seedTestData = async () => {
  const { User } = await import("@/models/User");
  const { Area } = await import("@/models/Area");
  const { Surgery } = await import("@/models/Surgery");
  const { Resident } = await import("@/models/Resident");
  const { Teacher } = await import("@/models/Teacher");

  // Create test area
  const testArea = await Area.create({
    name: "Test Area",
    description: "Test area for testing",
    isActive: true,
  });

  // Create test users
  const residentUser = await User.create({
    name: "Test Resident",
    email: "resident@test.com",
    image: "https://example.com/resident.jpg",
    role: "resident",
    rut: "12345678-9",
    isActive: true,
  });

  const teacherUser = await User.create({
    name: "Test Teacher",
    email: "teacher@test.com",
    image: "https://example.com/teacher.jpg",
    role: "teacher",
    rut: "98765432-1",
    isActive: true,
  });

  const adminUser = await User.create({
    name: "Test Admin",
    email: "admin@test.com",
    image: "https://example.com/admin.jpg",
    role: "admin",
    rut: "11111111-1",
    isActive: true,
  });

  // Create test resident
  const testResident = await Resident.create({
    user: residentUser._id,
    year: 1,
    area: testArea._id,
    isActive: true,
  });

  // Create test teacher
  const testTeacher = await Teacher.create({
    user: teacherUser._id,
    areas: [testArea._id],
    isActive: true,
  });

  // Create test surgeries
  const surgery1 = await Surgery.create({
    name: "Test Surgery 1",
    description: "First test surgery",
    area: testArea._id,
    difficulty: "beginner",
    estimatedDuration: 60,
    isActive: true,
  });

  const surgery2 = await Surgery.create({
    name: "Test Surgery 2",
    description: "Second test surgery",
    area: testArea._id,
    difficulty: "intermediate",
    estimatedDuration: 120,
    isActive: true,
  });

  return {
    area: testArea,
    users: {
      resident: residentUser,
      teacher: teacherUser,
      admin: adminUser,
    },
    resident: testResident,
    teacher: testTeacher,
    surgeries: [surgery1, surgery2],
  };
};

// Create test record
export const createTestRecord = async (overrides = {}) => {
  const { Record } = await import("@/models/Record");
  const seedData = await seedTestData();

  return await Record.create({
    resident: seedData.resident._id,
    surgery: seedData.surgeries[0]._id,
    date: new Date(),
    role: "first_assistant",
    supervisor: seedData.teacher._id,
    notes: "Test record notes",
    status: "pending",
    ...overrides,
  });
};

// Database connection helpers
export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await setupTestDB();
  }
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

// Test database state helpers
export const getCollectionCount = async (collectionName: string) => {
  const collection = mongoose.connection.collection(collectionName);
  return await collection.countDocuments();
};

export const findDocumentById = async (collectionName: string, id: string) => {
  const collection = mongoose.connection.collection(collectionName);
  return await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
};

// Validation helpers
export const expectDocumentToExist = async (
  collectionName: string,
  query: any
) => {
  const collection = mongoose.connection.collection(collectionName);
  const document = await collection.findOne(query);
  expect(document).toBeTruthy();
  return document;
};

export const expectDocumentNotToExist = async (
  collectionName: string,
  query: any
) => {
  const collection = mongoose.connection.collection(collectionName);
  const document = await collection.findOne(query);
  expect(document).toBeNull();
};

// Mock database operations for unit tests
export const mockDatabaseOperations = () => {
  const mockFind = jest.fn();
  const mockFindOne = jest.fn();
  const mockFindById = jest.fn();
  const mockCreate = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();
  const mockFindByIdAndDelete = jest.fn();
  const mockDeleteMany = jest.fn();
  const mockCountDocuments = jest.fn();
  const mockAggregate = jest.fn();

  const mockModel = {
    find: mockFind,
    findOne: mockFindOne,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
    deleteMany: mockDeleteMany,
    countDocuments: mockCountDocuments,
    aggregate: mockAggregate,
  };

  return {
    mockModel,
    mocks: {
      find: mockFind,
      findOne: mockFindOne,
      findById: mockFindById,
      create: mockCreate,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findByIdAndDelete: mockFindByIdAndDelete,
      deleteMany: mockDeleteMany,
      countDocuments: mockCountDocuments,
      aggregate: mockAggregate,
    },
  };
};

// Test data cleanup
export const cleanupTestData = async () => {
  const collections = [
    "users",
    "residents",
    "teachers",
    "areas",
    "surgeries",
    "records",
  ];

  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.collection(collectionName);
      await collection.deleteMany({});
    } catch (error) {
      // Collection might not exist, ignore error
    }
  }
};
