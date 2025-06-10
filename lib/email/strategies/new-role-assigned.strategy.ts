import { EmailStrategy } from "../email-factory.strategy";
import { NewRoleAssignedData } from "../types/email-data.types";

export class NewRoleAssignedStrategy implements EmailStrategy {
  formatData(data: NewRoleAssignedData) {
    if (!data.user || !data.assignedBy) {
      throw new Error("Missing required data: user or assignedBy information");
    }

    return {
      userName: data.user.name,
      userEmail: data.user.email,
      role: data.role === "resident" ? "Residente" : "Profesor",
      assignedByName: data.assignedBy.name,
      platformName: "ReQuiEM",
      platformDescription: "Sistema de Registro Quirúrgico Electrónico Médico",
      universityName: "Universidad Católica de Chile",
    };
  }

  getTemplateId(): string {
    // TODO: Replace with actual SendGrid template ID
    return "d-template-id-for-role-assignment";
  }
}
