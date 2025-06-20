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
      platformDescription: "Sistema de Registro y evaluación de cirugía",
      universityName: "Universidad Católica de Chile",
      recordURL: `${process.env.NEXT_PUBLIC_APP_URL}`,
      supportEmail: "equipo6.iic3144@gmail.com ",
    };
  }

  getTemplateId(): string {
    return "d-017793cd388c4557851b80ef2ca8da3f";
  }
}
