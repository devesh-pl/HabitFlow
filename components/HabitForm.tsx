import React, { useState } from 'react';
import { HabitStatus } from '../types';
import { parseNaturalLanguageHabit, getHabitMotivation } from '../services/geminiService';

interface HabitFormProps {
  onAddHabit: (name: string, status: HabitStatus, date: string) => void;
  onMotivation: (text: string) => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onAddHabit, onMotivation }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  
  // Manual State
  const [name, setName] = useState('');
  const [status, setStatus] = useState<HabitStatus>('Done');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAddHabit(name, status, date);
    
    // Trigger lightweight motivation
    const motivation = await getHabitMotivation(name, status);
    onMotivation(motivation);

    // Reset
    setName('');
    setStatus('Done');
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await parseNaturalLanguageHabit(aiInput);
      
      if (result && result.confidence > 0.5) {
        onAddHabit(result.habitName, result.status, result.date);
        const motivation = await getHabitMotivation(result.habitName, result.status);
        onMotivation(motivation);
        setAiInput('');
      } else {
        setError("Could not clearly understand the habit. Please try again or use Manual mode.");
      }
    } catch (err) {
      setError("AI Service unavailable. Please check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === 'manual' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'ai' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M15 11v.01"/></svg>
          AI Assistant
        </button>
      </div>

      <div className="p-6">
        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Read 30 mins"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setStatus('Done')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      status === 'Done' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Not Done')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      status === 'Not Done' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Not Done
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Save Habit
            </button>
          </form>
        ) : (
          <form onSubmit={handleAISubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tell us what you did</label>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., 'I ran 5 miles this morning' or 'I forgot to drink water today'"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">Gemini will automatically extract the habit, date, and status.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !aiInput.trim()}
              className={`w-full py-3 font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 ${
                isLoading ? 'bg-purple-300 cursor-not-allowed text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                  Process with AI
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};