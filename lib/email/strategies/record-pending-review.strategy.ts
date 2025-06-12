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
      platformDescription: "Sistema de Registro y evaluación de cirugía",
      universityName: "Universidad Católica de Chile",
      recordURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
      supportEmail: "equipo6.iic3144@gmail.com ",
    };
  }

  getTemplateId(): string {
    return "d-0ddfd0c272ba48d59eadf17ef97b0676";
  }
}
