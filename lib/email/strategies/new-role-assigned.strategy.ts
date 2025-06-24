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
      platformName: "SurgerySkills",
      platformDescription: "Sistema de Registro Quirúrgico Electrónico Médico",
      universityName: "Universidad Católica de Chile",
      supportEmail: "equipo6.iic3144@gmail.com ",
    };
  }

  getTemplateId(): string {
    return "d-4f66833e80b8457684c78930489b1b6b";
  }
}
