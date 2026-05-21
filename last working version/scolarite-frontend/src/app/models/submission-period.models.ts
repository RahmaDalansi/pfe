export interface SubmissionPeriod {
  id: number;
  name: string;
  academicYear: string;
  semester: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isDefault: boolean;
}

export interface ProfessorSubmissionStatus {
  keycloakId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  submissionStatus: 'SUBMITTED' | 'NOT_SUBMITTED' | 'EXCEPTION_GRANTED';
  submittedAt?: Date;
  hasExceptionPeriod: boolean;
}

export interface SubmissionStatistics {
  periodId: number;
  periodName: string;
  totalProfessors: number;
  submittedCount: number;
  notSubmittedCount: number;
  exceptionGrantedCount: number;
  submittedProfessors: ProfessorSubmissionStatus[];
  notSubmittedProfessors: ProfessorSubmissionStatus[];
  exceptionProfessors: ProfessorSubmissionStatus[];
}

export interface ExceptionPeriodRequest {
  professorKeycloakId: string;
  periodId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ExceptionPeriod {
  id: number;
  professorKeycloakId: string;
  professorName: string;
  periodId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface TimeSlotDetail {
  status: 'PREFERRED' | 'AVAILABLE' | 'UNAVAILABLE';
  reason?: string;
  reasonType?: string;
}

export interface DailyPreferencesDetail {
  day: string;
  dayLabel: string;
  morning: TimeSlotDetail;
  afternoon: TimeSlotDetail;
  evening: TimeSlotDetail;
}

export interface ProfessorPreferencesDetail {
  professorKeycloakId: string;
  professorName: string;
  professorFirstName: string;
  professorLastName: string;
  professorEmail: string;
  submissionStatus: 'SUBMITTED' | 'NOT_SUBMITTED' | 'EXCEPTION_GRANTED';
  submittedAt?: Date;
  hasExceptionPeriod: boolean;
  dailyPreferences: DailyPreferencesDetail[];
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  globalNotes: string;
}