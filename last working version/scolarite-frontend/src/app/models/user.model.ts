export interface ImportResponse {
  message: string;
  imported: number;
}

export interface UserCredentials {
  username: string;
  password: string;
  newPassword?: string;
}

export interface CsvUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'PROFESSOR'| 'ADMIN';
}