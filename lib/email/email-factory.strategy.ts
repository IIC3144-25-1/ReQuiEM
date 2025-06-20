import { EmailTypesEnum } from "./types/email-types.enum";
import { NewUserWelcomeStrategy } from "./strategies/new-user-welcome.strategy";
import { NewRoleAssignedStrategy } from "./strategies/new-role-assigned.strategy";
import { RecordPendingReviewStrategy } from "./strategies/record-pending-review.strategy";
import { RecordCorrectedStrategy } from "./strategies/record-corrected.strategy";
import { EmailTemplateData } from "./types/email-data.types";

export interface EmailStrategy {
  formatData(data: unknown): EmailTemplateData;
  getTemplateId(): string;
}

export class EmailStrategyFactory {
  create(type: EmailTypesEnum): EmailStrategy {
    switch (type) {
      case EmailTypesEnum.NEW_USER_WELCOME:
        return new NewUserWelcomeStrategy();
      case EmailTypesEnum.NEW_RESIDENT_ASSIGNED:
        return new NewRoleAssignedStrategy();
      case EmailTypesEnum.NEW_TEACHER_ASSIGNED:
        return new NewRoleAssignedStrategy();
      case EmailTypesEnum.RECORD_PENDING_REVIEW:
        return new RecordPendingReviewStrategy();
      case EmailTypesEnum.RECORD_CORRECTED:
        return new RecordCorrectedStrategy();
      // Add other strategies here as needed

      default:
        throw new Error(`No strategy found for email type: ${type}`);
    }
  }
}
