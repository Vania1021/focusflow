import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Square, ChevronLeft, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

const Study = () => {
  const { currentSession, contents, pauseSession, resumeSession, endSession } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentContent = contents.find(c => c.id === currentSession?.contentId);
  
  useEffect(() => {
    if (!currentSession) {
      navigate("/dashboard");
      return;
    }
    
    if (currentSession.isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentSession, navigate]);
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleTogglePlay = () => {
    if (currentSession?.isActive) {
      pauseSession();
    } else {
      resumeSession();
    }
  };
  
  const handleEnd = () => {
    endSession();
    toast({
      title: "Session complete!",
      description: `You studied for ${formatTime(elapsedSeconds)}. Great work!`,
    });
    navigate("/dashboard");
  };
  
  if (!currentSession || !currentContent) return null;
  
  const isPlaying = currentSession.isActive;
  const targetMinutes = 30; // Default 30 min goal
  const progressPercent = Math.min((elapsedSeconds / (targetMinutes * 60)) * 100, 100);
  
  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-medium text-foreground truncate">{currentContent.title}</h1>
              <p className="text-sm text-muted-foreground">Study Session</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Study Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 text-center space-y-8 animate-scale-in">
            {/* Timer Display */}
            <div className="relative">
              <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center ${
                isPlaying ? 'gradient-sage animate-pulse-soft' : 'bg-sage-100'
              }`}>
                <div className="w-40 h-40 rounded-full bg-card flex items-center justify-center">
                  <div>
                    <p className="font-serif text-4xl font-bold text-foreground">
                      {formatTime(elapsedSeconds)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isPlaying ? "Studying..." : "Paused"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress to Goal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>Daily Goal</span>
                </div>
                <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} />
              <p className="text-xs text-muted-foreground">
                {targetMinutes - Math.floor(elapsedSeconds / 60)} min remaining to reach your goal
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleEnd}
                className="w-14 h-14 rounded-full p-0"
              >
                <Square className="w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                onClick={handleTogglePlay}
                className="w-20 h-20 rounded-full p-0"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
              
              <div className="w-14 h-14" /> {/* Spacer for symmetry */}
            </div>
            
            {/* Export Options */}
            <div className="flex justify-center gap-4 mt-4">
               <Button variant="outline" size="sm" onClick={() => toast({ title: "Summary exported", description: "Your summary has been downloaded." })}>
                 Export Summary
               </Button>
               <Button variant="outline" size="sm" onClick={() => toast({ title: "Flowchart exported", description: "Your flowchart has been downloaded." })}>
                 Export Flowchart
               </Button>
            </div>
            
            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-sage-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="font-serif text-xl font-bold text-foreground">
                  {Math.floor(elapsedSeconds / 60)}
                </p>
                <p className="text-xs text-muted-foreground">Minutes studied</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-accent mb-1">
                  <Target className="w-4 h-4" />
                </div>
                <p className="font-serif text-xl font-bold text-foreground">
                  {targetMinutes}
                </p>
                <p className="text-xs text-muted-foreground">Daily target</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Study;
