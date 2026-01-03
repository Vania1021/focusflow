import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Loader2, FileText, PlayCircle, 
  Mic, LayoutDashboard, LogOut, ChevronRight, Settings, History,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ProfileOverview } from "@/components/dashboard/ProfileOverview";
import { ContentUpload } from "@/components/dashboard/ContentUpload";
import { ProcessedContentDisplay } from "@/components/dashboard/ProcessedContentDisplay";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { useAuthStore } from "@/store/useAuthStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useStudyStore } from "@/store/useStudyTemp";
import { useProgressStore } from "@/store/useProgressStore";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { MyLearningHistory } from "@/components/dashboard/MyLearningHistory";
import { useToast } from "@/hooks/use-toast";
import { useContentOutputStore } from "@/store/useContentOutput";
import { AIBodyDouble } from "@/components/dashboard/AIBodyDouble";
import TextInputTab from "../pages/TextInputTab";
import { ContentUploadVideo } from "@/components/dashboard/ContentUploadVideo";
import VideoInputTab from "./VideoInputTab";


/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */
export type OutputStyle = "summary" | "visual" | "flowchart" | "flashcards";

export const OUTPUTS: { id: OutputStyle; label: string }[] = [
  { id: "summary", label: "Text Summary" },
  { id: "visual", label: "Visual Diagram" },
  { id: "flowchart", label: "Flowchart" },
  { id: "flashcards", label: "Flashcards" },
];



const Dashboard = () => {
  const {progress, getOrUpdateProgress} = useProgressStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { preferences, getPreferences } = usePreferencesStore();
  const { contents } = useStudyStore();
  const navigate = useNavigate();
  
  // Active Lab state: 'overview' | 'text' | 'video' | 'audio'
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else {
      getPreferences(); 
      getOrUpdateProgress();
    }
  }, [isAuthenticated, navigate, getPreferences, getOrUpdateProgress]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation - Reduces context switching for ADHD users */}
      <aside className="w-64 glass-card border-r border-border/50 flex flex-col p-6 z-20">
        <h1 className="font-serif text-2xl font-bold text-gradient mb-8">FocusFlow</h1>
        
        <nav className="flex-1 space-y-2">
          <SidebarLink 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <SidebarLink 
            icon={<UserIcon className="w-4 h-4" />} 
            label="My Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <SidebarLink 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Input Labs
          </div>
          <SidebarLink 
            icon={<FileText className="w-4 h-4" />} 
            label="Text Labs" 
            active={activeTab === 'text'} 
            onClick={() => setActiveTab('text')} 
          />
          <SidebarLink 
            icon={<PlayCircle className="w-4 h-4" />} 
            label="Video Focus" 
            active={activeTab === 'video'} 
            onClick={() => setActiveTab('video')} 
          />
          <SidebarLink 
            icon={<Mic className="w-4 h-4" />} 
            label="Audio Stream" 
            active={activeTab === 'audio'} 
            onClick={() => setActiveTab('audio')} 
          />
          <SidebarLink 
            icon={<History className="w-4 h-4" />} 
            label="My Learning History" 
            active={activeTab === 'myLearningHistory'} 
            onClick={() => setActiveTab('myLearningHistory')} 
          />
        </nav>

        <Button 
          variant="ghost" 
          className="justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* 1. putting a check here If tab is 'settings', show ONLY the Settings View */}
        {activeTab === 'settings' ? (
           <SettingsView />
        ) : activeTab === 'myLearningHistory' ? (
          <MyLearningHistory />
        ) : (
           /* 2. ELSE: Render the Standard Dashboard (Overview, Profile, Labs, etc all the other crap: to be fixed) */
           <>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold capitalize">{activeTab} Dashboard</h2>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          
          <div className="px-4 py-2 rounded-full bg-sage-50 border border-sage-200 text-xs font-bold text-sage-700">
            {preferences?.aiEvaluation?.focusIntensity || "Syncing"} Focus Mode
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dynamic Center Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Insight Highlight: Now formatted as dopamine-friendly bullets */}
            {activeTab === 'overview' && preferences?.aiEvaluation && (
              <div className="glass-card p-6 border-l-4 border-accent animate-fade-in bg-accent/5">
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Focus Insights</h3>
                </div>
                <ul className="space-y-3">
                  {/* Assuming personalizedInsight is now an array from backend */}
                  {Array.isArray(preferences.aiEvaluation.personalizedInsight) ? (
                    preferences.aiEvaluation.personalizedInsight.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                        <span className="text-accent mt-1">•</span> {point}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm italic">"{preferences.aiEvaluation.personalizedInsight}"</li>
                  )}
                </ul>
              </div>
            )}

            {/* Dashboard Content */}
            {activeTab === 'profile' && <ProfileOverview />}

            {/* Conditional Lab Components */}
            {(activeTab === 'text'  || activeTab === 'audio') && (
              <div className="animate-fade-in space-y-6">
                <ContentUpload activeTab={activeTab} />
                
                <TextInputTab />
                <ProcessedContentDisplay />
              </div>
            )}


            {(activeTab === 'video') && (
              <div className="animate-fade-in space-y-6">
                <ContentUploadVideo />
                
                <VideoInputTab />
                <ProcessedContentDisplay />
              </div>
            )}

            {/* Unified Material List */}
            <div className="pt-6">
                <h3 className="font-serif text-xl font-semibold mb-4">Focus Session</h3>
                <FocusTimer />
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            <ProfileCard />
            <StreakDisplay />
          </div>
        </div>
        </> 
              )}
      </main>

      {/* The AI Companion follows the user everywhere */}
      <AIBodyDouble />
    </div>
  );
};

// Sub-component for Sidebar Links
const SidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
      active ? 'bg-primary text-white shadow-soft' : 'hover:bg-muted text-muted-foreground'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
    {active && <ChevronRight className="w-3 h-3" />}
  </button>
);

export default Dashboard;