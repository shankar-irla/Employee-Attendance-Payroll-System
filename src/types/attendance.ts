export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female';
  position?: string;
  dateAdded: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  notes?: string;
}

export interface AttendanceSession {
  date: string;
  records: AttendanceRecord[];
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

export interface PayrollData {
  employeeId: string;
  name: string;
  gender: 'male' | 'female';
  daysPresent: number;
  dailyRate: number;
  totalSalary: number;
  contractorFee: number;
  totalWithContractorFee: number;
  month: string;
  year: number;
}

export interface AttendanceStats {
  totalEmployees: number;
  totalSessions: number;
  averageAttendance: number;
  employeeStats: {
    employeeId: string;
    name: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  }[];
}