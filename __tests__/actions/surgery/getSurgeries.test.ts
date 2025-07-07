import { getSurgeries } from "@/actions/surgery/getSurgeries";

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock models
jest.mock("@/models/Surgery", () => ({
  Surgery: {
    find: jest.fn(),
  },
}));

jest.mock("@/models/Area", () => ({
  Area: {
    find: jest.fn(),
  },
}));

const mockDbConnect = require("@/lib/dbConnect").default;
const mockSurgery = require("@/models/Surgery").Surgery;
const mockArea = require("@/models/Area").Area;

describe("getSurgeries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true);
    mockArea.find.mockResolvedValue([]);
  });

  it("should return all non-deleted surgeries with populated areas", async () => {
    const mockSurgeries = [
      {
        _id: "surgery1",
        name: "Appendectomy",
        deleted: false,
        area: { _id: "area1", name: "Cirugía General" },
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      {
        _id: "surgery2",
        name: "Cholecystectomy",
        deleted: false,
        area: { _id: "area2", name: "Cirugía General" },
        createdAt: "2024-01-02T00:00:00.000Z",
      },
    ];

    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockSurgeries),
          }),
        }),
      }),
    });

    const result = await getSurgeries();

    expect(result).toEqual(mockSurgeries);
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockSurgery.find).toHaveBeenCalledWith({ deleted: false });
  });

  it("should return empty array when no surgeries exist", async () => {
    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const result = await getSurgeries();

    expect(result).toEqual([]);
    expect(mockDbConnect).toHaveBeenCalled();
  });

  it("should filter out deleted surgeries", async () => {
    const mockSurgeries = [
      {
        _id: "surgery1",
        name: "Appendectomy",
        deleted: false,
        area: { _id: "area1", name: "Cirugía General" },
      },
    ];

    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockSurgeries),
          }),
        }),
      }),
    });

    const result = await getSurgeries();

    expect(result).toEqual(mockSurgeries);
    expect(mockSurgery.find).toHaveBeenCalledWith({ deleted: false });
  });

  it("should sort surgeries by creation date descending", async () => {
    const mockSort = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    mockSurgery.find.mockReturnValue({
      sort: mockSort,
    });

    await getSurgeries();

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("should populate area field", async () => {
    const mockPopulate = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: mockPopulate,
      }),
    });

    await getSurgeries();

    expect(mockPopulate).toHaveBeenCalledWith({
      path: "area",
      model: mockArea,
    });
  });

  it("should use lean query for performance", async () => {
    const mockLean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: mockLean,
        }),
      }),
    });

    await getSurgeries();

    expect(mockLean).toHaveBeenCalled();
  });

  it("should ensure Area model is connected", async () => {
    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    await getSurgeries();

    expect(mockArea.find).toHaveBeenCalled();
  });

  it("should serialize result properly", async () => {
    const mockSurgeries = [
      {
        _id: "surgery1",
        name: "Appendectomy",
        deleted: false,
        area: { _id: "area1", name: "Cirugía General" },
      },
    ];

    mockSurgery.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockSurgeries),
          }),
        }),
      }),
    });

    const result = await getSurgeries();

    expect(result).toEqual(mockSurgeries);
    expect(typeof result[0]).toBe("object");
  });
});
