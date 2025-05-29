import { EmailTypesEnum } from "./types/email-types.enum";
import { NewUserWelcomeStrategy } from "./strategies/new-user-welcome.strategy";
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
      // Add other strategies here as needed

      default:
        throw new Error(`Email strategy ${type} not found.`);
    }
  }
}
