import React, { useState, useEffect } from 'react';
import { Habit, HabitStatus } from './types';
import { getHabits, saveHabit, deleteHabit } from './services/storageService';
import { HabitForm } from './components/HabitForm';
import { HabitCard } from './components/HabitCard';
import { Auth } from './components/Auth';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [motivationMsg, setMotivationMsg] = useState<string | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Load habits on mount (local storage for now)
  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const handleAddHabit = (name: string, status: HabitStatus, date: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      habitName: name,
      status,
      date,
      createdAt: Date.now(),
    };
    
    const updated = saveHabit(newHabit);
    setHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = deleteHabit(id);
    setHabits(updated);
  };

  const handleMotivation = (msg: string) => {
    setMotivationMsg(msg);
    // Auto-dismiss after 5 seconds
    setTimeout(() => setMotivationMsg(null), 5000);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  // Auth Loading Screen
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Auth />;
  }

  // Derived state
  const latestHabit = habits.length > 0 ? habits[0] : null;
  const historyHabits = habits.length > 0 ? habits.slice(1) : [];
  
  const completedCount = habits.filter(h => h.status === 'Done').length;
  const completionRate = habits.length ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <header className="flex flex-col items-center mb-8 relative">
           <button 
             onClick={handleSignOut}
             className="absolute right-0 top-0 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
           >
             Sign Out
           </button>

          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 mt-4">
            <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">HabitFlow</h1>
          <p className="text-gray-500 mt-2">Track, analyze, and improve your daily routine.</p>
          <p className="text-xs text-blue-600 mt-2">Welcome, {user.email}</p>
        </header>

        {/* Motivation Toast */}
        {motivationMsg && (
          <div className="animate-fade-in-down bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <p className="font-medium">{motivationMsg}</p>
            </div>
            <button onClick={() => setMotivationMsg(null)} className="text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase">Total</p>
            <p className="text-2xl font-bold text-gray-800">{habits.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase">Done</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase">Rate</p>
            <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
          </div>
        </div>

        {/* Form */}
        <HabitForm onAddHabit={handleAddHabit} onMotivation={handleMotivation} />

        {/* Latest Habit */}
        {latestHabit && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800 px-1">Latest Activity</h2>
            <HabitCard 
              habit={latestHabit} 
              onDelete={handleDeleteHabit} 
              isLatest={true} 
            />
          </div>
        )}

        {/* History */}
        {historyHabits.length > 0 && (
          <div className="space-y-3 pt-4">
            <h2 className="text-lg font-bold text-gray-800 px-1">History</h2>
            <div className="space-y-3">
              {historyHabits.map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onDelete={handleDeleteHabit} 
                />
              ))}
            </div>
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No habits tracked yet.</p>
            <p className="text-sm">Start by adding one above!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;