import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Brain, Eye, Palette, Zap, Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore, UserPreferences } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  multiSelect?: boolean;
  maxSelections?: number;
}

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  questions: Question[];
}

const sections: Section[] = [
  {
    id: 'attention',
    title: 'Attention & Focus',
    icon: Brain,
    description: 'Understanding your focus patterns',
    questions: [
      {
        id: 'focusSessionLength' as const,
        question: 'How long can you usually stay focused on one task?',
        options: [
          { value: 'less-10', label: 'Less than 10 minutes', icon: '⏱' },
          { value: '10-20', label: '10–20 minutes', icon: '⏱' },
          { value: '20-30', label: '20–30 minutes', icon: '⏱' },
          { value: 'more-30', label: 'More than 30 minutes', icon: '⏱' },
        ],
      },
      {
        id: 'breakLength' as const,
        question: 'What should be the ideal break length time?',
        options: [
          { value: 'less-10', label: 'Less than 10 minutes', icon: '⏱' },
          { value: '10-20', label: '10–20 minutes', icon: '⏱' },
          { value: '20-30', label: '20–30 minutes', icon: '⏱' },
          { value: 'more-30', label: 'More than 30 minutes', icon: '⏱' },
        ],
      },
      {
        id: 'focusBreakers' as const,
        question: 'What usually breaks your focus first?',
        options: [
          { value: 'notifications', label: 'Notifications / tabs', icon: '📱' },
          { value: 'long-paragraphs', label: 'Long paragraphs', icon: '📄' },
          { value: 'unstructured-videos', label: 'Videos without structure', icon: '🎬' },
          { value: 'background-noise', label: 'Background noise', icon: '🔊' },
          { value: 'not-sure', label: "I'm not sure", icon: '🤔' },
        ],
        multiSelect: true,
        maxSelections: 2,
      },
    ],
  },
  {
    id: 'content',
    title: 'Content Format',
    icon: Eye,
    description: 'How you prefer to learn',
    questions: [
      {
        id: 'preferredOutput' as const,
        question: 'When learning something new, you prefer:',
        options: [
          { value: 'bullet-points', label: 'Bullet points', icon: '📝' },
          { value: 'visual-diagrams', label: 'Visual diagrams / flowcharts', icon: '📊' },
          { value: 'audio', label: 'Listening (audio)', icon: '🎧' },
          { value: 'short-videos', label: 'Watching short videos', icon: '🎬' },
        ],
      },
      {
        id: 'detailLevel' as const,
        question: 'Long explanations feel:',
        options: [
          { value: 'overwhelming', label: 'Overwhelming', icon: '😰' },
          { value: 'okay-structured', label: 'Okay if structured', icon: '📋' },
          { value: 'keep-short', label: 'Keep it short', icon: '✂️' },
        ],
      },
    ],
  },
  {
    id: 'sensory',
    title: 'Sensory Comfort',
    icon: Palette,
    description: 'Visual and audio preferences',
    questions: [
      {
        id: 'colorTheme' as const,
        question: 'Which screen style feels most comfortable?',
        options: [
          { value: 'light', label: 'Light and clean', icon: '☀️' },
          { value: 'dark', label: 'Dark and calm', icon: '🌙' },
          { value: 'soft', label: 'Soft colors (low contrast)', icon: '🌿' },
        ],
      },
      {
        id: 'audioSpeed' as const,
        question: 'Do you like adjusting playback speed?',
        options: [
          { value: 'slower', label: 'Yes, slower helps me focus', icon: '🐢' },
          { value: 'faster', label: 'Yes, faster keeps me engaged', icon: '🐇' },
          { value: 'normal', label: 'I prefer normal speed', icon: '▶️' },
        ],
      },
    ],
  },
  {
    id: 'rhythm',
    title: 'Learning Rhythm',
    icon: Zap,
    description: 'Your study patterns',
    questions: [
      {
        id: 'sessionStyle' as const,
        question: 'What helps you stay consistent?',
        options: [
          { value: 'short-breaks', label: 'Short sessions with breaks', icon: '⏰' },
          { value: 'deep-focus', label: 'Longer deep-focus sessions', icon: '🎯' },
          { value: 'flexible', label: 'Flexible, no strict timing', icon: '🌊' },
        ],
      },
      {
        id: 'progressTracking' as const,
        question: 'How do you feel about progress tracking?',
        options: [
          { value: 'motivating', label: 'Motivating', icon: '🚀' },
          { value: 'neutral', label: 'Neutral', icon: '😐' },
          { value: 'stressful', label: 'Stressful', icon: '😓' },
        ],
      },
    ],
  },
  {
    id: 'awareness',
    title: 'Self-Awareness',
    icon: Heart,
    description: 'Understanding your energy',
    questions: [
      {
        id: 'energyLevel' as const,
        question: 'On most days, your energy while studying is:',
        options: [
          { value: 'low', label: 'Low', icon: '🔋' },
          { value: 'medium', label: 'Medium', icon: '⚡' },
          { value: 'high', label: 'High', icon: '🔥' },
        ],
      },
      {
        id: 'scrollSpeed' as const,
        question: 'How do you prefer to scroll through content?',
        options: [
          { value: 'slow', label: 'Slow and steady', icon: '🐌' },
          { value: 'moderate', label: 'Moderate pace', icon: '🚶' },
          { value: 'fast', label: 'Quick scanning', icon: '🏃' },
        ],
      },
    ],
  },
];

