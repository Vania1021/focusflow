import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  Layers,
  Radio,
  MousePointer2,
  Check,
  Sparkles,
  Zap,
  Clock,
  Layout,
  MessageSquareText,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Helper Component for Bionic Reading Effect
const BionicText = ({ text }: { text: string }) => {
  return (
    <span>
      {text.split(" ").map((word, i) => {
        const midpoint = Math.ceil(word.length / 2);
        const boldPart = word.substring(0, midpoint);
        const lightPart = word.substring(midpoint);
        return (
          <span key={i} className="inline-block mr-1">
            <span className="font-bold text-[#2D1B18]">{boldPart}</span>
            <span className="opacity-70 font-medium">{lightPart}</span>
          </span>
        );
      })}
    </span>
  );
};

const Index = () => {
  const [demoStep, setDemoStep] = useState(0);

  // Self-running demo sequence simulating a 30-second learning burst
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 6);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-[#4A6741]/20 overflow-x-hidden">
      
      {/* 1. NAVIGATION */}
      <header className="container mx-auto px-6 py-2 sticky top-0 bg-[#FDFCFB]/80 backdrop-blur-md z-50">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="focusflow logo" className="h-20" />
            <span className="font-serif text-2xl font-bold text-[#3E2A26] tracking-tight"></span>
          </div>
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-[#5D4037]">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-[#4A6741] text-white rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6">
        
        {/* 2. HERO: Instant Initiation */}
        <section className="max-w-4xl mx-auto text-center pt-24 pb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A6741]/10 text-[#4A6741] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" />
            Bio-Adaptive Learning
          </div>
          <h1 className="font-serif text-5xl md:text-8xl font-black text-[#2D1B18] mb-8 leading-[1.1]">
            Your screen,
            <br />
            <span className="text-[#4A6741]">finally organized.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#5D4037]/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            FocusFlow quietly arranges videos, meetings, and pages
            so <span className="text-[#4A6741] font-semibold underline decoration-2 underline-offset-4">nothing slips away</span> while you learn.
          </p>

          <Button size="lg" className="bg-[#4A6741] hover:bg-[#3D5635] text-lg px-12 h-18 rounded-full shadow-2xl group transition-all">
            Live Demo (3-min)
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </section>

        {/* 3. THE CENTERPIECE: SELF-RUNNING LIVE DEMO */}
        <section className="max-w-6xl mx-auto mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[2.5rem] border border-[#E8E1D5] shadow-2xl overflow-hidden min-h-[500px]">
            
            {/* Left Side: The "Source" (Video/Web) */}
            <div className="bg-[#111] p-1 flex flex-col relative">
               <div className="flex-1 rounded-t-[1.5rem] bg-[#1a1a1a] flex flex-col items-center justify-center p-8 text-center">
                  <div className={`transition-all duration-700 ${demoStep === 5 ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 animate-pulse">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                    </div>
                    <p className="text-white/80 font-serif text-xl italic max-w-xs">
                      {demoStep < 5 ? "Watching a lecture on neurobiology..." : "Applying Bionic Reading to transcript..."}
                    </p>
                  </div>
               </div>
               
               {/* Bionic Transformation overlay for Demo Step 5 */}
               {demoStep === 5 && (
                 <div className="absolute inset-0 bg-white p-12 flex items-center justify-center animate-fade-in">
                   <div className="text-2xl text-[#3E2A26] leading-relaxed">
                     <BionicText text="This is how FocusFlow remaps the digital world. It guides your eyes through every word so you never lose your place." />
                   </div>
                 </div>
               )}

               <div className="h-16 bg-[#222] flex items-center px-6 gap-4 border-t border-white/5">
                 <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-[#4A6741] transition-all duration-1000" style={{ width: `${(demoStep + 1) * 16}%` }} />
                 </div>
                 <span className="text-white/40 text-xs font-mono">04:20 / 12:00</span>
               </div>
            </div>

            {/* Right Side: FocusFlow Intelligence Panel */}
            <div className="p-8 md:p-12 space-y-6 bg-[#FDFCFB]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A6741]">Intelligence Dashboard</p>
                <div className="flex gap-1">
                   <span className="w-2 h-2 rounded-full bg-[#4A6741] animate-pulse" />
                   <span className="text-[10px] font-bold text-[#4A6741]">Syncing...</span>
                </div>
              </div>

              <div className="space-y-4">
                {demoStep >= 1 && (
                  <div className="animate-fade-in slide-in-from-right-4 duration-500">
                    <DemoCard color="blue" title="Topic Highlight" icon={<Target className="w-4 h-4" />}>
                      What this content is about
                    </DemoCard>
                  </div>
                )}
                {demoStep >= 2 && (
                  <div className="animate-fade-in slide-in-from-right-4 duration-500">
                    <DemoCard color="green" title="Smart Nugget" icon={<Zap className="w-4 h-4" />}>
                      Main idea, simplified for you
                    </DemoCard>
                  </div>
                )}
                {demoStep >= 3 && (
                  <div className="animate-fade-in slide-in-from-right-4 duration-500">
                    <div className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded-lg">
                       <div className="flex items-center gap-2 mb-2">
                         <Layers className="w-4 h-4 text-orange-600" />
                         <span className="font-bold text-orange-800">Visual Step</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded border-2 border-dashed border-orange-300 flex items-center justify-center text-xs">1</div>
                          <div className="h-0.5 flex-1 bg-orange-200" />
                          <div className="w-10 h-10 rounded border-2 border-dashed border-orange-300 flex items-center justify-center text-xs">2</div>
                       </div>
                    </div>
                  </div>
                )}
                {demoStep >= 4 && (
                  <div className="animate-fade-in slide-in-from-right-4 duration-500 bg-[#4A6741] text-white p-4 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <p className="text-sm font-semibold">Missed a bit? A 30-sec catch-up is ready.</p>
                  </div>
                )}
                {demoStep === 0 && (
                   <div className="h-64 flex flex-col items-center justify-center text-muted-foreground italic border-2 border-dashed border-[#E8E1D5] rounded-3xl">
                      <Radio className="w-10 h-10 mb-4 opacity-20" />
                      Listening to your lecture...
                   </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE FOUR PILLARS: Interactive Micro-Benefits */}
        <section className="max-w-6xl mx-auto mb-32 grid grid-cols-1 md:grid-cols-2 gap-10">
          <Feature
            icon={<Eye />}
            title="Your eyes always know where to go"
            description="Pages become calm instantly. No more rereading paragraphs three times."
            items={["Bionic Text Engines", "Wall-of-Text Shredder", "Semantic Anchors"]}
          />
          <Feature
            icon={<Radio />}
            title="Miss nothing, even when you zone out"
            description="Catch-up summaries that actually help. Jump back without the guessing game."
            items={["Live Catch-up Summaries", "Topic Landmarks", "Audio-to-Nugget Extraction"]}
          />
          <Feature
            icon={<Layers />}
            title="Understand it at a glance"
            description="We turn complex paragraphs into visual steps. Ideas stick better when they're shapes."
            items={["Interactive Flowcharts", "Select-to-Explain", "One-Click Simplification"]}
          />
          <Feature
            icon={<MousePointer2 />}
            title="Steps in when things feel heavy"
            description="Automatic overload reduction. We detect when you're tab-hopping and help you anchor."
            items={["Cognitive Overload Protection", "Tab-Hopping Prevention", "Actionable Next-Steps"]}
          />
        </section>

        {/* 5. TRUST & CALM */}
        <section className="bg-[#F8F5F0] rounded-[3rem] p-20 text-center mb-32 border border-[#E8E1D5]">
          <h3 className="font-serif text-4xl font-bold text-[#3E2A26] mb-8">
            Designed for high-performance comfort
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
             <div className="space-y-4">
                <Check className="w-8 h-8 text-[#4A6741] mx-auto" />
                <h4 className="font-bold">Zero Noise</h4>
                <p className="text-sm text-[#5D4037]/70">No alerts, no notifications, no pressure.</p>
             </div>
             <div className="space-y-4">
                <Layout className="w-8 h-8 text-[#4A6741] mx-auto" />
                <h4 className="font-bold">Pure Hierarchy</h4>
                <p className="text-sm text-[#5D4037]/70">The most important info is always the biggest.</p>
             </div>
             <div className="space-y-4">
                <MessageSquareText className="w-8 h-8 text-[#4A6741] mx-auto" />
                <h4 className="font-bold">On-Demand Help</h4>
                <p className="text-sm text-[#5D4037]/70">Ask about anything you see on screen.</p>
             </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="text-center pb-32">
          <h2 className="font-serif text-5xl font-black text-[#2D1B18] mb-10">
            Remap your learning today.
          </h2>
          <Link to="/auth">
            <Button size="xl" className="bg-[#4A6741] hover:bg-[#3D5635] text-xl px-16 h-20 rounded-full shadow-2xl">
              Launch FocusFlow
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </Link>
          <p className="mt-8 text-sm text-muted-foreground font-medium uppercase tracking-widest">
            30-second free assessment inside
          </p>
        </section>

      </main>
    </div>
  );
};

const DemoCard = ({
  color,
  title,
  icon,
  children
}: {
  color: "blue" | "green";
  title: string;
  icon: React.ReactNode;
  children: string;
}) => {
  const map = {
    blue: "border-blue-400 bg-blue-50 text-blue-900",
    green: "border-green-400 bg-green-50 text-green-900"
  };

  return (
    <div className={`border-l-4 p-5 rounded-xl shadow-sm ${map[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-70">{icon}</span>
        <p className="font-bold text-sm uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

const Feature = ({
  icon,
  title,
  description,
  items
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}) => (
  <div className="bg-white rounded-[2.5rem] p-12 border border-[#E8E1D5] hover:shadow-xl transition-all group">
    <div className="w-14 h-14 mb-8 text-[#4A6741] bg-[#FDFCFB] rounded-2xl flex items-center justify-center border border-[#E8E1D5] group-hover:scale-110 transition-transform shadow-sm">
      {icon}
    </div>
    <h4 className="font-serif text-3xl font-bold mb-4 text-[#3E2A26]">{title}</h4>
    <p className="text-[#5D4037]/70 mb-8 text-lg leading-relaxed">{description}</p>
    <ul className="space-y-4">
      {items.map((i, idx) => (
        <li key={idx} className="flex gap-4 text-md font-semibold text-[#5D4037]">
          <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-[#4A6741]" />
          </div>
          {i}
        </li>
      ))}
    </ul>
  </div>
);

export default Index;