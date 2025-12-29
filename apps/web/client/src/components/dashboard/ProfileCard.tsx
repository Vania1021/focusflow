import { Brain, Zap, Target, Ear } from "lucide-react";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { Progress } from "@/components/ui/progress";

export const ProfileCard = () => {
  const { preferences, isLoading } = usePreferencesStore();
  
  if (isLoading) return <div className="glass-card p-6 animate-pulse">Analyzing habits...</div>;
  if (!preferences?.aiEvaluation) return null;

  const { aiEvaluation } = preferences;

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-sage-100 text-sage-600">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Neuro-Profile</h3>
          <p className="text-xs text-muted-foreground">Bio-adaptive Configuration</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* ADHD Index */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span>ADHD Variance Index</span>
            <span>{aiEvaluation.adhdLevel}/5</span>
          </div>
          <Progress value={(aiEvaluation.adhdLevel / 5) * 100} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Zap className="w-3 h-3" /> Intensity
            </div>
            <p className="font-bold text-sm capitalize">{aiEvaluation.focusIntensity}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Target className="w-3 h-3" /> Pomodoro
            </div>
            <p className="font-bold text-sm">{aiEvaluation.recommendedPomodoro}m</p>
          </div>
        </div>

        {/* Sensory Tags */}
        <div className="pt-2">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">
            Sensory Adaptations
          </p>
          <div className="flex flex-wrap gap-2">
            {aiEvaluation.sensoryNeeds.map((need, i) => (
              <span key={i} className="px-2 py-1 rounded-md bg-sage-50 text-[10px] text-sage-700 font-bold border border-sage-200">
                {need.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};