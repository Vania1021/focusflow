import { FileText, Video, Play, Pause, Download, Trash2, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore, StudyContent } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";

interface ContentCardProps {
  content: StudyContent;
}

export const ContentCard = ({ content }: ContentCardProps) => {
  const { removeContent, currentSession, startSession, pauseSession, resumeSession } = useAppStore();
  const navigate = useNavigate();
  
  const isActive = currentSession?.contentId === content.id;
  const isPlaying = isActive && currentSession.isActive;
  
  const handleStudyAction = () => {
    if (content.status !== 'ready') return;
    
    if (isActive) {
      if (isPlaying) {
        pauseSession();
      } else {
        resumeSession();
      }
    } else {
      startSession(content.id);
      navigate('/study');
    }
  };
  
  const getStatusIcon = () => {
    switch (content.status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-accent" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'error':
        return <span className="w-4 h-4 rounded-full bg-destructive" />;
    }
  };
  
  return (
    <div className={`glass-card p-4 transition-all duration-300 ${isActive ? 'ring-2 ring-accent shadow-glow' : 'hover:shadow-elevated'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          content.type === 'text' ? 'bg-sage-100 text-sage-600' : 'bg-teal-100 text-teal-600'
        }`}>
          {content.type === 'text' ? <FileText className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <h4 className="font-medium text-foreground truncate">{content.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {content.status === 'processing' ? 'Processing...' : 
             content.status === 'error' ? 'Error processing' :
             `Added ${new Date(content.uploadedAt).toLocaleDateString()}`}
          </p>
          
          {content.progress !== undefined && content.progress > 0 && content.status === 'ready' && (
            <div className="mt-3">
              <Progress value={content.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{content.progress}% complete</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {content.status === 'ready' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStudyAction}
                className={isPlaying ? 'text-accent' : ''}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {
                const link = document.createElement('a');
                link.href = content.source;
                link.download = content.title;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => removeContent(content.id)}>
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
};
