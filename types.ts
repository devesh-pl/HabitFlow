export type HabitStatus = 'Done' | 'Not Done';

export interface Habit {
  id: string;
  habitName: string;
  status: HabitStatus;
  date: string; // ISO Date string YYYY-MM-DD
  createdAt: number; // Timestamp
}

export interface HabitStats {
  total: number;
  completed: number;
  rate: number;
}