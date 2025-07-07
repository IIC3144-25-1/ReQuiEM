import { createSurgery } from "@/actions/surgery/createSurgery";
import { Surgery } from "@/models/Surgery";
import dbConnect from "@/lib/dbConnect";

// Mock dependencies
jest.mock("@/lib/dbConnect");
jest.mock("@/models/Surgery");

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockSurgery = Surgery as jest.Mocked<typeof Surgery>;

describe("createSurgery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(null);
  });

  it("should connect to database", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockDbConnect).toHaveBeenCalledTimes(2); // Called twice in the function
  });

  it("should create surgery with basic information", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    const result = await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [],
    });

    expect(result).toEqual(mockSurgeryDoc);
  });

  it("should create surgery with steps", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");
    formData.append("steps.0", "First step");
    formData.append("steps.1", "Second step");
    formData.append("steps.2", "Third step");

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: ["First step", "Second step", "Third step"],
      osats: [],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: ["First step", "Second step", "Third step"],
      osats: [],
    });
  });

  it("should create surgery with osats", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");
    formData.append("osats.0.item", "First assessment");
    formData.append(
      "osats.0.scale",
      JSON.stringify([
        { punctuation: 1, description: "Poor" },
        { punctuation: 3, description: "Good" },
      ])
    );

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "First assessment",
          scale: [
            { punctuation: "1", description: "Poor" },
            { punctuation: "2", description: "" },
            { punctuation: "3", description: "Good" },
          ],
        },
      ],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "First assessment",
          scale: [
            { punctuation: "1", description: "Poor" },
            { punctuation: "2", description: "" },
            { punctuation: "3", description: "Good" },
          ],
        },
      ],
    });
  });

  it("should handle multiple osats", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");

    formData.append("osats.0.item", "First assessment");
    formData.append(
      "osats.0.scale",
      JSON.stringify([
        { punctuation: 1, description: "Poor" },
        { punctuation: 2, description: "Good" },
      ])
    );

    formData.append("osats.1.item", "Second assessment");
    formData.append(
      "osats.1.scale",
      JSON.stringify([
        { punctuation: 1, description: "Bad" },
        { punctuation: 3, description: "Excellent" },
      ])
    );

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "First assessment",
          scale: [
            { punctuation: "1", description: "Poor" },
            { punctuation: "2", description: "Good" },
          ],
        },
        {
          item: "Second assessment",
          scale: [
            { punctuation: "1", description: "Bad" },
            { punctuation: "2", description: "" },
            { punctuation: "3", description: "Excellent" },
          ],
        },
      ],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "First assessment",
          scale: [
            { punctuation: "1", description: "Poor" },
            { punctuation: "2", description: "Good" },
          ],
        },
        {
          item: "Second assessment",
          scale: [
            { punctuation: "1", description: "Bad" },
            { punctuation: "2", description: "" },
            { punctuation: "3", description: "Excellent" },
          ],
        },
      ],
    });
  });

  it("should handle empty osats scale", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");
    formData.append("osats.0.item", "Assessment");
    formData.append("osats.0.scale", JSON.stringify([]));

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "Assessment",
          scale: [],
        },
      ],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [
        {
          item: "Assessment",
          scale: [],
        },
      ],
    });
  });

  it("should handle database errors", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");

    mockSurgery.create.mockRejectedValue(new Error("Database error"));

    await expect(createSurgery(formData)).rejects.toThrow("Database error");
  });

  it("should return serialized surgery document", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: [],
      osats: [],
      toJSON: () => ({ _id: "surgery123", name: "Test Surgery" }),
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    const result = await createSurgery(formData);

    expect(typeof result).toBe("object");
    expect(result._id).toBe("surgery123");
  });

  it("should handle non-sequential step indices", async () => {
    const formData = new FormData();
    formData.append("name", "Test Surgery");
    formData.append("description", "Test Description");
    formData.append("areaId", "area123");
    formData.append("steps.0", "First step");
    formData.append("steps.2", "Third step");
    formData.append("steps.1", "Second step");

    const mockSurgeryDoc = {
      _id: "surgery123",
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: ["First step", "Second step", "Third step"],
      osats: [],
    };

    mockSurgery.create.mockResolvedValue(mockSurgeryDoc as any);

    await createSurgery(formData);

    expect(mockSurgery.create).toHaveBeenCalledWith({
      name: "Test Surgery",
      description: "Test Description",
      area: "area123",
      steps: ["First step", "Second step", "Third step"],
      osats: [],
    });
  });
});
