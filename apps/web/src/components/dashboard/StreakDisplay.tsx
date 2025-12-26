import { Flame, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export const StreakDisplay = () => {
  const { streak } = useAppStore();
  
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxProgress = Math.max(...streak.weeklyProgress, 60);
  
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-foreground">Study Streak</h3>
        <div className="streak-badge animate-streak-glow">
          <Flame className="w-4 h-4" />
          <span>{streak.currentStreak} days</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sage-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sage-600 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">Current</span>
          </div>
          <p className="font-serif text-3xl font-bold text-sage-700">{streak.currentStreak}</p>
        </div>
        <div className="bg-teal-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Best</span>
          </div>
          <p className="font-serif text-3xl font-bold text-teal-700">{streak.longestStreak}</p>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-3">This week</p>
        <div className="flex items-end justify-between gap-2 h-24">
          {streak.weeklyProgress.map((minutes, index) => {
            const height = maxProgress > 0 ? (minutes / maxProgress) * 100 : 0;
            const isToday = index === new Date().getDay();
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${Math.max(height, 8)}%`,
                    background: isToday 
                      ? 'linear-gradient(180deg, hsl(var(--accent)), hsl(var(--primary)))' 
                      : minutes > 0 
                        ? 'hsl(var(--sage-200))' 
                        : 'hsl(var(--sage-100))',
                  }}
                />
                <span className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-muted-foreground'}`}>
                  {days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
