import { EmailStrategy } from "../email-factory.strategy";
import { RecordCorrectedData } from "../types/email-data.types";

export class RecordCorrectedStrategy implements EmailStrategy {
  formatData(data: RecordCorrectedData) {
    if (!data.user || !data.record) {
      throw new Error("Missing required data: user or record information");
    }

    return {
      userName: data.user.name,
      userEmail: data.user.email,
      recordTitle: data.record.title,
      teacherName: data.record.teacherName,
      correctionDate: new Date(data.record.correctedAt).toLocaleDateString(
        "es-CL"
      ),
      comments: data.record.comments || "Sin comentarios adicionales",
      platformName: "ReQuiEM",
      platformDescription: "Sistema de Registro Quirúrgico Electrónico Médico",
      universityName: "Universidad Católica de Chile",
    };
  }

  getTemplateId(): string {
    // TODO: Replace with actual SendGrid template ID
    return "d-template-id-for-record-corrected";
  }
}