const ProfileSetup = () => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  const { updateProfile } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const currentSection = sections[sectionIndex];
  const currentQuestion = currentSection.questions[questionIndex];
  
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const completedQuestions = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + questionIndex;
  const progress = (completedQuestions / totalQuestions) * 100;
  
  const handleSelect = (value: string) => {
    if (currentQuestion.multiSelect) {
      const currentValues = (answers[currentQuestion.id] as string[]) || [];
      const maxSelections = currentQuestion.maxSelections || 2;
      
      if (currentValues.includes(value)) {
        setAnswers({ ...answers, [currentQuestion.id]: currentValues.filter(v => v !== value) });
      } else if (currentValues.length < maxSelections) {
        setAnswers({ ...answers, [currentQuestion.id]: [...currentValues, value] });
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };
  
  const isSelected = (value: string) => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };
  
  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.multiSelect) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };
  
  const handleNext = () => {
    if (questionIndex < currentSection.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else if (sectionIndex < sections.length - 1) {
      setSectionIndex(sectionIndex + 1);
      setQuestionIndex(0);
    } else {
      // Complete setup
      const preferences: UserPreferences = {
        focusSessionLength: answers.focusSessionLength as string || '',
        breakLength: answers.breakLength as string || '',
        focusBreakers: answers.focusBreakers as string[] || [],
        preferredOutput: answers.preferredOutput as string || '',
        detailLevel: answers.detailLevel as string || '',
        colorTheme: answers.colorTheme as string || '',
        audioSpeed: answers.audioSpeed as string || '',
        videoSpeed: answers.audioSpeed as string || '', // Same as audio for now
        sessionStyle: answers.sessionStyle as string || '',
        progressTracking: answers.progressTracking as string || '',
        energyLevel: answers.energyLevel as string || '',
        scrollSpeed: answers.scrollSpeed as string || '',
      };
      
      updateProfile({ preferences });
      toast({ 
        title: "Assessment complete!", 
        description: "Your learning profile has been personalized." 
      });
      navigate("/dashboard");
    }
  };
  
  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
      setQuestionIndex(sections[sectionIndex - 1].questions.length - 1);
    }
  };
  
  const isFirstQuestion = sectionIndex === 0 && questionIndex === 0;
  const isLastQuestion = sectionIndex === sections.length - 1 && questionIndex === currentSection.questions.length - 1;
  
  const SectionIcon = currentSection.icon;
  
  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-sage-100 text-sage-700">
                {currentSection.title}
              </span>
              <span className="text-sm text-muted-foreground">
                {completedQuestions + 1} of {totalQuestions}
              </span>
            </div>
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Section indicators */}
          <div className="flex gap-1 mt-3">
            {sections.map((section, idx) => (
              <div 
                key={section.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx < sectionIndex 
                    ? 'bg-sage-500' 
                    : idx === sectionIndex 
                      ? 'bg-sage-300' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Question Card */}
        <div className="glass-card p-8 animate-fade-in" key={`${sectionIndex}-${questionIndex}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-100 flex items-center justify-center">
              <SectionIcon className="w-8 h-8 text-sage-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{currentSection.description}</p>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground">
              {currentQuestion.question}
            </h2>
            {currentQuestion.multiSelect && (
              <p className="text-sm text-muted-foreground mt-2">
                Select up to {currentQuestion.maxSelections || 2} options
              </p>
            )}
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                  isSelected(option.value)
                    ? 'bg-sage-100 border-2 border-sage-300 text-sage-800'
                    : 'bg-muted/50 border-2 border-transparent hover:bg-sage-50 text-foreground'
                }`}
              >
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium flex-1">{option.label}</span>
                {isSelected(option.value) && (
                  <CheckCircle className="w-5 h-5 text-sage-600" />
                )}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {!isFirstQuestion && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()} 
              className={`${isFirstQuestion ? 'w-full' : 'flex-1'}`}
            >
              {isLastQuestion ? "Complete" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
