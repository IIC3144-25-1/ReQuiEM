import { createUser } from "@/actions/user/create";

// Mock the User model
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@example.com",
  role: "resident",
  rut: "12.345.678-5",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserModel = {
  create: jest.fn(),
  findOne: jest.fn(),
};

jest.mock("@/models/User", () => ({
  User: mockUserModel,
}));

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock auth config
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("User Actions - Create User", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      // Mock that user doesn't exist
      mockUserModel.findOne.mockResolvedValue(null);
      
      // Mock successful creation
      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
      });

      const result = await createUser(userData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe(userData.name);
      expect(result.data.email).toBe(userData.email);
    });

    it("should fail when user already exists", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      // Mock that user already exists
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should validate required fields", async () => {
      const invalidUserData = {
        name: "",
        email: "invalid-email",
        role: "invalid-role" as any,
        rut: "",
      };

      const result = await createUser(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate email format", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "invalid-email-format",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("email");
    });

    it("should validate RUT format", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "invalid-rut",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("RUT");
    });

    it("should validate role values", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "invalid-role" as any,
        rut: "12.345.678-5",
      };

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("role");
    });

    it("should handle database errors", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      // Mock database error
      mockUserModel.findOne.mockRejectedValue(new Error("Database connection failed"));

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Database");
    });

    it("should handle duplicate RUT error", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      // Mock that email doesn't exist but RUT does
      mockUserModel.findOne
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(mockUser); // RUT check

      const result = await createUser(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("RUT");
    });

    it("should trim whitespace from input fields", async () => {
      const userData = {
        name: "  Dr. Juan Pérez  ",
        email: "  juan@hospital.cl  ",
        role: "resident" as const,
        rut: "  12.345.678-5  ",
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        rut: "12.345.678-5",
      });

      const result = await createUser(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident",
        rut: "12.345.678-5",
      });
      expect(result.success).toBe(true);
    });

    it("should set default values correctly", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
        isActive: true, // Default value
      });

      const result = await createUser(userData);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(true);
    });

    it("should handle creation with optional image field", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
        image: "https://example.com/image.jpg",
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
      });

      const result = await createUser(userData);

      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      expect(result.success).toBe(true);
      expect(result.data.image).toBe(userData.image);
    });

    it("should handle different user roles", async () => {
      const roles = ["admin", "teacher", "resident"] as const;

      for (const role of roles) {
        const userData = {
          name: `Dr. ${role} User`,
          email: `${role}@hospital.cl`,
          role,
          rut: `${Math.floor(Math.random() * 100000000)}-5`,
        };

        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.create.mockResolvedValue({
          ...mockUser,
          ...userData,
        });

        const result = await createUser(userData);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(role);
      }
    });

    it("should return proper error structure", async () => {
      const userData = {
        name: "",
        email: "",
        role: "" as any,
        rut: "",
      };

      const result = await createUser(userData);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("error");
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe("string");
    });

    it("should return proper success structure", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident" as const,
        rut: "12.345.678-5",
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        ...mockUser,
        ...userData,
      });

      const result = await createUser(userData);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("data");
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("_id");
      expect(result.data).toHaveProperty("name");
      expect(result.data).toHaveProperty("email");
      expect(result.data).toHaveProperty("role");
      expect(result.data).toHaveProperty("rut");
    });
  });
});
