import React, { useState, useEffect } from 'react';
import { Users, Calendar, BarChart3, DollarSign, Plus, Search, Download, UserX, SortAsc, SortDesc, UserMinus } from 'lucide-react';
import { Employee, AttendanceRecord, PayrollData } from './types/attendance';
import { storage } from './utils/storage';
import { EmployeeCard } from './components/EmployeeCard';
import { AttendanceCard } from './components/AttendanceCard';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { StatCard } from './components/StatCard';
import { PayrollCard } from './components/PayrollCard';
import { AbsenteeCard } from './components/AbsenteeCard';

type TabType = 'attendance' | 'employees' | 'reports' | 'payroll';
type SortOption = 'name' | 'employeeId' | 'gender' | 'status';
type SortDirection = 'asc' | 'desc';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    // Initialize demo data and load from storage
    storage.initializeDemoData();
    setEmployees(storage.getEmployees());
    setAttendanceRecords(storage.getAttendanceRecords());
  }, []);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFilteredAndSortedEmployeesForAttendance = () => {
    let filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
      (employee.position && employee.position.toLowerCase().includes(attendanceSearchTerm.toLowerCase()))
    );

    // Sort employees
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'employeeId':
          aValue = a.employeeId.toLowerCase();
          bValue = b.employeeId.toLowerCase();
          break;
        case 'gender':
          aValue = a.gender;
          bValue = b.gender;
          break;
        case 'status':
          const aStatus = getEmployeeAttendanceStatus(a.id) || 'unmarked';
          const bStatus = getEmployeeAttendanceStatus(b.id) || 'unmarked';
          aValue = aStatus;
          bValue = bStatus;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'dateAdded'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    
    if (editingEmployee) {
      storage.updateEmployee(editingEmployee.id, employeeData);
    } else {
      storage.addEmployee(newEmployee);
    }
    
    setEmployees(storage.getEmployees());
    setEditingEmployee(undefined);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      storage.deleteEmployee(employeeId);
      setEmployees(storage.getEmployees());
      setAttendanceRecords(storage.getAttendanceRecords());
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsAddModalOpen(true);
  };

  const handleAttendanceChange = (employeeId: string, status: 'present' | 'absent' | 'late') => {
    const record: AttendanceRecord = {
      id: `${employeeId}-${selectedDate}`,
      employeeId,
      date: selectedDate,
      status,
      timestamp: new Date().toISOString(),
    };
    
    storage.markAttendance(record);
    setAttendanceRecords(storage.getAttendanceRecords());
  };

  const handleMarkAllUnmarkedAsAbsent = () => {
    const unmarkedEmployees = getUnmarkedEmployees();
    if (unmarkedEmployees.length === 0) {
      alert('No unmarked employees found for today.');
      return;
    }

    if (window.confirm(`Mark all ${unmarkedEmployees.length} unmarked employees as absent for ${selectedDate}?`)) {
      unmarkedEmployees.forEach(employee => {
        const record: AttendanceRecord = {
          id: `${employee.id}-${selectedDate}`,
          employeeId: employee.id,
          date: selectedDate,
          status: 'absent',
          timestamp: new Date().toISOString(),
        };
        storage.markAttendance(record);
      });
      setAttendanceRecords(storage.getAttendanceRecords());
    }
  };

  const getEmployeeAttendanceStatus = (employeeId: string) => {
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === selectedDate);
    return record?.status || null;
  };

  const getAbsentEmployees = () => {
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const absentRecords = todayRecords.filter(r => r.status === 'absent');
    
    return absentRecords.map(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      return employee;
    }).filter(Boolean) as Employee[];
  };

  const getUnmarkedEmployees = () => {
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const markedEmployeeIds = new Set(todayRecords.map(r => r.employeeId));
    
    return employees.filter(employee => !markedEmployeeIds.has(employee.id));
  };

  const getTodayStats = () => {
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const late = todayRecords.filter(r => r.status === 'late').length;
    const total = employees.length;
    const unmarked = total - todayRecords.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    const malePresent = todayRecords.filter(r => {
      const employee = employees.find(e => e.id === r.employeeId);
      return r.status === 'present' && employee?.gender === 'male';
    }).length;
    
    const femalePresent = todayRecords.filter(r => {
      const employee = employees.find(e => e.id === r.employeeId);
      return r.status === 'present' && employee?.gender === 'female';
    }).length;
    
    return { present, absent, late, total, percentage, malePresent, femalePresent, unmarked };
  };

  const getOverallStats = () => {
    const allSessions = storage.getAllSessions();
    const totalSessions = allSessions.length;
    const averageAttendance = totalSessions > 0 
      ? Math.round(allSessions.reduce((sum, session) => sum + (session.presentCount / session.totalEmployees * 100), 0) / totalSessions)
      : 0;
    
    const maleEmployees = employees.filter(e => e.gender === 'male').length;
    const femaleEmployees = employees.filter(e => e.gender === 'female').length;
    
    return { totalSessions, averageAttendance, maleEmployees, femaleEmployees };
  };

  const getMonthlyStats = () => {
    return storage.getMonthlyAttendanceStats(selectedMonth, selectedYear);
  };

  const getPayrollData = (): PayrollData[] => {
    return storage.getMonthlyPayroll(selectedMonth, selectedYear);
  };

  const exportAttendance = () => {
    const session = storage.getAttendanceSession(selectedDate);
    if (!session) return;
    
    const csvContent = [
      ['Name', 'Employee ID', 'Gender', 'Status', 'Date'],
      ...employees.map(employee => [
        employee.name,
        employee.employeeId,
        employee.gender,
        session.records.find(r => r.employeeId === employee.id)?.status || 'Not marked',
        selectedDate
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPayroll = () => {
    const payrollData = getPayrollData();
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' });
    
    const csvContent = [
      ['Name', 'Employee ID', 'Gender', 'Days Present', 'Daily Rate', 'Basic Salary', 'Contractor Fee', 'Total with Contractor Fee', 'Month', 'Year'],
      ...payrollData.map(p => [
        p.name,
        p.employeeId,
        p.gender,
        p.daysPresent,
        p.dailyRate,
        p.totalSalary,
        p.contractorFee,
        p.totalWithContractorFee,
        p.month,
        p.year
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${monthName}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = getTodayStats();
  const overallStats = getOverallStats();
  const monthlyStats = getMonthlyStats();
  const payrollData = getPayrollData();
  const totalPayroll = payrollData.reduce((sum, p) => sum + p.totalSalary, 0);
  const totalContractorFees = payrollData.reduce((sum, p) => sum + p.contractorFee, 0);
  const totalPayrollWithContractorFee = payrollData.reduce((sum, p) => sum + p.totalWithContractorFee, 0);
  const absentEmployees = getAbsentEmployees();
  const unmarkedEmployees = getUnmarkedEmployees();
  const filteredAttendanceEmployees = getFilteredAndSortedEmployeesForAttendance();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Employee Attendance & Payroll</h1>
              </div>
              <nav className="ml-10 flex space-x-8">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'attendance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'employees'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Employees
                </button>
                <button
                  onClick={() => setActiveTab('payroll')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'payroll'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Payroll
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Date Selection and Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Daily Attendance</h2>
                  <p className="text-sm text-gray-600">Mark attendance for your employees</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={exportAttendance}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
                <StatCard
                  title="Total Employees"
                  value={stats.total}
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Present"
                  value={stats.present}
                  icon={Calendar}
                  color="bg-green-500"
                />
                <StatCard
                  title="Absent"
                  value={stats.absent}
                  icon={UserX}
                  color="bg-red-500"
                />
                <StatCard
                  title="Late"
                  value={stats.late}
                  icon={Calendar}
                  color="bg-orange-500"
                />
                <StatCard
                  title="Unmarked"
                  value={stats.unmarked}
                  icon={Users}
                  color="bg-gray-500"
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${stats.percentage}%`}
                  icon={BarChart3}
                  color="bg-purple-500"
                />
              </div>
            </div>

            {/* Search, Sort, and Bulk Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={attendanceSearchTerm}
                    onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSort('name')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'name'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Name
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSort('employeeId')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'employeeId'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ID
                      {sortBy === 'employeeId' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSort('gender')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'gender'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Gender
                      {sortBy === 'gender' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSort('status')}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'status'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Status
                      {sortBy === 'status' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {unmarkedEmployees.length > 0 && (
                  <button
                    onClick={handleMarkAllUnmarkedAsAbsent}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Mark All Unmarked as Absent ({unmarkedEmployees.length})
                  </button>
                )}
              </div>
            </div>

            {/* Absentees Section */}
            {(absentEmployees.length > 0 || unmarkedEmployees.length > 0) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserX className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Absentees & Unmarked</h3>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {absentEmployees.length + unmarkedEmployees.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Absent Employees */}
                  {absentEmployees.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
                        <UserX className="w-4 h-4 mr-2" />
                        Marked Absent ({absentEmployees.length})
                      </h4>
                      <div className="space-y-2">
                        {absentEmployees.map((employee) => (
                          <AbsenteeCard 
                            key={employee.id} 
                            employee={employee} 
                            status="absent"
                            onStatusChange={handleAttendanceChange}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmarked Employees */}
                  {unmarkedEmployees.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Not Marked ({unmarkedEmployees.length})
                      </h4>
                      <div className="space-y-2">
                        {unmarkedEmployees.map((employee) => (
                          <AbsenteeCard 
                            key={employee.id} 
                            employee={employee} 
                            status="unmarked"
                            onStatusChange={handleAttendanceChange}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attendance List */}
            <div className="space-y-4">
              {filteredAttendanceEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {attendanceSearchTerm ? 'No employees found matching your search.' : 'No employees found. Add some employees to get started.'}
                  </p>
                </div>
              ) : (
                filteredAttendanceEmployees.map((employee) => (
                  <AttendanceCard
                    key={employee.id}
                    employee={employee}
                    status={getEmployeeAttendanceStatus(employee.id)}
                    onStatusChange={handleAttendanceChange}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            {/* Employees Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Employee Management</h2>
                  <p className="text-sm text-gray-600">Add, edit, or remove employees from your roster</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </button>
              </div>
              
              {/* Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees by name, ID, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gender Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <StatCard
                  title="Total Employees"
                  value={employees.length}
                  icon={Users}
                  color="bg-gray-500"
                />
                <StatCard
                  title="Male Employees"
                  value={overallStats.maleEmployees}
                  icon={Users}
                  color="bg-blue-500"
                  subtitle="₹450/day + ₹50 fee"
                />
                <StatCard
                  title="Female Employees"
                  value={overallStats.femaleEmployees}
                  icon={Users}
                  color="bg-pink-500"
                  subtitle="₹400/day + ₹50 fee"
                />
              </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No employees found matching your search.' : 'No employees found. Add some employees to get started.'}
                  </p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onEdit={handleEditEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Monthly Payroll</h2>
                  <p className="text-sm text-gray-600">Calculate salaries based on attendance with contractor fees</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={i} value={2024 + i}>
                        {2024 + i}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={exportPayroll}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <StatCard
                  title="Basic Payroll"
                  value={`₹${totalPayroll.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Contractor Fees"
                  value={`₹${totalContractorFees.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-orange-500"
                />
                <StatCard
                  title="Total Payroll"
                  value={`₹${totalPayrollWithContractorFee.toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-green-500"
                />
                <StatCard
                  title="Working Days"
                  value={monthlyStats.totalWorkingDays}
                  icon={Calendar}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Total Employees"
                  value={employees.length}
                  icon={Users}
                  color="bg-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payrollData.map((payroll) => (
                <PayrollCard key={payroll.employeeId} payroll={payroll} />
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Employees"
                  value={employees.length}
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Total Sessions"
                  value={overallStats.totalSessions}
                  icon={Calendar}
                  color="bg-green-500"
                />
                <StatCard
                  title="Average Attendance"
                  value={`${overallStats.averageAttendance}%`}
                  icon={BarChart3}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Active Days"
                  value={overallStats.totalSessions}
                  icon={Calendar}
                  color="bg-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                    <div>
                      <p className="font-medium text-blue-900">Male Employees</p>
                      <p className="text-sm text-blue-700">Daily Rate: ₹450 + ₹50 contractor fee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">{overallStats.maleEmployees}</p>
                      <p className="text-sm text-blue-600">employees</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border-l-4 border-l-pink-500">
                    <div>
                      <p className="font-medium text-pink-900">Female Employees</p>
                      <p className="text-sm text-pink-700">Daily Rate: ₹400 + ₹50 contractor fee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-900">{overallStats.femaleEmployees}</p>
                      <p className="text-sm text-pink-600">employees</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                <div className="space-y-4">
                  {storage.getAllSessions().slice(-5).reverse().map((session) => (
                    <div key={session.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{new Date(session.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">
                          {session.presentCount} present, {session.absentCount} absent, {session.lateCount} late
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {Math.round((session.presentCount / session.totalEmployees) * 100)}%
                        </p>
                        <p className="text-sm text-gray-500">attendance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(undefined);
        }}
        onSave={handleAddEmployee}
        editingEmployee={editingEmployee}
      />
    </div>
  );
}

export default App;