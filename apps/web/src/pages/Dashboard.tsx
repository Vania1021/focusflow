import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ContentUpload } from "@/components/dashboard/ContentUpload";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { useAppStore } from "@/store/useAppStore";

const Dashboard = () => {
  const { isAuthenticated, user, contents } = useAppStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated || !user) return null;
  
  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-gradient">StudyFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Hello, {user.name}!
              </span>
              <div className="w-10 h-10 rounded-full gradient-sage flex items-center justify-center text-primary-foreground font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Streak & Profile */}
          <div className="space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <StreakDisplay />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ProfileCard />
            </div>
          </div>
          
          {/* Center & Right - Upload & Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <ContentUpload />
            </div>
            
            {/* Content List */}
            <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-foreground">Your Content</h2>
                <span className="text-sm text-muted-foreground">{contents.length} items</span>
              </div>
              
              {contents.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-sage-400" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No content yet</h3>
                  <p className="text-muted-foreground mb-4">Upload your first PDF or video to start studying</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
