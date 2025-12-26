import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";

export const ProfileCard = () => {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full gradient-sage flex items-center justify-center text-primary-foreground text-xl font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl font-semibold text-foreground">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      {user.studyGoal && (
        <div className="bg-sage-50 rounded-lg p-4">
          <p className="text-sm text-sage-600 mb-1">Study Goal</p>
          <p className="font-medium text-sage-800">{user.studyGoal}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Edit Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};
