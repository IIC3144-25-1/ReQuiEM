import { getRole, getRoleAndArea } from "@/actions/user/getRole";

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock getCurrentUser
jest.mock("@/actions/user/getUser", () => ({
  getCurrentUser: jest.fn(),
}));

// Mock models
jest.mock("@/models/Teacher", () => ({
  Teacher: {
    exists: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("@/models/Resident", () => ({
  Resident: {
    exists: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("@/models/Area", () => ({
  Area: {
    findOne: jest.fn(),
  },
}));

jest.mock("@/models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

const mockDbConnect = require("@/lib/dbConnect").default;
const mockGetCurrentUser = require("@/actions/user/getUser").getCurrentUser;
const mockTeacher = require("@/models/Teacher").Teacher;
const mockResident = require("@/models/Resident").Resident;
const mockArea = require("@/models/Area").Area;
const mockUser = require("@/models/User").User;

describe("User Role Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true);
  });

  describe("getRole", () => {
    it("should return null when no user is found", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await getRole();

      expect(result).toBeNull();
      expect(mockDbConnect).toHaveBeenCalled();
    });

    it("should return admin role for admin user", async () => {
      const mockUser = { _id: "user123", admin: true };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockTeacher.exists.mockResolvedValue(null);
      mockResident.exists.mockResolvedValue(null);

      const result = await getRole();

      expect(result).toEqual({
        isAdmin: true,
        role: null,
      });
      expect(mockTeacher.exists).toHaveBeenCalledWith({
        user: "user123",
        deleted: false,
      });
      expect(mockResident.exists).toHaveBeenCalledWith({
        user: "user123",
        deleted: false,
      });
    });

    it("should return teacher role for teacher user", async () => {
      const mockUser = { _id: "user123", admin: false };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockTeacher.exists.mockResolvedValue({ _id: "teacher123" });
      mockResident.exists.mockResolvedValue(null);

      const result = await getRole();

      expect(result).toEqual({
        isAdmin: false,
        role: "teacher",
      });
    });

    it("should return resident role for resident user", async () => {
      const mockUser = { _id: "user123", admin: false };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockTeacher.exists.mockResolvedValue(null);
      mockResident.exists.mockResolvedValue({ _id: "resident123" });

      const result = await getRole();

      expect(result).toEqual({
        isAdmin: false,
        role: "resident",
      });
    });

    it("should return admin true and teacher role for admin teacher", async () => {
      const mockUser = { _id: "user123", admin: true };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockTeacher.exists.mockResolvedValue({ _id: "teacher123" });
      mockResident.exists.mockResolvedValue(null);

      const result = await getRole();

      expect(result).toEqual({
        isAdmin: true,
        role: "teacher",
      });
    });

    it("should prioritize teacher role over resident role", async () => {
      const mockUser = { _id: "user123", admin: false };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockTeacher.exists.mockResolvedValue({ _id: "teacher123" });
      mockResident.exists.mockResolvedValue({ _id: "resident123" });

      const result = await getRole();

      expect(result).toEqual({
        isAdmin: false,
        role: "teacher",
      });
    });
  });

  describe("getRoleAndArea", () => {
    it("should return null when user is not found", async () => {
      mockUser.findById.mockResolvedValue(null);

      const result = await getRoleAndArea("user123");

      expect(result).toBeNull();
      expect(mockDbConnect).toHaveBeenCalled();
    });

    it("should return admin info with no role when user has no role", async () => {
      const mockUserDoc = { _id: "user123", admin: true };
      mockUser.findById.mockResolvedValue(mockUserDoc);
      mockResident.findOne.mockResolvedValue(null);
      mockTeacher.findOne.mockResolvedValue(null);

      const result = await getRoleAndArea("user123");

      expect(result).toEqual({
        isAdmin: true,
        strRole: null,
        area: null,
      });
    });

    it("should return resident role with area", async () => {
      const mockUserDoc = { _id: "user123", admin: false };
      const mockResidentDoc = { _id: "resident123", user: "user123" };
      const mockAreaDoc = { _id: "area123", name: "Cirugía General" };

      mockUser.findById.mockResolvedValue(mockUserDoc);
      mockResident.findOne.mockResolvedValue(mockResidentDoc);
      mockArea.findOne.mockResolvedValue(mockAreaDoc);

      const result = await getRoleAndArea("user123");

      expect(result).toEqual({
        isAdmin: false,
        strRole: "Residente",
        area: "Cirugía General",
      });
      expect(mockArea.findOne).toHaveBeenCalledWith({
        $or: [
          { residents: { $in: ["resident123"] } },
          { teachers: { $in: ["resident123"] } },
        ],
      });
    });

    it("should return teacher role with area", async () => {
      const mockUserDoc = { _id: "user123", admin: false };
      const mockTeacherDoc = { _id: "teacher123", user: "user123" };
      const mockAreaDoc = { _id: "area123", name: "Neurología" };

      mockUser.findById.mockResolvedValue(mockUserDoc);
      mockResident.findOne.mockResolvedValue(null);
      mockTeacher.findOne.mockResolvedValue(mockTeacherDoc);
      mockArea.findOne.mockResolvedValue(mockAreaDoc);

      const result = await getRoleAndArea("user123");

      expect(result).toEqual({
        isAdmin: false,
        strRole: "Profesor",
        area: "Neurología",
      });
    });

    it("should return empty string for area when no area is found", async () => {
      const mockUserDoc = { _id: "user123", admin: false };
      const mockResidentDoc = { _id: "resident123", user: "user123" };

      mockUser.findById.mockResolvedValue(mockUserDoc);
      mockResident.findOne.mockResolvedValue(mockResidentDoc);
      mockArea.findOne.mockResolvedValue(null);

      const result = await getRoleAndArea("user123");

      expect(result).toEqual({
        isAdmin: false,
        strRole: "Residente",
        area: "",
      });
    });

    it("should handle admin teacher with area", async () => {
      const mockUserDoc = { _id: "user123", admin: true };
      const mockTeacherDoc = { _id: "teacher123", user: "user123" };
      const mockAreaDoc = { _id: "area123", name: "Cardiología" };

      mockUser.findById.mockResolvedValue(mockUserDoc);
      mockResident.findOne.mockResolvedValue(null);
      mockTeacher.findOne.mockResolvedValue(mockTeacherDoc);
      mockArea.findOne.mockResolvedValue(mockAreaDoc);

      const result = await getRoleAndArea("user123");

      expect(result).toEqual({
        isAdmin: true,
        strRole: "Profesor",
        area: "Cardiología",
      });
    });
  });
});
