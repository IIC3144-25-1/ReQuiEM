import {
  validateRut,
  formatRut,
  cleanRut,
  calculateVerifierDigit,
} from "@/utils/rut";

describe("RUT Validation Utilities", () => {
  describe("cleanRut", () => {
    it("should remove dots and hyphens from RUT", () => {
      expect(cleanRut("12.345.678-9")).toBe("123456789");
      expect(cleanRut("12345678-9")).toBe("123456789");
      expect(cleanRut("12.345.678-K")).toBe("12345678K");
    });

    it("should handle empty or invalid input", () => {
      expect(cleanRut("")).toBe("");
      expect(cleanRut(null as any)).toBe("");
      expect(cleanRut(undefined as any)).toBe("");
    });

    it("should convert to uppercase", () => {
      expect(cleanRut("12345678-k")).toBe("12345678K");
    });
  });

  describe("calculateVerifierDigit", () => {
    it("should calculate correct verifier digit for valid RUTs", () => {
      expect(calculateVerifierDigit("12345678")).toBe("5");
      expect(calculateVerifierDigit("11111111")).toBe("1");
      expect(calculateVerifierDigit("22222222")).toBe("2");
      expect(calculateVerifierDigit("9999999")).toBe("3"); // Corrected from '6' to '3'
    });

    it("should return K for verifier digit 10", () => {
      expect(calculateVerifierDigit("1000005")).toBe("K"); // Correct example that returns K
    });

    it("should handle edge cases", () => {
      expect(calculateVerifierDigit("1")).toBe("9");
      expect(calculateVerifierDigit("12")).toBe("4"); // Corrected from '6' to '4'
    });
  });

  describe("formatRut", () => {
    it("should format RUT with dots and hyphen", () => {
      expect(formatRut("123456789")).toBe("12.345.678-9");
      expect(formatRut("12345678K")).toBe("12.345.678-K");
      expect(formatRut("1234567")).toBe("123.456-7");
    });

    it("should handle short RUTs", () => {
      expect(formatRut("12345")).toBe("1.234-5");
      expect(formatRut("1234")).toBe("123-4");
      expect(formatRut("123")).toBe("12-3");
    });

    it("should handle very short RUTs", () => {
      expect(formatRut("12")).toBe("1-2");
      expect(formatRut("1")).toBe("1");
    });

    it("should handle empty input", () => {
      expect(formatRut("")).toBe("");
    });
  });

  describe("validateRut", () => {
    describe("valid RUTs", () => {
      const validRuts = [
        "12.345.678-5",
        "12345678-5",
        "123456785",
        "11.111.111-1",
        "22.222.222-2",
        "9.999.999-3", // Corrected from 6 to 3
        "24.965.885-5", // Corrected from K to 5
        "24965885-5", // Corrected from K to 5
        "1-9",
        "12-4", // Corrected from 6 to 4
      ];

      validRuts.forEach((rut) => {
        it(`should validate ${rut} as valid`, () => {
          expect(validateRut(rut)).toBe(true);
        });
      });
    });

    describe("invalid RUTs", () => {
      const invalidRuts = [
        "12.345.678-9", // Wrong verifier digit (correct is 5)
        "12345678-9", // Wrong verifier digit (correct is 5)
        "123456789", // Wrong verifier digit (correct is 5)
        "11.111.111-2", // Wrong verifier digit (correct is 1)
        "22.222.222-3", // Wrong verifier digit (correct is 2)
        "9.999.999-6", // Wrong verifier digit (correct is 3)
        "24.965.885-K", // Wrong verifier digit (correct is 5)
        "", // Empty
        "1", // Too short
        "123456789012345", // Too long
        "abcdefgh-i", // Invalid characters
        "12.345.678-", // Missing verifier digit
        "12.345.678-AB", // Invalid verifier digit
      ];

      invalidRuts.forEach((rut) => {
        it(`should validate ${rut} as invalid`, () => {
          expect(validateRut(rut)).toBe(false);
        });
      });
    });

    describe("edge cases", () => {
      it("should handle null and undefined", () => {
        expect(validateRut(null as any)).toBe(false);
        expect(validateRut(undefined as any)).toBe(false);
      });

      it("should handle non-string input", () => {
        expect(validateRut(123456789 as any)).toBe(false);
        expect(validateRut({} as any)).toBe(false);
        expect(validateRut([] as any)).toBe(false);
      });

      it("should handle whitespace", () => {
        expect(validateRut("  12.345.678-5  ")).toBe(true);
        expect(validateRut(" 12 345 678 5 ")).toBe(true); // Spaces in middle are cleaned out
      });
    });

    describe("real Chilean RUTs", () => {
      // These are real format examples but with calculated verifier digits
      const realFormatRuts = [
        "7.654.321-K",
        "15.432.109-7",
        "8.765.432-1",
        "20.123.456-3",
        "6.543.210-9",
      ];

      realFormatRuts.forEach((rut) => {
        it(`should validate real format RUT ${rut}`, () => {
          const cleanedRut = cleanRut(rut);
          const rutNumber = cleanedRut.slice(0, -1);
          const expectedVerifier = calculateVerifierDigit(rutNumber);
          const actualVerifier = cleanedRut.slice(-1);

          if (expectedVerifier === actualVerifier) {
            expect(validateRut(rut)).toBe(true);
          } else {
            expect(validateRut(rut)).toBe(false);
          }
        });
      });
    });
  });

  describe("integration tests", () => {
    it("should work together for complete RUT processing", () => {
      const inputRut = "  12.345.678-5  ";

      // Clean the RUT
      const cleaned = cleanRut(inputRut.trim());
      expect(cleaned).toBe("123456785");

      // Validate the RUT
      const isValid = validateRut(inputRut);
      expect(isValid).toBe(true);

      // Format the RUT
      const formatted = formatRut(cleaned);
      expect(formatted).toBe("12.345.678-5");
    });

    it("should handle invalid RUT through complete flow", () => {
      const inputRut = "12.345.678-9"; // Wrong verifier

      // Clean the RUT
      const cleaned = cleanRut(inputRut);
      expect(cleaned).toBe("123456789");

      // Validate the RUT (should be false)
      const isValid = validateRut(inputRut);
      expect(isValid).toBe(false);

      // Format still works
      const formatted = formatRut(cleaned);
      expect(formatted).toBe("12.345.678-9");
    });

    it("should generate and validate RUT with calculated verifier", () => {
      const rutNumber = "12345678";
      const verifier = calculateVerifierDigit(rutNumber);
      const completeRut = rutNumber + verifier;

      expect(validateRut(completeRut)).toBe(true);

      const formatted = formatRut(completeRut);
      expect(formatted).toBe("12.345.678-5");
    });
  });

  describe("performance tests", () => {
    it("should validate many RUTs quickly", () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        validateRut("12.345.678-5");
      }

      const end = Date.now();
      const duration = end - start;

      // Should complete 1000 validations in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it("should format many RUTs quickly", () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        formatRut("123456785");
      }

      const end = Date.now();
      const duration = end - start;

      // Should complete 1000 formats in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});
