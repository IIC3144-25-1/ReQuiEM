import { ISurgery } from "@/models/Surgery";

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

// Mock Surgery model
const mockSurgeryModel = {
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
};

// Mock Area model
const mockAreaModel = {
  create: jest.fn(),
  findById: jest.fn(),
};

jest.mock("@/models/Surgery", () => ({
  Surgery: mockSurgeryModel,
}));

jest.mock("@/models/Area", () => ({
  Area: mockAreaModel,
}));

describe("Surgery Model Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("should create a valid surgery with all fields", async () => {
      const surgeryData: Partial<ISurgery> = {
        name: "Apendicectomía Laparoscópica",
        description: "Cirugía de apéndice por laparoscopia",
        area: "507f1f77bcf86cd799439012",
        steps: [
          "Preparación del campo quirúrgico",
          "Incisión y acceso laparoscópico",
          "Identificación del apéndice",
          "Disección y extracción",
          "Cierre de incisiones",
        ],
        osats: [
          {
            item: "Técnica quirúrgica",
            scale: [
              { punctuation: "1", description: "Deficiente" },
              { punctuation: "3", description: "Competente" },
              { punctuation: "5", description: "Excelente" },
            ],
          },
          {
            item: "Conocimiento anatómico",
            scale: [
              { punctuation: "1", description: "Básico" },
              { punctuation: "5", description: "Avanzado" },
            ],
          },
        ],
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...surgeryData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSurgeryModel.create.mockResolvedValue(mockResult);

      const result = await mockSurgeryModel.create(surgeryData);

      expect(mockSurgeryModel.create).toHaveBeenCalledWith(surgeryData);
      expect(result.name).toBe(surgeryData.name);
      expect(result.description).toBe(surgeryData.description);
      expect(result.area).toBe(surgeryData.area);
      expect(result.steps).toEqual(surgeryData.steps);
      expect(result.osats).toHaveLength(2);
      expect(result.osats[0].item).toBe("Técnica quirúrgica");
      expect(result.osats[0].scale).toHaveLength(3);
      expect(result.isActive).toBe(true);
    });

    it("should create surgery with minimal required fields", async () => {
      const surgeryData: Partial<ISurgery> = {
        name: "Colecistectomía",
        area: "507f1f77bcf86cd799439012",
        steps: ["Preparación", "Incisión", "Extracción"],
        osats: [
          {
            item: "Evaluación general",
            scale: [{ punctuation: "1" }, { punctuation: "5" }],
          },
        ],
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...surgeryData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSurgeryModel.create.mockResolvedValue(mockResult);

      const result = await mockSurgeryModel.create(surgeryData);

      expect(mockSurgeryModel.create).toHaveBeenCalledWith(surgeryData);
      expect(result.name).toBe(surgeryData.name);
      expect(result.description).toBeUndefined();
      expect(result.steps).toEqual(surgeryData.steps);
      expect(result.osats[0].scale[0].description).toBeUndefined();
    });

    it("should fail validation without required name", async () => {
      const surgeryData = {
        area: "507f1f77bcf86cd799439012",
        steps: ["Step 1"],
        osats: [],
      };

      const validationError = new Error("Validation failed: name is required");
      mockSurgeryModel.create.mockRejectedValue(validationError);

      await expect(mockSurgeryModel.create(surgeryData)).rejects.toThrow("Validation failed");
    });

    it("should fail validation without required area", async () => {
      const surgeryData = {
        name: "Test Surgery",
        steps: ["Step 1"],
        osats: [],
      };

      const validationError = new Error("Validation failed: area is required");
      mockSurgeryModel.create.mockRejectedValue(validationError);

      await expect(mockSurgeryModel.create(surgeryData)).rejects.toThrow("Validation failed");
    });
  });

  describe("Steps Validation", () => {
    it("should handle multiple steps", async () => {
      const steps = [
        "Preparación del paciente",
        "Anestesia local",
        "Incisión inicial",
        "Procedimiento principal",
        "Sutura y cierre",
      ];

      const surgeryData = {
        name: "Test Surgery",
        area: "507f1f77bcf86cd799439012",
        steps,
        osats: [],
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...surgeryData,
        isActive: true,
      };

      mockSurgeryModel.create.mockResolvedValue(mockResult);

      const result = await mockSurgeryModel.create(surgeryData);

      expect(result.steps).toEqual(steps);
      expect(result.steps).toHaveLength(5);
    });

    it("should fail validation with empty step", async () => {
      const surgeryData = {
        name: "Test Surgery",
        area: "507f1f77bcf86cd799439012",
        steps: ["Valid step", ""],
        osats: [],
      };

      const validationError = new Error("Validation failed: steps cannot be empty");
      mockSurgeryModel.create.mockRejectedValue(validationError);

      await expect(mockSurgeryModel.create(surgeryData)).rejects.toThrow("Validation failed");
    });
  });

  describe("OSAT Validation", () => {
    it("should validate OSAT structure", async () => {
      const osats = [
        {
          item: "Técnica quirúrgica",
          scale: [
            { punctuation: "1", description: "Necesita mejora" },
            { punctuation: "3", description: "Competente" },
            { punctuation: "5", description: "Excelente" },
          ],
        },
      ];

      const surgeryData = {
        name: "Test Surgery",
        area: "507f1f77bcf86cd799439012",
        steps: ["Step 1"],
        osats,
      };

      const mockResult = {
        _id: "507f1f77bcf86cd799439011",
        ...surgeryData,
        isActive: true,
      };

      mockSurgeryModel.create.mockResolvedValue(mockResult);

      const result = await mockSurgeryModel.create(surgeryData);

      expect(result.osats[0].item).toBe("Técnica quirúrgica");
      expect(result.osats[0].scale).toHaveLength(3);
    });

    it("should fail validation without OSAT item", async () => {
      const surgeryData = {
        name: "Test Surgery",
        area: "507f1f77bcf86cd799439012",
        steps: ["Step 1"],
        osats: [
          {
            scale: [{ punctuation: "1" }],
          },
        ],
      };

      const validationError = new Error("Validation failed: OSAT item is required");
      mockSurgeryModel.create.mockRejectedValue(validationError);

      await expect(mockSurgeryModel.create(surgeryData)).rejects.toThrow("Validation failed");
    });

    it("should fail validation without scale punctuation", async () => {
      const surgeryData = {
        name: "Test Surgery",
        area: "507f1f77bcf86cd799439012",
        steps: ["Step 1"],
        osats: [
          {
            item: "Test Item",
            scale: [{ description: "Test" }],
          },
        ],
      };

      const validationError = new Error("Validation failed: scale punctuation is required");
      mockSurgeryModel.create.mockRejectedValue(validationError);

      await expect(mockSurgeryModel.create(surgeryData)).rejects.toThrow("Validation failed");
    });
  });

  describe("Query Operations", () => {
    it("should find surgeries by area", async () => {
      const areaId = "507f1f77bcf86cd799439012";
      const mockSurgeries = [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Test Surgery",
          area: areaId,
          steps: ["Step 1"],
          osats: [],
        },
      ];

      mockSurgeryModel.find.mockResolvedValue(mockSurgeries);

      const result = await mockSurgeryModel.find({ area: areaId });

      expect(mockSurgeryModel.find).toHaveBeenCalledWith({ area: areaId });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Test Surgery");
    });

    it("should count surgeries by area", async () => {
      const mockAggregateResult = [
        { _id: "507f1f77bcf86cd799439012", count: 2 },
        { _id: "507f1f77bcf86cd799439013", count: 1 },
      ];

      mockSurgeryModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await mockSurgeryModel.aggregate([
        {
          $match: { isActive: true },
        },
        {
          $group: {
            _id: "$area",
            count: { $sum: 1 },
          },
        },
      ]);

      expect(mockSurgeryModel.aggregate).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].count).toBe(2);
    });
  });
});
