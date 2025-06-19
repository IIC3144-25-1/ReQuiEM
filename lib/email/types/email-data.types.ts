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

export interface NewRoleAssignedData extends BaseEmailData {
  role: "resident" | "teacher";
  assignedBy: {
    name: string;
    email: string;
  };
}

export interface RecordPendingReviewData extends BaseEmailData {
  record: {
    id: string;
    title: string;
    studentName: string;
    studentEmail: string;
    createdAt: string;
  };
}

export interface RecordCorrectedData extends BaseEmailData {
  record: {
    id: string;
    title: string;
    teacherName: string;
    teacherEmail: string;
    correctedAt: string;
    comments?: string;
  };
}

export interface EmailTemplateData {
  userName: string;
  userEmail: string;
  provider?: string;
  providerDisplayName?: string;
  platformName?: string;
  platformDescription?: string;
  universityName?: string;
  role?: string;
  assignedByName?: string;
  recordTitle?: string;
  studentName?: string;
  teacherName?: string;
  recordDate?: string;
  correctionDate?: string;
  comments?: string;
}
