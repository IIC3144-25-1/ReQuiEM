import { logout } from "@/actions/auth/logout";

// Mock NextAuth signOut
jest.mock("@/auth", () => ({
  signOut: jest.fn(),
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("logout", () => {
  const mockSignOut = require("@/auth").signOut;
  const mockRedirect = require("next/navigation").redirect;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call signOut with redirect false", async () => {
    await logout();

    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("should redirect to home page after signOut", async () => {
    await logout();

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("should call signOut before redirect", async () => {
    let signOutCalled = false;
    let redirectCalled = false;

    mockSignOut.mockImplementation(() => {
      signOutCalled = true;
      expect(redirectCalled).toBe(false); // redirect should not be called yet
    });

    mockRedirect.mockImplementation(() => {
      redirectCalled = true;
      expect(signOutCalled).toBe(true); // signOut should be called first
    });

    await logout();

    expect(signOutCalled).toBe(true);
    expect(redirectCalled).toBe(true);
  });

  it("should handle signOut errors gracefully", async () => {
    const error = new Error("SignOut failed");
    mockSignOut.mockRejectedValue(error);

    await expect(logout()).rejects.toThrow("SignOut failed");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
