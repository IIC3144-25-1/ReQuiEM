import { EmailStrategy } from "../email-factory.strategy";
import { RecordPendingReviewData } from "../types/email-data.types";

export class RecordPendingReviewStrategy implements EmailStrategy {
  formatData(data: RecordPendingReviewData) {
    if (!data.user || !data.record) {
      throw new Error("Missing required data: user or record information");
    }

    return {
      userName: data.user.name,
      userEmail: data.user.email,
      recordTitle: data.record.title,
      studentName: data.record.studentName,
      recordDate: new Date(data.record.createdAt).toLocaleDateString("es-CL"),
      platformName: "ReQuiEM",
      platformDescription: "Sistema de Registro Quirúrgico Electrónico Médico",
      universityName: "Universidad Católica de Chile",
    };
  }

  getTemplateId(): string {
    // TODO: Replace with actual SendGrid template ID
    return "d-template-id-for-record-pending-review";
  }
}
