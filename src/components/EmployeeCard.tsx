import React from 'react';
import { User, Mail, Phone, Edit2, Trash2, Briefcase } from 'lucide-react';
import { Employee } from '../types/attendance';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
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

  const getDailyRate = (gender: 'male' | 'female') => {
    return gender === 'male' ? 450 : 400;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${getGenderBorder(employee.gender)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getGenderColors(employee.gender)} rounded-full flex items-center justify-center`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                employee.gender === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {employee.gender === 'male' ? '♂ Male' : '♀ Female'}
              </span>
              <span className="text-xs text-gray-500">₹{getDailyRate(employee.gender)}/day + ₹50 fee</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(employee.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {employee.position && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{employee.position}</span>
          </div>
        )}
        {employee.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{employee.email}</span>
          </div>
        )}
        {employee.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{employee.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};