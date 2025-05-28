import { EmailTypesEnum } from '../types/email-types.enum';

export interface EmailPayload {
  to: string;
  from?: string;
  type: EmailTypesEnum;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export class EmailEvent {
  constructor(public readonly payload: EmailPayload) {}
}