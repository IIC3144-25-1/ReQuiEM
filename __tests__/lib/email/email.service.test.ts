import sgMail from "@sendgrid/mail";

// Mock SendGrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Mock the strategy factory
jest.mock("@/lib/email/email-factory.strategy", () => ({
  EmailStrategyFactory: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockReturnValue({
      formatData: jest.fn().mockReturnValue({ formattedData: "test" }),
      getTemplateId: jest.fn().mockReturnValue("test-template-id"),
    }),
  })),
}));

describe("EmailService", () => {
  let EmailService: any;
  let EmailTypesEnum: any;
  let emailService: any;
  let mockSend: jest.MockedFunction<typeof sgMail.send>;
  let mockSetApiKey: jest.MockedFunction<typeof sgMail.setApiKey>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set up environment variables
    process.env.SENDGRID_API_KEY = "test-api-key";
    process.env.FROM_EMAIL = "test@example.com";
    process.env.ENV = "development";
    process.env.TEST_EMAIL = "test-recipient@example.com";

    mockSend = sgMail.send as jest.MockedFunction<typeof sgMail.send>;
    mockSetApiKey = sgMail.setApiKey as jest.MockedFunction<
      typeof sgMail.setApiKey
    >;

    mockSend.mockResolvedValue([{} as any, {}]);

    // Import after setting environment variables
    const emailModule = await import("@/lib/email/email.service");
    const enumModule = await import("@/lib/email/types/email-types.enum");
    EmailService = emailModule.EmailService;
    EmailTypesEnum = enumModule.EmailTypesEnum;

    emailService = new EmailService();
  });

  afterEach(() => {
    delete process.env.SENDGRID_API_KEY;
    delete process.env.FROM_EMAIL;
    delete process.env.ENV;
    delete process.env.TEST_EMAIL;
  });

  describe("Constructor", () => {
    it("should initialize with SendGrid API key", () => {
      expect(mockSetApiKey).toHaveBeenCalledWith("test-api-key");
    });

    it("should throw error if SENDGRID_API_KEY is not provided", () => {
      delete process.env.SENDGRID_API_KEY;

      expect(() => new EmailService()).toThrow(
        "SENDGRID_API_KEY is not defined in environment variables"
      );
    });
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith({
        to: "test-recipient@example.com", // Uses TEST_EMAIL in development
        from: {
          email: "test@example.com",
          name: "SurgiSkills",
        },
        templateId: "test-template-id",
        dynamic_template_data: { formattedData: "test" },
      });
    });

    it("should use production email in production environment", async () => {
      process.env.ENV = "production";
      emailService = new EmailService();

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "recipient@example.com", // Uses actual recipient in production
        })
      );
    });

    it("should use custom from email if provided", async () => {
      const payload = {
        to: "recipient@example.com",
        from: "custom@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            email: "custom@example.com",
            name: "SurgiSkills",
          },
        })
      );
    });

    it("should use fallback email if FROM_EMAIL is not set", async () => {
      delete process.env.FROM_EMAIL;
      emailService = new EmailService();

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: {
            email: "no-reply@example.com",
            name: "SurgiSkills",
          },
        })
      );
    });

    it("should handle SendGrid errors", async () => {
      const error = new Error("SendGrid API error");
      mockSend.mockRejectedValue(error);

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await expect(emailService.sendEmail(payload)).rejects.toThrow(
        "SendGrid API error"
      );
    });

    it("should handle non-Error exceptions", async () => {
      mockSend.mockRejectedValue("String error");

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await expect(emailService.sendEmail(payload)).rejects.toThrow(
        "String error"
      );
    });
  });

  describe("Helper Methods", () => {
    describe("sendNewUserWelcomeEmail", () => {
      it("should send welcome email", async () => {
        const userData = { name: "John Doe", email: "john@example.com" };

        await emailService.sendNewUserWelcomeEmail(
          "john@example.com",
          userData
        );

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test-recipient@example.com",
            templateId: "test-template-id",
          })
        );
      });
    });

    describe("sendNewRoleAssignedEmail", () => {
      it("should send resident role assignment email", async () => {
        const data = {
          name: "John Doe",
          role: "resident" as const,
          area: "Surgery",
        };

        await emailService.sendNewRoleAssignedEmail("john@example.com", data);

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test-recipient@example.com",
            templateId: "test-template-id",
          })
        );
      });

      it("should send teacher role assignment email", async () => {
        const data = {
          name: "Jane Smith",
          role: "teacher" as const,
          area: "Cardiology",
        };

        await emailService.sendNewRoleAssignedEmail("jane@example.com", data);

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test-recipient@example.com",
            templateId: "test-template-id",
          })
        );
      });
    });

    describe("sendRecordPendingReviewEmail", () => {
      it("should send record pending review email", async () => {
        const data = {
          residentName: "John Doe",
          surgeryName: "Appendectomy",
          patientId: "12345678-9",
          recordId: "record-123",
        };

        await emailService.sendRecordPendingReviewEmail(
          "teacher@example.com",
          data
        );

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test-recipient@example.com",
            templateId: "test-template-id",
          })
        );
      });
    });

    describe("sendRecordCorrectedEmail", () => {
      it("should send record corrected email", async () => {
        const data = {
          residentName: "John Doe",
          surgeryName: "Appendectomy",
          patientId: "12345678-9",
          recordId: "record-123",
          feedback: "Good work, minor improvements needed",
        };

        await emailService.sendRecordCorrectedEmail(
          "resident@example.com",
          data
        );

        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test-recipient@example.com",
            templateId: "test-template-id",
          })
        );
      });
    });
  });

  describe("Environment Configuration", () => {
    it("should use TEST_EMAIL in development", async () => {
      process.env.ENV = "development";
      process.env.TEST_EMAIL = "dev-test@example.com";
      emailService = new EmailService();

      const payload = {
        to: "original@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "dev-test@example.com",
        })
      );
    });

    it("should fallback to original recipient if TEST_EMAIL not set", async () => {
      process.env.ENV = "development";
      delete process.env.TEST_EMAIL;
      emailService = new EmailService();

      const payload = {
        to: "original@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "original@example.com",
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should log successful email sends", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await emailService.sendEmail(payload);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Attempting to send email")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Email sent successfully")
      );

      consoleSpy.mockRestore();
    });

    it("should log errors when email sending fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("SendGrid error");
      mockSend.mockRejectedValue(error);

      const payload = {
        to: "recipient@example.com",
        type: EmailTypesEnum.NEW_USER_WELCOME,
        payload: { name: "Test User" },
      };

      await expect(emailService.sendEmail(payload)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error sending email"),
        error
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Integration", () => {
    it("should handle complete email workflow", async () => {
      const userData = {
        name: "Dr. John Doe",
        email: "john.doe@hospital.cl",
        role: "resident",
        area: "Surgery",
      };

      // Test multiple email types
      await emailService.sendNewUserWelcomeEmail(userData.email, userData);
      await emailService.sendNewRoleAssignedEmail(userData.email, {
        name: userData.name,
        role: "resident",
        area: userData.area,
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });
});
