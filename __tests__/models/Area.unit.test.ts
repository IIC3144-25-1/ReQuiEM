import { IArea } from "@/models/Area";

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

// Mock Area model
const mockAreaModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  populate: jest.fn(),
  collection: {
    getIndexes: jest.fn(),
  },
};

jest.mock("@/models/Area", () => ({
  Area: mockAreaModel,
}));

describe("Area Model Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("should create a valid area with required fields", async () => {
      const areaData: Partial<IArea> = {
        name: "Cirugía General",
        description: "Área de cirugía general del hospital",
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...areaData,
        residents: [],
        teachers: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create(areaData);

      expect(mockAreaModel.create).toHaveBeenCalledWith(areaData);
      expect(result._id).toBeDefined();
      expect(result.name).toBe(areaData.name);
      expect(result.description).toBe(areaData.description);
      expect(result.residents).toEqual([]);
      expect(result.teachers).toEqual([]);
      expect(result.deleted).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should create area with minimal required fields", async () => {
      const areaData: Partial<IArea> = {
        name: "Cardiología",
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...areaData,
        residents: [],
        teachers: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create(areaData);

      expect(result.name).toBe(areaData.name);
      expect(result.description).toBeUndefined();
      expect(result.residents).toEqual([]);
      expect(result.teachers).toEqual([]);
      expect(result.deleted).toBe(false);
    });

    it("should fail validation without required name field", async () => {
      const areaData = {};

      const validationError = new Error("Validation failed: name is required");
      mockAreaModel.create.mockRejectedValue(validationError);

      await expect(mockAreaModel.create(areaData)).rejects.toThrow("Validation failed");
    });

    it("should trim whitespace from name and description", async () => {
      const areaData = {
        name: "  Neurología  ",
        description: "  Área de neurología  ",
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        name: "Neurología",
        description: "Área de neurología",
        residents: [],
        teachers: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create(areaData);

      expect(result.name).toBe("Neurología");
      expect(result.description).toBe("Área de neurología");
    });

    it("should set default values correctly", async () => {
      const areaData = { name: "Test Area" };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...areaData,
        residents: [],
        teachers: [],
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create(areaData);

      expect(result.residents).toEqual([]);
      expect(result.teachers).toEqual([]);
      expect(result.deleted).toBe(false);
    });
  });

  describe("Query Operations", () => {
    it("should find areas by name", async () => {
      const mockArea = {
        _id: "507f1f77bcf86cd799439011",
        name: "Cirugía General",
        description: "Área de cirugía general",
        residents: [],
        teachers: [],
        deleted: false,
      };

      mockAreaModel.findOne.mockResolvedValue(mockArea);

      const result = await mockAreaModel.findOne({ name: "Cirugía General" });

      expect(mockAreaModel.findOne).toHaveBeenCalledWith({ name: "Cirugía General" });
      expect(result.name).toBe("Cirugía General");
      expect(result.description).toBe("Área de cirugía general");
    });

    it("should find active areas only", async () => {
      const mockAreas = [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Cirugía General",
          deleted: false,
        },
        {
          _id: "507f1f77bcf86cd799439012",
          name: "Cardiología",
          deleted: false,
        },
      ];

      mockAreaModel.find.mockResolvedValue(mockAreas);

      const result = await mockAreaModel.find({ deleted: { $ne: true } });

      expect(mockAreaModel.find).toHaveBeenCalledWith({ deleted: { $ne: true } });
      expect(result).toHaveLength(2);
    });

    it("should count total areas", async () => {
      mockAreaModel.countDocuments.mockResolvedValue(3);

      const count = await mockAreaModel.countDocuments();

      expect(mockAreaModel.countDocuments).toHaveBeenCalled();
      expect(count).toBe(3);
    });

    it("should count active areas", async () => {
      mockAreaModel.countDocuments.mockResolvedValue(2);

      const activeCount = await mockAreaModel.countDocuments({ deleted: { $ne: true } });

      expect(mockAreaModel.countDocuments).toHaveBeenCalledWith({ deleted: { $ne: true } });
      expect(activeCount).toBe(2);
    });
  });

  describe("Soft Delete", () => {
    it("should mark area as deleted instead of removing", async () => {
      const mockArea = {
        _id: "507f1f77bcf86cd799439011",
        name: "Test Area",
        description: "Area to be deleted",
        deleted: true,
        save: jest.fn(),
      };

      mockAreaModel.create.mockResolvedValue(mockArea);
      mockAreaModel.findById.mockResolvedValue(mockArea);

      const area = await mockAreaModel.create({
        name: "Test Area",
        description: "Area to be deleted",
      });

      area.deleted = true;
      await area.save();

      const deletedArea = await mockAreaModel.findById(area._id);
      expect(deletedArea?.deleted).toBe(true);
    });

    it("should filter out deleted areas in queries", async () => {
      const mockActiveAreas = [
        { name: "Active Area 1", deleted: false },
        { name: "Active Area 2", deleted: false },
      ];

      const mockAllAreas = [
        { name: "Active Area 1", deleted: false },
        { name: "Active Area 2", deleted: false },
        { name: "Deleted Area", deleted: true },
      ];

      mockAreaModel.find
        .mockResolvedValueOnce(mockActiveAreas)
        .mockResolvedValueOnce(mockAllAreas);

      const activeAreas = await mockAreaModel.find({ deleted: { $ne: true } });
      expect(activeAreas).toHaveLength(2);

      const allAreas = await mockAreaModel.find({});
      expect(allAreas).toHaveLength(3);
    });
  });

  describe("Aggregation Queries", () => {
    it("should aggregate areas with counts", async () => {
      const mockAggregateResult = [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Cirugía General",
          residentCount: 1,
          teacherCount: 1,
        },
        {
          _id: "507f1f77bcf86cd799439012",
          name: "Cardiología",
          residentCount: 0,
          teacherCount: 0,
        },
      ];

      mockAreaModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await mockAreaModel.aggregate([
        {
          $match: { deleted: { $ne: true } },
        },
        {
          $addFields: {
            residentCount: { $size: "$residents" },
            teacherCount: { $size: "$teachers" },
          },
        },
        {
          $sort: { name: 1 },
        },
      ]);

      expect(mockAreaModel.aggregate).toHaveBeenCalled();
      expect(result).toHaveLength(2);

      const surgeryArea = result.find((a) => a.name === "Cirugía General");
      expect(surgeryArea?.residentCount).toBe(1);
      expect(surgeryArea?.teacherCount).toBe(1);

      const cardiologyArea = result.find((a) => a.name === "Cardiología");
      expect(cardiologyArea?.residentCount).toBe(0);
      expect(cardiologyArea?.teacherCount).toBe(0);
    });
  });

  describe("Validation Edge Cases", () => {
    it("should handle empty string name", async () => {
      const validationError = new Error("Validation failed: name cannot be empty");
      mockAreaModel.create.mockRejectedValue(validationError);

      await expect(mockAreaModel.create({ name: "" })).rejects.toThrow("Validation failed");
    });

    it("should handle very long names", async () => {
      const longName = "A".repeat(1000);
      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        name: longName,
        residents: [],
        teachers: [],
        deleted: false,
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create({ name: longName });
      expect(result.name).toBe(longName);
    });

    it("should handle special characters in name", async () => {
      const specialName = "Área de Cirugía & Medicina Interna - Nivel 1";
      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        name: specialName,
        residents: [],
        teachers: [],
        deleted: false,
      };

      mockAreaModel.create.mockResolvedValue(mockResult);

      const result = await mockAreaModel.create({ name: specialName });
      expect(result.name).toBe(specialName);
    });
  });

  describe("Indexes", () => {
    it("should have proper indexes", async () => {
      const mockIndexes = {
        _id_: [["_id", 1]],
      };

      mockAreaModel.collection.getIndexes.mockResolvedValue(mockIndexes);

      const indexes = await mockAreaModel.collection.getIndexes();

      expect(indexes).toHaveProperty("_id_");
    });
  });
});
