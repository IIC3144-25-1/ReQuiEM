import getInitials from "@/utils/initials";

describe("getInitials", () => {
  it("should return initials for first and last name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane Smith")).toBe("JS");
    expect(getInitials("Michael Johnson")).toBe("MJ");
  });

  it("should return initials for single name", () => {
    expect(getInitials("John")).toBe("J");
    expect(getInitials("Jane")).toBe("J");
    expect(getInitials("Michael")).toBe("M");
  });

  it("should return initials for multiple names (only first two)", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
    expect(getInitials("Jane Mary Smith Johnson")).toBe("JM");
    expect(getInitials("Carlos Eduardo Silva Rodriguez")).toBe("CE");
  });

  it("should handle names with extra spaces", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
    expect(getInitials("Jane    Smith")).toBe("JS");
    expect(getInitials("  Michael  ")).toBe("M");
  });

  it("should handle empty or whitespace-only strings", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
    expect(getInitials("\t\n")).toBe("");
  });

  it("should handle lowercase names", () => {
    expect(getInitials("john doe")).toBe("JD");
    expect(getInitials("jane smith")).toBe("JS");
    expect(getInitials("michael johnson")).toBe("MJ");
  });

  it("should handle mixed case names", () => {
    expect(getInitials("jOhN dOe")).toBe("JD");
    expect(getInitials("JaNe SmItH")).toBe("JS");
    expect(getInitials("mIcHaEl JoHnSoN")).toBe("MJ");
  });

  it("should handle special characters in names", () => {
    expect(getInitials("José María")).toBe("JM");
    expect(getInitials("María-José García")).toBe("MG");
    expect(getInitials("O'Connor")).toBe("O");
  });

  it("should handle names with single characters", () => {
    expect(getInitials("J D")).toBe("JD");
    expect(getInitials("A B C")).toBe("AB");
    expect(getInitials("X")).toBe("X");
  });

  it("should handle names starting with numbers or symbols", () => {
    expect(getInitials("123 John")).toBe("1J");
    expect(getInitials("@John #Doe")).toBe("@#");
    expect(getInitials("$Money %Sign")).toBe("$%");
  });

  it("should handle Unicode characters", () => {
    expect(getInitials("Åse Børre")).toBe("ÅB");
    expect(getInitials("Çağlar Şahin")).toBe("ÇŞ");
    expect(getInitials("Žiž Đoković")).toBe("ŽĐ");
  });

  it("should handle very long names", () => {
    const longName = "Verylongfirstname Verylonglastname Verylongthirdname";
    expect(getInitials(longName)).toBe("VV");
  });
});
