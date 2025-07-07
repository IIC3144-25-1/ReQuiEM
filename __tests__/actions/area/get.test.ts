import { getArea } from "@/actions/area/get";
import dbConnect from "@/lib/dbConnect";
import { Area } from "@/models/Area";

// Mock the database connection
jest.mock("@/lib/dbConnect");
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;

// Mock the Area model
jest.mock("@/models/Area");
const mockArea = Area as jest.Mocked<typeof Area>;

describe("getArea", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(null);
  });

  it("should connect to database", async () => {
    // Mock the chain of methods
    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValue(null);

    mockArea.findById = mockFindById;
    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    await getArea("123");

    expect(mockDbConnect).toHaveBeenCalled();
  });

  it("should find area by id and exclude deleted ones", async () => {
    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValue(null);

    mockArea.findById = mockFindById;

    // Chain the methods correctly
    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    const areaId = "507f1f77bcf86cd799439011";
    await getArea(areaId);

    expect(mockFindById).toHaveBeenCalledWith(areaId);
    expect(mockWhere).toHaveBeenCalledWith("deleted");
    expect(mockEquals).toHaveBeenCalledWith(false);
  });

  it("should populate residents and teachers", async () => {
    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValue(null);

    mockArea.findById = mockFindById;

    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    await getArea("123");

    expect(mockPopulate).toHaveBeenCalledWith({
      path: "residents",
      model: expect.anything(),
    });
    expect(mockPopulate).toHaveBeenCalledWith({
      path: "teachers",
      model: expect.anything(),
    });
  });

  it("should return area data when found", async () => {
    const mockAreaData = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test Area",
      description: "Test Description",
      residents: [],
      teachers: [],
      deleted: false,
    };

    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValue(mockAreaData);

    mockArea.findById = mockFindById;

    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    const result = await getArea("507f1f77bcf86cd799439011");

    expect(result).toEqual(mockAreaData);
  });

  it("should return null when area not found", async () => {
    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockResolvedValue(null);

    mockArea.findById = mockFindById;

    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    const result = await getArea("nonexistent");

    expect(result).toBeNull();
  });

  it("should handle database errors", async () => {
    const mockFindById = jest.fn().mockReturnThis();
    const mockWhere = jest.fn().mockReturnThis();
    const mockEquals = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockReturnThis();
    const mockExec = jest.fn().mockRejectedValue(new Error("Database error"));

    mockArea.findById = mockFindById;

    mockFindById.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      equals: mockEquals,
    });
    mockEquals.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      populate: mockPopulate,
    });
    mockPopulate.mockReturnValue({
      lean: mockLean,
    });
    mockLean.mockReturnValue({
      exec: mockExec,
    });

    await expect(getArea("123")).rejects.toThrow("Database error");
  });
});
