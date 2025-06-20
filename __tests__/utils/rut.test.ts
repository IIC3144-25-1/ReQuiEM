import {
  cleanRut,
  calculateVerifierDigit,
  formatRut,
  validateRut,
} from "@/utils/rut";

describe("RUT Utilities", () => {
  describe("cleanRut", () => {
    it("should remove dots and hyphens", () => {
      expect(cleanRut("12.345.678-9")).toBe("123456789");
      expect(cleanRut("1.111.111-K")).toBe("1111111K");
      expect(cleanRut("12345678-9")).toBe("123456789");
    });

    it("should convert to uppercase", () => {
      expect(cleanRut("1111111k")).toBe("1111111K");
      expect(cleanRut("12345678k")).toBe("12345678K");
    });

    it("should handle edge cases", () => {
      expect(cleanRut("")).toBe("");
      expect(cleanRut(null as any)).toBe("");
      expect(cleanRut(undefined as any)).toBe("");
      expect(cleanRut("abc")).toBe("");
    });

    it("should remove all non-alphanumeric characters except K", () => {
      expect(cleanRut("12.345.678-9")).toBe("123456789");
      expect(cleanRut("12 345 678 9")).toBe("123456789");
      expect(cleanRut("12/345/678-9")).toBe("123456789");
    });

    it("should preserve numbers and K only", () => {
      expect(cleanRut("12345678K")).toBe("12345678K");
      expect(cleanRut("1a2b3c4d5e6f7g8hK")).toBe("12345678K");
    });
  });

  describe("calculateVerifierDigit", () => {
    it("should calculate correct verifier digits", () => {
      expect(calculateVerifierDigit("12345678")).toBe("5");
      expect(calculateVerifierDigit("11111111")).toBe("1");
      expect(calculateVerifierDigit("1111111")).toBe("4");
      expect(calculateVerifierDigit("24965885")).toBe("5");
    });

    it("should handle edge cases", () => {
      expect(calculateVerifierDigit("")).toBe("");
      expect(calculateVerifierDigit(null as any)).toBe("");
      expect(calculateVerifierDigit(undefined as any)).toBe("");
    });

    it("should handle single digit numbers", () => {
      expect(calculateVerifierDigit("1")).toBe("9");
      expect(calculateVerifierDigit("2")).toBe("7");
      expect(calculateVerifierDigit("3")).toBe("5");
    });

    it("should handle various length numbers", () => {
      expect(calculateVerifierDigit("123")).toBe("6");
      expect(calculateVerifierDigit("1234")).toBe("3");
      expect(calculateVerifierDigit("12345")).toBe("5");
      expect(calculateVerifierDigit("123456")).toBe("0");
      expect(calculateVerifierDigit("1234567")).toBe("4");
    });

    it("should return 0 for remainder 0", () => {
      expect(calculateVerifierDigit("123456")).toBe("0");
    });

    it("should return K for remainder 1", () => {
      expect(calculateVerifierDigit("8888888")).toBe("K");
    });
  });

  describe("formatRut", () => {
    it("should format RUT with dots and hyphen", () => {
      expect(formatRut("123456785")).toBe("12.345.678-5");
      expect(formatRut("111111111")).toBe("11.111.111-1");
      expect(formatRut("1111111K")).toBe("1.111.111-K");
    });

    it("should handle already formatted RUTs", () => {
      expect(formatRut("12.345.678-5")).toBe("12.345.678-5");
      expect(formatRut("1.111.111-K")).toBe("1.111.111-K");
    });

    it("should handle short RUTs", () => {
      expect(formatRut("12")).toBe("1-2");
      expect(formatRut("123")).toBe("12-3");
      expect(formatRut("1234")).toBe("123-4");
    });

    it("should handle very short inputs", () => {
      expect(formatRut("1")).toBe("1");
      expect(formatRut("")).toBe("");
    });

    it("should handle edge cases", () => {
      expect(formatRut(null as any)).toBe("");
      expect(formatRut(undefined as any)).toBe("");
    });

    it("should format different length RUTs correctly", () => {
      expect(formatRut("12345")).toBe("1.234-5");
      expect(formatRut("123456")).toBe("12.345-6");
      expect(formatRut("1234567")).toBe("123.456-7");
      expect(formatRut("12345678")).toBe("1.234.567-8");
      expect(formatRut("123456789")).toBe("12.345.678-9");
    });

    it("should preserve K verifier digit", () => {
      expect(formatRut("1111111k")).toBe("1.111.111-K");
      expect(formatRut("8888888K")).toBe("8.888.888-K");
    });
  });

  describe("validateRut", () => {
    it("should validate correct RUTs", () => {
      expect(validateRut("12.345.678-5")).toBe(true);
      expect(validateRut("11.111.111-1")).toBe(true);
      expect(validateRut("1.111.111-4")).toBe(true);
      expect(validateRut("8.888.888-K")).toBe(true);
    });

    it("should validate RUTs without formatting", () => {
      expect(validateRut("123456785")).toBe(true);
      expect(validateRut("111111111")).toBe(true);
      expect(validateRut("11111114")).toBe(true);
      expect(validateRut("8888888K")).toBe(true);
    });

    it("should reject invalid RUTs", () => {
      expect(validateRut("12.345.678-9")).toBe(false); // Wrong verifier
      expect(validateRut("11.111.111-2")).toBe(false); // Wrong verifier
      expect(validateRut("123456789")).toBe(false); // Wrong verifier
      expect(validateRut("111111112")).toBe(false); // Wrong verifier
    });

    it("should handle edge cases", () => {
      expect(validateRut("")).toBe(false);
      expect(validateRut(null as any)).toBe(false);
      expect(validateRut(undefined as any)).toBe(false);
      expect(validateRut(" ")).toBe(false);
    });

    it("should handle malformed RUTs", () => {
      expect(validateRut("abc")).toBe(false);
      expect(validateRut("12.345.678")).toBe(false); // Missing verifier
      expect(validateRut("12.345.678-")).toBe(false); // Missing verifier
      expect(validateRut("12.345.678-55")).toBe(false); // Invalid verifier
      expect(validateRut("1234567890123456789")).toBe(false); // Too long
    });

    it("should handle case insensitive K", () => {
      expect(validateRut("8.888.888-k")).toBe(true);
      expect(validateRut("8.888.888-K")).toBe(true);
      expect(validateRut("8888888k")).toBe(true);
      expect(validateRut("8888888K")).toBe(true);
    });

    it("should trim whitespace", () => {
      expect(validateRut("  12.345.678-5  ")).toBe(true);
      expect(validateRut("  8888888K  ")).toBe(true);
    });

    it("should reject RUTs with letters in body", () => {
      expect(validateRut("12a45678-5")).toBe(false);
      expect(validateRut("1a.111.111-1")).toBe(false);
    });

    it("should reject too short RUTs", () => {
      expect(validateRut("1")).toBe(false);
      expect(validateRut("12")).toBe(false); // Need at least 2 chars but this would be 1 digit + 1 verifier
    });

    it("should validate minimum length RUTs", () => {
      expect(validateRut("19")).toBe(true); // 1 + verifier 9
      expect(validateRut("27")).toBe(true); // 2 + verifier 7
    });

    it("should reject invalid verifier characters", () => {
      expect(validateRut("1111111X")).toBe(false);
      expect(validateRut("1111111Y")).toBe(false);
      expect(validateRut("1111111-")).toBe(false);
    });
  });

  describe("Integration Tests", () => {
    it("should work together for complete RUT processing", () => {
      const inputRut = "  12.345.678-5  ";

      // Clean the RUT
      const cleaned = cleanRut(inputRut);
      expect(cleaned).toBe("123456785");

      // Validate the RUT
      const isValid = validateRut(inputRut);
      expect(isValid).toBe(true);

      // Format the RUT
      const formatted = formatRut(cleaned);
      expect(formatted).toBe("12.345.678-5");
    });

    it("should handle invalid RUT workflow", () => {
      const invalidRut = "12.345.678-9";

      expect(validateRut(invalidRut)).toBe(false);

      // Should still clean and format even if invalid
      const cleaned = cleanRut(invalidRut);
      expect(cleaned).toBe("123456789");

      const formatted = formatRut(cleaned);
      expect(formatted).toBe("12.345.678-9");
    });

    it("should calculate and validate verifier digits", () => {
      const rutBody = "12345678";
      const verifier = calculateVerifierDigit(rutBody);
      expect(verifier).toBe("5");

      const fullRut = rutBody + verifier;
      expect(validateRut(fullRut)).toBe(true);

      const formatted = formatRut(fullRut);
      expect(formatted).toBe("12.345.678-5");
    });
  });

  describe("Performance Tests", () => {
    it("should handle large numbers of RUTs efficiently", () => {
      const ruts = Array.from({ length: 1000 }, (_, i) => {
        const base = (10000000 + i).toString();
        const verifier = calculateVerifierDigit(base);
        return base + verifier;
      });

      const startTime = Date.now();

      ruts.forEach((rut) => {
        validateRut(rut);
        formatRut(rut);
        cleanRut(rut);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });
  });

  describe("Real Chilean RUTs", () => {
    it("should validate known valid Chilean RUTs", () => {
      const validRuts = [
        "7.775.777-5",
        "8.888.888-K",
        "9.999.999-3",
        "10.000.000-8",
      ];

      validRuts.forEach((rut) => {
        expect(validateRut(rut)).toBe(true);
      });
    });
  });
});
