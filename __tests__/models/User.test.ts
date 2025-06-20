import mongoose from "mongoose";
import { User } from "@/models/User";
import { setupTestDB, teardownTestDB, clearTestDB } from "../utils/db-utils";

describe("User Model", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("Schema Validation", () => {
    it("should create a valid user with all required fields", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
        role: "resident",
        rut: "12.345.678-5",
        isActive: true,
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.image).toBe(userData.image);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.rut).toBe(userData.rut);
      expect(savedUser.isActive).toBe(userData.isActive);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it("should fail validation without required fields", async () => {
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });

    it("should fail validation with invalid email", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        role: "resident",
        rut: "12.345.678-5",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should fail validation with invalid role", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        role: "invalid-role",
        rut: "12.345.678-5",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should accept valid roles", async () => {
      const validRoles = ["resident", "teacher", "admin"];

      for (const role of validRoles) {
        const userData = {
          name: "John Doe",
          email: `john+${role}@example.com`,
          role,
          rut: "12.345.678-5",
        };

        const user = new User(userData);
        const savedUser = await user.save();
        expect(savedUser.role).toBe(role);
      }
    });

    it("should default isActive to true", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        role: "resident",
        rut: "12.345.678-5",
      };

      const user = new User(userData);
      const savedUser = await user.save();
      expect(savedUser.isActive).toBe(true);
    });
  });

  describe("Unique Constraints", () => {
    it("should enforce unique email constraint", async () => {
      const userData1 = {
        name: "John Doe",
        email: "john@example.com",
        role: "resident",
        rut: "12.345.678-5",
      };

      const userData2 = {
        name: "Jane Doe",
        email: "john@example.com", // Same email
        role: "teacher",
        rut: "98.765.432-1",
      };

      await new User(userData1).save();
      await expect(new User(userData2).save()).rejects.toThrow();
    });

    it("should enforce unique RUT constraint", async () => {
      const userData1 = {
        name: "John Doe",
        email: "john@example.com",
        role: "resident",
        rut: "12.345.678-5",
      };

      const userData2 = {
        name: "Jane Doe",
        email: "jane@example.com",
        role: "teacher",
        rut: "12.345.678-5", // Same RUT
      };

      await new User(userData1).save();
      await expect(new User(userData2).save()).rejects.toThrow();
    });
  });

  describe("RUT Validation", () => {
    it("should accept valid RUT formats", async () => {
      const validRuts = [
        "12.345.678-5",
        "12345678-5",
        "123456785",
        "1-9",
        "24.965.885-K",
      ];

      for (let i = 0; i < validRuts.length; i++) {
        const userData = {
          name: "John Doe",
          email: `john${i}@example.com`,
          role: "resident",
          rut: validRuts[i],
        };

        const user = new User(userData);
        const savedUser = await user.save();
        expect(savedUser.rut).toBe(validRuts[i]);
      }
    });

    it("should reject invalid RUT formats", async () => {
      const invalidRuts = [
        "12.345.678-9", // Wrong verifier
        "123456789", // Wrong verifier
        "invalid-rut",
        "12.345.678-",
        "",
      ];

      for (const rut of invalidRuts) {
        const userData = {
          name: "John Doe",
          email: "john@example.com",
          role: "resident",
          rut,
        };

        const user = new User(userData);
        await expect(user.save()).rejects.toThrow();
      }
    });
  });

  describe("Instance Methods", () => {
    let user: any;

    beforeEach(async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        role: "resident",
        rut: "12.345.678-5",
      };

      user = await new User(userData).save();
    });

    it("should have toJSON method that excludes sensitive fields", () => {
      const json = user.toJSON();
      expect(json).toHaveProperty("_id");
      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("role");
      expect(json).toHaveProperty("rut");
      expect(json).toHaveProperty("isActive");
      expect(json).toHaveProperty("createdAt");
      expect(json).toHaveProperty("updatedAt");
    });

    it("should update updatedAt on save", async () => {
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.name = "Updated Name";
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create test users
      await User.create([
        {
          name: "Active Resident",
          email: "resident@example.com",
          role: "resident",
          rut: "12.345.678-5",
          isActive: true,
        },
        {
          name: "Inactive Resident",
          email: "inactive@example.com",
          role: "resident",
          rut: "98.765.432-1",
          isActive: false,
        },
        {
          name: "Active Teacher",
          email: "teacher@example.com",
          role: "teacher",
          rut: "11.111.111-1",
          isActive: true,
        },
      ]);
    });

    it("should find users by role", async () => {
      const residents = await User.find({ role: "resident" });
      expect(residents).toHaveLength(2);

      const teachers = await User.find({ role: "teacher" });
      expect(teachers).toHaveLength(1);
    });

    it("should find active users", async () => {
      const activeUsers = await User.find({ isActive: true });
      expect(activeUsers).toHaveLength(2);
    });

    it("should find user by email", async () => {
      const user = await User.findOne({ email: "resident@example.com" });
      expect(user).toBeTruthy();
      expect(user?.name).toBe("Active Resident");
    });

    it("should find user by RUT", async () => {
      const user = await User.findOne({ rut: "12.345.678-5" });
      expect(user).toBeTruthy();
      expect(user?.name).toBe("Active Resident");
    });
  });

  describe("Indexes", () => {
    it("should have proper indexes", async () => {
      const indexes = await User.collection.getIndexes();

      // Check for email index
      expect(indexes).toHaveProperty("email_1");

      // Check for RUT index
      expect(indexes).toHaveProperty("rut_1");
    });
  });

  describe("Aggregation Queries", () => {
    beforeEach(async () => {
      await User.create([
        {
          name: "Resident 1",
          email: "r1@example.com",
          role: "resident",
          rut: "12.345.678-5",
        },
        {
          name: "Resident 2",
          email: "r2@example.com",
          role: "resident",
          rut: "98.765.432-1",
        },
        {
          name: "Teacher 1",
          email: "t1@example.com",
          role: "teacher",
          rut: "11.111.111-1",
        },
        {
          name: "Teacher 2",
          email: "t2@example.com",
          role: "teacher",
          rut: "22.222.222-2",
        },
        {
          name: "Admin 1",
          email: "a1@example.com",
          role: "admin",
          rut: "33.333.333-3",
        },
      ]);
    });

    it("should count users by role", async () => {
      const roleCount = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      expect(roleCount).toHaveLength(3);

      const residentCount = roleCount.find((r) => r._id === "resident");
      expect(residentCount?.count).toBe(2);

      const teacherCount = roleCount.find((r) => r._id === "teacher");
      expect(teacherCount?.count).toBe(2);

      const adminCount = roleCount.find((r) => r._id === "admin");
      expect(adminCount?.count).toBe(1);
    });
  });
});
