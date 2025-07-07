import { formatPhone } from "@/utils/phone";

describe("formatPhone", () => {
  it("should format phone numbers with space after 4 digits", () => {
    expect(formatPhone("12345678")).toBe("1234 5678");
    expect(formatPhone("87654321")).toBe("8765 4321");
    expect(formatPhone("55555555")).toBe("5555 5555");
  });

  it("should handle phone numbers with less than 4 digits", () => {
    expect(formatPhone("1")).toBe("1");
    expect(formatPhone("12")).toBe("12");
    expect(formatPhone("123")).toBe("123");
  });

  it("should handle phone numbers with exactly 4 digits", () => {
    expect(formatPhone("1234")).toBe("1234");
  });

  it("should handle phone numbers with 5-8 digits", () => {
    expect(formatPhone("12345")).toBe("1234 5");
    expect(formatPhone("123456")).toBe("1234 56");
    expect(formatPhone("1234567")).toBe("1234 567");
    expect(formatPhone("12345678")).toBe("1234 5678");
  });

  it("should remove non-digit characters", () => {
    expect(formatPhone("123-456-78")).toBe("1234 5678");
    expect(formatPhone("123.456.78")).toBe("1234 5678");
    expect(formatPhone("123 456 78")).toBe("1234 5678");
    expect(formatPhone("(123) 456-78")).toBe("1234 5678");
    expect(formatPhone("+1-234-567-8")).toBe("1234 5678");
  });

  it("should handle mixed characters", () => {
    expect(formatPhone("abc123def456ghi78")).toBe("1234 5678");
    expect(formatPhone("1a2b3c4d5e6f7g8h")).toBe("1234 5678");
    expect(formatPhone("!@#1$%^2&*()3_+4=5{}[]6|\\7:;\"'8")).toBe("1234 5678");
  });

  it("should limit to 8 digits maximum", () => {
    expect(formatPhone("123456789")).toBe("1234 5678");
    expect(formatPhone("1234567890")).toBe("1234 5678");
    expect(formatPhone("123456789012345")).toBe("1234 5678");
  });

  it("should handle empty and whitespace strings", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("   ")).toBe("");
    expect(formatPhone("\t\n")).toBe("");
  });

  it("should handle strings with only non-digit characters", () => {
    expect(formatPhone("abc")).toBe("");
    expect(formatPhone("!@#$%^&*()")).toBe("");
    expect(formatPhone("---...___")).toBe("");
  });

  it("should handle leading zeros", () => {
    expect(formatPhone("01234567")).toBe("0123 4567");
    expect(formatPhone("00001234")).toBe("0000 1234");
  });

  it("should handle repeated formatting", () => {
    const phone = "1234567890";
    const formatted = formatPhone(phone);
    expect(formatPhone(formatted)).toBe(formatted);
  });

  it("should handle phone numbers from different countries (digits only)", () => {
    // These test the digit extraction, not actual country formatting
    expect(formatPhone("+56 9 1234 5678")).toBe("5691 2345");
    expect(formatPhone("+1 (555) 123-4567")).toBe("1555 1234");
    expect(formatPhone("011 56 9 1234 5678")).toBe("0115 6912");
  });

  it("should preserve original behavior for edge cases", () => {
    expect(formatPhone("0")).toBe("0");
    expect(formatPhone("00")).toBe("00");
    expect(formatPhone("000")).toBe("000");
    expect(formatPhone("0000")).toBe("0000");
    expect(formatPhone("00000")).toBe("0000 0");
  });
});
