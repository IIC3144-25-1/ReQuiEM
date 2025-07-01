import { createUser } from "@/actions/user/create";

// Mock the User model
jest.mock("@/models/User", () => ({
  User: {
    create: jest.fn(),
  },
}));

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

describe("User Actions - Create User", () => {
  const mockUserModel = require("@/models/User").User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFormData = (data: Record<string, string | boolean>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, value);
      }
    });
    return formData;
  };

  describe("createUser", () => {
    it("should create a new user successfully with all fields", async () => {
      const userData = {
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        image: "https://example.com/image.jpg",
        rut: "12.345.678-5",
        phone: "+56912345678",
        area: "507f1f77bcf86cd799439011",
        admin: true,
      };

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439011",
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const formData = createFormData(userData);
      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        image: userData.image,
        rut: userData.rut,
        phone: userData.phone,
        area: userData.area,
        admin: userData.admin,
        emailVerified: undefined,
        birthdate: undefined,
      });
      expect(result._id).toBe(mockCreatedUser._id);
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
    });

    it("should create user with minimal required fields", async () => {
      const userData = {
        email: "minimal@example.com",
      };

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439012",
        email: userData.email,
        admin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const formData = createFormData(userData);
      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: userData.email,
        admin: false,
        name: undefined,
        image: undefined,
        emailVerified: undefined,
        rut: undefined,
        phone: undefined,
        birthdate: undefined,
        area: undefined,
      });
      expect(result.email).toBe(userData.email);
    });

    it("should handle date fields correctly", async () => {
      const userData = {
        email: "date@example.com",
        emailVerified: "2023-01-01T00:00:00.000Z",
        birthdate: "1990-05-15T00:00:00.000Z",
      };

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439013",
        email: userData.email,
        emailVerified: new Date(userData.emailVerified),
        birthdate: new Date(userData.birthdate),
        admin: false,
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const formData = createFormData(userData);
      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: userData.email,
        emailVerified: new Date(userData.emailVerified),
        birthdate: new Date(userData.birthdate),
        admin: false,
        name: undefined,
        image: undefined,
        rut: undefined,
        phone: undefined,
        area: undefined,
      });
    });

    it("should handle admin flag correctly", async () => {
      const userData = {
        email: "admin@example.com",
        admin: true,
      };

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439014",
        email: userData.email,
        admin: true,
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const formData = createFormData(userData);
      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          admin: true,
        })
      );
    });

    it("should throw validation error for invalid email", async () => {
      const userData = {
        email: "invalid-email",
      };

      const formData = createFormData(userData);

      await expect(createUser(formData)).rejects.toThrow();
    });

    it("should handle empty FormData", async () => {
      const formData = new FormData();

      await expect(createUser(formData)).rejects.toThrow();
    });

    it("should handle database connection errors", async () => {
      const dbConnect = require("@/lib/dbConnect").default;
      dbConnect.mockRejectedValue(new Error("Database connection failed"));

      const formData = createFormData({ email: "test@example.com" });

      await expect(createUser(formData)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle User.create errors", async () => {
      mockUserModel.create.mockRejectedValue(new Error("User creation failed"));

      const formData = createFormData({ email: "test@example.com" });

      await expect(createUser(formData)).rejects.toThrow(
        "User creation failed"
      );
    });

    it("should serialize the result correctly", async () => {
      const userData = {
        email: "serialize@example.com",
      };

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439017",
        email: userData.email,
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        admin: false,
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const formData = createFormData(userData);
      const result = await createUser(formData);

      // Verify that dates are serialized as strings
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(result.email).toBe(userData.email);
    });

    it("should handle undefined values correctly", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      // Don't append other fields to test undefined handling

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439018",
        email: "test@example.com",
        admin: false,
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: "test@example.com",
        admin: false,
        name: undefined,
        image: undefined,
        emailVerified: undefined,
        rut: undefined,
        phone: undefined,
        birthdate: undefined,
        area: undefined,
      });
    });

    it("should handle empty string values", async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("name", "");
      formData.append("rut", "");

      const mockCreatedUser = {
        _id: "507f1f77bcf86cd799439019",
        email: "test@example.com",
        admin: false,
      };

      mockUserModel.create.mockResolvedValue(mockCreatedUser);

      const result = await createUser(formData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: "test@example.com",
        admin: false,
        name: undefined,
        image: undefined,
        emailVerified: undefined,
        rut: undefined,
        phone: undefined,
        birthdate: undefined,
        area: undefined,
      });
    });
  });
});
