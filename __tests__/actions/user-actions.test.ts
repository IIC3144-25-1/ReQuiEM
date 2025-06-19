import { getServerSession } from "next-auth";
import {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
} from "@/actions/user-actions";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock the auth config
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock the User model
jest.mock("@/models/User", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  },
}));

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  default: jest.fn().mockResolvedValue(true),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const { User } = require("@/models/User");

describe.skip("User Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAdminSession = {
    user: {
      id: "admin-id",
      email: "admin@example.com",
      role: "admin",
    },
  };

  const mockTeacherSession = {
    user: {
      id: "teacher-id",
      email: "teacher@example.com",
      role: "teacher",
    },
  };

  const mockResidentSession = {
    user: {
      id: "resident-id",
      email: "resident@example.com",
      role: "resident",
    },
  };

  describe("createUser", () => {
    it("should create user when authenticated as admin", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const userData = {
        name: "New User",
        email: "newuser@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("_id");
      expect(result.data?.name).toBe(userData.name);
      expect(result.data?.email).toBe(userData.email);

      // Verify user was created in database
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser).toBeTruthy();
    });

    it("should fail when not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const userData = {
        name: "New User",
        email: "newuser@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should fail when authenticated as non-admin", async () => {
      mockGetServerSession.mockResolvedValue(mockTeacherSession);

      const userData = {
        name: "New User",
        email: "newuser@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should fail with invalid data", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const invalidUserData = {
        name: "",
        email: "invalid-email",
        role: "invalid-role" as any,
        rut: "invalid-rut",
      };

      const result = await createUser(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should fail when email already exists", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      // Create a user first
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        role: "resident",
        rut: "12.345.678-5",
      });

      const userData = {
        name: "New User",
        email: "existing@example.com", // Same email
        role: "teacher" as const,
        rut: "98.765.432-1",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("ya existe");
    });
  });

  describe("updateUser", () => {
    let existingUser: any;

    beforeEach(async () => {
      existingUser = await User.create({
        name: "Existing User",
        email: "existing@example.com",
        role: "resident",
        rut: "12.345.678-5",
      });
    });

    it("should update user when authenticated as admin", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const result = await updateUser(existingUser._id.toString(), updateData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateData.name);
      expect(result.data?.email).toBe(updateData.email);

      // Verify user was updated in database
      const updatedUser = await User.findById(existingUser._id);
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.email).toBe(updateData.email);
    });

    it("should allow user to update their own profile", async () => {
      const userSession = {
        user: {
          id: existingUser._id.toString(),
          email: existingUser.email,
          role: "resident",
        },
      };
      mockGetServerSession.mockResolvedValue(userSession);

      const updateData = {
        name: "Self Updated Name",
      };

      const result = await updateUser(existingUser._id.toString(), updateData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe(updateData.name);
    });

    it("should fail when user tries to update another user", async () => {
      mockGetServerSession.mockResolvedValue(mockResidentSession);

      const updateData = {
        name: "Unauthorized Update",
      };

      const result = await updateUser(existingUser._id.toString(), updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should fail when user not found", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const fakeId = "507f1f77bcf86cd799439011";
      const updateData = {
        name: "Updated Name",
      };

      const result = await updateUser(fakeId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario no encontrado");
    });

    it("should fail with invalid update data", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const invalidUpdateData = {
        email: "invalid-email",
        role: "invalid-role",
      };

      const result = await updateUser(
        existingUser._id.toString(),
        invalidUpdateData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("deleteUser", () => {
    let existingUser: any;

    beforeEach(async () => {
      existingUser = await User.create({
        name: "User to Delete",
        email: "delete@example.com",
        role: "resident",
        rut: "12.345.678-5",
      });
    });

    it("should delete user when authenticated as admin", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const result = await deleteUser(existingUser._id.toString());

      expect(result.success).toBe(true);

      // Verify user was deleted from database
      const deletedUser = await User.findById(existingUser._id);
      expect(deletedUser).toBeNull();
    });

    it("should fail when not authenticated as admin", async () => {
      mockGetServerSession.mockResolvedValue(mockTeacherSession);

      const result = await deleteUser(existingUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");

      // Verify user was not deleted
      const user = await User.findById(existingUser._id);
      expect(user).toBeTruthy();
    });

    it("should fail when user not found", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const fakeId = "507f1f77bcf86cd799439011";
      const result = await deleteUser(fakeId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Usuario no encontrado");
    });

    it("should fail with invalid user ID", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const result = await deleteUser("invalid-id");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getUsers", () => {
    beforeEach(async () => {
      await User.create([
        {
          name: "Resident 1",
          email: "resident1@example.com",
          role: "resident",
          rut: "12.345.678-5",
          isActive: true,
        },
        {
          name: "Resident 2",
          email: "resident2@example.com",
          role: "resident",
          rut: "98.765.432-1",
          isActive: false,
        },
        {
          name: "Teacher 1",
          email: "teacher1@example.com",
          role: "teacher",
          rut: "11.111.111-1",
          isActive: true,
        },
      ]);
    });

    it("should get all users when authenticated as admin", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const result = await getUsers();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it("should filter users by role", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const result = await getUsers({ role: "resident" });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.every((user) => user.role === "resident")).toBe(true);
    });

    it("should filter users by active status", async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession);

      const result = await getUsers({ isActive: true });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.every((user) => user.isActive === true)).toBe(true);
    });

    it("should fail when not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });

    it("should fail when authenticated as resident", async () => {
      mockGetServerSession.mockResolvedValue(mockResidentSession);

      const result = await getUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("No autorizado");
    });
  });
});
