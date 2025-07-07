import { NewUserWelcomeStrategy } from "@/lib/email/strategies/new-user-welcome.strategy";
import { NewRoleAssignedStrategy } from "@/lib/email/strategies/new-role-assigned.strategy";
import { RecordPendingReviewStrategy } from "@/lib/email/strategies/record-pending-review.strategy";
import { RecordCorrectedStrategy } from "@/lib/email/strategies/record-corrected.strategy";

describe("Email Strategies", () => {
  describe("NewUserWelcomeStrategy", () => {
    let strategy: NewUserWelcomeStrategy;

    beforeEach(() => {
      strategy = new NewUserWelcomeStrategy();
    });

    it("should format data correctly with user name", () => {
      const inputData = {
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "John Doe",
        userEmail: "john@example.com",
      });
    });

    it("should format data correctly without user name", () => {
      const inputData = {
        user: {
          email: "jane@example.com",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "Usuario",
        userEmail: "jane@example.com",
      });
    });

    it("should format data correctly with empty user name", () => {
      const inputData = {
        user: {
          name: "",
          email: "test@example.com",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "Usuario",
        userEmail: "test@example.com",
      });
    });

    it("should throw error when user data is missing", () => {
      const inputData = {} as any;

      expect(() => strategy.formatData(inputData)).toThrow(
        "Missing required data: user information"
      );
    });

    it("should return correct template ID", () => {
      const templateId = strategy.getTemplateId();
      expect(templateId).toBe("d-30ef841205284a6c9f4d5a3459a6a3eb");
    });
  });

  describe("NewRoleAssignedStrategy", () => {
    let strategy: NewRoleAssignedStrategy;

    beforeEach(() => {
      strategy = new NewRoleAssignedStrategy();
    });

    it("should format data correctly", () => {
      const inputData = {
        user: {
          id: "user123",
          name: "John Doe",
          email: "john@example.com",
        },
        role: "teacher" as const,
        assignedBy: {
          name: "Admin User",
          email: "admin@example.com",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "John Doe",
        userEmail: "john@example.com",
        role: "Profesor",
        assignedByName: "Admin User",
        platformName: "SurgiSkills",
        platformDescription: "Sistema de Registro Quirúrgico Electrónico Médico",
        universityName: "Universidad Católica de Chile",
        supportEmail: "equipo6.iic3144@gmail.com ",
      });
    });

    it("should return correct template ID", () => {
      const templateId = strategy.getTemplateId();
      expect(templateId).toBe("d-4f66833e80b8457684c78930489b1b6b");
    });
  });

  describe("RecordPendingReviewStrategy", () => {
    let strategy: RecordPendingReviewStrategy;

    beforeEach(() => {
      strategy = new RecordPendingReviewStrategy();
    });

    it("should format data correctly", () => {
      const inputData = {
        user: {
          id: "teacher123",
          name: "Dr. Smith",
          email: "smith@example.com",
        },
        record: {
          id: "record123",
          title: "Surgery Record",
          studentName: "John Doe",
          studentEmail: "john@example.com",
          createdAt: "2024-01-15T10:00:00Z",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "Dr. Smith",
        userEmail: "smith@example.com",
        recordTitle: "Surgery Record",
        studentName: "John Doe",
        recordDate: "15/1/2024",
        platformName: "SurgiSkills",
        platformDescription: "Sistema de Registro y evaluación de cirugía",
        universityName: "Universidad Católica de Chile",
        recordURL: expect.any(String),
        supportEmail: "equipo6.iic3144@gmail.com ",
      });
    });

    it("should return correct template ID", () => {
      const templateId = strategy.getTemplateId();
      expect(templateId).toBe("d-0ddfd0c272ba48d59eadf17ef97b0676");
    });
  });

  describe("RecordCorrectedStrategy", () => {
    let strategy: RecordCorrectedStrategy;

    beforeEach(() => {
      strategy = new RecordCorrectedStrategy();
    });

    it("should format data correctly", () => {
      const inputData = {
        user: {
          id: "user123",
          name: "John Doe",
          email: "john@example.com",
        },
        record: {
          id: "record123",
          title: "Surgery Record",
          teacherName: "Dr. Smith",
          teacherEmail: "smith@example.com",
          correctedAt: "2024-01-15T10:00:00Z",
          comments: "Good performance",
        },
      };

      const result = strategy.formatData(inputData);

      expect(result).toEqual({
        userName: "John Doe",
        userEmail: "john@example.com",
        recordTitle: "Surgery Record",
        teacherName: "Dr. Smith",
        correctionDate: "15-01-2024",
        comments: "Good performance",
        platformName: "SurgiSkills",
        platformDescription: "Sistema de Registro y evaluación de cirugía",
        universityName: "Universidad Católica de Chile",
        recordURL: expect.any(String),
        supportEmail: "equipo6.iic3144@gmail.com ",
      });
    });

    it("should return correct template ID", () => {
      const templateId = strategy.getTemplateId();
      expect(templateId).toBe("d-017793cd388c4557851b80ef2ca8da3f");
    });
  });

  describe("Strategy Interface Compliance", () => {
    const strategies = [
      {
        name: "NewUserWelcomeStrategy",
        instance: new NewUserWelcomeStrategy(),
      },
      {
        name: "NewRoleAssignedStrategy",
        instance: new NewRoleAssignedStrategy(),
      },
      {
        name: "RecordPendingReviewStrategy",
        instance: new RecordPendingReviewStrategy(),
      },
      {
        name: "RecordCorrectedStrategy",
        instance: new RecordCorrectedStrategy(),
      },
    ];

    strategies.forEach(({ name, instance }) => {
      describe(name, () => {
        it("should implement formatData method", () => {
          expect(typeof instance.formatData).toBe("function");
        });

        it("should implement getTemplateId method", () => {
          expect(typeof instance.getTemplateId).toBe("function");
        });

        it("should return string template ID", () => {
          const templateId = instance.getTemplateId();
          expect(typeof templateId).toBe("string");
          expect(templateId.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
