import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Mock mongoose
jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

const mockConnect = mongoose.connect as jest.MockedFunction<
  typeof mongoose.connect
>;

// Mock process.env
const originalEnv = process.env;

describe("dbConnect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global mongoose cache
    (global as any).mongoose = {
      conn: null,
      promise: null,
    };
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw error if MONGODB_URI is not defined", async () => {
    delete process.env.MONGODB_URI;

    // Reset the module to force re-evaluation
    jest.resetModules();

    await expect(async () => {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
    }).rejects.toThrow(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  });

  it("should connect to database when MONGODB_URI is defined", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    mockConnect.mockResolvedValue(mockConnection);

    const result = await dbConnect();

    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    expect(result).toBe(mockConnection);
  });

  it("should return cached connection if it exists", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    // Set up cached connection
    (global as any).mongoose = {
      conn: mockConnection,
      promise: null,
    };

    const result = await dbConnect();

    expect(mockConnect).not.toHaveBeenCalled();
    expect(result).toBe(mockConnection);
  });

  it("should return existing promise if connection is in progress", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    const mockPromise = Promise.resolve(mockConnection);

    // Set up cached promise
    (global as any).mongoose = {
      conn: null,
      promise: mockPromise,
    };

    const result = await dbConnect();

    expect(mockConnect).not.toHaveBeenCalled();
    expect(result).toBe(mockConnection);
  });

  it("should handle connection errors", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const connectionError = new Error("Connection failed");
    mockConnect.mockRejectedValue(connectionError);

    await expect(dbConnect()).rejects.toThrow("Connection failed");
  });

  it("should use correct connection options", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    mockConnect.mockResolvedValue(mockConnection);

    await dbConnect();

    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  });

  it("should initialize global mongoose object if not exists", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    // Clear global mongoose
    delete (global as any).mongoose;

    const mockConnection = {} as any;
    mockConnect.mockResolvedValue(mockConnection);

    await dbConnect();

    expect((global as any).mongoose).toBeDefined();
    expect((global as any).mongoose.conn).toBe(mockConnection);
    expect((global as any).mongoose.promise).toBeDefined();
  });

  it("should cache connection after successful connect", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    mockConnect.mockResolvedValue(mockConnection);

    // First call
    await dbConnect();
    expect(mockConnect).toHaveBeenCalledTimes(1);

    // Second call should use cached connection
    const result = await dbConnect();
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockConnection);
  });

  it("should handle different MongoDB URI formats", async () => {
    const uris = [
      "mongodb://localhost:27017/testdb",
      "mongodb://user:pass@localhost:27017/testdb",
      "mongodb+srv://user:pass@cluster.mongodb.net/testdb",
      "mongodb://localhost:27017,localhost:27018/testdb?replicaSet=rs0",
    ];

    for (const uri of uris) {
      process.env.MONGODB_URI = uri;

      // Reset cache
      (global as any).mongoose = {
        conn: null,
        promise: null,
      };

      const mockConnection = {} as any;
      mockConnect.mockResolvedValue(mockConnection);

      await dbConnect();

      expect(mockConnect).toHaveBeenCalledWith(uri, {
        bufferCommands: false,
      });

      jest.clearAllMocks();
    }
  });

  it("should handle concurrent connection attempts", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

    const mockConnection = {} as any;
    mockConnect.mockResolvedValue(mockConnection);

    // Make multiple concurrent calls
    const promises = [dbConnect(), dbConnect(), dbConnect()];

    const results = await Promise.all(promises);

    // Should only connect once
    expect(mockConnect).toHaveBeenCalledTimes(1);

    // All should return same connection
    results.forEach((result) => {
      expect(result).toBe(mockConnection);
    });
  });
});
