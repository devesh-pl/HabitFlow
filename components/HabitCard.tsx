import React from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onDelete: (id: string) => void;
  isLatest?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onDelete, isLatest = false }) => {
  const isDone = habit.status === 'Done';

  return (
    <div className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
      isLatest 
        ? 'bg-white shadow-lg border-blue-200 scale-100 ring-2 ring-blue-100' 
        : 'bg-white shadow-sm border-gray-100 hover:shadow-md'
    }`}>
      {isLatest && (
        <span className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
          Latest Entry
        </span>
      )}
      
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          isDone ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isDone ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{habit.habitName}</h3>
          <p className="text-xs text-gray-500">{habit.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          isDone ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          {habit.status}
        </span>
        <button 
          onClick={() => onDelete(habit.id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Delete habit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
};