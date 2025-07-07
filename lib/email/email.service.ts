import sgMail from "@sendgrid/mail";
import { EmailStrategyFactory } from "./email-factory.strategy";
import { EmailPayload } from "./events/email.event";
import { EmailTypesEnum } from "./types/email-types.enum";
import {
  NewRoleAssignedData,
  RecordPendingReviewData,
  RecordCorrectedData,
} from "./types/email-data.types";

export class EmailService {
  private strategyFactory: EmailStrategyFactory;

  constructor() {
    // Initialize SendGrid with API key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error(
        "SENDGRID_API_KEY is not defined in environment variables"
      );
    }

    sgMail.setApiKey(apiKey);
    this.strategyFactory = new EmailStrategyFactory();
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    // Factory pattern to get the appropriate strategy based on the email type
    const strategy = this.strategyFactory.create(payload.type);

    // Use test email in development
    const recipientEmail =
      process.env.ENV === "production"
        ? payload.to
        : process.env.TEST_EMAIL || payload.to;

    console.log(
      `Attempting to send email of type ${
        payload.type
      } to ${recipientEmail} from ${payload.from || process.env.FROM_EMAIL}`
    );

    try {
      const formattedData = strategy.formatData(payload.payload);
      const templateId = strategy.getTemplateId();

      const validFromEmail =
        payload.from || process.env.FROM_EMAIL || "no-reply@example.com";
      const msg = {
        to: recipientEmail,
        from: {
          email: validFromEmail,
          name:  'SurgiSkills',
        },
        templateId: templateId,
        dynamic_template_data: formattedData,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${recipientEmail}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error sending email: ${error.message}`, error);
        throw error;
      } else {
        console.error("Error sending email:", error);
        throw new Error(String(error));
      }
    }
  }

  // Helper methods for different email types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendNewUserWelcomeEmail(to: string, userData: any): Promise<void> {
    await this.sendEmail({
      to,
      type: EmailTypesEnum.NEW_USER_WELCOME,
      payload: userData,
    });
  }

  async sendNewRoleAssignedEmail(
    to: string,
    data: NewRoleAssignedData
  ): Promise<void> {
    await this.sendEmail({
      to,
      type:
        data.role === "resident"
          ? EmailTypesEnum.NEW_RESIDENT_ASSIGNED
          : EmailTypesEnum.NEW_TEACHER_ASSIGNED,
      payload: data,
    });
  }

  async sendRecordPendingReviewEmail(
    to: string,
    data: RecordPendingReviewData
  ): Promise<void> {
    await this.sendEmail({
      to,
      type: EmailTypesEnum.RECORD_PENDING_REVIEW,
      payload: data,
    });
  }

  async sendRecordCorrectedEmail(
    to: string,
    data: RecordCorrectedData
  ): Promise<void> {
    await this.sendEmail({
      to,
      type: EmailTypesEnum.RECORD_CORRECTED,
      payload: data,
    });
  }
}

export const emailService = new EmailService();
