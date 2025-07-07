import { getAllResident } from "@/actions/resident/getAll";

// Mock database connection
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock models
jest.mock("@/models/Resident", () => ({
  Resident: {
    find: jest.fn(),
  },
}));

jest.mock("@/models/User", () => ({
  User: {},
}));

jest.mock("@/models/Area", () => ({
  Area: {},
}));

const mockDbConnect = require("@/lib/dbConnect").default;
const mockResident = require("@/models/Resident").Resident;
const mockUser = require("@/models/User").User;
const mockArea = require("@/models/Area").Area;

describe("getAllResident", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true);
  });

  it("should return all non-deleted residents with populated user and area", async () => {
    const mockResidents = [
      {
        _id: "resident1",
        user: { _id: "user1", name: "Juan Pérez", email: "juan@example.com" },
        area: { _id: "area1", name: "Cirugía General" },
        deleted: false,
      },
      {
        _id: "resident2",
        user: {
          _id: "user2",
          name: "María García",
          email: "maria@example.com",
        },
        area: { _id: "area2", name: "Cardiología" },
        deleted: false,
      },
    ];

    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResidents),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getAllResident();

    expect(result).toEqual(mockResidents);
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockResident.find).toHaveBeenCalled();
  });

  it("should return empty array when no residents exist", async () => {
    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getAllResident();

    expect(result).toEqual([]);
    expect(mockDbConnect).toHaveBeenCalled();
  });

  it("should filter out deleted residents", async () => {
    const mockEquals = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const mockWhere = jest.fn().mockReturnValue({
      equals: mockEquals,
    });

    mockResident.find.mockReturnValue({
      where: mockWhere,
    });

    await getAllResident();

    expect(mockWhere).toHaveBeenCalledWith("deleted");
    expect(mockEquals).toHaveBeenCalledWith(false);
  });

  it("should populate user field", async () => {
    const mockPopulateUser = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: mockPopulateUser,
        }),
      }),
    });

    await getAllResident();

    expect(mockPopulateUser).toHaveBeenCalledWith({
      path: "user",
      model: mockUser,
    });
  });

  it("should populate area field", async () => {
    const mockPopulateArea = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });

    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: mockPopulateArea,
          }),
        }),
      }),
    });

    await getAllResident();

    expect(mockPopulateArea).toHaveBeenCalledWith({
      path: "area",
      model: mockArea,
    });
  });

  it("should use lean query for performance", async () => {
    const mockLean = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });

    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValue({
              lean: mockLean,
            }),
          }),
        }),
      }),
    });

    await getAllResident();

    expect(mockLean).toHaveBeenCalled();
  });

  it("should serialize result properly", async () => {
    const mockResidents = [
      {
        _id: "resident1",
        user: { _id: "user1", name: "Juan Pérez" },
        area: { _id: "area1", name: "Cirugía General" },
        deleted: false,
      },
    ];

    mockResident.find.mockReturnValue({
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValueOnce({
            populate: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockResidents),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getAllResident();

    expect(result).toEqual(mockResidents);
    expect(typeof result[0]).toBe("object");
  });
});
