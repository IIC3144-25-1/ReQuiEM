import { EmailStrategy } from '../email-factory.strategy';

export class NewUserWelcomeStrategy implements EmailStrategy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatData(data: any) {
    if (!data.user) {
      throw new Error('Missing required data: user information');
    }

    return {
      userName: data.user.name || 'Usuario',
      userEmail: data.user.email,
    };
  }

  getTemplateId(): string {
    return 'd-30ef841205284a6c9f4d5a3459a6a3eb'; 
  }
}