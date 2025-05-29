export interface BaseEmailData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface NewUserWelcomeData extends BaseEmailData {
  provider: string;
  isFirstLogin: boolean;
}

export interface EmailTemplateData {
  userName: string;
  userEmail: string;
  provider?: string;
  providerDisplayName?: string;
  platformName?: string;
  platformDescription?: string;
  universityName?: string;
}
