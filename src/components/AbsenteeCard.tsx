import React from 'react';
import { User, Clock, Check, X, AlertCircle } from 'lucide-react';
import { Employee } from '../types/attendance';

interface AbsenteeCardProps {
  employee: Employee;
  status: 'absent' | 'unmarked';
  onStatusChange: (employeeId: string, status: 'present' | 'absent' | 'late') => void;
}

export const AbsenteeCard: React.FC<AbsenteeCardProps> = ({ employee, status, onStatusChange }) => {
  const getGenderColors = (gender: 'male' | 'female') => {
    return gender === 'male' 
      ? 'from-blue-500 to-blue-700' 
      : 'from-pink-500 to-pink-700';
  };

  const getStatusColor = () => {
    return status === 'absent' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    return status === 'absent' 
      ? <X className="w-4 h-4 text-red-600" />
      : <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${getGenderColors(employee.gender)} rounded-full flex items-center justify-center`}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{employee.name}</h4>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-600">ID: {employee.employeeId}</p>
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
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
            {getStatusIcon()}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onStatusChange(employee.id, 'present')}
              className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
            >
              Present
            </button>
            <button
              onClick={() => onStatusChange(employee.id, 'late')}
              className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              Late
            </button>
            {status === 'unmarked' && (
              <button
                onClick={() => onStatusChange(employee.id, 'absent')}
                className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Absent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};