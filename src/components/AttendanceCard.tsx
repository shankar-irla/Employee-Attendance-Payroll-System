import React from 'react';
import { User, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Employee } from '../types/attendance';

interface AttendanceCardProps {
  employee: Employee;
  status: 'present' | 'absent' | 'late' | null;
  onStatusChange: (employeeId: string, status: 'present' | 'absent' | 'late') => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ employee, status, onStatusChange }) => {
  const getStatusColor = (currentStatus: typeof status) => {
    switch (currentStatus) {
      case 'present': return 'bg-green-100 border-green-300';
      case 'absent': return 'bg-red-100 border-red-300';
      case 'late': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (currentStatus: typeof status) => {
    switch (currentStatus) {
      case 'present': return <Check className="w-5 h-5 text-green-600" />;
      case 'absent': return <X className="w-5 h-5 text-red-600" />;
      case 'late': return <Clock className="w-5 h-5 text-orange-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGenderColors = (gender: 'male' | 'female') => {
    return gender === 'male' 
      ? 'from-blue-500 to-blue-700' 
      : 'from-pink-500 to-pink-700';
  };

  const getGenderBorder = (gender: 'male' | 'female') => {
    return gender === 'male' 
      ? 'border-l-4 border-l-blue-500' 
      : 'border-l-4 border-l-pink-500';
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(status)} ${getGenderBorder(employee.gender)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getGenderColors(employee.gender)} rounded-full flex items-center justify-center`}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{employee.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                employee.gender === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {employee.gender === 'male' ? '♂' : '♀'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="mr-2">
            {getStatusIcon(status)}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onStatusChange(employee.id, 'present')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                status === 'present'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Present
            </button>
            <button
              onClick={() => onStatusChange(employee.id, 'late')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                status === 'late'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Late
            </button>
            <button
              onClick={() => onStatusChange(employee.id, 'absent')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                status === 'absent'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Absent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};