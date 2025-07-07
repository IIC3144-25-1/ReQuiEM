import {
  colorMap,
  tailwindColors,
  isTailwindColor,
  TailwindColor,
} from "@/utils/colors";

describe("Colors Utilities", () => {
  describe("colorMap", () => {
    it("should contain all expected colors", () => {
      const expectedColors: TailwindColor[] = [
        "slate",
        "gray",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
      ];

      expectedColors.forEach((color) => {
        expect(colorMap).toHaveProperty(color);
      });
    });

    it("should return correct CSS classes for specific colors", () => {
      expect(colorMap.red).toBe("bg-red-200 border-red-300 text-red-600");
      expect(colorMap.blue).toBe("bg-blue-200 border-blue-300 text-blue-600");
      expect(colorMap.green).toBe(
        "bg-green-200 border-green-300 text-green-600"
      );
      expect(colorMap.purple).toBe(
        "bg-purple-200 border-purple-300 text-purple-600"
      );
    });

    it("should have consistent CSS class structure", () => {
      Object.entries(colorMap).forEach(([color, classes]) => {
        expect(classes).toMatch(/^bg-\w+-200 border-\w+-300 text-\w+-600$/);
        expect(classes).toContain(`bg-${color}-200`);
        expect(classes).toContain(`border-${color}-300`);
        expect(classes).toContain(`text-${color}-600`);
      });
    });

    it("should have all colors from tailwindColors array", () => {
      tailwindColors.forEach((color) => {
        expect(colorMap).toHaveProperty(color);
      });
    });
  });

  describe("tailwindColors", () => {
    it("should contain 19 colors", () => {
      expect(tailwindColors).toHaveLength(19);
    });

    it("should contain all expected colors in correct order", () => {
      const expectedColors = [
        "slate",
        "gray",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
      ];

      expect(tailwindColors).toEqual(expectedColors);
    });

    it("should not contain duplicates", () => {
      const uniqueColors = [...new Set(tailwindColors)];
      expect(uniqueColors).toHaveLength(tailwindColors.length);
    });

    it("should contain only string values", () => {
      tailwindColors.forEach((color) => {
        expect(typeof color).toBe("string");
      });
    });
  });

  describe("isTailwindColor", () => {
    it("should return true for valid tailwind colors", () => {
      expect(isTailwindColor("red")).toBe(true);
      expect(isTailwindColor("blue")).toBe(true);
      expect(isTailwindColor("green")).toBe(true);
      expect(isTailwindColor("purple")).toBe(true);
      expect(isTailwindColor("slate")).toBe(true);
      expect(isTailwindColor("rose")).toBe(true);
    });

    it("should return false for invalid colors", () => {
      expect(isTailwindColor("invalid")).toBe(false);
      expect(isTailwindColor("black")).toBe(false);
      expect(isTailwindColor("white")).toBe(false);
      expect(isTailwindColor("transparent")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(isTailwindColor(123)).toBe(false);
      expect(isTailwindColor(null)).toBe(false);
      expect(isTailwindColor(undefined)).toBe(false);
      expect(isTailwindColor({})).toBe(false);
      expect(isTailwindColor([])).toBe(false);
      expect(isTailwindColor(true)).toBe(false);
    });

    it("should return false for empty strings", () => {
      expect(isTailwindColor("")).toBe(false);
    });

    it("should be case sensitive", () => {
      expect(isTailwindColor("RED")).toBe(false);
      expect(isTailwindColor("Blue")).toBe(false);
      expect(isTailwindColor("GREEN")).toBe(false);
    });

    it("should handle all valid tailwind colors", () => {
      tailwindColors.forEach((color) => {
        expect(isTailwindColor(color)).toBe(true);
      });
    });
  });

  describe("Type safety", () => {
    it("should export TailwindColor type correctly", () => {
      // This is a compile-time check - if it compiles, the type is correct
      const color: TailwindColor = "red";
      expect(typeof color).toBe("string");
    });

    it("should ensure colorMap keys match TailwindColor type", () => {
      // All keys in colorMap should be valid TailwindColor values
      Object.keys(colorMap).forEach((key) => {
        expect(isTailwindColor(key)).toBe(true);
      });
    });
  });
});
