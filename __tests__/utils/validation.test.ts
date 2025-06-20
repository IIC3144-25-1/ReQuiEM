import {
  validateEmail,
  validatePassword,
  validateRut,
} from "@/utils/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should validate correct email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "firstname.lastname@company.com",
        "email@subdomain.example.com",
        "firstname-lastname@example.com",
        "user123@example123.com",
        "test.email.with+symbol@example.com",
        "user@example-one.com",
        "x@example.com",
        "example@s.example",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "",
        "plainaddress",
        "@missingdomain.com",
        "missing@.com",
        "missing.domain@.com",
        "two@@domain.com",
        "domain@.com",
        ".user@domain.com",
        "user.@domain.com",
        "user..name@domain.com",
        "user@domain..com",
        "user name@domain.com",
        "user@domain .com",
        "user@domain,com",
        "user@domain",
        "user@",
        "@domain.com",
        "user@domain@domain.com",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
      expect(validateEmail(" ")).toBe(false);
      expect(validateEmail("   test@example.com   ")).toBe(true); // Should trim
    });

    it("should handle case sensitivity", () => {
      expect(validateEmail("TEST@EXAMPLE.COM")).toBe(true);
      expect(validateEmail("Test@Example.Com")).toBe(true);
      expect(validateEmail("test@EXAMPLE.com")).toBe(true);
    });

    it("should validate international domains", () => {
      const internationalEmails = [
        "user@example.co.uk",
        "user@example.com.br",
        "user@example.org.au",
        "user@subdomain.example.info",
      ];

      internationalEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const strongPasswords = [
        "Password123!",
        "MyStr0ng@Pass",
        "C0mpl3x#P@ssw0rd",
        "Secure123$",
        "Valid@Pass1",
        "Strong9#Password",
        "MyP@ssw0rd123",
        "Compl3x!Pass",
      ];

      strongPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it("should reject weak passwords", () => {
      const weakPasswords = [
        "",
        "123456",
        "password",
        "PASSWORD",
        "Password",
        "12345678",
        "password123",
        "PASSWORD123",
        "Password123", // Missing special character
        "password@", // Missing uppercase and number
        "PASSWORD@", // Missing lowercase and number
        "Pass@", // Too short
        "p@1", // Too short
        "short",
      ];

      weakPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(false);
      });
    });

    it("should require minimum length", () => {
      expect(validatePassword("P@1")).toBe(false); // 3 chars
      expect(validatePassword("P@ss1")).toBe(false); // 5 chars
      expect(validatePassword("P@ssw0rd")).toBe(true); // 8 chars
      expect(validatePassword("P@ssw0rd123")).toBe(true); // 11 chars
    });

    it("should require uppercase letter", () => {
      expect(validatePassword("password123!")).toBe(false);
      expect(validatePassword("Password123!")).toBe(true);
      expect(validatePassword("MYPASSWORD123!")).toBe(false); // Missing lowercase
    });

    it("should require lowercase letter", () => {
      expect(validatePassword("PASSWORD123!")).toBe(false);
      expect(validatePassword("Password123!")).toBe(true);
      expect(validatePassword("mypassword123!")).toBe(false); // Missing uppercase
    });

    it("should require number", () => {
      expect(validatePassword("Password!")).toBe(false);
      expect(validatePassword("Password1!")).toBe(true);
      expect(validatePassword("Password123!")).toBe(true);
    });

    it("should require special character", () => {
      expect(validatePassword("Password123")).toBe(false);
      expect(validatePassword("Password123!")).toBe(true);
      expect(validatePassword("Password123@")).toBe(true);
      expect(validatePassword("Password123#")).toBe(true);
      expect(validatePassword("Password123$")).toBe(true);
      expect(validatePassword("Password123%")).toBe(true);
    });

    it("should handle edge cases", () => {
      expect(validatePassword(null as any)).toBe(false);
      expect(validatePassword(undefined as any)).toBe(false);
      expect(validatePassword(" ")).toBe(false);
    });

    it("should accept various special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      for (const char of specialChars) {
        const password = `Password123${char}`;
        expect(validatePassword(password)).toBe(true);
      }
    });
  });

  describe("validateRut", () => {
    it("should validate correct Chilean RUTs", () => {
      const validRuts = [
        "12.345.678-5",
        "11.111.111-1",
        "1.111.111-K",
        "24.965.885-K",
      ];

      validRuts.forEach((rut) => {
        expect(validateRut(rut)).toBe(true);
      });
    });

    it("should validate RUTs without formatting", () => {
      const validRuts = ["123456785", "111111111", "1111111K", "24965885K"];

      validRuts.forEach((rut) => {
        expect(validateRut(rut)).toBe(true);
      });
    });

    it("should reject invalid RUTs", () => {
      const invalidRuts = [
        "12.345.678-9", // Wrong verifier digit
        "11.111.111-2", // Wrong verifier digit
        "1.111.111-X", // Invalid verifier digit
        "123456789", // Wrong verifier digit
        "111111112", // Wrong verifier digit
      ];

      invalidRuts.forEach((rut) => {
        expect(validateRut(rut)).toBe(false);
      });
    });

    it("should handle malformed RUTs", () => {
      const malformedRuts = [
        "",
        "abc.def.ghi-j",
        "12.345.678",
        "12.345.678-",
        "12.345.678-55",
        "12-345-678-5",
        "1234567890123456789",
      ];

      malformedRuts.forEach((rut) => {
        expect(validateRut(rut)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(validateRut(null as any)).toBe(false);
      expect(validateRut(undefined as any)).toBe(false);
      expect(validateRut(" ")).toBe(false);
      expect(validateRut("   12.345.678-5   ")).toBe(true); // Should trim
    });

    it("should handle different RUT formats", () => {
      const formats = ["12345678-5", "12.345.678-5", "123456785"];

      formats.forEach((rut) => {
        expect(validateRut(rut)).toBe(true);
      });
    });

    it("should handle K verifier digit case insensitive", () => {
      expect(validateRut("1.111.111-K")).toBe(true);
      expect(validateRut("1.111.111-k")).toBe(true);
      expect(validateRut("1111111K")).toBe(true);
      expect(validateRut("1111111k")).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should validate complete user data", () => {
      const validUserData = {
        email: "user@hospital.cl",
        password: "SecurePass123!",
        rut: "12.345.678-5",
      };

      expect(validateEmail(validUserData.email)).toBe(true);
      expect(validatePassword(validUserData.password)).toBe(true);
      expect(validateRut(validUserData.rut)).toBe(true);
    });

    it("should reject invalid user data", () => {
      const invalidUserData = {
        email: "invalid-email",
        password: "weak",
        rut: "invalid-rut",
      };

      expect(validateEmail(invalidUserData.email)).toBe(false);
      expect(validatePassword(invalidUserData.password)).toBe(false);
      expect(validateRut(invalidUserData.rut)).toBe(false);
    });
  });

  describe("Performance Tests", () => {
    it("should validate emails efficiently", () => {
      const emails = Array.from(
        { length: 1000 },
        (_, i) => `user${i}@example.com`
      );

      const startTime = Date.now();
      emails.forEach((email) => validateEmail(email));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should validate passwords efficiently", () => {
      const passwords = Array.from({ length: 1000 }, (_, i) => `Password${i}!`);

      const startTime = Date.now();
      passwords.forEach((password) => validatePassword(password));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should validate RUTs efficiently", () => {
      const ruts = Array.from({ length: 1000 }, (_, i) => {
        const base = (10000000 + i).toString();
        return `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}-5`;
      });

      const startTime = Date.now();
      ruts.forEach((rut) => validateRut(rut));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
