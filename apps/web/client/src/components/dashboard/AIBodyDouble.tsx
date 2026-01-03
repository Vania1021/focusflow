import React from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { useStudyStore } from '@/store/useStudyTemp';
import { Brain, Heart } from 'lucide-react';

export const AIBodyDouble = () => {
  const { state, companionMessage, score } = useFocusStore();
  const { currentSession } = useStudyStore();

  // Only show when a study session is active
  if (!currentSession) return null;

  const getStatusColor = () => {
    if (state === "LOST") return "text-red-500 bg-red-50 border-red-200";
    if (state === "AT_RISK") return "text-orange-500 bg-orange-50 border-orange-200";
    return "text-sage-600 bg-sage-50 border-sage-100";
  };

  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-2xl border shadow-lg max-w-xs animate-fade-in z-50 transition-colors duration-500 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {state === "FOCUSED" ? <Heart className="w-5 h-5 fill-current" /> : <Brain className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Focus Companion</p>
            <p className="text-[10px] font-mono">{score}%</p>
          </div>
          <p className="text-sm font-medium leading-tight">
            {companionMessage}
          </p>
        </div>
      </div>
    </div>
  );
};