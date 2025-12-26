import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Video, Flame, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen gradient-soft overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-gradient">StudyFlow</h1>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 text-sage-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Your personal study companion
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Study smarter,{" "}
              <span className="text-gradient">not harder</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your PDFs and videos, track your progress, and build lasting study habits 
              with our beautifully simple learning platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-sage-600" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Upload & Learn</h3>
            <p className="text-muted-foreground">
              Import PDFs, documents, or paste links. We'll process them for optimal studying.
            </p>
          </div>
          
          <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Video Content</h3>
            <p className="text-muted-foreground">
              Add videos from YouTube or upload directly. Study at your own pace with sessions.
            </p>
          </div>
          
          <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Build Streaks</h3>
            <p className="text-muted-foreground">
              Track daily progress and maintain study streaks. Stay motivated with visual goals.
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-24 text-center animate-fade-up" style={{ animationDelay: "0.5s" }}>
          <div className="inline-flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div>
              <p className="font-serif text-4xl font-bold text-gradient">10k+</p>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div>
              <p className="font-serif text-4xl font-bold text-gradient">50k+</p>
              <p className="text-muted-foreground">Hours Studied</p>
            </div>
            <div className="w-px h-12 bg-border hidden md:block" />
            <div>
              <p className="font-serif text-4xl font-bold text-gradient">98%</p>
              <p className="text-muted-foreground">Goal Completion</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 StudyFlow. Built for focused learning.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
