import { loginWithGoogle, loginWithMicrosoft } from "@/actions/auth/login";
import { signIn } from "@/auth";

// Mock the auth module
jest.mock("@/auth");
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe("Auth Login Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginWithGoogle", () => {
    it("should call signIn with google provider and default redirect", async () => {
      await loginWithGoogle({ redirectTo: null });

      expect(mockSignIn).toHaveBeenCalledWith("google", {
        redirectTo: "/",
      });
    });

    it("should call signIn with google provider and custom redirect", async () => {
      const customRedirect = "/dashboard";
      await loginWithGoogle({ redirectTo: customRedirect });

      expect(mockSignIn).toHaveBeenCalledWith("google", {
        redirectTo: customRedirect,
      });
    });

    it("should handle empty string redirect", async () => {
      await loginWithGoogle({ redirectTo: "" });

      expect(mockSignIn).toHaveBeenCalledWith("google", {
        redirectTo: "/",
      });
    });

    it("should handle signIn errors", async () => {
      mockSignIn.mockRejectedValue(new Error("Authentication failed"));

      await expect(loginWithGoogle({ redirectTo: null })).rejects.toThrow(
        "Authentication failed"
      );
    });
  });

  describe("loginWithMicrosoft", () => {
    it("should call signIn with microsoft provider and default redirect", async () => {
      await loginWithMicrosoft({ redirectTo: null });

      expect(mockSignIn).toHaveBeenCalledWith("microsoft-entra-id", {
        redirectTo: "/",
      });
    });

    it("should call signIn with microsoft provider and custom redirect", async () => {
      const customRedirect = "/profile";
      await loginWithMicrosoft({ redirectTo: customRedirect });

      expect(mockSignIn).toHaveBeenCalledWith("microsoft-entra-id", {
        redirectTo: customRedirect,
      });
    });

    it("should handle empty string redirect", async () => {
      await loginWithMicrosoft({ redirectTo: "" });

      expect(mockSignIn).toHaveBeenCalledWith("microsoft-entra-id", {
        redirectTo: "/",
      });
    });

    it("should handle signIn errors", async () => {
      mockSignIn.mockRejectedValue(new Error("Microsoft auth failed"));

      await expect(loginWithMicrosoft({ redirectTo: null })).rejects.toThrow(
        "Microsoft auth failed"
      );
    });
  });

  describe("Provider consistency", () => {
    it("should use correct provider names", async () => {
      await loginWithGoogle({ redirectTo: null });
      await loginWithMicrosoft({ redirectTo: null });

      expect(mockSignIn).toHaveBeenCalledWith("google", expect.any(Object));
      expect(mockSignIn).toHaveBeenCalledWith(
        "microsoft-entra-id",
        expect.any(Object)
      );
    });

    it("should both functions handle null redirectTo the same way", async () => {
      await loginWithGoogle({ redirectTo: null });
      await loginWithMicrosoft({ redirectTo: null });

      expect(mockSignIn).toHaveBeenNthCalledWith(1, "google", {
        redirectTo: "/",
      });
      expect(mockSignIn).toHaveBeenNthCalledWith(2, "microsoft-entra-id", {
        redirectTo: "/",
      });
    });
  });
});
