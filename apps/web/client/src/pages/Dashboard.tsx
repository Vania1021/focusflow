import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Loader2, FileText, PlayCircle, 
  Mic, LayoutDashboard, LogOut, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ContentUpload } from "@/components/dashboard/ContentUpload";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { useAuthStore } from "@/store/useAuthStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useStudyStore } from "@/store/useStudyTemp";

const Dashboard = () => {
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
    }
  }, [isAuthenticated, navigate, getPreferences]);

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

            {/* Conditional Lab Components */}
            {activeTab !== 'overview' && (
              <div className="animate-fade-in space-y-6">
                <ContentUpload activeTab={activeTab} />
                <OutputVibeSelector />
              </div>
            )}

            {/* Unified Material List */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-semibold">Your Learning Materials</h3>
              <div className="grid grid-cols-1 gap-3">
                {contents
                  .filter(c => activeTab === 'overview' || c.type === activeTab)
                  .map((content) => <ContentCard key={content.id} content={content} />)
                }
                {contents.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground border-dashed border-2 rounded-xl">
                    No {activeTab} materials synced.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            <ProfileCard />
            <StreakDisplay />
          </div>
        </div>
      </main>
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

// New Component: Output Vibe Selector for variety
const OutputVibeSelector = () => (
  <div className="glass-card p-6 space-y-4">
    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Select Output Style</h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {['Text Summary', 'Visual Diagram', 'Flowchart', 'Flashcards'].map(style => (
        <button key={style} className="p-3 border rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-colors border-border/50">
          {style.toUpperCase()}
        </button>
      ))}
    </div>
  </div>
);

export default Dashboard;