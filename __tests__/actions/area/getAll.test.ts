import { getAllAreas } from "@/actions/area/getAll";

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Area model
jest.mock("@/models/Area", () => ({
  Area: {
    find: jest.fn(),
  },
}));

const mockDbConnect = require("@/lib/dbConnect").default;
const mockArea = require("@/models/Area").Area;

describe("getAllAreas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true);
  });

  it("should return all non-deleted areas", async () => {
    const mockAreas = [
      { _id: "area1", name: "Cirugía General", deleted: false },
      { _id: "area2", name: "Cardiología", deleted: false },
    ];

    mockArea.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAreas),
      }),
    });

    const result = await getAllAreas();

    expect(result).toEqual(mockAreas);
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockArea.find).toHaveBeenCalledWith({ deleted: false });
  });

  it("should return empty array when no areas exist", async () => {
    mockArea.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await getAllAreas();

    expect(result).toEqual([]);
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockArea.find).toHaveBeenCalledWith({ deleted: false });
  });

  it("should filter out deleted areas", async () => {
    const mockAreas = [
      { _id: "area1", name: "Cirugía General", deleted: false },
    ];

    mockArea.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAreas),
      }),
    });

    const result = await getAllAreas();

    expect(result).toEqual(mockAreas);
    expect(mockArea.find).toHaveBeenCalledWith({ deleted: false });
  });

  it("should handle database connection", async () => {
    mockArea.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    await getAllAreas();

    expect(mockDbConnect).toHaveBeenCalled();
  });

  it("should use lean query for performance", async () => {
    const mockLean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    mockArea.find.mockReturnValue({
      lean: mockLean,
    });

    await getAllAreas();

    expect(mockLean).toHaveBeenCalled();
  });

  it("should serialize result properly", async () => {
    const mockAreas = [
      { _id: "area1", name: "Cirugía General", deleted: false },
    ];

    mockArea.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAreas),
      }),
    });

    const result = await getAllAreas();

    // The result should be plain objects (JSON serialized)
    expect(result).toEqual(mockAreas);
    expect(typeof result[0]).toBe("object");
  });
});
