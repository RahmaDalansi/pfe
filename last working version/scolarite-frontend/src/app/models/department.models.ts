export interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  headOfDepartment: string;
  isActive: boolean;
  specialtyCount: number;
}

export interface Specialty {
  id: number;
  code: string;
  name: string;
  description: string;
  durationYears: number;
  isActive: boolean;
  departmentId: number;
  departmentName: string;
  levelCount: number;
}

export interface Level {
  id: number;
  yearNumber: number;
  name: string;
  semesterCount: number;
  isActive: boolean;
  specialtyId: number;
  specialtyName: string;
  groupCount: number;
}

export interface Group {
  id: number;
  groupNumber: number;
  name: string;
  studentCount: number;
  maxCapacity: number;
  isActive: boolean;
  levelId: number;
  levelName: string;
  specialtyId: number;
  specialtyName: string;
  departmentId: number;
  departmentName: string;
}