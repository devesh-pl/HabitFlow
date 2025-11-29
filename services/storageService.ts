import { Habit } from '../types';

const STORAGE_KEY = 'habitflow_data_v1';

export const getHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load habits", e);
    return [];
  }
};

export const saveHabit = (habit: Habit): Habit[] => {
  const current = getHabits();
  const updated = [habit, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteHabit = (id: string): Habit[] => {
  const current = getHabits();
  const updated = current.filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearHabits = (): Habit[] => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};