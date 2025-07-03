import React from 'react';
import { User, Calendar, Receipt } from 'lucide-react';
import { PayrollData } from '../types/attendance';

interface PayrollCardProps {
  payroll: PayrollData;
}

export const PayrollCard: React.FC<PayrollCardProps> = ({ payroll }) => {
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
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 ${getGenderBorder(payroll.gender)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getGenderColors(payroll.gender)} rounded-full flex items-center justify-center`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{payroll.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                payroll.gender === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {payroll.gender === 'male' ? '♂ Male' : '♀ Female'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-600 font-bold text-lg">
            <span className="mr-1">₹</span>
            {payroll.totalWithContractorFee.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Total with Contractor Fee</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Basic Salary */}
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">Basic Salary</span>
          </div>
          <span className="text-blue-900 font-semibold">₹{payroll.totalSalary.toLocaleString()}</span>
        </div>

        {/* Contractor Fee */}
        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">Contractor Fee</span>
          </div>
          <span className="text-orange-900 font-semibold">₹{payroll.contractorFee}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Days Present</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{payroll.daysPresent}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 text-gray-600 flex items-center justify-center text-sm">₹</span>
              <span className="text-sm text-gray-600">Daily Rate</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">₹{payroll.dailyRate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};