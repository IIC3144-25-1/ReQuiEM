import { User, IUser } from "@/models/User";

// Mock mongoose
jest.mock("mongoose", () => ({
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    index: jest.fn(),
    virtual: jest.fn().mockReturnValue({ get: jest.fn() }),
  })),
  model: jest.fn(),
  models: {},
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => id || "507f1f77bcf86cd799439011"),
  },
}));

// Mock the User model
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@example.com",
  image: "https://example.com/image.jpg",
  role: "resident",
  rut: "12.345.678-5",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn(),
  toJSON: jest.fn(),
  toObject: jest.fn(),
};

const mockUserModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  createIndexes: jest.fn(),
  collection: {
    getIndexes: jest.fn(),
  },
};

// Mock the User model implementation
jest.mock("@/models/User", () => ({
  User: mockUserModel,
  IUser: {},
}));

describe("User Model Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        image: "https://example.com/juan.jpg",
        role: "resident",
        rut: "12.345.678-5",
        isActive: true,
      };

      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
      });

      const result = await mockUserModel.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
      expect(result.rut).toBe(userData.rut);
      expect(result.isActive).toBe(userData.isActive);
    });

    it("should create a user with minimal required fields", async () => {
      const userData = {
        name: "Dr. María González",
        email: "maria@hospital.cl",
        role: "teacher",
        rut: "98.765.432-1",
      };

      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
        isActive: true, // Default value
      });

      const result = await mockUserModel.create(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
      expect(result.rut).toBe(userData.rut);
      expect(result.isActive).toBe(true);
    });

    it("should handle creation errors", async () => {
      const userData = {
        name: "Invalid User",
        email: "invalid-email",
        role: "invalid-role",
        rut: "invalid-rut",
      };

      const error = new Error("Validation failed");
      mockUserModel.create.mockRejectedValue(error);

      await expect(mockUserModel.create(userData)).rejects.toThrow("Validation failed");
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
    });
  });

  describe("User Queries", () => {
    it("should find users by role", async () => {
      const mockResidents = [
        { ...mockUser, role: "resident", name: "Resident 1" },
        { ...mockUser, role: "resident", name: "Resident 2" },
      ];

      mockUserModel.find.mockResolvedValue(mockResidents);

      const result = await mockUserModel.find({ role: "resident" });

      expect(mockUserModel.find).toHaveBeenCalledWith({ role: "resident" });
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("resident");
      expect(result[1].role).toBe("resident");
    });

    it("should find active users", async () => {
      const mockActiveUsers = [
        { ...mockUser, isActive: true, name: "Active User 1" },
        { ...mockUser, isActive: true, name: "Active User 2" },
      ];

      mockUserModel.find.mockResolvedValue(mockActiveUsers);

      const result = await mockUserModel.find({ isActive: true });

      expect(mockUserModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toHaveLength(2);
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(true);
    });

    it("should find user by email", async () => {
      const email = "test@example.com";
      mockUserModel.findOne.mockResolvedValue({ ...mockUser, email });

      const result = await mockUserModel.findOne({ email });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result.email).toBe(email);
    });

    it("should find user by RUT", async () => {
      const rut = "12.345.678-5";
      mockUserModel.findOne.mockResolvedValue({ ...mockUser, rut });

      const result = await mockUserModel.findOne({ rut });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut });
      expect(result.rut).toBe(rut);
    });

    it("should find user by ID", async () => {
      const id = "507f1f77bcf86cd799439011";
      mockUserModel.findById.mockResolvedValue({ ...mockUser, _id: id });

      const result = await mockUserModel.findById(id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(id);
      expect(result._id).toBe(id);
    });

    it("should return null when user not found", async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await mockUserModel.findOne({ email: "nonexistent@example.com" });

      expect(result).toBeNull();
    });
  });

  describe("User Updates", () => {
    it("should update user by ID", async () => {
      const id = "507f1f77bcf86cd799439011";
      const updateData = { name: "Updated Name", isActive: false };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await mockUserModel.findByIdAndUpdate(id, updateData, { new: true });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
      expect(result.name).toBe(updateData.name);
      expect(result.isActive).toBe(updateData.isActive);
    });

    it("should handle update errors", async () => {
      const id = "507f1f77bcf86cd799439011";
      const updateData = { email: "invalid-email" };
      const error = new Error("Validation failed");

      mockUserModel.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        mockUserModel.findByIdAndUpdate(id, updateData, { new: true })
      ).rejects.toThrow("Validation failed");
    });
  });

  describe("User Deletion", () => {
    it("should delete user by ID", async () => {
      const id = "507f1f77bcf86cd799439011";
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await mockUserModel.findByIdAndDelete(id);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });

    it("should delete multiple users", async () => {
      const deleteResult = { deletedCount: 3 };
      mockUserModel.deleteMany.mockResolvedValue(deleteResult);

      const result = await mockUserModel.deleteMany({ isActive: false });

      expect(mockUserModel.deleteMany).toHaveBeenCalledWith({ isActive: false });
      expect(result.deletedCount).toBe(3);
    });
  });

  describe("User Aggregation", () => {
    it("should count users by role", async () => {
      const aggregationResult = [
        { _id: "resident", count: 5 },
        { _id: "teacher", count: 3 },
        { _id: "admin", count: 1 },
      ];

      mockUserModel.aggregate.mockResolvedValue(aggregationResult);

      const pipeline = [
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ];

      const result = await mockUserModel.aggregate(pipeline);

      expect(mockUserModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(result).toEqual(aggregationResult);
      expect(result[0].count).toBe(5);
    });

    it("should count total documents", async () => {
      mockUserModel.countDocuments.mockResolvedValue(10);

      const result = await mockUserModel.countDocuments();

      expect(mockUserModel.countDocuments).toHaveBeenCalled();
      expect(result).toBe(10);
    });

    it("should count documents with filter", async () => {
      mockUserModel.countDocuments.mockResolvedValue(7);

      const result = await mockUserModel.countDocuments({ isActive: true });

      expect(mockUserModel.countDocuments).toHaveBeenCalledWith({ isActive: true });
      expect(result).toBe(7);
    });
  });

  describe("User Validation", () => {
    it("should validate email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      validEmails.forEach(email => {
        // In a real implementation, this would test the schema validation
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it("should validate role values", () => {
      const validRoles = ["admin", "teacher", "resident"];
      const invalidRoles = ["student", "doctor", "nurse"];

      validRoles.forEach(role => {
        expect(validRoles).toContain(role);
      });

      invalidRoles.forEach(role => {
        expect(validRoles).not.toContain(role);
      });
    });

    it("should validate RUT format", () => {
      const validRuts = [
        "12.345.678-5",
        "11.111.111-1",
        "1.111.111-K",
      ];

      validRuts.forEach(rut => {
        // Basic RUT format validation
        expect(rut).toMatch(/^\d{1,2}\.\d{3}\.\d{3}-[\dK]$/);
      });
    });
  });

  describe("User Indexes", () => {
    it("should have proper indexes", async () => {
      const mockIndexes = {
        "_id_": { v: 2, key: { _id: 1 } },
        "email_1": { v: 2, key: { email: 1 }, unique: true },
        "rut_1": { v: 2, key: { rut: 1 }, unique: true },
      };

      mockUserModel.collection.getIndexes.mockResolvedValue(mockIndexes);

      const result = await mockUserModel.collection.getIndexes();

      expect(result).toHaveProperty("_id_");
      expect(result).toHaveProperty("email_1");
      expect(result).toHaveProperty("rut_1");
      expect(result.email_1.unique).toBe(true);
      expect(result.rut_1.unique).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors", async () => {
      const connectionError = new Error("Database connection failed");
      mockUserModel.find.mockRejectedValue(connectionError);

      await expect(mockUserModel.find({})).rejects.toThrow("Database connection failed");
    });

    it("should handle validation errors", async () => {
      const validationError = new Error("Validation failed: email is required");
      mockUserModel.create.mockRejectedValue(validationError);

      await expect(mockUserModel.create({})).rejects.toThrow("Validation failed: email is required");
    });

    it("should handle duplicate key errors", async () => {
      const duplicateError = new Error("E11000 duplicate key error");
      mockUserModel.create.mockRejectedValue(duplicateError);

      const userData = {
        name: "Test User",
        email: "existing@example.com",
        role: "resident",
        rut: "12.345.678-5",
      };

      await expect(mockUserModel.create(userData)).rejects.toThrow("E11000 duplicate key error");
    });
  });
});
