import { Employee, AttendanceRecord, AttendanceSession, PayrollData } from '../types/attendance';

const EMPLOYEES_KEY = 'attendance_employees';
const RECORDS_KEY = 'attendance_records';

export const storage = {
  // Employee management
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEmployees: (employees: Employee[]): void => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  },

  addEmployee: (employee: Employee): void => {
    const employees = storage.getEmployees();
    employees.push(employee);
    storage.saveEmployees(employees);
  },

  updateEmployee: (employeeId: string, updates: Partial<Employee>): void => {
    const employees = storage.getEmployees();
    const index = employees.findIndex(e => e.id === employeeId);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      storage.saveEmployees(employees);
    }
  },

  deleteEmployee: (employeeId: string): void => {
    const employees = storage.getEmployees().filter(e => e.id !== employeeId);
    storage.saveEmployees(employees);
    
    // Also remove attendance records for this employee
    const records = storage.getAttendanceRecords().filter(r => r.employeeId !== employeeId);
    storage.saveAttendanceRecords(records);
  },

  // Attendance management
  getAttendanceRecords: (): AttendanceRecord[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAttendanceRecords: (records: AttendanceRecord[]): void => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  getAttendanceForDate: (date: string): AttendanceRecord[] => {
    return storage.getAttendanceRecords().filter(r => r.date === date);
  },

  markAttendance: (record: AttendanceRecord): void => {
    const records = storage.getAttendanceRecords();
    const existingIndex = records.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
    
    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    storage.saveAttendanceRecords(records);
  },

  // Analytics
  getAttendanceSession: (date: string): AttendanceSession | null => {
    const employees = storage.getEmployees();
    const records = storage.getAttendanceForDate(date);
    
    if (employees.length === 0) return null;
    
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    
    return {
      date,
      records,
      totalEmployees: employees.length,
      presentCount,
      absentCount,
      lateCount,
    };
  },

  getAllSessions: (): AttendanceSession[] => {
    const records = storage.getAttendanceRecords();
    const dates = [...new Set(records.map(r => r.date))];
    
    return dates.map(date => storage.getAttendanceSession(date)).filter(Boolean) as AttendanceSession[];
  },

  // Payroll calculations
  getMonthlyPayroll: (month: number, year: number): PayrollData[] => {
    const employees = storage.getEmployees();
    const records = storage.getAttendanceRecords();
    
    return employees.map(employee => {
      const monthRecords = records.filter(r => {
        const recordDate = new Date(r.date);
        return r.employeeId === employee.id && 
               recordDate.getMonth() === month && 
               recordDate.getFullYear() === year &&
               r.status === 'present';
      });
      
      const daysPresent = monthRecords.length;
      const dailyRate = employee.gender === 'male' ? 450 : 400; // Updated rates
      const totalSalary = daysPresent * dailyRate;
      const contractorFee = 50; // Fixed ₹50 per employee
      const totalWithContractorFee = totalSalary + contractorFee;
      
      return {
        employeeId: employee.id,
        name: employee.name,
        gender: employee.gender,
        daysPresent,
        dailyRate,
        totalSalary,
        contractorFee,
        totalWithContractorFee,
        month: new Date(year, month).toLocaleString('default', { month: 'long' }),
        year,
      };
    });
  },

  getMonthlyAttendanceStats: (month: number, year: number) => {
    const employees = storage.getEmployees();
    const records = storage.getAttendanceRecords();
    
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === month && recordDate.getFullYear() === year;
    });
    
    const totalWorkingDays = new Set(monthRecords.map(r => r.date)).size;
    const totalPresent = monthRecords.filter(r => r.status === 'present').length;
    const totalAbsent = monthRecords.filter(r => r.status === 'absent').length;
    const totalLate = monthRecords.filter(r => r.status === 'late').length;
    
    const maleEmployees = employees.filter(e => e.gender === 'male').length;
    const femaleEmployees = employees.filter(e => e.gender === 'female').length;
    
    return {
      totalWorkingDays,
      totalPresent,
      totalAbsent,
      totalLate,
      totalEmployees: employees.length,
      maleEmployees,
      femaleEmployees,
      averageAttendance: totalWorkingDays > 0 ? Math.round((totalPresent / (employees.length * totalWorkingDays)) * 100) : 0,
    };
  },

  // Demo data
  initializeDemoData: (): void => {
    const employees = storage.getEmployees();
    if (employees.length === 0) {
      const demoEmployees: Employee[] = [
        { id: '1', name: 'John Smith', employeeId: 'EMP001', email: 'john@company.com', gender: 'male', position: 'Manager', dateAdded: new Date().toISOString() },
        { id: '2', name: 'Sarah Johnson', employeeId: 'EMP002', email: 'sarah@company.com', gender: 'female', position: 'Developer', dateAdded: new Date().toISOString() },
        { id: '3', name: 'Mike Wilson', employeeId: 'EMP003', email: 'mike@company.com', gender: 'male', position: 'Designer', dateAdded: new Date().toISOString() },
        { id: '4', name: 'Emily Davis', employeeId: 'EMP004', email: 'emily@company.com', gender: 'female', position: 'Analyst', dateAdded: new Date().toISOString() },
        { id: '5', name: 'David Brown', employeeId: 'EMP005', email: 'david@company.com', gender: 'male', position: 'Sales Rep', dateAdded: new Date().toISOString() },
      ];
      storage.saveEmployees(demoEmployees);
    }
  }
};