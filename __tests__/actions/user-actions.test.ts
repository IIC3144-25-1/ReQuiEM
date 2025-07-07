import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
} from "@/actions/user-actions";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  connectDB: jest.fn(),
}));

// Mock User model
jest.mock("@/models/User", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

const mockGetServerSession = require("next-auth").getServerSession;
const mockConnectDB = require("@/lib/dbConnect").connectDB;
const mockUser = require("@/models/User").User;

describe("User Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(true);
  });

  describe("createUser", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      role: "resident" as const,
      rut: "12345678-9",
    };

    it("should create user successfully with admin session", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue({ _id: "user123", ...userData });

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(mockUser.create).toHaveBeenCalledWith({
        ...userData,
        isActive: true,
      });
    });

    it("should reject creation without admin session", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident" },
      });

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
      expect(mockUser.create).not.toHaveBeenCalled();
    });

    it("should reject creation with no session", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should reject creation if user already exists", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findOne.mockResolvedValue({ _id: "existing" });

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario con este email o RUT ya existe");
    });
  });

  describe("updateUser", () => {
    const updateData = {
      name: "Updated Name",
      email: "updated@example.com",
    };

    it("should allow admin to update any user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin", id: "admin123" },
      });
      mockUser.findByIdAndUpdate.mockResolvedValue({
        _id: "user123",
        ...updateData,
      });

      const result = await updateUser("user123", updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
    });

    it("should allow user to update their own profile", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident", id: "user123" },
      });
      mockUser.findByIdAndUpdate.mockResolvedValue({
        _id: "user123",
        ...updateData,
      });

      const result = await updateUser("user123", updateData);

      expect(result.success).toBe(true);
    });

    it("should reject user updating another user's profile", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident", id: "user123" },
      });

      const result = await updateUser("user456", updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should handle user not found", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findByIdAndUpdate.mockResolvedValue(null);

      const result = await updateUser("nonexistent", updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario no encontrado");
    });
  });

  describe("deleteUser", () => {
    it("should allow admin to delete user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findByIdAndDelete.mockResolvedValue({ _id: "user123" });

      const result = await deleteUser("user123");

      expect(result.success).toBe(true);
    });

    it("should reject non-admin deletion", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident" },
      });

      const result = await deleteUser("user123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should handle user not found", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findByIdAndDelete.mockResolvedValue(null);

      const result = await deleteUser("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario no encontrado");
    });
  });

  describe("getUsers", () => {
    it("should allow admin to get all users", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: "user1" }, { _id: "user2" }]),
      });

      const result = await getUsers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("should allow teacher to get users", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "teacher" },
      });
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const result = await getUsers();

      expect(result.success).toBe(true);
    });

    it("should reject resident access", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident" },
      });

      const result = await getUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should filter by role", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await getUsers({ role: "teacher" });

      expect(mockUser.find).toHaveBeenCalledWith({ role: "teacher" });
    });

    it("should filter by isActive", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await getUsers({ isActive: true });

      expect(mockUser.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe("getUserById", () => {
    it("should allow admin to get any user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin", id: "admin123" },
      });
      mockUser.findById.mockResolvedValue({ _id: "user123" });

      const result = await getUserById("user123");

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
    });

    it("should allow user to get their own profile", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident", id: "user123" },
      });
      mockUser.findById.mockResolvedValue({ _id: "user123" });

      const result = await getUserById("user123");

      expect(result.success).toBe(true);
    });

    it("should reject user getting another user's profile", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "resident", id: "user123" },
      });
      mockUser.findById.mockResolvedValue({ _id: "user456" });

      const result = await getUserById("user456");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should handle user not found", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { role: "admin" },
      });
      mockUser.findById.mockResolvedValue(null);

      const result = await getUserById("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario no encontrado");
    });

    it("should reject access without session", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getUserById("user123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });
  });
});
